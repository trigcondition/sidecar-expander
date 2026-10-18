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

:::note
The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. The remote pages (`rui1021`) and the Pi's latest fixes were tested on a real Rytm on 2026-10-18; other "hardware" marks come from the 1017 to 1020 builds of the same line. Keep the stock OS file at hand: flashing it takes you back, and your projects stay compatible both ways.
:::

## On both: Sidecar Mini and Sidecar

| Feature | Status |
|---|---|
| EXT machines PLAITS and DAISYSP on every track | <span class="sc-ok">hardware</span> |
| EXT machines DSP SAMPLE, DIGIDRUM, JUNO, 6-OP FM | <span class="sc-ok">hardware</span> (heard from the modded Rytm) |
| Each voice returns on its own track and plays through the track's analog filter and amp | <span class="sc-ok">hardware</span> |
| SEND FX 1/2 pages: AMPLITUDE 2 sends, TYPE, P1 ROUTE (PRE/POST), P2..P5 with the effect's labels | <span class="sc-ok">hardware</span> |
| CHORUS and COMB send effects | <span class="sc-ok">hardware</span> (Pi, and the Teensy live) |
| CRUSH and RINGMOD send effects | <span class="sc-ok">hardware</span> |
| The sample browser folder, LOAD TO PROJ into the Sidecar's sample pool | <span class="sc-ok">hardware</span> (as TEENSY); the new name **SIDECAR** <span class="sc-test">in testing</span> (1021) |
| The **NO SIDECAR** popup in the slot menu (was NO TEENSY) | <span class="sc-test">in testing</span> (1021) |
| User machines in slots U1..U5 | <span class="sc-ok">hardware</span> (loading on the Pi and the Mini), slot menu fixes too |
| Slot fingerprints when a project is shared with another Sidecar (slot prints) | <span class="sc-ok">hardware</span> |
| Stepped list knobs (STUTTER ENG and LEN, ENG / PAT / list knobs step one item a detent) | <span class="sc-ok">hardware</span> |
| Double stop fades the Sidecar's effect tails | <span class="sc-ok">hardware</span> (Pi) |

## The remote UI (`rui1021`)

| Feature | Status |
|---|---|
| Sidecar pages on the Rytm's screen (TRK + YES) with the Pi (1021 kernel) | <span class="sc-ok">hardware</span> (2026-10-18) |
| Sidecar pages with Sidecar Mini (Teensy, 1021 firmware): SIDECAR, SYSTEM (no recorder or network on the Teensy) and voice pages | <span class="sc-ok">hardware</span> (2026-10-18) |
| Text in the Rytm's own font, the stock look, very responsive knobs; status as two pages SIDECAR + SYSTEM | <span class="sc-ok">hardware</span> (2026-10-18) |
| PLAY/STOP while a page is open | not yet: every key goes to the Sidecar (fix in progress) |

## Sidecar (Raspberry Pi 4B) only

| Feature | Status |
|---|---|
| RINGS, CLOUDSEED and STUTTER send effects | <span class="sc-ok">hardware</span> |
| Multitrack recorder to the SD card (up to 23 sources) | <span class="sc-ok">hardware</span> (5-minute take, 13 files) |
| Web page at `http://sidecar.local`: status, sound, send FX, record, machines, files, log | <span class="sc-ok">hardware</span> (restyled, 2026-10-18) |
| Sample pool and presets per project, the Pool & presets page | <span class="sc-ok">hardware</span> |
| File browser with folder upload, also large sample folders (summary line, Retry failed) | <span class="sc-ok">hardware</span> (2026-10-18) |
| Unplugging and replugging the USB cable to the Rytm; restarting the Rytm or the Pi | <span class="sc-ok">hardware</span> (2026-10-18): the digital voices stop and resume |
| 5" HDMI touch display: status, settings, screensaver, brightness | <span class="sc-ok">hardware</span> (restyled, 2026-10-18) |
| Display: hide the touch test, brightness down to 5 % | <span class="sc-ok">hardware</span> |
| Boots from its own SD card, no computer needed | <span class="sc-ok">hardware</span>, also from a cold power cycle |
| Wi-Fi: join a WPA2 network | <span class="sc-ok">hardware</span> (joins on the first boot; off in the package, no setup page yet); rejoin watchdog <span class="sc-test">in testing</span> (new) |
| Computer audio and MIDI over USB-C | <span class="sc-ok">hardware</span> (multi-channel audio and MIDI) |

## Sidecar Mini (Teensy 4.1) only

| Feature | Status |
|---|---|
| Runs on a stock board, no PSRAM needed | <span class="sc-ok">hardware</span> |
| More and bigger user machines on a Teensy with PSRAM | <span class="sc-plan">planned</span> (high priority) |
| Recorder on the Mini | <span class="sc-plan">planned</span> |
| Web console over WebSerial: log, status, commands | <span class="sc-ok">hardware</span> |
| Console tabs for user machines and the SD card | <span class="sc-test">in testing</span> |
| USB audio to a computer (multi-channel or stereo) and MIDI pass-through | <span class="sc-test">in testing</span>; not in the tester release |

For what does not work yet, see [Troubleshooting and known issues](/sidecar-expander/using/troubleshooting/).
