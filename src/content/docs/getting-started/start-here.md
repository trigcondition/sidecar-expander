---
title: Start here
description: "The short way to a working Sidecar 0.5.1: patch Elektron's stock OS 1.74 in the browser, flash it with Transfer, make the Pi's SD card, connect and play."
sidebar:
  order: 1
---

Prefer to do it step by step on one page, with the patcher and the downloads in it? Use [Set up Sidecar](/sidecar-expander/getting-started/setup/). This page is the same route as text.

The one route for a new setup: an Analog Rytm MKII, a Raspberry Pi 4B or Pi 5, Sidecar 0.5.1 (on the Pi) with the Rytm firmware 0.5.0 (on the Rytm, OS 1.74; 0.5.1 brings no new Rytm firmware). Each step links to the full page if you need more. Prefer paper? The whole manual is a PDF: [Sidecar-0.5.0-User-Manual.pdf](https://github.com/trigcondition/sidecar-firmware/releases/download/v0.5.0/Sidecar-0.5.0-User-Manual.pdf).

New to Sidecar? The [introduction video](https://www.youtube.com/watch?v=b10zwIORtgU) shows the workflow and the features of 0.4.4 (an earlier release) in about 20 minutes.

:::caution
Back up first: use Transfer to back up your projects, kits, sounds and samples before you flash. You can always go back to the stock OS ([Recovery to stock](/sidecar-expander/getting-started/recovery/)).
:::

1. **Get the stock OS.** Download `Analog-Rytm_MKII_OS1.74_dist.zip` from Elektron's Analog Rytm MKII support page and unzip it. You need `Analog-Rytm_MKII_OS1.74.syx`.
2. **Patch it.** Open the [patcher](/sidecar-expander/patcher/), leave the build on the default (the first in the list), drop the stock `.syx` on the page, press **Patch**, then **Save .syx**. Nothing is uploaded: it all happens in your browser.
3. **Flash the Rytm.** With the Rytm connected to your computer over USB, drop the patched `.syx` on Transfer and confirm on the Rytm. If it stays on "Success! Rebooting", power cycle it.
4. **Make the SD card.** From Sidecar 0.5.0 on the easiest way is the ready **SD card image** of the release (one for 800x480, one for 1024x600): write it to a microSD card with Raspberry Pi Imager or balenaEtcher ([details](/sidecar-expander/getting-started/install-pi/#make-the-sd-card)). The other way, for any release: from the [Sidecar 0.4.4 release](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.4.4), download the 800x480 card zip (or the 1024x600 one for a 1024x600 display). Format a microSD card as FAT32, unzip, and copy the files themselves to the card's top level ([details](/sidecar-expander/getting-started/install-pi/#make-the-sd-card)).
   If you need other settings (screen size, Wi-Fi, the Ethernet address), make the card's `config.txt` and `cmdline.txt` with the [card config editor](/sidecar-expander/getting-started/config-editor/) before you start.
5. **Connect.** Put the card in the Pi. Connect the Rytm's USB port to a USB-A port of the Pi, no hub, with a good, short USB A-to-B cable (like the one that comes with the Rytm). On the Rytm, set SETTINGS > SYSTEM > USB CONFIG to the Overbridge mode.
6. **Power up and play.** Power the Pi with its official supply. After about 11 seconds the Rytm shows the Sidecar's connect screen. Pick an EXT machine on a track and play it; hold UP to see every shortcut.

## Choose your setup

- [A display](/sidecar-expander/using/display/): which touch displays work, and the screen sizes.
- [Raspberry Pi 5](/sidecar-expander/getting-started/install-pi/#raspberry-pi-5): the supply and what is different.
- [The web page](/sidecar-expander/getting-started/install-pi/#first-boot-over-ethernet-sidecarlocal): `sidecar.local` over Ethernet, and pairing your browser.
- [Overbridge and the Rytm's settings](/sidecar-expander/introduction/hardware/): what you need, and which USB and MIDI settings matter.
- [Computer audio](/sidecar-expander/using/usb-audio-midi/): the Sidecar as an audio and MIDI interface for your DAW.
- [OS 1.73](/sidecar-expander/getting-started/patch-and-flash/#which-os-174-or-173): 0.5.x needs OS 1.74; this explains moving between 1.73 and 1.74.
- [Build it yourself](/sidecar-expander/getting-started/patch-and-flash/#advanced-build-it-with-elekloader): the same firmware with elekloader, and the hashes to check.
- [Recovery to stock](/sidecar-expander/getting-started/recovery/): going back, and the STARTUP menu if the Rytm does not boot.
- [User machines](/sidecar-expander/getting-started/install-pi/#starter-user-machines) and [Wi-Fi](/sidecar-expander/using/wifi/).
- [Analog Four MKII](/sidecar-expander/using/analog-four/#install).
- Something wrong? [Troubleshooting](/sidecar-expander/using/troubleshooting/), or ask on [Discord](/sidecar-expander/about/community/).
