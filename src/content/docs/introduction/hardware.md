---
title: Hardware you need
description: The Rytm, the board, the cables and the cards for a Teensy or a Pi Sidecar.
sidebar:
  order: 3
---

## On the Rytm side

- An **Analog Rytm MKII running OS 1.73**, and only OS 1.73. The mods are built against that exact OS, and the patcher refuses any other file.
  - An older OS: update to 1.73 first.
  - A newer OS: this release is not for you. The Rytm does not support downgrades.
- The stock file `Analog-Rytm_MKII_OS1.73.syx` from the official download page. We do not distribute it.
- The official **Transfer** app on a computer, to send the patched OS.
- Recommended: a **DIN MIDI interface**, for the recovery route that works even when the OS does not boot.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the **Overbridge** mode.

## Option A: Teensy 4.1

- A **Teensy 4.1** (PJRC). A stock board is enough.
- A **USB host cable** for the Teensy's 5-pin USB host header. It needs 5 male header pins soldered to the host pads.
- A **micro-USB data cable**, for power and for loading the firmware.
- Optional: a **microSD card** (FAT32 or exFAT) in the Teensy's slot, for samples and patch banks.
- Optional: **PSRAM** chips on the Teensy's underside. Nothing needs them: everything works on a stock board. PSRAM adds headroom for samples, and the recorder on the Teensy will use it.

## Option B: Raspberry Pi 4B

- A **Raspberry Pi 4 Model B**, 2 GB or more.
- The official **USB-C power supply** (5.1 V, 3 A), or one as good.
- A **microSD card**, 1 GB or more. A fast, larger card is better for the recorder.
- A **USB A-to-B cable** from the Pi to the Rytm.
- Optional: a **5" 800x480 HDMI touch display** (tested with a 5" HDMI LCD with USB touch). It uses the micro-HDMI port next to the power socket and one USB-A port for touch.
- Optional: an **Ethernet cable** straight to your computer, for the web page at `sidecar.local`.

## What you do not need

- No hub: plug the Rytm straight into the Sidecar.
- No change to the Rytm's hardware. Everything the Rytm runs comes from the patched OS file, and you can go back to stock at any time.
