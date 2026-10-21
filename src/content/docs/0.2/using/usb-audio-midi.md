---
slug: 0.2/using/usb-audio-midi
title: USB audio and MIDI to a computer
description: The Sidecar's USB modes for a computer, and MIDI pass-through.
sidebar:
  order: 8
---

<span class="sc-ok">hardware</span> on the **Sidecar (Pi 4B)**: part of this release (not on the **Pi 5** in 0.2.0: its USB-C port is power only), tested with multi-channel audio and MIDI (no clicks at the stream's start; 5 minutes clean, 2026-10-19). On the **Sidecar Mini (Teensy)**: stereo USB audio to the computer, <span class="sc-ok">hardware</span> (2026-10-18, heard in a DAW); part of this release.

## Sidecar Mini: stereo USB audio and MIDI

<span class="sc-ok">hardware</span> (2026-10-18, heard in a DAW). The Sidecar Mini release build is a **stereo** USB audio interface: 2 in / 2 out at 48 kHz, 24-bit, plus USB MIDI.

| | |
|---|---|
| IN 1/2 (to the computer) | the Rytm's MAIN L/R, with the Sidecar's voices as the Rytm plays them |
| OUT 1/2 (from the computer) | added to the Rytm's MAIN input |
| USB MIDI | the Rytm's MIDI to the computer and back (<span class="sc-test">in testing</span>) |
| Mode | `:usbmode=stereo` (the default) or `:usbmode=off`, on the console or its USB tab; kept across reboots |
| While recording | without PSRAM the recorder and USB audio share one 32 KB buffer: while the recorder is armed or records, USB audio is **paused** (the device stays, the computer hears silence) and comes back when the take ends. USB MIDI keeps running. |

The 20-in / 12-out multichannel mode on the Mini is **not in this release**; it is in development. On the Mini the computer sees the device as **Sidecar Mini**.


With the Sidecar as the Rytm's USB host, the Rytm's own USB port is taken. The Sidecar can hand the Rytm's audio and MIDI on to a computer through its own device port: the Teensy's micro-USB, or the Pi's USB-C. It shows up as a class-compliant audio and MIDI device, so no driver is needed on macOS, Windows or Linux.

## What the computer sees

| | Sidecar (Pi) | Sidecar Mini (release build) |
|---|---|---|
| Audio | 12 in / 12 out (UAC2); computer audio on or off on the Sound tab | stereo, 2 in / 2 out; `:usbmode=stereo` or `off` |
| MIDI | yes | yes |

On the Pi a build option (`SIDECAR_CH_IN=20`) adds the Sidecar's 8 voices on inputs 13-20, in voice order; the release has 12.

The Pi's channel map:

| In (to the computer) | Out (from the computer) |
|---|---|
| 1-2 MAIN L/R, 3-10 BD SD RS BT LT MT CH CY, 11-12 audio in L/R (or the FX return) | 1-2 MAIN, 3-4 MAIN FX, 5-12 the voice inputs |

The Rytm is the clock. On the Sidecar (Pi) the multichannel mode is the default; the Mini offers stereo in this release (above). On the Pi, the USB-C device and computer audio are switched on the Sound page.

## MIDI pass-through

The Rytm's USB MIDI goes to the computer, and the computer's MIDI goes to the Rytm: notes, CCs, clock and transport, program changes, and on the Sidecar (Pi) SysEx dumps (the Sidecar Mini blocks all of the maker's SysEx on the way to the Rytm, dumps included). Two filters stay in place:

- the Sidecar's own messages to and from the Rytm are not passed on;
- OS update messages are never passed to the Rytm. Update the Rytm with the Sidecar unplugged.

## A stock Rytm

A Rytm without the mods only plays its Overbridge MAIN inputs. The Sidecar's voices can still be heard: set `out=main` (all voices summed on MAIN, faded in, limited at -12 dBFS) and `notes=on` (MIDI channel N plays voice N). Each voice's machine is set with `notemach=V:NAME`. This is a test mode; the mods give the full experience.

## Recording the Sidecar's audio in OBS (macOS)

- Allow OBS to use audio inputs: **System Settings → Privacy & Security → Microphone**, switch OBS on, then restart OBS.
- The Sidecar (Pi) presents 12 inputs, the Sidecar Mini 2 (the stereo release build). OBS takes **channels 1-2**, which are the Rytm's MAIN L/R.
- For more channels at once, use a DAW, or combine devices in an aggregate device (Audio MIDI Setup).
