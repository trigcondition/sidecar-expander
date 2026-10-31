---
title: Versioning
description: How Sidecar versions are numbered, and how they relate to the Rytm builds.
sidebar:
  order: 3
---

Sidecar uses **semantic versioning**, `MAJOR.MINOR.PATCH`, starting with the first public release, **0.1.0**. One number covers both Sidecar (Raspberry Pi 4B and Pi 5) and Sidecar Mini (Teensy 4.1), which share one engine core. A release may leave one of them out: **0.2.0** and **0.3.0** are Sidecar (Pi) releases; Sidecar Mini stays at **0.1.0** until a release names a newer Mini build. The current release is **0.3.0**.

| Step | Example | What it means |
|---|---|---|
| PATCH | 0.1.0 → 0.1.1 | fixes only |
| MINOR | 0.1.x → 0.2.0 | new features; before 1.0 also anything that changes how a setup behaves |
| MAJOR | 0.x → 1.0.0 | 1.0.0 follows the testers' feedback; after that, a break in how a setup is used |

**The Rytm firmware.** From 0.3.0 the Rytm mods carry the same version number: `rytm-sidecar-0.3.1.elemod` goes with the Sidecar 0.3.1 card. Before, the Rytm builds had their own names (`rui1027d` for 0.1.0 and 0.2.0). Each version's [release notes](/sidecar-expander/release-notes/) name the Rytm firmware it needs: flash that one, not just the newest. The Rytm firmware may get a release of its own between Sidecar versions (the MD page after 0.3.1 is one).

**Where you see the version:** the SYSTEM page on the Rytm (`SYSTEM 0.1.0`), the Pi's display (About) and web page (About), the Sidecar Mini console (About), and `:version` on either console.
