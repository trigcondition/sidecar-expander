#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Stops the site's deploy while the patcher lists an unreleased build.

    scripts/check_unreleased.py

The deploy workflow runs this first. A build marked "unreleased" in public/patcher/builds.json or patches/index.json is
hidden on the page, but its patch file would still be on the site, so nothing deploys with one. Exit status 1 if one is
listed. On release day: delete the "unreleased" key, rerun make_patches.py, and this passes. It also stops on a
"{{" slot left in builds.json or the index (a hash still to fill in from the release build), and on an UNRELEASED
mark left in a current page (src/content/docs, the archived 0.2 and 0.3 aside) or a root .md file.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATCHER = os.path.join(HERE, "public", "patcher")

with open(os.path.join(PATCHER, "builds.json")) as fh:
    builds = json.load(fh)["builds"]
with open(os.path.join(PATCHER, "patches", "index.json")) as fh:
    index = json.load(fh)["patches"]
held = sorted({b["tag"] for b in builds + index if b.get("unreleased")})
slots = sorted({b["tag"] for b in builds + index if "{{" in json.dumps(b)})
if slots:
    print("NOT DEPLOYING: a {{...}} slot not filled in: " + ", ".join(slots), file=sys.stderr)
    sys.exit(1)
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
    print("NOT DEPLOYING: UNRELEASED marks left in " + ", ".join(os.path.relpath(m, HERE) for m in marked), file=sys.stderr)
    sys.exit(1)
if held:
    print("NOT DEPLOYING: unreleased in the patcher: " + ", ".join(held), file=sys.stderr)
    sys.exit(1)
print("no unreleased build listed")
