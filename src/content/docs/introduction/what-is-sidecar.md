---
title: What Sidecar is
description: A voice and feature expander for the Analog Rytm MKII, hosted on a Teensy 4.1 (Sidecar Mini) or a Raspberry Pi 4B (Sidecar).
sidebar:
  order: 1
---

Sidecar | Expander adds digital voices, send effects, recording and a web UI to the **Analog Rytm MKII**.

A small computer sits on the Rytm's USB port: a **Teensy 4.1** (**Sidecar Mini**, the cheap way to start) or a **Raspberry Pi 4B** (**Sidecar**, the full version). It acts as the Rytm's USB host in Overbridge mode. The Rytm streams its tracks to the Sidecar, and the Sidecar sends its own voices and effects back into the Rytm. Everything comes out of the Rytm's own outputs, through its analog path.

A set of mods to the Rytm's OS 1.73 adds pages on the Rytm itself to drive the Sidecar. You play and edit everything from the Rytm: pick a Sidecar machine on a track, turn its knobs, p-lock them, and send tracks to the Sidecar's effects.

:::caution[Unofficial, experimental software]
This is a tester release. It is not made, endorsed or supported by the instrument's maker. Read [Recovery to stock](/sidecar-expander/getting-started/recovery/) before you install anything.
:::

## How it fits together

| Part | Runs on | Does |
|---|---|---|
| **Rytm mods** | the Rytm (patched OS 1.73) | external (EXT) machines on every track, the SEND FX pages, the user slot menu, the SIDECAR folder in the sample browser, the remote UI page. Built on elekloader. |
| **The engine** | Teensy 4.1 or Pi 4B | renders up to 8 voices, the two send effects, the sample pool, the user machines; on the Pi also the recorder, the display and the web page. |
| **The patcher** | your browser or Python | patches your own stock OS 1.73 file. We never distribute firmware. |
| **The web tools** | your browser | the Pi's page at `sidecar.local`, or the Teensy's console over WebSerial. |

## What the Rytm keeps doing

- Its own analog voices, sequencer, effects and outputs work as before.
- A Sidecar voice plays through the track's **own analog filter, overdrive and amp**, like an analog voice. Its p-locks, LFO and slides reach the Sidecar.
- The send effects return into the Rytm's master path: before its analog distortion and compressor (PRE), or after them (POST). You choose per effect.
- The kit stores everything: the machine choices, the knob values, the send levels and the effect types. A kit you save comes back the same way.

## Where to go next

- [What works now](/sidecar-expander/introduction/what-works-now/)
- [Hardware you need](/sidecar-expander/introduction/hardware/)
- [Sidecar Mini or Sidecar?](/sidecar-expander/introduction/pi-vs-teensy/)
