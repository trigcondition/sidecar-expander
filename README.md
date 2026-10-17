# Sidecar | Expander

**A voice and feature expander for the Analog Rytm MKII.**

Sidecar adds digital voices and send effects to the Analog Rytm MKII. A small computer sits on the Rytm's USB port: a Teensy 4.1 or a Raspberry Pi 4B. A set of mods to the Rytm's OS 1.73 adds pages on the Rytm itself to drive it. You play and edit everything from the Rytm.

> **First public tester release. Unofficial, experimental software.** Read [Risks and recovery](#risks-and-recovery) before you install anything.

Documentation, the browser patcher and the web console: <https://trigcondition.github.io/sidecar-expander/>

## What works now

- **External voice machines on every track.** PLAITS and DAISYSP machines run on the Sidecar, and their audio returns on the track's own channel.
- **SEND FX 1/2.** AMPLITUDE 2 has two per-track sends to the Sidecar's effects. The SEND FX 1/2 pages behind DELAY / REVERB carry TYPE and P1..P5 (on the Pi: RINGS, CLOUDSEED, STUTTER, CHORUS, COMB).
  - P1 is ROUT: PRE returns through the Rytm's analog distortion and compressor; POST returns clean.
  - P2..P5 show each effect's own labels.
- **TEENSY folder.** The Sidecar's SD card appears as a folder in the Rytm's own sample browser.
- **Raspberry Pi version only:**
  - an HDMI display (800x480);
  - a status page at `http://sidecar.local` over a direct Ethernet cable;
  - boots from its own SD card.

See [KNOWN-ISSUES.md](KNOWN-ISSUES.md) for what does not work yet.

## Requirements

- **An Analog Rytm MKII running OS 1.73, and only OS 1.73.** The mods are built against that exact OS. The patcher refuses any other file.
  - If your Rytm runs an older OS, update it to 1.73 first.
  - If it runs a newer OS, this release is not for you: the Rytm does not support downgrades.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the Overbridge mode.
- One of:
  - **Teensy 4.1** with a USB host cable on its 5-pin host header (soldered pins), a micro-USB cable, and a microSD card (optional, for samples). See [INSTALL-TEENSY.md](INSTALL-TEENSY.md).
  - **Raspberry Pi 4B** (2 GB or more) with a USB-C power supply, a blank microSD card, and optionally an 800x480 HDMI display and an Ethernet cable. See [INSTALL-PI.md](INSTALL-PI.md). (Available from 2026-10-20.)
- The stock OS 1.73 file `Analog-Rytm_MKII_OS1.73.syx` from the official download page. We do not distribute it.
- Elektron Transfer, to send the OS file. For recovery, a DIN MIDI interface is also useful.

## Risks and recovery

- This is **unofficial**. It is not made, endorsed or supported by Elektron. Running modified firmware may affect the support or warranty you get for your unit. You use it at your own risk.
- **Back up first.** Use Transfer to back up your projects, kits, sounds and samples before you flash anything.
- **Going back to stock:** send the stock `Analog-Rytm_MKII_OS1.73.syx` the same way you sent the patched one.
- **If the Rytm does not boot:** hold **FUNC** while you power it on to get the STARTUP menu, press **TRIG 4 (OS UPGRADE)**, and send the stock 1.73 file over **DIN MIDI**: Transfer's legacy OS upgrade mode through a MIDI interface. This route is served by the Rytm's bootloader, so it works without a booting OS. It is slow: about 16 minutes or more.
- **Known stock behaviour:** after an OS upgrade, the Rytm can stay on "Success! Rebooting" and never restart by itself. A power cycle is fine: switch it off and on.
- Do not switch the Rytm off while it writes an update, except in the "Success! Rebooting" case above.
- The kit's SEND FX settings are stored in the kit. A stock OS ignores them.

## Install

1. **Patch your OS file:** with the browser patcher or the Python script, as in [PATCHER.md](PATCHER.md). Use `sfx1017` unless you want to try the early remote UI (`rui1017`).
2. **Flash it:** send the patched `.syx` with Transfer and confirm on the Rytm.
3. **Set up the Sidecar:**
   - Teensy: [INSTALL-TEENSY.md](INSTALL-TEENSY.md).
   - Pi 4B: [INSTALL-PI.md](INSTALL-PI.md).
4. **Connect:** plug the Rytm's USB cable into the Sidecar's host port and power both. On the Rytm, choose an external machine on a track, or set a SEND FX TYPE.

## Feedback

Please report what you find with the **Tester report** form under [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose). It asks for the build (`sfx1017` / `rui1017`, and the Teensy or Pi build from `BUILD-INFO`), what you did, and what happened. Logs from the web console or `sidecar.local` help a lot.

## This repository

- `src/content/docs/`: the documentation site (Astro Starlight; `npm ci && npm run build` builds it into `_site/`).
- `public/patcher/`: the Rytm mod patcher (browser page and Python script), served at `/patcher/`.
- `public/console/`: the Teensy web console, served at `/console/`.
- `scripts/`: the release scripts (patch files, console sync, packaging, share scan).
- `.github/workflows/pages.yml`: builds and deploys the site to GitHub Pages (manual trigger).

## Credits and licences

- Our code is under the **GNU GPL version 2 or (at your option) any later version** ([LICENSE](LICENSE)).
- The **Raspberry Pi engine** links the [Circle](https://github.com/rsta2/circle) bare-metal library (GPLv3), so the Pi binary as a whole is distributed under the terms of the **GPL version 3** ([licenses/GPL-3.0.txt](licenses/GPL-3.0.txt)).
- The **Rytm mods** include the core of [elekloader](https://github.com/irpina/elekloader) (GPL-2.0-or-later). The patcher's firmware codec is elekloader's, which comes from [digikit](https://github.com/m-dwyer/digikit).
- The voices and effects build on Mutable Instruments' Plaits and Rings (MIT), DaisySP (MIT), CloudSeed (MIT) and others.

Every third-party component and its licence is listed in [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES).

"Analog Rytm", "Overbridge" and "Elektron" are trademarks of Elektron Music Machines. They are used here only to say what this works with.

## Written offer for source code

This first release ships binaries, the patcher and documentation. The complete source follows in a later release, after tester feedback.

Until then, and for at least three years from the date you received a binary from this project, we will give anyone who asks a complete machine-readable copy of the **corresponding source code** for:
- the Raspberry Pi engine (`engine.img` and `sdboot.img`), including Circle and our changes to it, under the GPL version 3;
- the Rytm mods in the patch files, including the elekloader core, under the GPL version 2 or later;
- the Teensy firmware, including the materials needed to relink the LGPL-2.1 parts of the Teensyduino core and SPI library.

We provide it at no charge beyond the cost of physically performing the distribution, or as a download. To ask for it, open an issue titled "Source request" in this repository.

## Disclaimer

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. See sections 11 and 12 of the [LICENSE](LICENSE).
