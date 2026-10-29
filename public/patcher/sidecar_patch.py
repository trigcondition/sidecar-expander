#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
#
# Sidecar | Expander: Rytm mod patcher.
# Copyright (C) 2026 the Sidecar | Expander contributors.
#
# The firmware codec below (the 8-in-7 SysEx transport and its checksums, the LZ
# depacker and the packer) is elekloader's (https://github.com/irpina/elekloader,
# elekloader/codec/ and elekloader/syx.py, GPL-2.0-or-later), which vendors it from
# digikit (https://github.com/m-dwyer/digikit, GPL-2.0-or-later). It is copied here
# with its logic unchanged, so this file needs nothing beyond Python 3.8+.
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU General Public License as published by the Free Software Foundation;
# either version 2 of the License, or (at your option) any later version. It is
# distributed WITHOUT ANY WARRANTY; see LICENSE.
"""Patch your own stock Analog Rytm MKII OS 1.73 .syx with a Sidecar mod patch.

    python3 sidecar_patch.py Analog-Rytm_MKII_OS1.73.syx patches/sidecar-sfx1017.json

writes Analog-Rytm_MKII_OS1.73_sfx1017.syx next to the stock file (or -o PATH).

The patch file holds only the Sidecar mods' bytes and elekloader's core, as records
against the decoded MAIN OS image; it contains no firmware. This script checks the
stock file's SHA-256, decodes its MAIN OS, applies the records, packs and re-encodes
the image, and refuses to write anything unless the result's SHA-256 is the one the
patch names (so it is bit-identical to the tested build). Nothing is sent anywhere.
"""
import argparse
import hashlib
import json
import os
import struct
import sys

FORMAT = "sidecar-rytm-patch"
COUNT_OFF, TABLE_OFF, ENTRY_SZ = 0x1C, 0x20, 16
VERSION_AT = 0x14
MFR = b"\x00\x20\x3c"
FIRST_COUNTER = 242
CHUNK = 101


class PatchError(Exception):
    pass


def sha(b):
    return hashlib.sha256(b).hexdigest()


# ---- SysEx transport (elekloader/codec/transport.py, from digikit) -------------------

def encode_8in7(data):
    out = bytearray()
    for start in range(0, len(data), 7):
        group = data[start:start + 7]
        marker = 0
        for n, b in enumerate(group):
            if b & 0x80:
                marker |= 1 << (6 - n)
        out.append(marker)
        out.extend(b & 0x7F for b in group)
    return bytes(out)


def content_checksum(container):
    acc = 0
    for idx in range(1, (len(container) >> 2) + 1):
        word, = struct.unpack_from(">I", container, (idx - 1) * 4)
        acc = (acc + (idx ^ word)) & 0xFFFFFFFF
    return acc


def packet_checksum(body, k):
    total = k
    for i in range(119):
        total += body[6 + i] ^ (i + k)
    return total & 0x7F


def _patch_framing_count(msg, n):
    body = bytearray(msg[1:-1])
    body[11] = (n >> 14) & 0x7F
    body[12] = (n >> 7) & 0x7F
    body[13] = n & 0x7F
    return bytes([0xF0]) + bytes(body) + bytes([0xF7])


def encode_syx(stream, device_id, framing_start, framing_end):
    k = framing_start[1:-1][7]
    n_msgs = (len(stream) + CHUNK - 1) // CHUNK
    out = bytearray(_patch_framing_count(framing_start, n_msgs))
    counter = FIRST_COUNTER
    for start in range(0, len(stream), CHUNK):
        chunk = stream[start:start + CHUNK]
        if len(chunk) < CHUNK:
            chunk = chunk + bytes(CHUNK - len(chunk))
        body = MFR + bytes([device_id, 0x00, 0x7E, (counter >> 14) & 0x7F,
                            (counter >> 7) & 0x7F, counter & 0x7F]) + encode_8in7(chunk)
        body += bytes([packet_checksum(body, k) & 0x7F])
        out.append(0xF0)
        out += body
        out.append(0xF7)
        counter += 1
    out += _patch_framing_count(framing_end, n_msgs)
    return bytes(out)


# ---- LZ depacker (elekloader/codec/elz.py, from digikit) -----------------------------

BIAS, REUSE, FAR = 767, 2, 3328


class _Bits:
    def __init__(self, data, pos, end):
        self.d, self.p, self.end = data, pos, end
        self.tag = 0

    def byte(self):
        if self.p >= self.end:
            raise PatchError("a packed section ends early")
        v = self.d[self.p]
        self.p += 1
        return v

    def bit(self):
        self.tag = (self.tag << 1) & 0x1FF
        if self.tag & 0xFF == 0:
            b = self.byte()
            self.tag = (b << 1) | 1
            return b >> 7
        return self.tag >> 8

    def gamma(self):
        v = 1
        while True:
            v = (v << 1) | self.bit()
            if self.bit():
                return v
            if v > 0x02000000:
                raise PatchError("gamma overflow in a packed section")


def depack_section(stream):
    length = struct.unpack_from(">I", stream, 0)[0]
    s = _Bits(stream, 8, 8 + length)
    out = bytearray()
    last = 1
    while True:
        if s.bit():
            out.append(s.byte())
            continue
        g = s.gamma()
        if g == REUSE:
            off = last
        else:
            raw = ((g << 8) + s.byte()) & 0xFFFFFFFF
            if raw == BIAS:
                break
            off = (raw - BIAS) & 0xFFFFFFFF
            last = off
        short = 2 * s.bit() + s.bit()
        n = short if short else s.gamma() + 2
        if off > FAR:
            n += 1
        if off == 0 or off > len(out):
            raise PatchError("a packed section points before its start")
        for _ in range(n + 1):
            out.append(out[-off])
    if s.p != 8 + length:
        raise PatchError("a packed section's end marker is not at its declared length")
    return bytes(out)


# ---- packer "lz1" (elekloader/codec/aplib.py as it was, from digikit; match finder by
# irpina): the greedy finder the first patches were made with ---------------------------

_TERM_GAMMA = (1 << 24) + 2
_TERM_BYTE = 0xFF
_MIN_MATCH = 3
_MAX_OFFSET = 1 << 16
_MAX_COUNT = 1 << 11


def _gamma_bits(value):
    tail = bin(value)[3:]
    out = []
    for i, ch in enumerate(tail):
        out.append(int(ch))
        out.append(1 if i == len(tail) - 1 else 0)
    return out


def _match_events(offset, count):
    length = count - 1
    if offset > FAR:
        length -= 1
    raw = offset + BIAS
    g, trailer = raw >> 8, raw & 0xFF
    out = [(0, b"")]
    gbits = _gamma_bits(g)
    for i, bit in enumerate(gbits):
        out.append((bit, bytes((trailer,)) if i == len(gbits) - 1 else b""))
    if 1 <= length <= 3:
        out.append(((length >> 1) & 1, b""))
        out.append((length & 1, b""))
    else:
        out.append((0, b""))
        out.append((0, b""))
        for bit in _gamma_bits(length - 2):
            out.append((bit, b""))
    return out


def _find_matches(data, min_match=_MIN_MATCH, max_offset=_MAX_OFFSET,
                  max_count=_MAX_COUNT, candidates=24):
    n = len(data)
    if n < min_match:
        return []
    table = {}
    out = []
    i = 0
    while i < n - min_match:
        key = data[i:i + min_match]
        best_off = best_len = 0
        chain = table.get(key)
        if chain:
            for j in reversed(chain[-candidates:]):
                off = i - j
                if off <= 0 or off > max_offset:
                    continue
                limit = min(max_count, n - i)
                k = 0
                while k < limit and data[j + k] == data[i + k]:
                    k += 1
                need = min_match + (1 if off > FAR else 0)
                if k >= need and k > best_len:
                    best_off, best_len = off, k
                    if k >= 64:
                        break
        chain = table.setdefault(key, [])
        chain.append(i)
        if len(chain) > candidates:
            del chain[:-candidates]
        if best_len:
            out.append((i, best_off, best_len))
            for k in range(1, best_len):
                p = i + k
                if p < n - min_match:
                    c = table.setdefault(data[p:p + min_match], [])
                    c.append(p)
                    if len(c) > candidates:
                        del c[:-candidates]
            i += best_len
        else:
            i += 1
    return out


# ---- packer "lz2": elekloader's current one (elekloader/codec/aplib.py _parse), which
# chooses back-references by bit cost, with last-offset reuse and one-byte lookahead -----

_MAX_OFFSET2 = (1 << 20) - 1
_CANDIDATES2 = 8
_LITERAL_BITS = 9


def _reuse_events(offset, count):
    length = count - 1 - (1 if offset > FAR else 0)
    out = [(0, b"")] + [(bit, b"") for bit in _gamma_bits(REUSE)]
    if length <= 3:
        out += [((length >> 1) & 1, b""), (length & 1, b"")]
    else:
        out += [(0, b""), (0, b"")] + [(bit, b"") for bit in _gamma_bits(length - 2)]
    return out


def _gamma_cost(value):
    return 2 * (value.bit_length() - 1)


def _match_cost(offset, count, reuse):
    length = count - 1 - (1 if offset > FAR else 0)
    if length < 1:
        return None
    lc = 2 if length <= 3 else 2 + _gamma_cost(length - 2)
    return 1 + (_gamma_cost(REUSE) if reuse else _gamma_cost((offset + BIAS) >> 8) + 8) + lc


def _parse2(data):
    n = len(data)
    head, prev = {}, [-1] * n
    hashed = [0]

    def hash_to(p):
        while hashed[0] <= p:
            q = hashed[0]
            if q + _MIN_MATCH <= n:
                k = (data[q] << 16) | (data[q + 1] << 8) | data[q + 2]
                prev[q] = head.get(k, -1)
                head[k] = q
            hashed[0] = q + 1

    def run(i, j, limit):
        k = 0
        while k < limit and data[i + k] == data[j + k]:
            k += 1
        return k

    def best(i, last):
        hash_to(i)
        limit = min(_MAX_COUNT, n - i)
        out = (0, 0, 0, False)
        if last and last <= i:
            k = run(i, i - last, limit)
            c = _match_cost(last, k, True) if k >= 2 else None
            if c is not None and _LITERAL_BITS * k - c > out[0]:
                out = (_LITERAL_BITS * k - c, last, k, True)
        j, tried = (prev[i] if i + _MIN_MATCH <= n else -1), 0
        while j >= 0 and tried < _CANDIDATES2:
            off = i - j
            if off > _MAX_OFFSET2:
                break
            k = run(i, j, limit)
            c = _match_cost(off, k, off == last)
            if c is not None and _LITERAL_BITS * k - c > out[0]:
                out = (_LITERAL_BITS * k - c, off, k, off == last)
            j, tried = prev[j], tried + 1
        return out

    out, i, last = [], 0, 0
    while i < n:
        gain, off, count, reuse = best(i, last)
        if gain > 0 and i + 1 < n and best(i + 1, last)[0] > gain + _LITERAL_BITS:
            gain = 0
        if gain > 0:
            out.append(("R" if reuse else "M", off, count))
            last = off
            i += count
        else:
            out.append(("L", data[i]))
            i += 1
    return out


PACKERS = ("lz1", "lz2")   # a patch without output.packer was made with lz1


def pack_section(data, packer="lz1"):
    """Image -> its stored MAIN OS section: [u32 len][u32 byte sum] + stream, zero-padded
    to a multiple of 4. lz1 is the packer of the first patches (sfx/rui 10xx), lz2
    elekloader's bit-cost packer (rel0-3-0 on)."""
    events = []
    if packer == "lz2":
        for e in _parse2(data):
            if e[0] == "L":
                events.append((1, bytes((e[1],))))
            elif e[0] == "M":
                events.extend(_match_events(e[1], e[2]))
            else:
                events.extend(_reuse_events(e[1], e[2]))
    elif packer == "lz1":
        matches = {pos: (off, count) for pos, off, count in _find_matches(data)}
        i, n = 0, len(data)
        while i < n:
            hit = matches.get(i)
            if hit:
                events.extend(_match_events(*hit))
                i += hit[1]
            else:
                events.append((1, bytes((data[i],))))
                i += 1
    else:
        raise PatchError("unknown packer %r: this patcher knows %s" % (packer, ", ".join(PACKERS)))
    events.append((0, b""))
    gbits = _gamma_bits(_TERM_GAMMA)
    for k, bit in enumerate(gbits):
        events.append((bit, bytes((_TERM_BYTE,)) if k == len(gbits) - 1 else b""))
    body = bytearray()
    for i in range(0, len(events), 8):
        tag, payload = 0, bytearray()
        for j, (bit, pl) in enumerate(events[i:i + 8]):
            tag |= (bit & 1) << (7 - j)
            payload += pl
        body.append(tag)
        body += payload
    sec = struct.pack(">II", len(body), sum(body) & 0xFFFFFFFF) + bytes(body)
    return sec + bytes(-len(sec) % 4)


# ---- the .syx container (elekloader/syx.py) ------------------------------------------

def _classify(raw):
    ln, sm = struct.unpack_from(">II", raw, 0) if len(raw) >= 8 else (0, 1)
    if ln + 8 <= len(raw) and (sum(raw[8:8 + ln]) & 0xFFFFFFFF) == sm:
        return "packed"
    if len(raw) >= 8 and sm == 0:
        return "raw-header"
    return "raw"


class Syx:
    def __init__(self, raw):
        msgs, i = [], 0
        while i < len(raw):
            if raw[i] != 0xF0:
                raise PatchError("not a SysEx file (byte %d is not F0)" % i)
            j = raw.find(b"\xf7", i)
            if j < 0:
                raise PatchError("a SysEx message has no end")
            msgs.append(raw[i:j + 1])
            i = j + 1
        if len(msgs) < 3 or len(msgs[0]) != 16 or len(msgs[-1]) != 16:
            raise PatchError("not an OS file: no framing messages")
        self.framing = (msgs[0], msgs[-1])
        self.data = msgs[1:-1]
        if any(len(m) != 128 for m in self.data):
            raise PatchError("not an OS file: a data message is not 128 bytes")
        self.device_id = msgs[0][4]
        dec = bytearray()
        for m in self.data:
            payload = m[10:126]
            k = 0
            while k < len(payload):
                ms = payload[k]
                k += 1
                for n in range(7):
                    if k >= len(payload):
                        break
                    dec.append(payload[k] | (0x80 if (ms >> (6 - n)) & 1 else 0))
                    k += 1
        self.total = struct.unpack_from(">I", dec, 0)[0]
        if dec[8:12] != b"ELE3" or 8 + self.total > len(dec):
            raise PatchError("not an OS file: no ELE3 container")
        self.container = bytes(dec[8:8 + self.total])
        self.header = self.container[:COUNT_OFF]
        n = struct.unpack_from(">I", self.container, COUNT_OFF)[0]
        if not 0 < n <= 16:
            raise PatchError("not an OS file: bad section table")
        self.table = [struct.unpack_from(">IIII", self.container, TABLE_OFF + ENTRY_SZ * i)
                      for i in range(n)]
        self.data_start = min(off for _s, off, _l, _d in self.table)
        self.stored = {sid: self.container[off:off + ln] for sid, off, ln, _d in self.table}

    def section(self, sid):
        raw = self.stored[sid]
        kind = _classify(raw)
        if kind == "packed":
            return depack_section(raw)
        return bytes(raw[8:]) if kind == "raw-header" else bytes(raw)

    def write(self, main_sid, stored_main, version):
        header = bytearray(self.header)
        header[VERSION_AT:VERSION_AT + 4] = version.encode("ascii")
        cont = bytearray(self.container[:self.data_start])
        cont[:COUNT_OFF] = header
        for i, (sid, _o, _l, dest) in enumerate(self.table):
            data = stored_main if sid == main_sid else self.stored[sid]
            struct.pack_into(">IIII", cont, TABLE_OFF + ENTRY_SZ * i, sid, len(cont), len(data), dest)
            cont += data
            cont += bytes(-len(cont) % 16)
        stream = struct.pack(">II", len(cont), content_checksum(bytes(cont))) + bytes(cont)
        return encode_syx(stream, self.device_id, self.framing[0], self.framing[1])


# ---- the patch -----------------------------------------------------------------------

def load_patch(path):
    with open(path, "rb") as fh:
        doc = json.loads(fh.read().decode("utf-8"))
    if doc.get("format") != FORMAT or doc.get("format_version") != 1:
        raise PatchError("%s is not a Sidecar patch file (format 1)" % path)
    return doc


def patch(stock_raw, doc, log=print):
    st = doc["stock"]
    got = sha(stock_raw)
    if got != st["syx_sha256"]:
        raise PatchError("this is not the stock OS %s file the patch needs\n  want sha256 %s\n"
                         "  got  sha256 %s\nUse the unmodified file from the official download."
                         % (st["os"], st["syx_sha256"], got))
    log("stock file OK (OS %s, sha256 %s..)" % (st["os"], got[:16]))
    syx = Syx(stock_raw)
    main = st["main_section"]
    sections = {sid: syx.section(sid) for sid in syx.stored}
    stock = sections[main]
    if len(stock) != st["main_len"] or sha(stock) != st["main_sha256"]:
        raise PatchError("the stock MAIN OS does not decode to the expected image")
    out = doc["output"]
    packer = out.get("packer", "lz1")
    if packer not in PACKERS:
        raise PatchError("this patch needs packer %r; this patcher knows %s (get the newer "
                         "sidecar_patch.py)" % (packer, ", ".join(PACKERS)))
    img = bytearray(stock) + bytearray(out["main_len"] - len(stock))
    for op in doc["ops"]:
        if len(op) == 2:
            b = bytes.fromhex(op[1])
            img[op[0]:op[0] + len(b)] = b
        else:
            src = sections[op[3] if len(op) > 3 else main]
            img[op[0]:op[0] + op[2]] = src[op[1]:op[1] + op[2]]
    if sha(bytes(img)) != out["main_sha256"]:
        raise PatchError("the patched image is not the expected one")
    log("applied %d records (%s); packing the image, this takes a little while.."
        % (len(doc["ops"]), doc["tag"]))
    res = syx.write(main, pack_section(bytes(img), packer), out["version"])
    if sha(res) != out["syx_sha256"]:
        raise PatchError("the result is not bit-identical to the tested build; nothing written")
    log("result OK: %s, sha256 %s" % (out["name"], out["syx_sha256"]))
    return res


def main(argv=None):
    ap = argparse.ArgumentParser(description="Patch a stock Analog Rytm MKII OS 1.73 .syx "
                                             "with a Sidecar mod patch (nothing leaves this computer).")
    ap.add_argument("stock", help="your stock Analog-Rytm_MKII_OS1.73.syx")
    ap.add_argument("patch", help="a patch file, e.g. patches/sidecar-sfx1017.json")
    ap.add_argument("-o", "--out", help="where to write the patched .syx")
    a = ap.parse_args(argv)
    try:
        doc = load_patch(a.patch)
        with open(a.stock, "rb") as fh:
            raw = fh.read()
        res = patch(raw, doc)
    except (PatchError, OSError, ValueError, KeyError) as e:
        print("error: %s" % e, file=sys.stderr)
        return 1
    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.stock)), doc["output"]["name"])
    with open(out, "wb") as fh:
        fh.write(res)
    print("wrote %s; send it to the Rytm with the Transfer app (or the STARTUP menu's "
          "OS UPGRADE over MIDI)" % out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
