// SPDX-License-Identifier: GPL-2.0-or-later
//
// Sidecar | Expander: Rytm mod patcher, in plain JavaScript (no dependencies).
// Copyright (C) 2026 the Sidecar | Expander contributors.
//
// A port of sidecar_patch.py. Its firmware codec (the SysEx transport and checksums,
// the LZ depacker and the packer) is elekloader's (https://github.com/irpina/elekloader,
// GPL-2.0-or-later), which vendors it from digikit (https://github.com/m-dwyer/digikit,
// GPL-2.0-or-later); ported here with the same logic, so the output is byte for byte
// the Python's. Runs in a browser page or in Node; touches no network and no device.
//
// This program is free software; you can redistribute it and/or modify it under the
// terms of the GNU General Public License as published by the Free Software Foundation;
// either version 2 of the License, or (at your option) any later version. It is
// distributed WITHOUT ANY WARRANTY; see LICENSE.
(function (root) {
  'use strict';

  const FORMAT = 'sidecar-rytm-patch';
  const COUNT_OFF = 0x1C, TABLE_OFF = 0x20, ENTRY_SZ = 16, VERSION_AT = 0x14;
  const FIRST_COUNTER = 242, CHUNK = 101;
  const BIAS = 767, REUSE = 2, FAR = 3328;
  const MIN_MATCH = 3, MAX_OFFSET = 1 << 16, MAX_COUNT = 1 << 11, CANDIDATES = 24;
  const TERM_GAMMA = (1 << 24) + 2, TERM_BYTE = 0xFF;

  class PatchError extends Error {}

  // ---- SHA-256 ----------------------------------------------------------------------
  const K256 = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);

  function sha256hex(data) {
    const n = data.length, total = ((n + 9 + 63) >> 6) << 6;
    const buf = new Uint8Array(total);
    buf.set(data);
    buf[n] = 0x80;
    const bits = n * 8;
    const dv = new DataView(buf.buffer);
    dv.setUint32(total - 8, Math.floor(bits / 0x100000000));
    dv.setUint32(total - 4, bits >>> 0);
    const h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
                               0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const w = new Uint32Array(64);
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + 4 * i);
      for (let i = 16; i < 64; i++) {
        const a = w[i - 15], b = w[i - 2];
        const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
        const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const t1 = (hh + S1 + ((e & f) ^ (~e & g)) + K256[i] + w[i]) >>> 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
    }
    return Array.from(h, (x) => x.toString(16).padStart(8, '0')).join('');
  }

  // ---- growable byte buffer --------------------------------------------------------
  class Bytes {
    constructor(cap) { this.a = new Uint8Array(cap || 1024); this.n = 0; }
    grow(k) {
      if (this.n + k <= this.a.length) return;
      let c = this.a.length * 2;
      while (c < this.n + k) c *= 2;
      const b = new Uint8Array(c); b.set(this.a.subarray(0, this.n)); this.a = b;
    }
    push(v) { this.grow(1); this.a[this.n++] = v; }
    append(u8) { this.grow(u8.length); this.a.set(u8, this.n); this.n += u8.length; }
    zeros(k) { this.grow(k); this.a.fill(0, this.n, this.n + k); this.n += k; }
    bytes() { return this.a.slice(0, this.n); }
  }

  const u32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
  const put32 = (b, o, v) => { b[o] = v >>> 24; b[o + 1] = (v >>> 16) & 255; b[o + 2] = (v >>> 8) & 255; b[o + 3] = v & 255; };
  const fromHex = (s) => { const o = new Uint8Array(s.length >> 1); for (let i = 0; i < o.length; i++) o[i] = parseInt(s.substr(2 * i, 2), 16); return o; };

  // ---- SysEx transport ---------------------------------------------------------------
  function contentChecksum(c) {
    let acc = 0;
    const words = c.length >> 2;
    for (let idx = 1; idx <= words; idx++) acc = (acc + ((idx ^ u32(c, (idx - 1) * 4)) >>> 0)) >>> 0;
    return acc;
  }

  function patchFramingCount(msg, n) {
    const m = msg.slice();
    m[12] = (n >> 14) & 0x7F; m[13] = (n >> 7) & 0x7F; m[14] = n & 0x7F;   // body 11..13
    return m;
  }

  function encodeSyx(stream, deviceId, fStart, fEnd) {
    const k = fStart[8];
    const nMsgs = Math.ceil(stream.length / CHUNK);
    const out = new Uint8Array(32 + nMsgs * 128);
    out.set(patchFramingCount(fStart, nMsgs), 0);
    let o = 16, counter = FIRST_COUNTER;
    const chunk = new Uint8Array(CHUNK);
    for (let s = 0; s < stream.length; s += CHUNK) {
      chunk.fill(0);
      chunk.set(stream.subarray(s, Math.min(s + CHUNK, stream.length)));
      const m = out.subarray(o, o + 128);
      m[0] = 0xF0; m[1] = 0x00; m[2] = 0x20; m[3] = 0x3C; m[4] = deviceId; m[5] = 0; m[6] = 0x7E;
      m[7] = (counter >> 14) & 0x7F; m[8] = (counter >> 7) & 0x7F; m[9] = counter & 0x7F;
      let p = 10;
      for (let g = 0; g < CHUNK; g += 7) {
        let marker = 0;
        const mp = p++;
        for (let n = 0; n < 7 && g + n < CHUNK; n++) {
          const b = chunk[g + n];
          if (b & 0x80) marker |= 1 << (6 - n);
          m[p++] = b & 0x7F;
        }
        m[mp] = marker;
      }
      let total = k;                                   // body = m[1..125]; body[6+i] = m[7+i]
      for (let i = 0; i < 119; i++) total += m[7 + i] ^ (i + k);
      m[126] = total & 0x7F;
      m[127] = 0xF7;
      o += 128; counter++;
    }
    out.set(patchFramingCount(fEnd, nMsgs), o);
    return out;
  }

  // ---- LZ depacker -------------------------------------------------------------------
  function depackSection(st) {
    const length = u32(st, 0), end = 8 + length;
    let p = 8, tag = 0;
    const byte = () => { if (p >= end) throw new PatchError('a packed section ends early'); return st[p++]; };
    const bit = () => {
      tag = (tag << 1) & 0x1FF;
      if ((tag & 0xFF) === 0) { const b = byte(); tag = (b << 1) | 1; return b >> 7; }
      return tag >> 8;
    };
    const gamma = () => {
      let v = 1;
      for (;;) {
        v = v * 2 + bit();
        if (bit()) return v;
        if (v > 0x02000000) throw new PatchError('gamma overflow in a packed section');
      }
    };
    const out = new Bytes(st.length * 2);
    let last = 1;
    for (;;) {
      if (bit()) { out.push(byte()); continue; }
      const g = gamma();
      let off;
      if (g === REUSE) off = last;
      else {
        const raw = ((g * 256 + byte()) % 0x100000000);
        if (raw === BIAS) break;
        off = (raw - BIAS + 0x100000000) % 0x100000000;
        last = off;
      }
      const short = 2 * bit() + bit();
      let n = short ? short : gamma() + 2;
      if (off > FAR) n += 1;
      if (off === 0 || off > out.n) throw new PatchError('a packed section points before its start');
      out.grow(n + 1);
      for (let i = 0; i <= n; i++) { out.a[out.n] = out.a[out.n - off]; out.n++; }
    }
    if (p !== end) throw new PatchError("a packed section's end marker is not at its declared length");
    return out.bytes();
  }

  // ---- packer: streams the events _assemble() would group in 8s ----------------------
  class BitWriter {
    constructor(cap) { this.out = new Bytes(cap); this.tagAt = -1; this.nbits = 8; }
    ev(bit, payload) {                     // payload: -1 for none, else a byte
      if (this.nbits === 8) { this.tagAt = this.out.n; this.out.push(0); this.nbits = 0; }
      if (bit) this.out.a[this.tagAt] |= 1 << (7 - this.nbits);
      this.nbits++;
      if (payload >= 0) this.out.push(payload);
    }
    gamma(value, lastPayload) {            // _gamma_bits(value), payload riding the last bit
      const tail = value.toString(2).slice(1);
      for (let i = 0; i < tail.length; i++) {
        const lastBit = i === tail.length - 1;
        this.ev(tail.charCodeAt(i) - 48, -1);
        this.ev(lastBit ? 1 : 0, lastBit ? lastPayload : -1);
      }
    }
  }

  function packSection(data) {
    const n = data.length;
    const w = new BitWriter(n + (n >> 2));
    // the match finder: a 3-byte key -> its last CANDIDATES positions (oldest first)
    const table = new Map();
    const index = (p) => {
      const key = (data[p] << 16) | (data[p + 1] << 8) | data[p + 2];
      let c = table.get(key);
      if (!c) { c = []; table.set(key, c); }
      c.push(p);
      if (c.length > CANDIDATES) c.splice(0, c.length - CANDIDATES);
    };
    let i = 0;
    const lim = n - MIN_MATCH;
    while (i < n) {
      let bestOff = 0, bestLen = 0;
      if (i < lim) {
        const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
        const chain = table.get(key);
        if (chain) {
          for (let ci = chain.length - 1; ci >= 0; ci--) {
            const j = chain[ci];
            const off = i - j;
            if (off <= 0 || off > MAX_OFFSET) continue;
            const limit = Math.min(MAX_COUNT, n - i);
            let k = 0;
            while (k < limit && data[j + k] === data[i + k]) k++;
            const need = MIN_MATCH + (off > FAR ? 1 : 0);
            if (k >= need && k > bestLen) { bestOff = off; bestLen = k; if (k >= 64) break; }
          }
        }
        index(i);
      }
      if (bestLen) {
        for (let k = 1; k < bestLen; k++) if (i + k < lim) index(i + k);
        let length = bestLen - 1;
        if (bestOff > FAR) length -= 1;
        const raw = bestOff + BIAS;
        w.ev(0, -1);
        w.gamma(raw >> 8, raw & 0xFF);
        if (length >= 1 && length <= 3) { w.ev((length >> 1) & 1, -1); w.ev(length & 1, -1); }
        else { w.ev(0, -1); w.ev(0, -1); w.gamma(length - 2, -1); }
        i += bestLen;
      } else {
        w.ev(1, data[i]);
        i += 1;
      }
    }
    w.ev(0, -1);
    w.gamma(TERM_GAMMA, TERM_BYTE);
    const body = w.out.bytes();
    let sum = 0;
    for (let k = 0; k < body.length; k++) sum = (sum + body[k]) >>> 0;
    const pad = (4 - ((8 + body.length) % 4)) % 4;
    const sec = new Uint8Array(8 + body.length + pad);
    put32(sec, 0, body.length); put32(sec, 4, sum); sec.set(body, 8);
    return sec;
  }

  // ---- the .syx container --------------------------------------------------------------
  function classify(raw) {
    if (raw.length < 8) return 'raw';
    const ln = u32(raw, 0), sm = u32(raw, 4);
    if (ln + 8 <= raw.length) {
      let s = 0;
      for (let k = 8; k < 8 + ln; k++) s = (s + raw[k]) >>> 0;
      if (s === sm) return 'packed';
    }
    return sm === 0 ? 'raw-header' : 'raw';
  }

  function parseSyx(raw) {
    const msgs = [];
    for (let i = 0; i < raw.length;) {
      if (raw[i] !== 0xF0) throw new PatchError('not a SysEx file (byte ' + i + ' is not F0)');
      const j = raw.indexOf(0xF7, i);
      if (j < 0) throw new PatchError('a SysEx message has no end');
      msgs.push(raw.subarray(i, j + 1));
      i = j + 1;
    }
    if (msgs.length < 3 || msgs[0].length !== 16 || msgs[msgs.length - 1].length !== 16)
      throw new PatchError('not an OS file: no framing messages');
    const data = msgs.slice(1, -1);
    if (data.some((m) => m.length !== 128)) throw new PatchError('not an OS file: a data message is not 128 bytes');
    const dec = new Bytes(data.length * 101);
    for (const m of data) {
      const pl = m.subarray(10, 126);
      for (let k = 0; k < pl.length;) {
        const ms = pl[k++];
        for (let n = 0; n < 7 && k < pl.length; n++) dec.push(pl[k++] | (((ms >> (6 - n)) & 1) ? 0x80 : 0));
      }
    }
    const d = dec.a;
    const total = u32(d, 0);
    if (String.fromCharCode(d[8], d[9], d[10], d[11]) !== 'ELE3' || 8 + total > dec.n)
      throw new PatchError('not an OS file: no ELE3 container');
    const container = d.slice(8, 8 + total);
    const cnt = u32(container, COUNT_OFF);
    if (!(cnt > 0 && cnt <= 16)) throw new PatchError('not an OS file: bad section table');
    const table = [];
    for (let i = 0; i < cnt; i++) {
      const o = TABLE_OFF + ENTRY_SZ * i;
      table.push([u32(container, o), u32(container, o + 4), u32(container, o + 8), u32(container, o + 12)]);
    }
    const stored = new Map(table.map(([sid, off, ln]) => [sid, container.subarray(off, off + ln)]));
    return {
      framing: [msgs[0], msgs[msgs.length - 1]], deviceId: msgs[0][4], container, table, stored,
      dataStart: Math.min(...table.map((t) => t[1])),
      section(sid) {
        const r = stored.get(sid), kind = classify(r);
        return kind === 'packed' ? depackSection(r) : kind === 'raw-header' ? r.slice(8) : r.slice();
      },
    };
  }

  function writeSyx(s, mainSid, storedMain, version) {
    const cont = new Bytes(s.container.length + storedMain.length);
    cont.append(s.container.subarray(0, s.dataStart));
    for (let k = 0; k < 4; k++) cont.a[VERSION_AT + k] = version.charCodeAt(k);
    s.table.forEach(([sid, , , dest], i) => {
      const data = sid === mainSid ? storedMain : s.stored.get(sid);
      const o = TABLE_OFF + ENTRY_SZ * i;
      put32(cont.a, o, sid); put32(cont.a, o + 4, cont.n); put32(cont.a, o + 8, data.length); put32(cont.a, o + 12, dest);
      cont.append(data);
      cont.zeros((16 - (cont.n % 16)) % 16);
    });
    const c = cont.bytes();
    const stream = new Uint8Array(8 + c.length);
    put32(stream, 0, c.length); put32(stream, 4, contentChecksum(c)); stream.set(c, 8);
    return encodeSyx(stream, s.deviceId, s.framing[0], s.framing[1]);
  }

  // ---- the patch -------------------------------------------------------------------------
  function checkPatch(doc) {
    if (!doc || doc.format !== FORMAT || doc.format_version !== 1)
      throw new PatchError('not a Sidecar patch file (format 1)');
    return doc;
  }

  // stockRaw: Uint8Array of the tester's .syx; log(text) reports progress. -> Uint8Array
  function patch(stockRaw, doc, log) {
    log = log || (() => {});
    checkPatch(doc);
    const st = doc.stock, out = doc.output;
    const got = sha256hex(stockRaw);
    if (got !== st.syx_sha256)
      throw new PatchError('This is not the stock OS ' + st.os + ' file the patch needs (sha256 ' + got +
        '). Use the unmodified file from the official download.');
    log('Stock file OK (OS ' + st.os + ').');
    const s = parseSyx(stockRaw);
    const sections = new Map();
    for (const sid of s.stored.keys()) sections.set(sid, s.section(sid));
    const stock = sections.get(st.main_section);
    if (stock.length !== st.main_len || sha256hex(stock) !== st.main_sha256)
      throw new PatchError('the stock MAIN OS does not decode to the expected image');
    const img = new Uint8Array(out.main_len);
    img.set(stock);
    for (const op of doc.ops) {
      if (op.length === 2) img.set(fromHex(op[1]), op[0]);
      else {
        const src = sections.get(op.length > 3 ? op[3] : st.main_section);
        img.set(src.subarray(op[1], op[1] + op[2]), op[0]);
      }
    }
    if (sha256hex(img) !== out.main_sha256) throw new PatchError('the patched image is not the expected one');
    log('Applied ' + doc.ops.length + ' records; packing.');
    const res = writeSyx(s, st.main_section, packSection(img), out.version);
    if (sha256hex(res) !== out.syx_sha256)
      throw new PatchError('the result is not bit-identical to the tested build; nothing was saved');
    log('Result OK: ' + out.name + ' (sha256 ' + out.syx_sha256.slice(0, 16) + '..)');
    return res;
  }

  const api = { patch, checkPatch, sha256hex, parseSyx, packSection, depackSection, PatchError };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SidecarPatch = api;
})(typeof self !== 'undefined' ? self : this);
