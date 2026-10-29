---
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

So the user docs mark features "hardware" only after a run on a real Rytm, and "in testing" when the emulator is the only evidence. See [What works now](/sidecar-expander/introduction/what-works-now/).

## Testing on a real Rytm: the MIDI bridge

With the Rytm plugged into the Sidecar, its USB port belongs to the Pi, so a computer's test tools cannot see it. The **Rytm MIDI bridge** (0.3.0, for developers) gives the tools the Rytm's USB MIDI over the network: the same raw byte stream the emulator serves with `--usb-midi-tcp`, on TCP port 7330. The Sidecar keeps working normally meanwhile.

- **Off at every boot.** Turn it on for this boot from the web page (paired; Status tab, *Rytm MIDI bridge*, **Turn on for this boot**), which then shows a one-time **token**. It will not turn on with `paircode=0`.
- **A relay on your computer** (`tools/rytm_bridge.py --pi sidecar.local`, standard library only) answers the Sidecar's challenge with the token and listens on `127.0.0.1:7321`. Point a tool at `tcp:127.0.0.1:7321` (`--port tcp:127.0.0.1:7321`) and it talks to the real Rytm.
- **Blocked unless you allow it.** The bridge refuses the Rytm's OS upgrade messages and every +Drive write (put, delete, rename and so on); reads always pass. Two switches on the page allow either for the session. Both, and the bridge, go off again at the next boot.
- **Trusted network only, and turn it off when you are done.** The stream is plain TCP; each turn-on makes a new token.

<span class="sc-test">in testing</span>: tested against a fake Sidecar and on the Mac; not yet checked on hardware.

**REMOTE KEYS** (the Rytm-side mod that lets a test tool press the Rytm's keys, analoghealth's protocol) is **not in the 0.3.0 release firmware**: it is a development build only (`RUI_DEV=1 tools/build_rui.sh TAG` in the mods repository). Two UI freezes on a release candidate after key and pad bursts pointed at it, so it stays out of production builds until it is reworked. The bridge itself works with the release firmware, for MIDI and SysEx.

## The engine's own tests

- `make -C core test`: the core's unit tests (protocol bytes against `sim/protocol.py`, the voices, the send FX, the user slots, the remote UI).
- Golden renders: the Mac core against the Teensy's renders, bit for bit where possible.
- `teensy/gate.sh`: sizes, golden renders, the end-to-end plugin suite on the Teensy.
- On the Pi: an on-device suite over serial (machines, long runs without gaps, the guard, the watchdog) and the boot bench, which renders every machine on every core at each boot.
