---
title: Pi or Teensy?
description: How the two Sidecars compare.
sidebar:
  order: 4
---

Both run the same engine core, play the same machines and speak the same protocol to the Rytm. The Pi has far more CPU and memory, so it gets the large effects, the recorder, the display and the web page. The Teensy is small, cheap, quick to start and needs nothing but a USB cable.

| | Teensy 4.1 | Raspberry Pi 4B |
|---|---|---|
| Processor | one Cortex-M7 at 600 MHz | four Cortex-A72 at 1.5 GHz, bare metal (no Linux) |
| Memory | 1 MB RAM (PSRAM optional) | 2 GB or more |
| Start-up | about a second | about 11 seconds from the SD card |
| Voices | 8 | 8 |
| Built-in machines | all | all |
| User machines (U1..U5) | yes (RMP1 packages) | yes (RMPA packages) |
| Send effects | CHORUS, COMB, CRUSH, RINGMOD | those, plus RINGS, CLOUDSEED, STUTTER |
| Recorder | planned (with PSRAM, then without) | yes, up to 23 sources |
| Display | none | optional 5" HDMI touch |
| Web UI | console in Chrome or Edge over USB (WebSerial) | its own page at `sidecar.local` over Ethernet (Wi-Fi in testing) |
| Computer audio over USB | in testing | in testing |
| Power | from its micro-USB port | its own 5 V 3 A supply |
| Latency, voice after the Rytm's own drum | about 3.8 ms | about 4.7 ms |

**Pick the Teensy** for a light, low-cost box that adds voices and the basic effects.

**Pick the Pi** for the reverb, the resonator and the stutter, multitrack recording, a screen, and file management in a browser.
