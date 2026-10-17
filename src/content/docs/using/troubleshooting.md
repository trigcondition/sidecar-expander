---
title: Troubleshooting and known issues
description: What to check when something does not work, and the issues we know about.
sidebar:
  order: 10
---

## First checks

| Symptom | Check |
|---|---|
| No Sidecar voices | USB CONFIG is the Overbridge mode; the Rytm is plugged straight in, no hub; the Sidecar's log shows `ob: streaming` and `MIDI attached` (Teensy console, `sidecar.local` Log tab) |
| Voices silent right after plugging in | once the Rytm sent no USB MIDI for about 50 seconds while its audio already streamed. Wait a minute, or replug the USB cable |
| A track shows `!NAME` | the Sidecar cannot play that machine or effect: see [!NAME on the Rytm](/sidecar-expander/using/user-machines/#name-on-the-rytm) |
| P2..P5 show numbers, not names | the Sidecar's firmware is older than the mods: update it |
| `sidecar.local` does not open | a direct Ethernet cable; your computer's port on automatic (link-local) or 169.254.61.59/16; try <http://169.254.61.60> |
| STUTTER is silent or always on | see [Set up STUTTER](/sidecar-expander/using/send-effects/#set-up-stutter-route-to-main): ROUTE TO MAIN off, P2 at 0 first |
| The Rytm froze | power cycle it, and report what the Sidecar was doing |
| The Pi does not start | the `# sidecar sdboot begin` block must stay in `config.txt`; use the official 5 V 3 A supply (a weak supply browns out with a display attached) |

## Known issues

### Rytm mods

- **User FX slots are not available yet.** The TYPE list offers the built-in effects only.
- **The remote UI (`rui` builds) is early.** TRK + YES opens the page, but the Sidecar does not serve pages in the tester release. The page stays blank and returns within a second.
- **OS 1.73 only.** Patch files for other OS versions do not exist, and the Rytm cannot be downgraded.
- **The sample browser can lag** while you scroll a large folder with the Sidecar connected. Report the folder size and whether the sequencer was running.
- The slot menu can hold the screen for up to 2 seconds while the Sidecar answers.

### Stock Rytm behaviour

- After an OS upgrade the Rytm can hang on **"Success! Rebooting"**. Power cycle it: the update is complete.

### Teensy 4.1

- RINGS, CLOUDSEED and STUTTER run only on the Pi.
- The console's Machines and Files tabs are in testing.
- USB audio to a computer is not part of the tester release.

### Raspberry Pi 4B

- Wi-Fi is off in the tester release; Ethernet has no DHCP client (fixed 169.254.61.60, or `ip=`).
- The web page has no password.
- Only the Pi 4B is supported. The Pi 5, Pi 3 and Pi 400 are untested.

### Not yet confirmed on hardware

Results from testers are welcome:
- a cold power cycle of the Pi straight into the engine, with no computer attached;
- unplugging and replugging the Sidecar (or its power) while the Rytm plays: the Rytm should keep running, and the names and labels should come back.

## Reporting

Use the **Tester report** form under [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose). It asks for the Rytm build (`sfx1017` / `rui1017`), the Sidecar build (from `BUILD-INFO`), what you did and what happened. A log from the Teensy console or `sidecar.local` helps a lot.
