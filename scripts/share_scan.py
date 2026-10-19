#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Share-readiness scan of everything that would ship: the repo's files, the built site (_site/) and the dist/ artifacts.

    scripts/share_scan.py [--stock STOCK.syx] [--names NAME ...]

Flags:
- personal data: the names given with --names (plus a few defaults), e-mail addresses (third-party licence notices
  are reported separately, as expected), local paths (/Users/, /home/, /private/, /var/folders/);
- firmware: .syx/.bin files, SysEx OS file headers, and, with --stock, any patch literal that holds 4 consecutive
  bytes of a decoded stock section (the same rule release_patch.py enforces);
- "Elektron" in GUI files (.html/.js, and the strings of the .hex and Pi images); in the docs site's pages only a note.
Exit status 1 when anything outside the expected notices is found.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import zipfile

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATCHER = os.path.join(HERE, "public", "patcher")   # served at /patcher/
sys.path.insert(0, PATCHER)
import sidecar_patch as sp  # noqa: E402

NOTICE_FILES = {"THIRD_PARTY_LICENSES", "LICENSE"}
EMAIL = re.compile(rb"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PATHS = re.compile(rb"/(?:Users|home|private|var/folders)/[^\s\"'<>]*")
GUI_EXT = {".html", ".js", ".hex", ".img"}
# the SysEx header as a SysEx message has it: F0 00 20 3C, then data bytes (all below 0x80). The 4 bytes alone also
# occur by chance inside machine code (an AArch64 ADD after an ADRP), which is not a message.
SYSEX = re.compile(rb"\xf0\x00\x20\x3c[\x00-\x7f]{16}")
# e-mail addresses that third-party code compiles into our binaries as its own copyright notice
BINARY_NOTICES = {b"j@w1.fi"}   # wpa_supplicant (hostap), the Pi's Wi-Fi; listed in THIRD_PARTY_LICENSES


def files():
    for root, dirs, fs in os.walk(HERE):
        dirs[:] = [d for d in dirs if d not in (".git", "__pycache__", "tests", "node_modules", ".astro", ".shots")]
        for f in fs:
            p = os.path.join(root, f)
            yield os.path.relpath(p, HERE), p


def payload(rel, path):
    """-> bytes to scan: a .hex as its binary, a zip's members joined, else the raw file."""
    raw = open(path, "rb").read()
    if rel.endswith(".hex"):
        out = bytearray()
        for line in raw.decode("ascii", "replace").splitlines():
            if line.startswith(":") and line[7:9] == "00":
                out += bytes.fromhex(line[9:9 + 2 * int(line[1:3], 16)])
        return bytes(out)
    if rel.endswith(".zip"):
        with zipfile.ZipFile(path) as z:
            return b"\n".join(z.read(n) for n in z.namelist())
    if rel.endswith(".json") and "patches" in rel:
        doc = json.loads(raw)
        if "ops" in doc:                    # the mods' own bytes, as the Rytm will hold them
            return raw + b"\n" + b"".join(bytes.fromhex(op[1]) for op in doc["ops"] if len(op) == 2)
    return raw


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stock", help="the stock .syx, to check the patch files' literals against it")
    ap.add_argument("--names", nargs="*", default=[], help="personal names to look for (case-insensitive)")
    a = ap.parse_args()
    names = [n.encode() for n in a.names]
    bad, notes = [], []
    for rel, path in sorted(files()):
        top = rel.split(os.sep)[0]
        # not Elektron firmware: Circle's armstub, and the Pi's Wi-Fi chip firmware (RPi-Distro, firmware/NOTICE)
        wifi_fw = "/firmware/brcmfmac43455-sdio" in rel and rel.endswith(".bin")
        if rel.endswith((".syx", ".bin")) and not rel.endswith("armstub8-rpi4.bin") and not wifi_fw:
            if rel.lower().endswith(".syx") and (os.sep + "JUNO" + os.sep in rel or os.sep + "DX7" + os.sep in rel):
                notes.append(f"{rel}: starter content patch data (Juno-106 / DX7 dumps, MIT sources; see its NOTICE)")
            else:
                bad.append(f"{rel}: firmware-like file type")
        if rel == os.path.join("scripts", "share_scan.py"):
            continue                       # its own patterns
        data = payload(rel, path)
        low = data.lower()
        for n in names:
            if n.lower() in low:
                bad.append(f"{rel}: personal name {n.decode()!r}")
        for m in set(PATHS.findall(data)):
            bad.append(f"{rel}: local path {m[:60].decode(errors='replace')}")
        mails = sorted(set(EMAIL.findall(data)))
        if rel.endswith((".img", ".hex", ".zip")) and mails and set(mails) <= BINARY_NOTICES:
            notes.append(f"{rel}: third-party notice e-mail {', '.join(m.decode() for m in mails)}")
            mails = []
        if mails:
            # the site's bundled third-party scripts (Pagefind's translation credits) count as notices too
            vendored = rel.startswith((os.path.join("_site", "pagefind") + os.sep, os.path.join("_site", "_astro") + os.sep))
            (notes if top in NOTICE_FILES or top == "licenses" or vendored or rel.endswith(("COPYING.linux", "LICENCE.broadcom"))
             else bad).append(f"{rel}: e-mail {', '.join(m.decode() for m in mails[:4])}")
        if rel.endswith((".syx", ".bin", ".img", ".hex", ".zip")) and SYSEX.search(data):
            bad.append(f"{rel}: holds an Elektron SysEx header")
        ext = os.path.splitext(rel)[1]
        if ext in GUI_EXT or rel.endswith(".zip"):
            # the docs site's pages may name the maker in prose (compatibility, nominative use); the device GUIs may not
            site_page = rel.startswith("_site" + os.sep) and not rel.startswith(tuple(os.path.join("_site", d) + os.sep for d in ("console", "patcher")))
            for m in set(re.findall(rb"[^\x00-\x1f\"<>]{0,40}elektron[^\x00-\x1f\"<>]{0,40}", data, re.I)):
                (notes if site_page else bad).append(f"{rel}: 'Elektron' in {'a docs page' if site_page else 'a GUI/binary string'}: {m.decode(errors='replace').strip()!r}")
            if ext in (".html", ".js") and re.search(rb"overbridge", data, re.I):
                notes.append(f"{rel}: mentions 'Overbridge' (a trademark; consider neutral wording in the GUI)")
    if a.stock:
        st = sp.Syx(open(a.stock, "rb").read())
        grams = set()
        for sid in st.stored:
            b = st.section(sid)
            grams |= {b[i:i + 4] for i in range(len(b) - 3)}
        pdir = os.path.join(PATCHER, "patches")
        for f in sorted(os.listdir(pdir)):
            if not f.startswith("sidecar-"):
                continue
            doc = json.load(open(os.path.join(pdir, f)))
            hits = 0
            for op in doc["ops"]:
                if len(op) == 2:
                    b = bytes.fromhex(op[1])
                    hits += sum(1 for i in range(len(b) - 3) if b[i:i + 4] in grams)
            (bad if hits else notes).append(f"public/patcher/patches/{f}: {hits} literal windows found in stock "
                                            f"({doc['stats']['literal_bytes']} literal bytes)")
    for n in notes:
        print("note ", n)
    for b in bad:
        print("FLAG ", b)
    print(f"{len(bad)} flagged, {len(notes)} notes")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
