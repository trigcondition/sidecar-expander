---
title: Hardware you need
description: The Rytm, the board, the cables and the cards for Sidecar Mini (Teensy 4.1) or Sidecar (Raspberry Pi 4B).
sidebar:
  order: 3
---

## On the Rytm side

- An **Analog Rytm MKII running OS 1.73**, and only OS 1.73. The mods are built against that exact OS, and the patcher refuses any other file.
  - An older OS: update to 1.73 first.
  - OS 1.74 or newer: not supported yet. The first version is based on Analog Rytm MKII OS 1.73; OS 1.74 will be supported after testing. On OS 1.74 (or any other version), first flash the stock OS 1.73 `.syx` with Transfer, as any OS update, then patch and flash it.
- The stock file `Analog-Rytm_MKII_OS1.73.syx` from the official download page. We do not distribute it.
- The official **Transfer** app on a computer, to send the patched OS.
- Recommended: a **DIN MIDI interface**, for the recovery route that works even when the OS does not boot.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the **Overbridge** mode. That is the only setting the Sidecar needs: the Rytm's MIDI port settings (USB MIDI in and out) do not have to be changed for the voices, send effects, user machines or remote pages (tested on hardware). Only STUTTER's tempo sync and the recorder's armed mode use the Rytm's clock and transport over USB (MIDI CONFIG: CLOCK SEND and TRANSPORT SEND).

## Option A: Sidecar Mini (Teensy 4.1)

- A **Teensy 4.1** (PJRC). A stock board is enough.
- **Solder the Teensy 4.1's USB host header** (5 V, D-, D+, GND, shield). Press-fit or unsoldered pins make the host port flaky: the Rytm connects only after a reboot or after many retries (the link comes up at full speed and drops), and the Teensy's own USB to the computer can drop when the host port's power switches on. Use a short, good USB cable to the Rytm.
- A **USB host cable** for the Teensy's 5-pin USB host header. It needs 5 male header pins soldered to the host pads.
- A **micro-USB data cable**, for power and for loading the firmware.
- Optional: a **microSD card** (FAT32 or exFAT) in the Teensy's slot, for samples and patch banks. **To record on a Mini without PSRAM, use a fast card** (A1/A2, U3/V30): the Teensy's own buffer is small.
- Optional: **PSRAM** chips on the Teensy's underside. Nothing needs them: everything works on a stock board. PSRAM adds headroom for samples, a second plugin code space for more and bigger user machines, and stems recording (both in testing: see KNOWN-ISSUES for what PSRAM testers can run).

## Option B: Sidecar (Raspberry Pi 4B)

- A **Raspberry Pi 4 Model B**, 2 GB or more.
- The official **USB-C power supply** (5.1 V, 3 A), or one as good.
- A **microSD card**, 1 GB or more. A fast, larger card is better for the recorder.
- A **USB A-to-B cable** from the Pi to the Rytm.
- Optional: a **5" 800x480 HDMI touch display** (tested with a 5" HDMI LCD with USB touch). It uses the micro-HDMI port next to the power socket and one USB-A port for touch.
- Optional: an **Ethernet cable** straight to your computer, for the web page at `sidecar.local`.

## What you do not need

- No hub: plug the Rytm straight into the Sidecar.
- No change to the Rytm's hardware. Everything the Rytm runs comes from the patched OS file, and you can go back to stock at any time.
