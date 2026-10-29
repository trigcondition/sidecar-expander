#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Generate public/patcher/patches/*.json and patches/index.json from a rytm-mods build.

    scripts/make_patches.py --mods ../rytm-mods-release --dir ../rytm-mods/build/sidecar-1017 \
        --commit <rytm-mods commit of the build> [--elekloader DIR] [TAG ...]

--dir holds the stock .syx and our Analog-Rytm_MKII_OS1.73_<tag>.syx builds (git-ignored
there; never copied here). Each patch is made by rytm-mods' tools/release_patch.py, which
refuses unless the records rebuild our .syx byte for byte and carry no stock bytes. TAGs
default to every build in public/patcher/builds.json.

Each patch's output.packer names the packer the front ends must use to get that .syx:
--packer (default lz2, elekloader's bit-cost packer, which release_patch.py checks with).
A patch without the field is lz1, the greedy packer of the first patches (sfx/rui 10xx).
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
PATCHER = HERE / "public" / "patcher"   # served at /patcher/ on the Pages site
OUT = PATCHER / "patches"

ap = argparse.ArgumentParser()
ap.add_argument("--mods", required=True, help="a rytm-mods checkout with tools/release_patch.py")
ap.add_argument("--dir", required=True, help="the build folder (stock + built .syx)")
ap.add_argument("--commit", required=True, help="the rytm-mods commit the builds came from")
ap.add_argument("--elekloader", help="elekloader checkout (default: <mods>/vendor/elekloader)")
ap.add_argument("--packer", default="lz2", choices=["lz1", "lz2"],
                help="the packer the elekloader release_patch.py used (default lz2)")
ap.add_argument("tags", nargs="*")
a = ap.parse_args()

cfg = json.loads((PATCHER / "builds.json").read_text())
builds = [b for b in cfg["builds"] if not a.tags or b["tag"] in a.tags]
if a.tags and len(builds) != len(a.tags):
    sys.exit("unknown tag(s): %s" % (set(a.tags) - {b["tag"] for b in builds}))
OUT.mkdir(parents=True, exist_ok=True)
tool = Path(a.mods) / "tools" / "release_patch.py"
for b in builds:
    cmd = [sys.executable, str(tool), "--tag", b["tag"], "--dir", a.dir, "--commit", a.commit,
           "--title", b["title"], "--description", b["description"],
           "-o", str(OUT / f"sidecar-{b['tag']}.json")]
    if a.elekloader:
        cmd += ["--elekloader", a.elekloader]
    subprocess.run(cmd, check=True)
    f = OUT / f"sidecar-{b['tag']}.json"
    d = json.loads(f.read_text())
    d["output"]["packer"] = a.packer
    f.write_text(json.dumps(d, separators=(",", ":")) + "\n")

index = []
for b in cfg["builds"]:                       # the index lists every built patch, in config order
    f = OUT / f"sidecar-{b['tag']}.json"
    if f.exists():
        d = json.loads(f.read_text())
        index.append({"file": f.name, "tag": d["tag"], "title": d["title"],
                      "description": d.get("description", ""), "output": d["output"]["name"],
                      "output_sha256": d["output"]["syx_sha256"], "source_commit": d["source_commit"]})
(OUT / "index.json").write_text(json.dumps({"stock_sha256": json.loads(
    (OUT / index[0]["file"]).read_text())["stock"]["syx_sha256"], "patches": index}, indent=1) + "\n")
print("wrote %s (%d patches)" % (OUT / "index.json", len(index)))
