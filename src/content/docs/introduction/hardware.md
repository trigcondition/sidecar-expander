---
title: Hardware you need
description: The Rytm, the board, the cables and the cards for Sidecar (Raspberry Pi 4B or Pi 5).
sidebar:
  order: 3
---

## On the Rytm side

- An **Analog Rytm MKII on OS 1.74 or OS 1.73**. There is one build of the mods for each, built against that exact OS; elekloader refuses a module made for another OS. The 1.74 build has run on a real Rytm.
  - An older OS: update to 1.74 first (Elektron offers only 1.74 now).
  - You can move between 1.73 and 1.74 in both directions with Elektron's stock files (Elektron offers only 1.74 now, so keep your own copy of 1.73 if you want it): see [Which OS](/sidecar-expander/getting-started/patch-and-flash/#which-os-174-or-173).
  - A newer OS than 1.74: not supported yet.
- The stock file of your OS: `Analog-Rytm_MKII_OS1.74.syx` from Elektron's `Analog-Rytm_MKII_OS1.74_dist.zip` on the Rytm MKII support page, or the `Analog-Rytm_MKII_OS1.73.syx` you have. We do not distribute it.
- The official **Transfer** app on a computer, to send the patched OS.
- Recommended: a **DIN MIDI interface**, for the recovery route that works even when the OS does not boot.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the **Overbridge** mode. That is the only setting the Sidecar needs: the Rytm's MIDI port settings (USB MIDI in and out) do not have to be changed for the voices, send effects, user machines or remote pages (tested on hardware). **Playing notes from the pads (CHRO mode):** the track's sound needs **CHROMATIC** on **SYNTH** or **SYN+SMP** (FUNC + FLTR, the sound's settings). On OFF or SAMPLE the Rytm sends the Sidecar no pitch and every pad plays the same note. The setting belongs to the sound and stays when you change its machine. Poly tracks, and chords held on the pads (6-OP FM and the poly machines), also need **PAD DEST** on **INT+EXT** (SETTINGS > MIDI CONFIG > PORT CONFIG), with OUTPUT TO including USB: the Sidecar reads the pads' MIDI notes. After you select a track, its first pad hit or two may stay silent while the Sidecar learns which voice the pads play. Only STUTTER's tempo sync, synced LFOs and the recorder's armed mode use the Rytm's clock and transport over USB (MIDI CONFIG: CLOCK SEND and TRANSPORT SEND). The 0.3.0's [song recorder](/sidecar-expander/using/song-recorder/) needs a few more MIDI CONFIG settings, which it checks for you.

## Sidecar (Raspberry Pi 4B or Pi 5)

:::note[Sidecar Mini]
Sidecar Mini (Teensy 4.1) is frozen at 0.1.0; its docs are in the [0.2 docs](/sidecar-expander/0.2/introduction/pi-vs-teensy/).
:::


- A **Raspberry Pi 4 Model B** (2 GB or more) or a **Raspberry Pi 5**. One SD card set boots both.
- The official **USB-C power supply**: 5.1 V 3 A for the Pi 4, **27 W** for the Pi 5, plugged in directly (not through a hub).
- A **heatsink or a fan** (a case with a fan, or at least a heatsink on the SoC). The Pi runs the Sidecar's audio at full clock; above its temperature limit it slows itself down to 600 MHz, and the sound can drop out. See [Keeping it cool](/sidecar-expander/using/troubleshooting/#keeping-it-cool).
- A **microSD card**, 1 GB or more. A fast, larger card is better for the recorder.
- A **USB A-to-B cable** from the Pi to the Rytm.
- Optional: a **touch display**. Not needed to play or edit: the Sidecar's pages open on the Rytm's own screen, and the web page covers setup ([A screen is optional](/sidecar-expander/introduction/what-is-sidecar/#a-screen-is-optional)). It adds the piano roll, the scope and the status at a glance. Displays: an 800x480 HDMI display with USB touch (tested with a 5" HDMI LCD), a 7" DSI display compatible with the official display v1 (tested with the OSOYOO 7" DSI on a Pi 4), or in 0.3.0 a 1024x600 HDMI display. See [The display](/sidecar-expander/using/display/#which-displays-work).
- Optional (0.3.0): a **USB stick** formatted FAT32 (MBR) for project bundles, in a blue USB 3 port of the Pi 4; see [Storage](/sidecar-expander/using/storage/).
- Optional: an **Ethernet cable** straight to your computer, for the web page at `sidecar.local`.

| | Raspberry Pi 4B | Raspberry Pi 5 |
|---|---|---|
| Use | **with a computer**: the Sidecar is also a USB-C audio and MIDI interface (<span class="sc-ok">hardware</span>) | **with a computer** too, from 0.4.0 (<span class="sc-test">in testing</span>): needs a USB-C power and data splitter or a header-pin supply: a computer or hub port gives a Pi 5 only about 1.5 A ([USB audio and MIDI](/sidecar-expander/using/usb-audio-midi/#powering-a-pi-5-with-a-computer-attached)) |
| Overbridge passthrough (opt-in) | the computer sees the Rytm through the Sidecar since 0.4.1 (<span class="sc-ok">hardware</span>, [Overbridge through the Sidecar](/sidecar-expander/using/usb-audio-midi/#overbridge-through-the-sidecar)) | the same, since 0.4.2 (<span class="sc-ok">hardware</span>, on a powered hub port; a USB-C power and data splitter is recommended) |
| Supply | official 5.1 V 3 A USB-C | official 27 W USB-C, directly: from a hub's port the Pi 5 ran in reduced-power mode and the web page became slow ("503 busy"). The Sidecar warns about a weak supply |
| HDMI display (micro-HDMI 0) | 800x480, sharp (<span class="sc-ok">hardware</span>) | the 800x480 UI scaled to the firmware's 1920x1080: works, slightly soft (<span class="sc-ok">hardware</span>) |
| DSI display | <span class="sc-ok">hardware</span> (OSOYOO 7" DSI, 0.3.0) | driven by the engine: <span class="sc-test">in testing</span> |
| Touch Display 2 | not supported | 7": <span class="sc-ok">hardware</span> (0.3.2); 5": <span class="sc-test">in testing</span>, untested here ([The display](/sidecar-expander/using/display/#which-displays-work)) |
| Wi-Fi | <span class="sc-ok">hardware</span> | <span class="sc-ok">hardware</span> |
| Since | 0.1.0 | 0.2.0 |

## What you do not need

- No touchscreen: the Rytm's screen and keys drive everything, and a phone or laptop browser covers setup.
- No hub: plug the Rytm straight into the Sidecar.
- No change to the Rytm's hardware. Everything the Rytm runs comes from the patched OS file, and you can go back to stock at any time.
