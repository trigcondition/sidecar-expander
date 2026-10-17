---
title: USB audio and MIDI to a computer
description: The Sidecar's USB modes for a computer, and MIDI pass-through.
sidebar:
  order: 8
---

<span class="sc-test">in testing</span>: built and tested on hardware with a computer, not part of the tester release.

With the Sidecar as the Rytm's USB host, the Rytm's own USB port is taken. The Sidecar can hand the Rytm's audio and MIDI on to a computer through its own device port: the Teensy's micro-USB, or the Pi's USB-C. It shows up as a class-compliant audio and MIDI device, so no driver is needed on macOS, Windows or Linux.

## USB modes

| Mode | What the computer sees |
|---|---|
| **multi** | 12 channels in and out: the Rytm's MAIN L/R, its 8 voice outputs and its audio inputs; optionally the Sidecar's 8 voices on channels 13-20 |
| **stereo** | the Rytm's MAIN L/R in and out |
| **off** | MIDI only (and the Teensy's serial console) |

The channel map is the same on both Sidecars, so a DAW template works for either:

| In (to the computer) | Out (from the computer) |
|---|---|
| 1-2 MAIN L/R, 3-10 BD SD RS BT LT MT CH CY, 11-12 audio in L/R, 13-20 the Sidecar's voices | 1-2 MAIN, 3-4 MAIN FX, 5-12 the voice inputs |

The Rytm is the clock. On the Teensy the mode is chosen with `usbmode=multi|stereo|off` in the console and kept across reboots; a change makes the device disconnect and reconnect on the computer. On the Pi, the USB-C device and computer audio are switched on the Sound page.

## MIDI pass-through

The Rytm's USB MIDI goes to the computer, and the computer's MIDI goes to the Rytm: notes, CCs, clock and transport, program changes, SysEx dumps. Two filters stay in place:

- the Sidecar's own messages to and from the Rytm are not passed on;
- OS update messages are never passed to the Rytm. Update the Rytm with the Sidecar unplugged.

## A stock Rytm

A Rytm without the mods only plays its Overbridge MAIN inputs. The Sidecar's voices can still be heard: set `out=main` (all voices summed on MAIN, faded in, limited at -12 dBFS) and `notes=on` (MIDI channel N plays voice N). Each voice's machine is set with `notemach=V:NAME`. This is a test mode; the mods give the full experience.
