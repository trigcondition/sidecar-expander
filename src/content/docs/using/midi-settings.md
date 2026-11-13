---
title: MIDI settings (keyboards)
description: "How MIDI keyboards in the Pi's USB-A ports and the computer on USB-C play the Rytm's tracks: the keyboard route SELECTED or CHANNEL, the auto channel and computer notes, set from the SIDECAR MENU or the touchscreen."
sidebar:
  order: 8.1
---

<span class="sc-test">in testing</span> New in 0.5.0 (Sidecar on the Pi 4 and Pi 5). The MIDI page on the Rytm is drawn by the Sidecar, so it works with the Rytm firmware 0.4.4 too.

USB MIDI keyboards and controllers in the Pi's **USB-A** ports, and the computer on the Sidecar's **USB-C** MIDI port, play the Rytm's tracks through the Sidecar. Which track a note plays is the **keyboard route**. Before 0.5.0 it was set on the console only. Now it has a page of its own. For what a keyboard plays on each machine, see [MIDI keyboards on the Pi](/sidecar-expander/using/usb-audio-midi/#midi-keyboards-on-the-pi).

## The settings

| Setting | Values | What it does |
|---|---|---|
| **KEYBOARD ROUTE** | **SELECTED** (default), **CHANNEL** | **SELECTED:** every note, CC, pitch bend and program change plays the track selected on the Rytm. For the Rytm the messages go out on its auto channel, so all the CCs of a controller with several channels land on that one track. **CHANNEL:** MIDI channel N plays Rytm track N (1..12). Channels 13..16 go to the Rytm as they are. Use it for a controller or a DAW that sends each track its own channel |
| **AUTO CHANNEL** | 1..16 (default 14) | the Rytm's own auto channel. Change it here only to match the Rytm's (its MIDI CONFIG > CHANNELS) |
| **COMPUTER NOTES** | ON (default), OFF | ON: the computer's notes go by channel whatever the route: channel N plays track N, 13..16 go to the Rytm as they are, except on the auto channel, which plays the selected track. A DAW that sequences the Rytm's track channels keeps working. OFF: they go straight to the Rytm, untouched |

A change takes effect at once. It is saved on the card (`/.rytm/keys.txt`) a moment later and read again at boot.

## Where to set them

- **On the Rytm:** the **SIDECAR MENU** (UP + YES, then YES on SIDECAR), the **MIDI** row. **Knob A** or **UP / DOWN** pick a row. **YES** or **knob B** changes it. **NO** goes back.
  - A line at the bottom explains each change: `CH 1-12 PLAY TRACKS 1-12`, `NOTES: THE SELECTED TRACK`, `SET THE RYTM'S TO MATCH` (after an AUTO CHANNEL change).
  - The page is not on the LEFT / RIGHT ring.
- **On the touchscreen:** **Settings > MIDI**. The **Keyboards** panel has **Notes play** (Selected track / By channel), **Auto channel** (- / +) and **Computer notes (USB-C)** (Off / On). The controls are greyed until the Sidecar has sent its state.
- **On the console:** `keys=selected`, `keys=channel`, `keys=auto:N` and `keys=mac:on` or `keys=mac:off`. `keys` alone prints the state.

## What the pages show

The Rytm's MIDI page has three more rows:

| Row | Shows |
|---|---|
| **MIDI LEARN** | the number of learned routes (`NONE`, `3 ROUTES`). `WAITING` while a learn is armed: YES stops it. **YES twice** clears every route. `LOCKED` when the file was written by a newer build: nothing is cleared |
| **USB-A** | the first device in the Pi's USB-A ports by name, and `+N` for more. Read only |
| **LAST** | the way the last key went, for example `MPKMINI > SD POLY`. Read only |

The touchscreen's **In now** panel lists every USB-A device by name, the last key and the number of MIDI-learn routes. Arming a learn is a console command (`learn=fader`, `learn=a`, `learn=b` or `learn=NAME`, with an optional depth after a colon), not a button.

The USB-C mode stays in Settings > Sound and the SIDECAR MENU's USB-C row.
