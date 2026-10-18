---
title: Sidecar Mini or Sidecar?
description: Sidecar Mini (Teensy 4.1) and Sidecar (Raspberry Pi 4B) compared, and moving a project from one to the other.
sidebar:
  order: 4
---

There are two Sidecars. Both run the same engine core, play the same built-in machines and speak the same protocol to the Rytm.

- **Sidecar Mini** runs on a **Teensy 4.1**. It is the cheap way to get started: the built-in machines, a few user machines, samples streamed from its card, and the remote pages on the Rytm's screen. Recording over the Rytm's USB audio is planned for the Mini.
- **Sidecar** runs on a **Raspberry Pi 4B**. It is the full version: many user machines, the heavy effects (RINGS, CLOUDSEED, STUTTER), the multitrack recorder, the touch display and Wi-Fi.

Start with the Mini, make projects on it, and move up to the full Sidecar later.

| | Sidecar Mini (Teensy 4.1) | Sidecar (Raspberry Pi 4B) |
|---|---|---|
| Processor | one Cortex-M7 at 600 MHz | four Cortex-A72 at 1.5 GHz, bare metal (no Linux) |
| Memory | 1 MB RAM (PSRAM optional) | 2 GB or more |
| Start-up | about a second | about 11 seconds from the SD card |
| Voices | 8 | 8 |
| Built-in machines | all | all |
| User machines (U1..U5) | yes, RMP1 packages; 32 KB of plugin code space: the six starter machines fit together, but only one large NoisePlethora package at a time | yes, RMPA packages; no such limit |
| Samples from the card (SIDECAR folder, sample pool) | yes | yes |
| Send effects | CHORUS, COMB, CRUSH, RINGMOD | those, plus RINGS, CLOUDSEED, STUTTER |
| Remote pages on the Rytm's screen (`rui1021`) | yes (SIDECAR, SYSTEM without recorder and network, voice pages) | yes |
| Recorder | planned | yes, up to 23 sources to the SD card |
| Display | none | optional 5" HDMI touch display |
| Web UI | the console in Chrome or Edge over USB (WebSerial) | its own page at `sidecar.local` over Ethernet or Wi-Fi |
| Wi-Fi | none | yes (off in the SD card package) |
| Computer audio and MIDI over USB | not in this release | yes, multi-channel (tested on hardware) |
| Power | from its micro-USB port | its own 5 V 3 A supply |
| Latency, voice after the Rytm's own drum | about 3.8 ms | about 4.7 ms |

**Planned for the Mini:** a Teensy with PSRAM fitted will get room for more and bigger user machines; the processor has the headroom for it. This is high on the [roadmap](/sidecar-expander/roadmap/). Everything in this release works on a stock Teensy 4.1 without PSRAM.

## Moving a project from the Mini to the Sidecar

The Rytm project itself stays on the Rytm. What the Sidecar keeps per project (the sample pool, the JUNO and FM lists, the user slot list) uses the same files on both, and every sound remembers its user machine by a fingerprint of the machine's id, which is the same in both package types. To move up:

1. Copy your Mini's card folders (`/Samples`, `/JUNO`, `/DX7`, `/PRESETS` and the hidden `/.rytm`) to the Pi's card, or upload them on `sidecar.local`.
2. Install the Pi version (`.a64.rmp`) of each user machine you use: the Teensy's `.rmp` packages do not load on the Pi. You can also export the slot list from the Mini's console and import it on `sidecar.local`.
3. Load the project on the Rytm: the slots find their machines from the project's sounds.

Slot fingerprints across two Sidecars are still <span class="sc-test">in testing</span>.
