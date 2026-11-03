---
title: USB audio and MIDI to a computer
description: The Sidecar's USB modes for a computer, and MIDI pass-through.
sidebar:
  order: 8
---

<span class="sc-ok">hardware</span> on the **Pi 4B**: part of the 0.2.0 release, tested with multi-channel audio and MIDI (no clicks at the stream's start; 5 minutes clean, 2026-10-19).

<span class="sc-test">in testing</span> on the **Pi 5**, new in 0.4.0: on by default, `gadget=0` in `cmdline.txt` turns it off. Read [Powering a Pi 5 with a computer attached](#powering-a-pi-5-with-a-computer-attached) first.

With the Sidecar as the Rytm's USB host, the Rytm's own USB port is taken. The Sidecar can hand the Rytm's audio and MIDI on to a computer through its own device port: the USB-C port of the Pi 4 or the Pi 5. It shows up as a class-compliant audio and MIDI device, so no driver is needed on macOS, Windows or Linux.

## What the computer sees

| | Pi 4B | Pi 5 (in testing) |
|---|---|---|
| Audio | 12 in / 12 out (UAC2); computer audio on or off on the Sound tab | the same |
| MIDI | yes | yes |

On the Pi a build option (`SIDECAR_CH_IN=20`) adds the Sidecar's 8 voices on inputs 13-20, in voice order; the release has 12.

The Pi's channel map:

| In (to the computer) | Out (from the computer) |
|---|---|
| 1-2 MAIN L/R, 3-10 BD SD RS BT LT MT CH CY, 11-12 audio in L/R (or the FX return) | 1-2 MAIN, 3-4 MAIN FX, 5-12 the voice inputs |

The Rytm is the clock. The multichannel mode is the default. The USB-C device and computer audio are switched on the web page's Sound tab or the touchscreen's Settings > Sound.

A voice on TRK is in its track's channel, as before. A voice on PRE / POST ([the OUT route](/sidecar-expander/using/stereo-out/), 0.3) leaves its track's channel; whether it shows in the MAIN L/R the Rytm sends back is still to be measured on a real Rytm ([Measurements](/sidecar-expander/using/stereo-out/#measurements-pending)).

## Powering a Pi 5 with a computer attached

The Pi 5's USB-C port is both its **power input** and its **data port** to the computer, and a computer's USB port cannot power a Pi 5. So a Pi 5 with a computer needs one of these:

- **A USB-C power and data splitter:** an adapter that takes power from the 27 W supply and passes the data on to the computer. A powered hub or dock with USB-PD pass-through that also passes the data works too.
- **A header-pin power adapter:** power into the Pi's 5 V GPIO pins, so the USB-C port carries data only.

With a header-pin supply the Pi has no USB-PD to read and may report 3 A mode, which limits bus-powered USB devices on its USB-A ports to 600 mA; the Rytm and the Analog Four have their own supply ([the Pi 5 power note](/sidecar-expander/release-notes/#fixed-in-040)).

**Pi 5 testers, please report** whether your computer sees **Sidecar | Expander** as an audio and MIDI device, and how the audio sounds (clicks, dropouts, levels), with the [Tester report](https://github.com/trigcondition/sidecar-expander/issues/new/choose) form.

## MIDI pass-through

The Rytm's USB MIDI goes to the computer, and the computer's MIDI goes to the Rytm: notes, CCs, clock and transport, program changes, and SysEx dumps. Two filters stay in place:

- the Sidecar's own messages to and from the Rytm are not passed on;
- OS update messages are never passed to the Rytm. Update the Rytm with the Sidecar unplugged.

## A stock Rytm

A Rytm without the mods only plays its Overbridge MAIN inputs. The Sidecar's voices can still be heard: set `out=main` (all voices summed on MAIN, faded in, limited at -12 dBFS) and `notes=on` (MIDI channel N plays voice N). Each voice's machine is set with `notemach=V:NAME`. This is a test mode; the mods give the full experience.

## Recording the Sidecar's audio in OBS (macOS)

- Allow OBS to use audio inputs: **System Settings → Privacy & Security → Microphone**, switch OBS on, then restart OBS.
- The Sidecar presents 12 inputs. OBS takes **channels 1-2**, which are the Rytm's MAIN L/R.
- For more channels at once, use a DAW, or combine devices in an aggregate device (Audio MIDI Setup).
