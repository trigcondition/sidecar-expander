---
title: USB audio and MIDI to a computer
description: The Sidecar's USB modes for a computer (CLASS COMPLIANT, and OVERBRIDGE passthrough on the Pi 4 from 0.4.1), powering a Pi 5 with a computer attached, and MIDI pass-through.
sidebar:
  order: 8
---

<span class="sc-ok">hardware</span> on the **Pi 4B**: part of the 0.2.0 release, tested with multi-channel audio and MIDI (no clicks at the stream's start; 5 minutes clean, 2026-10-19).

<span class="sc-test">in testing</span> on the **Pi 5**, new in 0.4.0: on by default, `gadget=0` in `cmdline.txt` turns it off. Read [Powering a Pi 5 with a computer attached](#powering-a-pi-5-with-a-computer-attached) first.

With the Sidecar as the Rytm's USB host, the Rytm's own USB port is taken. The Sidecar can hand the Rytm's audio and MIDI on to a computer through its own device port: the USB-C port of the Pi 4 or the Pi 5. It shows up as a class-compliant audio and MIDI device, so no driver is needed on macOS, Windows or Linux. On a Pi 4, from 0.4.1, the USB-C port can instead show the computer the Rytm itself, for Overbridge: [Overbridge through the Sidecar](#overbridge-through-the-sidecar-pi-4).

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

## Overbridge through the Sidecar (Pi 4)

<span class="sc-ok">hardware</span> on the **Pi 4B**, new in 0.4.1, opt-in. The Pi 5 gets it in 0.4.2 (see [below](#the-pi-5-and-overbridge)).

The Sidecar's USB-C port is one thing at a time, like the Rytm's own USB CONFIG. The **USB-C mode** picks which:

| USB-C mode | The computer sees |
|---|---|
| **CLASS COMPLIANT** (the default) | the Sidecar device: 12 in / 12 out audio and USB MIDI, no driver ([above](#what-the-computer-sees)) |
| **OVERBRIDGE** | the Rytm itself, passed through the Sidecar: Overbridge Engine and the Analog Rytm plugin work as with the Rytm plugged in directly, while the Sidecar keeps playing alongside. While no Rytm is there, and about 10 s after it is unplugged, the computer sees the Sidecar device |

Set it in any of three places:

- the web page, **Sound** tab, **USB-C mode**: Class compliant or Overbridge (Overbridge asks you to confirm);
- the Rytm: **SIDECAR MENU > USB-C** (UP + YES, then the USB-C row): pick CLASS COMPLIANT or OVERBRIDGE; OVERBRIDGE takes YES twice, NO keeps the old mode;
- the touchscreen: **Settings > Sound**, USB-C MODE.

Each place shows what USB-C is now (the Sidecar device, the Rytm, or replugging). The choice is kept on the card and comes back after a restart.

- **It switches live,** without a restart: the computer sees an unplug and a plug-in. Stop your DAW first, and **never switch during a transfer or an OS update**: the replug cuts it.
- **The computer's sleep:** macOS suspends an idle USB device about 10 s after a switch and resumes it later; the Sidecar's USB-C side now copes with that, and with the Overbridge app starting while a request is still pending (both stopped the stream or reset the Pi in the test builds).
- **The warning:** in OVERBRIDGE the Rytm's vendor requests and Overbridge's own channel reach the Rytm unfiltered, so an OS update from the computer can reach it too. Back up your projects before any update.
- In OVERBRIDGE the Sidecar's own 12-channel audio device is not shown; switch back to CLASS COMPLIANT for it.
- Thanks to [Iced-Cream](https://github.com/Iced-Cream), whose pull requests 19 and 20 are the base of it.

### The Pi 5 and Overbridge

Not in 0.4.1: OVERBRIDGE is greyed out on a Pi 5 (the Rytm's USB-C page says PI5: IN 0.4.2). The Pi 5's USB-C port is also its power input, and a Pi 5 that uses it for data gets only about 1.5 A from a computer or hub port: on a hub port it ran short of power and reset when Overbridge started. It comes in **0.4.2**, once it has been tested with a USB-C power and data splitter.

## Powering a Pi 5 with a computer attached

The Pi 5's USB-C port is both its **power input** and its **data port** to the computer, and a computer's USB port cannot power a Pi 5. A computer or hub port gives a Pi 5 that uses its USB-C for data only about **1.5 A**, far less than the 5 A its 27 W supply gives (under-voltage, resets). So a Pi 5 with a computer needs one of these:

- **A USB-C power and data splitter:** an adapter that takes power from the 27 W supply and passes the data on to the computer. A powered hub or dock with USB-PD pass-through that also passes the data works too.
- **A header-pin power adapter:** power into the Pi's 5 V GPIO pins, so the USB-C port carries data only.

With a header-pin supply the Pi has no USB-PD to read and may report 3 A mode, which limits bus-powered USB devices on its USB-A ports to 600 mA; the Rytm and the Analog Four have their own supply ([the Pi 5 power note](/sidecar-expander/release-notes/#fixed-in-040)).

**Pi 5 testers, please report** whether your computer sees **Sidecar | Expander** as an audio and MIDI device, and how the audio sounds (clicks, dropouts, levels), with the [Tester report](https://github.com/trigcondition/sidecar-expander/issues/new/choose) form.

## MIDI pass-through

The Rytm's USB MIDI goes to the computer, and the computer's MIDI goes to the Rytm: notes, CCs, clock and transport, program changes, and SysEx dumps. Two filters stay in place:

- the Sidecar's own messages to and from the Rytm are not passed on;
- OS update messages are not passed to the Rytm unless you turn that on ([OS updates through the Sidecar](#os-updates-through-the-sidecar)). By default, update the Rytm with the Sidecar unplugged.

## OS updates through the Sidecar

<span class="sc-test">in testing</span>. New in 0.4.0, from work by [Iced-Cream](https://github.com/Iced-Cream).

A setting, off by default, lets Elektron Transfer or elkflash on a computer at the Pi's USB-C port send the Rytm an OS update through the Sidecar, so the Rytm does not need to be unplugged from the Pi. Turn it on with `usbmidi=os:on` in `cmdline.txt`, or as a command on the serial console. The web page's `/cmd` refuses it on purpose. With it off, OS update messages are blocked, as before.

- While it is on, the USB-C port waits for the Rytm instead of dropping messages, so the whole OS file arrives.
- If data is lost during an upgrade, the upgrade is aborted rather than finished with a hole in the image. The log says `OS upgrade ABORTED`. Start the upgrade again.
- `/status` shows `usbmidi.os` (`off`, `emu` or `on`), `usbmidi.osUpgrade` (whether OS messages pass right now) and `usbmidi.aborted` (upgrades cut since boot).
- After the upgrade the Rytm reboots and the Pi sees it again.
- It is meant for the Rytm. Keep it off when you are not updating, and back up your projects first, as before any OS change.

## A stock Rytm

A Rytm without the mods only plays its Overbridge MAIN inputs. The Sidecar's voices can still be heard: set `out=main` (all voices summed on MAIN, faded in, limited at -12 dBFS) and `notes=on` (MIDI channel N plays voice N). Each voice's machine is set with `notemach=V:NAME`. This is a test mode; the mods give the full experience.

## Recording the Sidecar's audio in OBS (macOS)

- Allow OBS to use audio inputs: **System Settings → Privacy & Security → Microphone**, switch OBS on, then restart OBS.
- The Sidecar presents 12 inputs. OBS takes **channels 1-2**, which are the Rytm's MAIN L/R.
- For more channels at once, use a DAW, or combine devices in an aggregate device (Audio MIDI Setup).
