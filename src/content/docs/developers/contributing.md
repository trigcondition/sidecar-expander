---
title: Contributing
description: How to report, test and contribute.
sidebar:
  order: 9
---

Sidecar is in public testing, and the most useful contribution right now is a good tester report.

## Report

Use the **Tester report** form under [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose):

- the Rytm build (`rui1027` / `sfx1021`) and the Sidecar build (`BUILD-INFO` in the release);
- what you did, what you expected, what happened;
- a log: the Teensy console's log, or the Log tab of `sidecar.local`.

The items under "Not yet confirmed on hardware" in [Known issues](/sidecar-expander/using/troubleshooting/#still-in-testing) are especially welcome.

## Source code

The engine and the Rytm mods are published after the tester round. Until then the [written offer](/sidecar-expander/about/licence/#written-offer-for-source-code) gives you the source on request. This repository holds the patcher, the web console, the documentation and the release scripts.

## Guidelines

- **No firmware in the repository.** Never commit an OS file, a decoded section, a snapshot or anything derived from the instrument's firmware. The patch files carry only our own bytes and copy instructions; the release tooling refuses anything else.
- **Describe firmware findings conceptually** in public text, and tag them: measured on hardware, measured in the emulator, or inferred.
- **No third-party code without its licence.** Check the licence before reusing a project; keep notices in `THIRD_PARTY_LICENSES`.
- **Audio first.** Nothing on the render path allocates, blocks or logs. Card and network work happens between blocks.
- **Hardware claims need hardware.** Mark anything shown only in the emulator as "in testing".
- Plain, direct English in the docs: what it does, how to use it, its limits.

## Documentation

This site is in `src/content/docs/` (Markdown, Astro Starlight). `npm run build` must pass: it also checks every internal link. Corrections are welcome as issues or, once the repository accepts them, pull requests.
