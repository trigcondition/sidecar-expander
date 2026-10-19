---
title: Versioning
description: How Sidecar versions are numbered, and how they relate to the Rytm builds.
sidebar:
  order: 3
---

Sidecar uses **semantic versioning**, `MAJOR.MINOR.PATCH`, starting with the first public release, **0.1.0**. One number covers both Sidecar (Raspberry Pi 4B) and Sidecar Mini (Teensy 4.1), which share one engine core.

| Step | Example | What it means |
|---|---|---|
| PATCH | 0.1.0 → 0.1.1 | fixes only |
| MINOR | 0.1.x → 0.2.0 | new features; before 1.0 also anything that changes how a setup behaves |
| MAJOR | 0.x → 1.0.0 | 1.0.0 follows the testers' feedback; after that, a break in how a setup is used |

**The Rytm builds** (the mods, such as `rui1027d`) keep their own build names. Each Sidecar version's [release notes](/sidecar-expander/release-notes/) name the Rytm build it needs: flash that one, not just the newest.

**Where you see the version:** the SYSTEM page on the Rytm (`SYSTEM 0.1.0`), the Pi's display (About) and web page (About), the Sidecar Mini console (About), and `:version` on either console.
