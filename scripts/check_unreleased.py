#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Stops the site's deploy while the patcher lists an unreleased build.

    scripts/check_unreleased.py

The deploy workflow runs this first. A build marked "unreleased" in public/patcher/builds.json or patches/index.json is
hidden on the page, but its patch file would still be on the site, so nothing deploys with one. Exit status 1 if one is
listed. On release day: delete the "unreleased" key, rerun make_patches.py, and this passes. It also stops on:

- a "{{" slot (a hash or a commit still to fill in from the release build, such as {{COMMIT}} in the card zips' names)
  in any file the site or the repository's front page publishes: src/ (every page, the archived ones too, and the
  components), public/ (the patcher, the console) and the root .md files;
- a bare COMMIT written as part of a file name (sidecar-pi-sd-COMMIT-800x480.zip), in the same files;
- an UNRELEASED mark left in a current page (src/content/docs, the archived 0.2 and 0.3 aside) or a root .md file.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATCHER = os.path.join(HERE, "public", "patcher")

with open(os.path.join(PATCHER, "builds.json")) as fh:
    builds = json.load(fh)["builds"]
with open(os.path.join(PATCHER, "patches", "index.json")) as fh:
    index = json.load(fh)["patches"]
held = sorted({b["tag"] for b in builds + index if b.get("unreleased")})
slots = sorted({b["tag"] for b in builds + index if "{{" in json.dumps(b)})
stops = []                                          # every reason, then one exit
if slots:
    stops.append("a {{...}} slot not filled in the patcher: " + ", ".join(slots))
# a {{ slot or a bare COMMIT in a file name, anywhere the site or the repository's front page publishes
BARE_COMMIT = re.compile(r"[A-Za-z0-9_.]-COMMIT(?![A-Za-z{}])|(?<![A-Za-z{}])COMMIT-[A-Za-z0-9]")
published = [os.path.join(HERE, f) for f in sorted(os.listdir(HERE)) if f.endswith(".md")]
for top in ("src", "public"):
    for root, dirs, files in os.walk(os.path.join(HERE, top)):
        dirs[:] = sorted(d for d in dirs if d != "__pycache__")
        published += [os.path.join(root, f) for f in sorted(files)]
unfilled = []
for path in published:
    with open(path, "rb") as fh:
        data = fh.read()
    if b"\0" in data[:8192]:                       # binary
        continue
    for n, line in enumerate(data.decode(errors="replace").splitlines(), 1):
        if "{{" in line or BARE_COMMIT.search(line):
            unfilled.append(f"{os.path.relpath(path, HERE)}:{n}")
if unfilled:
    stops.append("a {{...}} slot or a bare COMMIT not filled in: " + ", ".join(unfilled))
# an UNRELEASED mark left in a current page or a root page (HTML comments reach the built site)
marked = []
for root, dirs, files in os.walk(os.path.join(HERE, "src", "content", "docs")):
    rel = os.path.relpath(root, os.path.join(HERE, "src", "content", "docs"))
    if rel.split(os.sep)[0] in ("0.2", "0.3"):        # the archived versions
        continue
    marked += [os.path.join(root, f) for f in files if "UNRELEASED" in open(os.path.join(root, f), errors="replace").read()]
marked += [os.path.join(HERE, f) for f in sorted(os.listdir(HERE)) if f.endswith(".md")
           and "UNRELEASED" in open(os.path.join(HERE, f), errors="replace").read()]
if marked:
    stops.append("UNRELEASED marks left in " + ", ".join(os.path.relpath(m, HERE) for m in marked))
if held:
    stops.append("unreleased in the patcher: " + ", ".join(held))
for stop in stops:
    print("NOT DEPLOYING: " + stop, file=sys.stderr)
if stops:
    sys.exit(1)
print("no unreleased build listed")
