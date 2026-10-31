# Sidecar | Expander

**A voice and feature expander for the Analog Rytm MKII.**

Sidecar adds digital voices, effects and a sequencer to the Analog Rytm MKII. A **Raspberry Pi 4B or Pi 5** sits on the Rytm's USB port; one SD card boots both. The Pi 4B is the main target, and the one the measurements are made on; the Pi 5 scales its HDMI picture. A set of mods to the Rytm's OS 1.73 adds pages on the Rytm itself to drive it. You play and edit everything from the Rytm.

> **Sidecar 0.3.1** (Rytm firmware 0.3.1, an elekloader module): a fix release of the 0.3.0 early-tester release for the Raspberry Pi 4B and the Pi 5 ([release notes](RELEASE-NOTES.md)); downloads: the [Sidecar (Pi) files](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.3.1) and the [Rytm firmware](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.3.1). **Unofficial, experimental software.** Read [Risks and recovery](#risks-and-recovery) before you install anything.
>
> **Sidecar Mini (Teensy 4.1) is phased out.** It is frozen at 0.1.0: no new features. Its source stays in [sidecar-firmware](https://github.com/trigcondition/sidecar-firmware) (`teensy/`) for reference, and the 0.1.0 release stays on the [releases page](https://github.com/trigcondition/sidecar-expander/releases).
>
> The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing.

Documentation and the browser patcher: <https://trigcondition.github.io/sidecar-expander/>

## What works now

Sidecar 0.3.0 adds, on top of 0.2.0:

- **Poly tracks** on every Sidecar machine, played by the Sidecar's own sequencer: chords, up to 8 pages, trig conditions, p-locks, NOTE EDIT, POLY CONFIG in the Rytm's track menu, poly tracks per pattern.
- **New machines:** MULTISAMPLE, WAVETABLE and GRANULAR (poly), CHOP (a sample in up to 64 slices), LIVE IN (the Rytm's audio input) and MD built in, in DIGIDRUM's place.
- **New user machines:** NUSAW, VOX, HUSH1 and RAFFO, with the six starters (ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN) and MD in `sidecar-pi-plugins-0.3.1.zip`.
- **Effects:** insert FX and FX buses, among them **AMP** (Neural Amp Modeler A2-Lite captures from the card's `/NAM/` folder); **SPACE**, a tape echo send effect; the OUT route to the Rytm's main mix.
- **Recording:** the recorder with dated take names and recording to a USB drive; the sampler and auto-sampler; the song recorder.
- **Projects by the Rytm's slot:** SAVE AS, copy and paste take the Sidecar's files along; CLEAR and DELETE go to the project trash; bundles; pools and the sample library.
- **The pairing code**, on by default: pair a browser with `http://sidecar.local` once, with the 8-digit code on the Rytm (SIDECAR MENU > WEB UI) or the touchscreen.

From earlier releases, still in 0.3.0: PLAITS, DAISYSP, DSP SAMPLE, JUNO and 6-OP FM on every track; user machine slots U1..U5; SEND FX 1/2 (CHORUS, COMB, CRUSH, RINGMOD, HALO, RINGS, CLOUDSEED, STUTTER); LFOs; the SIDECAR folder in the Rytm's sample browser; the remote pages and the SRC view; the multitrack recorder; computer audio and MIDI over USB-C (Pi 4B); the touchscreen; the web page; Wi-Fi.

Most of 0.3.0 is tested in the emulator and on the Mac; a part of it has run on a real Rytm with a Pi 4B. The status of each feature: [What works now](https://trigcondition.github.io/sidecar-expander/introduction/what-works-now/). See [KNOWN-ISSUES.md](KNOWN-ISSUES.md) for what does not work yet.

## Requirements

- **An Analog Rytm MKII running OS 1.73, and only OS 1.73.** The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. The mods are built against that exact OS. The patcher refuses any other file.
  - If your Rytm runs an older OS, update it to 1.73 first.
  - **On OS 1.74:** the patched file is a whole OS (1.73 plus the Sidecar mods), so sending it replaces 1.74; no separate downgrade. Your projects carry over.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the Overbridge mode. That is the only setting the Sidecar needs: the Rytm's MIDI port settings (USB MIDI in and out) do not have to be changed for the voices, send effects, user machines or remote pages (tested on hardware). Only STUTTER's tempo sync and the recorder's armed mode use the Rytm's clock and transport over USB (MIDI CONFIG: CLOCK SEND and TRANSPORT SEND).
- **A Raspberry Pi 4B** (2 GB or more, with a computer: also USB-C audio and MIDI) **or a Raspberry Pi 5** (standalone for now: USB audio and MIDI to the computer are coming; the official 27 W supply, directly), its official USB-C power supply, a blank microSD card (one card set boots both), and optionally an 800x480 or 1024x600 HDMI display and an Ethernet cable. See [INSTALL-PI.md](INSTALL-PI.md).
- The stock OS 1.73 file `Analog-Rytm_MKII_OS1.73.syx` from the official download page. We do not distribute it.
- Transfer, the Rytm maker's free transfer app, to send the OS file. For recovery, a DIN MIDI interface is also useful.

## Risks and recovery

- This is **unofficial**. It is not made, endorsed or supported by Elektron. Running modified firmware may affect the support or warranty you get for your unit. You use it at your own risk.
- **Back up first.** Use Transfer to back up your projects, kits, sounds and samples before you flash anything.
- **Going back to stock:** send the stock `Analog-Rytm_MKII_OS1.73.syx` the same way you sent the patched one. Where things are stored: the send FX settings and the Sidecar machine choices are in the Rytm's kit; the Sidecar's per-project and per-kit files (slot lists, sample pool, JUNO / FM lists, LFOs) are on the Sidecar's card. Back on the stock OS your projects still load: the send FX values are ignored and tracks on Sidecar machines show them as missing.
- **If the Rytm does not boot:** hold **FUNC** while you power it on to get the STARTUP menu, press **TRIG 4 (OS UPGRADE)**, and send the stock 1.73 file over **DIN MIDI**: Transfer's legacy OS upgrade mode through a MIDI interface. This route is served by the Rytm's bootloader, so it works without a booting OS. It is slow: about 16 minutes or more.
- **Known stock behaviour:** after an OS upgrade, the Rytm can stay on "Success! Rebooting" and never restart by itself. A power cycle is fine: switch it off and on.
- Do not switch the Rytm off while it writes an update, except in the "Success! Rebooting" case above.
- The kit's SEND FX settings are stored in the kit. A stock OS ignores them.

## Install

1. **Build the Rytm firmware 0.3.1 from your stock OS 1.73 file:** with elekloader (`core-0.1.elemod` + `rytm-sidecar-0.3.1.elemod`, version set to 1.73) or the browser patcher (build `rel0-3-1`); both give the same `.syx` ([Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/), [PATCHER.md](PATCHER.md)).
2. **Flash it:** send the patched `.syx` with Transfer and confirm on the Rytm.
3. **Set up the Sidecar** (Pi 4B or Pi 5): [INSTALL-PI.md](INSTALL-PI.md).
4. **Connect:** plug the Rytm's USB cable into the Sidecar's host port and power both. On the Rytm, choose an external machine on a track, or set a SEND FX TYPE.
5. **Pair your browser:** open `http://sidecar.local` and enter the 8-digit code from the Rytm (SIDECAR MENU > WEB UI) or the touchscreen.

## Tested on hardware or in the emulator

Checked on a real Rytm MKII with a Sidecar attached.

With 0.3.0 (2026-10-26 to 2026-10-29, Pi 4B): the first Rytm flashed with the Rytm firmware 0.3.0; the move of real projects to their Rytm slots, no failures; the RAM store; no underruns with MD's per-step locks and pattern switches; poly tracks per pattern and NOTE EDIT (first round).

On 2026-10-18, with the test line:
- the connect screen, SCOPE and meters, the REC page (arm, record, stop) and playback on the Pi (one glitch when picking takes with C, being fixed), the status pages SIDECAR and SYSTEM catching every knob, the key pass-through (rui1022 and later);
- the remote pages: the Rytm's own font, the stock look, very responsive;
- the FX return on IN L/R (echoes seen on SCOPE's FX source);
- HALO heard;
- the slot reasons !ROOM, !CRSH, !TIME;
- Pi: folder upload of large sample folders, computer audio and MIDI over USB-C, unplugging and replugging the USB cable (after many replugs the Pi may need a restart: known issue), restarting the Rytm and the Pi, the restyled web page and display, Wi-Fi joining on the first boot.

Earlier (1017 to 1022 builds): all the voices heard; the send effects; the Pi recorder (a 5-minute take); user machines; stepped knobs and slot fingerprints; the Pi's cold boot.

Still in testing (emulator or simulator only, not yet reported from a real Rytm): most of what is new in 0.3.0 (see [What works now](https://trigcondition.github.io/sidecar-expander/introduction/what-works-now/#new-in-030)), the DSP SAMPLE waveform page and the machine graphics, the Pi's Wi-Fi settings page.

**Wi-Fi without a cable** (Pi, in testing): create `sidecar-wifi.txt` at the card root with `ssid=MyNetwork` and `psk=MyPassword` (optional `band=2g|5g|any`, default 2.4 GHz; `open=1` for an open network). The Pi imports it at the next boot, stores only the derived key, deletes the file, and falls back to its previous setting after 90 s if the network does not come up. Errors are written to `sidecar-wifi-error.txt`. Details: INSTALL-PI.md. Never share the card while the file is on it.

## USB ID

The Sidecar's own USB device port (the Pi's USB-C, for computer audio and MIDI) presents itself as `1209:0001`. That is a shared **test** ID from pid.codes, not a product ID of our own: another test device on your computer may use it too, and a computer may remember the wrong driver name for it. A proper ID is planned before a final release. Plugging the Rytm into the Sidecar's host port does not depend on it.

## Feedback

Please report what you find with the **Tester report** form under [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose). It asks for the build (the Rytm firmware 0.3.1, and the Sidecar build from `BUILD-INFO-pi.txt`), what you did, and what happened. `http://sidecar.local/status` and `/log`, saved right after the problem, help a lot.

## Versioning

From 0.1.0 on, Sidecar uses semantic versioning (`MAJOR.MINOR.PATCH`): PATCH releases fix, MINOR releases add features (and, before 1.0, may change how a setup behaves), 1.0.0 follows the testers' feedback. From 0.3.0 on, the Rytm firmware carries the same number (`rytm-sidecar-0.3.0.elemod`); the older Rytm builds had their own names (`rui1027d`). Sidecar Mini stays at 0.1.0. The version shows on the SYSTEM page and on the Pi's display and web page.

## Publishing the site (GitHub Pages)

The site is one Astro Starlight project: the landing page is the site root and the docs keep their paths; `public/patcher/` and `public/console/` are served at `/patcher/` and `/console/`. `.github/workflows/deploy.yml` builds it with withastro/action and deploys it with actions/deploy-pages on every push to `main`.

1. Push the repository to `github.com/trigcondition/sidecar-expander` (branch `main`).
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the workflow by hand: **Actions → Deploy to GitHub Pages → Run workflow**).
4. The site is at <https://trigcondition.github.io/sidecar-expander/> (`site` and `base` in `astro.config.mjs`).

Local check: `npm ci && npm run build` (also validates every internal link), `npm run preview`.

## This repository

- `src/content/docs/`: the documentation site (Astro Starlight; `npm ci && npm run build` builds it into `_site/`).
- `public/patcher/`: the Rytm mod patcher (browser page and Python script), served at `/patcher/`.
- `public/console/`: the Sidecar Mini (Teensy) web console over WebSerial, frozen at 0.1.0, served at `/console/`.
- `scripts/`: the release scripts (patch files, console sync, packaging, share scan).
- `RELEASE-NOTES.md`: what is in this release; `KNOWN-ISSUES.md`: what does not work yet. The release files are on [sidecar-firmware](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.3.1) (the Pi) and [sidecar-mods](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.3.1) (the Rytm firmware); 0.1.0 and 0.2.0 stay on this repository's [releases](https://github.com/trigcondition/sidecar-expander/releases).
- `.github/workflows/deploy.yml`: builds and deploys the site to GitHub Pages on every push to `main`.

## Credits and licences

- Our code is under the **GNU GPL version 2 or (at your option) any later version** ([LICENSE](LICENSE)).
- The **Raspberry Pi engine** links the [Circle](https://github.com/rsta2/circle) bare-metal library (GPLv3), so the Pi binary as a whole is distributed under the terms of the **GPL version 3** ([licenses/GPL-3.0.txt](licenses/GPL-3.0.txt)).
- The **Rytm mods** include the core of [elekloader](https://github.com/irpina/elekloader) (GPL-2.0-or-later). The patcher's firmware codec is elekloader's, which comes from [digikit](https://github.com/m-dwyer/digikit).
- The voices and effects build on Mutable Instruments' Plaits and Rings (MIT), DaisySP (MIT), CloudSeed (MIT) and others.

Every third-party component and its licence is listed in [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES).

"Analog Rytm", "Overbridge" and "Elektron" are trademarks of Elektron Music Machines. They are used here only to say what this works with.

## Written offer for source code

The source is public: [sidecar-firmware](https://github.com/trigcondition/sidecar-firmware) (the Sidecar engine, and the frozen Sidecar Mini 0.1.0) and [sidecar-mods](https://github.com/trigcondition/sidecar-mods) (the Rytm mods; it rebuilds the released build byte for byte from your own stock OS file).

Until then, and for at least three years from the date you received a binary from this project, we will give anyone who asks a complete machine-readable copy of the **corresponding source code** for:
- the Raspberry Pi engine (`engine.img` and `sdboot.img`), including Circle and our changes to it, under the GPL version 3;
- the Rytm mods in the patch files and the elekloader modules, including the elekloader core, under the GPL version 2 or later;
- the Teensy firmware (Sidecar Mini 0.1.0), including the materials needed to relink the LGPL-2.1 parts of the Teensyduino core and SPI library.

We provide it at no charge beyond the cost of physically performing the distribution, or as a download. To ask for it, open an issue titled "Source request" in this repository.

## Disclaimer

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. See sections 11 and 12 of the [LICENSE](LICENSE).
