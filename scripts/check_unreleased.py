#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Stops the site's deploy while the patcher lists an unreleased build.

    scripts/check_unreleased.py

The deploy workflow runs this first. A build marked "unreleased" in public/patcher/builds.json or patches/index.json is
hidden on the page, but its patch file would still be on the site, so nothing deploys with one. Exit status 1 if one is
listed. On release day: delete the "unreleased" key, rerun make_patches.py, and this passes.
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
if held:
    print("NOT DEPLOYING: unreleased in the patcher: " + ", ".join(held), file=sys.stderr)
    sys.exit(1)
print("no unreleased build listed")
