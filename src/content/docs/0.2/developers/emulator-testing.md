---
slug: 0.2/developers/emulator-testing
title: Testing with the emulator
description: How the Rytm mods and the Sidecar are tested before anything is flashed.
sidebar:
  order: 8
---

Nothing goes onto a real Rytm untested. A separate project, **rytm-emu**, emulates the Analog Rytm MKII well enough to boot the stock OS 1.73 and the modded builds, show the screen, press keys and turn knobs, and act as a USB device for a host.

## What it gives

- **The Rytm's CPU and peripherals:** a ColdFire interpreter (the reference) and a JIT held bit-exact to it, the memory map, the display, the panel, the card and the +Drive file system. The analog voice hardware is stubbed.
- **Headless runs:** boot a firmware, press keys by name at given times, take screenshots, save and load snapshots, inspect memory.
- **Overbridge over TCP:** the emulator exposes the Rytm's Overbridge stream and USB MIDI on a TCP link. A Sidecar can be its host: the Mac core library, a Python stand-in, or a real Pi over Ethernet.
- **A strict mode** that faults on unmapped access, and a cache model that reports stale instruction fetches, both useful when patching code.

## How it is used

| Test | What it checks |
|---|---|
| Mod end-to-end runs | a modded build boots, its pages draw, keys and knobs do what they should, and its SysEx reaches the host (send FX, slot menu, remote UI, slot fingerprints) |
| Core against emulator | the Sidecar core as the emulator's host: an EXT track on U1 plays the right machine, deleting a package makes the slot MISSING and the machine list show `!NAME` |
| Pi against emulator | the Pi engine as the host over Ethernet: four tracks on Sidecar machines for 10 minutes with no underruns, p-locks and knob turns reaching the engine |
| Send FX end-to-end | the send FX pages, the TYPE list, labels, stepped knobs and the audio return against the core |

## What it cannot prove

- The analog path: levels, the analog distortion and compressor, the filter's response to the Sidecar's voice.
- Real USB timing, power events and the real Rytm's behaviour when the host disappears.

So the user docs mark features "hardware" only after a run on a real Rytm, and "in testing" when the emulator is the only evidence. See [What works now](/sidecar-expander/0.2/introduction/what-works-now/).

## The engine's own tests

- `make -C core test`: the core's unit tests (protocol bytes against `sim/protocol.py`, the voices, the send FX, the user slots, the remote UI).
- Golden renders: the Mac core against the Teensy's renders, bit for bit where possible.
- `teensy/gate.sh`: sizes, golden renders, the end-to-end plugin suite on the Teensy.
- On the Pi: an on-device suite over serial (machines, long runs without gaps, the guard, the watchdog) and the boot bench, which renders every machine on every core at each boot.
