# Sidecar | Expander

**A voice and feature expander for the Analog Rytm MKII.**

Sidecar adds digital voices and send effects to the Analog Rytm MKII. A small computer sits on the Rytm's USB port: **Sidecar Mini** on a Teensy 4.1, or the full **Sidecar** on a Raspberry Pi 4B. A set of mods to the Rytm's OS 1.73 adds pages on the Rytm itself to drive it. You play and edit everything from the Rytm.

> **Public tester release (the 1021 line). Unofficial, experimental software.** Read [Risks and recovery](#risks-and-recovery) before you install anything.
>
> The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing.
>
> The remote pages are part of this release (`rui1022`, the default build) and were tested on a real Rytm with Sidecar Mini and Sidecar on 2026-10-18. A few parts are still in testing: see [Tested on hardware or in the emulator](#tested-on-hardware-or-in-the-emulator).

Documentation, the browser patcher and the web console: <https://trigcondition.github.io/sidecar-expander/>

## Sidecar Mini or Sidecar

**Sidecar Mini** (Teensy 4.1) is the cheap way to get started: the built-in machines, a few user machines, samples streamed from its card and the remote pages on the Rytm. Recording is planned for the Mini, and a Teensy with PSRAM fitted will get room for more and bigger user machines (planned, high priority). **Sidecar** (Raspberry Pi 4B) has everything: many user machines, the heavy effects, the recorder, the display and Wi-Fi. Make projects on the Mini and move up later: the Sidecar's per-project files are the same on both; only the user machine packages differ (`.rmp` for the Mini, `.a64.rmp` for the Pi).

| | Sidecar Mini (Teensy 4.1) | Sidecar (Raspberry Pi 4B) |
|---|---|---|
| Built-in machines, samples from the card, remote pages | yes | yes |
| User machines | a few: 32 KB of plugin code space (one large NoisePlethora package at a time) | many |
| Send effects | CHORUS, COMB, CRUSH, RINGMOD | those, plus RINGS, CLOUDSEED, STUTTER |
| Recorder | planned | yes, multitrack to the SD card |
| Display, Wi-Fi, web page | no (a web console over USB) | yes |

## What works now

- **External voice machines on every track.** PLAITS, DAISYSP, DIGIDRUM, JUNO, 6-OP FM and DSP SAMPLE run on the Sidecar, and their audio returns on the track's own channel.
- **User machines.** Five slots U1..U5 play loadable machine plugins; six starter machines (ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN) come with the release.
- **SEND FX 1/2.** AMPLITUDE 2 has two per-track sends to the Sidecar's effects. The SEND FX 1/2 pages behind DELAY / REVERB carry TYPE and P1..P5 (CHORUS, COMB, CRUSH, RINGMOD; on the Pi also RINGS, CLOUDSEED, STUTTER).
  - P1 is ROUT: PRE returns through the Rytm's analog distortion and compressor; POST returns clean.
  - P2..P5 show each effect's own labels; list knobs step one item a detent.
- **SIDECAR folder.** The Sidecar's SD card appears as a folder in the Rytm's own sample browser (it was called TEENSY before 1021).
- **Remote pages (`rui1022`, Sidecar Mini and Sidecar).** TRK + YES opens the SIDECAR and SYSTEM status pages and the voice pages on the Rytm's screen, in the Rytm's own font. The page catches only the keys and knobs it uses: PLAY, STOP and RECORD always reach the Rytm, and the pads, mutes, FILL and tap tempo work as usual; keys that open stock screens stay with the Sidecar.
- **Sidecar (Raspberry Pi 4B) only:**
  - a sample pool and presets per project, with a Pool & presets page on the web page;
  - a multitrack recorder to the SD card;
  - an HDMI touch display (800x480);
  - a web page at `http://sidecar.local` over a direct Ethernet cable;
  - boots from its own SD card.

See [KNOWN-ISSUES.md](KNOWN-ISSUES.md) for what does not work yet.

## Requirements

- **An Analog Rytm MKII running OS 1.73, and only OS 1.73.** The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. The mods are built against that exact OS. The patcher refuses any other file.
  - If your Rytm runs an older OS, update it to 1.73 first.
  - **OS 1.74 is not supported yet**; it will be supported after testing. On OS 1.74 (or any other version), first flash the stock OS 1.73 `.syx` with Transfer, as any OS update, then patch and flash it.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the Overbridge mode. That is the only setting the Sidecar needs: the Rytm's MIDI port settings (USB MIDI in and out) do not have to be changed for the voices, send effects, user machines or remote pages (tested on hardware). Only STUTTER's tempo sync and the recorder's armed mode use the Rytm's clock and transport over USB (MIDI CONFIG: CLOCK SEND and TRANSPORT SEND).
- One of:
  - **Sidecar Mini: a Teensy 4.1** (no PSRAM needed) with a USB host cable on its 5-pin host header (soldered pins), a micro-USB cable, and a microSD card (optional, for samples). See [INSTALL-TEENSY.md](INSTALL-TEENSY.md).
  - **Sidecar: a Raspberry Pi 4B** (2 GB or more) with a USB-C power supply, a blank microSD card, and optionally an 800x480 HDMI display and an Ethernet cable. See [INSTALL-PI.md](INSTALL-PI.md). (The Sidecar package follows on 2026-10-20.)
- The stock OS 1.73 file `Analog-Rytm_MKII_OS1.73.syx` from the official download page. We do not distribute it.
- Transfer, the Rytm maker's free transfer app, to send the OS file. For recovery, a DIN MIDI interface is also useful.

## Risks and recovery

- This is **unofficial**. It is not made, endorsed or supported by Elektron. Running modified firmware may affect the support or warranty you get for your unit. You use it at your own risk.
- **Back up first.** Use Transfer to back up your projects, kits, sounds and samples before you flash anything.
- **Going back to stock:** send the stock `Analog-Rytm_MKII_OS1.73.syx` the same way you sent the patched one. Nothing new is stored in your projects, so they stay compatible both ways.
- **If the Rytm does not boot:** hold **FUNC** while you power it on to get the STARTUP menu, press **TRIG 4 (OS UPGRADE)**, and send the stock 1.73 file over **DIN MIDI**: Transfer's legacy OS upgrade mode through a MIDI interface. This route is served by the Rytm's bootloader, so it works without a booting OS. It is slow: about 16 minutes or more.
- **Known stock behaviour:** after an OS upgrade, the Rytm can stay on "Success! Rebooting" and never restart by itself. A power cycle is fine: switch it off and on.
- Do not switch the Rytm off while it writes an update, except in the "Success! Rebooting" case above.
- The kit's SEND FX settings are stored in the kit. A stock OS ignores them.

## Install

1. **Patch your OS file:** with the browser patcher or the Python script, as in [PATCHER.md](PATCHER.md). Use `rui1022` (the default: the mods plus the remote pages), or `sfx1021` for the mods without the remote pages.
2. **Flash it:** send the patched `.syx` with Transfer and confirm on the Rytm.
3. **Set up the Sidecar:**
   - Sidecar Mini (Teensy 4.1): [INSTALL-TEENSY.md](INSTALL-TEENSY.md).
   - Sidecar (Pi 4B): [INSTALL-PI.md](INSTALL-PI.md).
4. **Connect:** plug the Rytm's USB cable into the Sidecar's host port and power both. On the Rytm, choose an external machine on a track, or set a SEND FX TYPE.

## Tested on hardware or in the emulator

Checked on a real Rytm MKII with a Sidecar attached.

On 2026-10-18, with the 1021 builds:
- `rui1022`'s key handling with the Pi (rytm-teensy 466542f): only the page's keys and knobs go to the Sidecar; PLAY / STOP / RECORD, pads, mutes, FILL and tap tempo work on the page; every checklist item correct;
- the remote pages (`rui1021`) on the Pi (1021 kernel) and on the Teensy (1021 firmware): the Rytm's own font, the stock look, very responsive; the SIDECAR and SYSTEM status pages and the voice pages;
- Pi: folder upload of large sample folders (no more network errors; a summary line and Retry failed), unplugging and replugging the USB cable between Pi and Rytm (the digital voices stop and resume), restarting the Rytm and the Pi, the restyled web page and display, Wi-Fi joining on the first boot.

Earlier (1017 to 1020 builds):
- the voices heard: PLAITS, DAISYSP, JUNO, 6-OP FM, DIGIDRUM, DSP SAMPLE;
- the send effects on the Pi (with labels, PRE/POST, STUTTER) and on the Teensy, live (CHORUS, COMB);
- the Pi recorder (a 5-minute take), user machines loading, the web page's tabs, the touch display.

Still in testing (emulator or simulator only, not yet reported from a real Rytm):
- the `sfx1021` build on its own (the same mods without the remote pages), the SIDECAR folder name and the NO SIDECAR popup.

## USB ID

The Sidecar's own USB device port (the Pi's USB-C, for computer audio and MIDI) presents itself as `1209:0001`. That is a shared **test** ID from pid.codes, not a product ID of our own: another test device on your computer may use it too, and a computer may remember the wrong driver name for it. A proper ID is planned before a final release. Plugging the Rytm into the Sidecar's host port does not depend on it.

## Feedback

Please report what you find with the **Tester report** form under [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose). It asks for the build (`rui1022` / `sfx1021`, and the Teensy or Pi build from `BUILD-INFO`), what you did, and what happened. Logs from the web console or `sidecar.local` help a lot.

## This repository

- `src/content/docs/`: the documentation site (Astro Starlight; `npm ci && npm run build` builds it into `_site/`).
- `public/patcher/`: the Rytm mod patcher (browser page and Python script), served at `/patcher/`.
- `public/console/`: the Sidecar Mini (Teensy) web console, served at `/console/`.
- `scripts/`: the release scripts (patch files, console sync, packaging, share scan).
- `RELEASE-NOTES.md`: what is in this release; `KNOWN-ISSUES.md`: what does not work yet.
- `.github/workflows/pages.yml`: builds and deploys the site to GitHub Pages (manual trigger).

## Credits and licences

- Our code is under the **GNU GPL version 2 or (at your option) any later version** ([LICENSE](LICENSE)).
- The **Raspberry Pi engine** links the [Circle](https://github.com/rsta2/circle) bare-metal library (GPLv3), so the Pi binary as a whole is distributed under the terms of the **GPL version 3** ([licenses/GPL-3.0.txt](licenses/GPL-3.0.txt)).
- The **Rytm mods** include the core of [elekloader](https://github.com/irpina/elekloader) (GPL-2.0-or-later). The patcher's firmware codec is elekloader's, which comes from [digikit](https://github.com/m-dwyer/digikit).
- The voices and effects build on Mutable Instruments' Plaits and Rings (MIT), DaisySP (MIT), CloudSeed (MIT) and others.

Every third-party component and its licence is listed in [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES).

"Analog Rytm", "Overbridge" and "Elektron" are trademarks of Elektron Music Machines. They are used here only to say what this works with.

## Written offer for source code

This tester release ships binaries, the patcher and documentation. The complete source follows in a later release, after tester feedback.

Until then, and for at least three years from the date you received a binary from this project, we will give anyone who asks a complete machine-readable copy of the **corresponding source code** for:
- the Raspberry Pi engine (`engine.img` and `sdboot.img`), including Circle and our changes to it, under the GPL version 3;
- the Rytm mods in the patch files, including the elekloader core, under the GPL version 2 or later;
- the Teensy firmware, including the materials needed to relink the LGPL-2.1 parts of the Teensyduino core and SPI library.

We provide it at no charge beyond the cost of physically performing the distribution, or as a download. To ask for it, open an issue titled "Source request" in this repository.

## Disclaimer

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. See sections 11 and 12 of the [LICENSE](LICENSE).
