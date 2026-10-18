---
title: What works now
description: The features of the current line, and which are confirmed on real hardware.
sidebar:
  order: 2
---

Sidecar is in public testing. Each feature below is marked:

- <span class="sc-ok">hardware</span>: checked on a real Rytm MKII with the Sidecar attached;
- <span class="sc-test">in testing</span>: built and tested in the emulator or the simulator, or on the Sidecar alone, not yet confirmed with a real Rytm;
- <span class="sc-plan">planned</span>: on the [roadmap](/sidecar-expander/roadmap/).

The current tester builds of the Rytm mods are `sfx1021` (the default) and `rui1021` (with the remote UI, for the Pi with the 1021 kernel).

:::caution[The 1021 Rytm builds are not yet confirmed on a real Rytm]
`sfx1021` and `rui1021` pass our emulator tests, but nobody has run them on a real Rytm yet. A "hardware" mark below means the feature worked on a real Rytm with an earlier build of the same line (1017 to 1020); what is new in 1021 is marked "in testing". Keep the stock OS file at hand: flashing it takes you back, and your projects stay compatible both ways.
:::

## On both Sidecars

| Feature | Status |
|---|---|
| EXT machines PLAITS and DAISYSP on every track | <span class="sc-ok">hardware</span> |
| EXT machines DSP SAMPLE, DIGIDRUM, JUNO, 6-OP FM | <span class="sc-ok">hardware</span> (heard from the modded Rytm) |
| Each voice returns on its own track and plays through the track's analog filter and amp | <span class="sc-ok">hardware</span> |
| SEND FX 1/2 pages: AMPLITUDE 2 sends, TYPE, P1 ROUTE (PRE/POST), P2..P5 with the effect's labels | <span class="sc-ok">hardware</span> |
| CHORUS and COMB send effects | <span class="sc-ok">hardware</span> (Pi, and the Teensy live) |
| CRUSH and RINGMOD send effects | <span class="sc-test">in testing</span> |
| The sample browser folder, LOAD TO PROJ into the Sidecar's sample pool | <span class="sc-ok">hardware</span> (as TEENSY); the new name **SIDECAR** <span class="sc-test">in testing</span> (1021) |
| The **NO SIDECAR** popup in the slot menu (was NO TEENSY) | <span class="sc-test">in testing</span> (1021) |
| User machines in slots U1..U5 | <span class="sc-ok">hardware</span> (loading on the Pi); slot menu fixes <span class="sc-test">in testing</span> |
| Slot fingerprints when a project is shared with another Sidecar (slot prints) | <span class="sc-test">in testing</span> |
| Stepped list knobs (STUTTER ENG and LEN, ENG / PAT / list knobs step one item a detent) | <span class="sc-test">in testing</span> |
| Double stop fades the Sidecar's effect tails | <span class="sc-ok">hardware</span> (Pi) |

## The remote UI (`rui1021`)

| Feature | Status |
|---|---|
| Sidecar pages on the Rytm's screen (TRK + YES), with the Pi | <span class="sc-ok">hardware</span> with `rui1019` and its kernel (the earlier font) |
| Text in the Rytm's own font, stock layout, the full SIDECAR status page, faster knob response | <span class="sc-test">in testing</span> (1021, Pi with the 1021 kernel) |
| The remote UI with the Teensy | <span class="sc-test">untested</span> |

## Raspberry Pi 4B only

| Feature | Status |
|---|---|
| RINGS, CLOUDSEED and STUTTER send effects | <span class="sc-ok">hardware</span> |
| Multitrack recorder to the SD card (up to 23 sources) | <span class="sc-ok">hardware</span> (5-minute take, 13 files) |
| Web page at `http://sidecar.local`: status, sound, send FX, record, machines, files, log | <span class="sc-ok">hardware</span> |
| Sample pool and presets per project, the Pool & presets page | <span class="sc-test">in testing</span> (simulator; not yet checked by ear) |
| File browser with folder upload | <span class="sc-ok">hardware</span> |
| 5" HDMI touch display: status, settings, screensaver, brightness | <span class="sc-ok">hardware</span> |
| Boots from its own SD card, no computer needed | <span class="sc-ok">hardware</span> with a computer attached; a cold power cycle straight into the engine <span class="sc-test">in testing</span> |
| Wi-Fi: join a WPA2 network | <span class="sc-ok">hardware</span> (joined; off in the package, no setup page yet) |
| Computer audio and MIDI over USB-C | <span class="sc-test">in testing</span> |

## Teensy 4.1 only

| Feature | Status |
|---|---|
| Runs on a stock board, no PSRAM needed | <span class="sc-ok">hardware</span> |
| Web console over WebSerial: log, status, commands | <span class="sc-ok">hardware</span> |
| Console tabs for user machines and the SD card | <span class="sc-test">in testing</span> |
| USB audio to a computer (multi-channel or stereo) and MIDI pass-through | <span class="sc-test">in testing</span>; not in the tester release |

For what does not work yet, see [Troubleshooting and known issues](/sidecar-expander/using/troubleshooting/).
