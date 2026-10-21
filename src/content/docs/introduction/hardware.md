---
title: Hardware you need
description: The Rytm, the board, the cables and the cards for Sidecar (Raspberry Pi 4B or Pi 5).
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

## Sidecar (Raspberry Pi 4B or Pi 5)

:::note[Sidecar Mini]
Sidecar Mini (Teensy 4.1) is frozen at 0.1.0; its docs are in the [0.2 docs](/sidecar-expander/0.2/introduction/pi-vs-teensy/).
:::


- A **Raspberry Pi 4 Model B** (2 GB or more) or a **Raspberry Pi 5**. One SD card set boots both.
- The official **USB-C power supply**: 5.1 V 3 A for the Pi 4, **27 W** for the Pi 5, plugged in directly (not through a hub).
- A **microSD card**, 1 GB or more. A fast, larger card is better for the recorder.
- A **USB A-to-B cable** from the Pi to the Rytm.
- Optional: a **5" 800x480 HDMI touch display** (tested with a 5" HDMI LCD with USB touch). It uses the micro-HDMI port next to the power socket and one USB-A port for touch.
- Optional: an **Ethernet cable** straight to your computer, for the web page at `sidecar.local`.

| | Raspberry Pi 4B | Raspberry Pi 5 |
|---|---|---|
| Use | **with a computer**: the Sidecar is also a USB-C audio and MIDI interface (<span class="sc-ok">hardware</span>) | **standalone**: no USB audio or MIDI to the computer yet |
| Supply | official 5.1 V 3 A USB-C | official 27 W USB-C, directly: from a hub's port the Pi 5 ran in reduced-power mode and the web page became slow ("503 busy"). The Sidecar warns about a weak supply |
| HDMI display (micro-HDMI 0) | 800x480, sharp (<span class="sc-ok">hardware</span>) | the 800x480 UI scaled to the firmware's 1920x1080: works, slightly soft (<span class="sc-ok">hardware</span>) |
| DSI display | the firmware's: expected, being confirmed | driven by the engine: <span class="sc-test">in testing</span> |
| Wi-Fi | <span class="sc-ok">hardware</span> | <span class="sc-ok">hardware</span> |
| Since | 0.1.0 | 0.2.0 |

## What you do not need

- No hub: plug the Rytm straight into the Sidecar.
- No change to the Rytm's hardware. Everything the Rytm runs comes from the patched OS file, and you can go back to stock at any time.
