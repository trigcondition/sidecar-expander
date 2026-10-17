---
title: What works now
description: The features of the current line, and which are confirmed on real hardware.
sidebar:
  order: 2
---

Sidecar is in public testing. Each feature below is marked:

- <span class="sc-ok">hardware</span>: checked on a real Rytm MKII with the Sidecar attached;
- <span class="sc-test">in testing</span>: built and tested in the emulator or on the Sidecar alone, not yet confirmed with a real Rytm;
- <span class="sc-plan">planned</span>: on the [roadmap](/sidecar-expander/roadmap/).

The current tester builds of the Rytm mods are `sfx1017` (recommended) and `rui1017` (with the early remote UI). The next line (`sfx1019`, `rui1019`) adds stepped knobs and slot fingerprints; those parts are marked "in testing".

## On both Sidecars

| Feature | Status |
|---|---|
| EXT machines PLAITS and DAISYSP on every track | <span class="sc-ok">hardware</span> |
| EXT machines DSP SAMPLE, DIGIDRUM, JUNO, 6-OP FM | <span class="sc-test">in testing</span> (each engine plays on the Sidecar on hardware; the full path from the modded Rytm is emulator-tested) |
| Each voice returns on its own track and plays through the track's analog filter and amp | <span class="sc-ok">hardware</span> |
| SEND FX 1/2 pages: AMPLITUDE 2 sends, TYPE, P1 ROUTE (PRE/POST), P2..P5 with the effect's labels | <span class="sc-ok">hardware</span> |
| CHORUS and COMB send effects | <span class="sc-ok">hardware</span> (Pi and Teensy) |
| CRUSH and RINGMOD send effects | <span class="sc-test">in testing</span> |
| The TEENSY folder in the Rytm's sample browser, LOAD TO PROJ into the Sidecar's sample pool | <span class="sc-ok">hardware</span> |
| User machines in slots U1..U5 | <span class="sc-ok">hardware</span> (loading); slot menu fixes and slot fingerprints <span class="sc-test">in testing</span> |
| Stepped knobs (STUTTER ENG and LEN, list knobs step one item a detent) | <span class="sc-test">in testing</span> (`sfx1019`) |
| Double stop fades the Sidecar's effect tails | <span class="sc-ok">hardware</span> (Pi) |
| Remote UI: Sidecar pages on the Rytm's screen (TRK + YES) | <span class="sc-test">in testing</span>; `rui1017` opens a blank page |

## Raspberry Pi 4B only

| Feature | Status |
|---|---|
| RINGS, CLOUDSEED and STUTTER send effects | <span class="sc-ok">hardware</span> |
| Multitrack recorder to the SD card (up to 23 sources) | <span class="sc-ok">hardware</span> (5-minute take, 13 files) |
| Web page at `http://sidecar.local`: status, sound, send FX, record, machines, files, log | <span class="sc-ok">hardware</span> |
| File browser with folder upload | <span class="sc-ok">hardware</span> |
| 5" HDMI touch display: status, settings, screensaver, brightness | <span class="sc-ok">hardware</span> |
| Boots from its own SD card, no computer needed | <span class="sc-ok">hardware</span> (a cold power cycle still to confirm) |
| Wi-Fi: join a WPA2 network | <span class="sc-test">in testing</span> (joined once; no setup page yet) |
| Computer audio and MIDI over USB-C | <span class="sc-test">in testing</span> |

## Teensy 4.1 only

| Feature | Status |
|---|---|
| Runs on a stock board, no PSRAM needed | <span class="sc-ok">hardware</span> |
| Web console over WebSerial: log, status, commands | <span class="sc-ok">hardware</span> |
| Console tabs for user machines and the SD card | <span class="sc-test">in testing</span> |
| USB audio to a computer (multi-channel or stereo) and MIDI pass-through | <span class="sc-test">in testing</span>; not in the tester release |

For what does not work yet, see [Troubleshooting and known issues](/sidecar-expander/using/troubleshooting/).
