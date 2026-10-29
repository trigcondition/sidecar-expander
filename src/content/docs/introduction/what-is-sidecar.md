---
title: What Sidecar is
description: A voice and feature expander for the Analog Rytm MKII, hosted on a Raspberry Pi 4B or Pi 5.
sidebar:
  order: 1
---

Sidecar | Expander adds digital voices, send effects, recording and a web UI to the **Analog Rytm MKII**.

A small computer sits on the Rytm's USB port: a **Raspberry Pi 4B or Pi 5** (one SD card for both). It acts as the Rytm's USB host in Overbridge mode. The Rytm streams its tracks to the Sidecar, and the Sidecar sends its own voices and effects back into the Rytm. Everything comes out of the Rytm's own outputs, through its analog path.

:::note[Sidecar Mini]
Sidecar Mini (Teensy 4.1) is frozen at 0.1.0; its docs are in the [0.2 docs](/sidecar-expander/0.2/introduction/pi-vs-teensy/).
:::

A set of mods to the Rytm's OS 1.73 adds pages on the Rytm itself to drive the Sidecar. You play and edit everything from the Rytm: pick a Sidecar machine on a track, turn its knobs, p-lock them, and send tracks to the Sidecar's effects. The Sidecar's own pages open on the Rytm's screen with one key held: **UP** in 0.3.0 (TRK in the 0.2.0 release).

## A screen is optional

**You do not need a touchscreen.** The Rytm's own screen and keys drive everything:

- **On the Rytm:** the Sidecar draws its pages on the Rytm's display, in the Rytm's font: status, the machines, the sequencer, POLY CONFIG, the inserts and the OUT route, the pools, projects, songs, the recorder and the scope. **Hold UP** for the map of every shortcut; UP + YES opens the Sidecar's pages.
- **In a browser:** the Sidecar's web page at `sidecar.local`, on a phone or a laptop, covers the setup: Wi-Fi, user machines, the pools, projects and bundles, poly tracks.
- **A touchscreen (optional)** on the Pi adds what a big screen does best: the piano roll, the scope, the voices and the status at a glance. See [The touchscreen](/sidecar-expander/using/touchscreen/).

:::caution[Unofficial, experimental software]
This is a tester release. It is not made, endorsed or supported by the instrument's maker. Read [Recovery to stock](/sidecar-expander/getting-started/recovery/) before you install anything.
:::

## How it fits together

| Part | Runs on | Does |
|---|---|---|
| **Rytm mods** | the Rytm (patched OS 1.73) | external (EXT) machines on every track, the SEND FX pages, the user slot menu, the SIDECAR folder in the sample browser, the remote pages the Sidecar draws on the Rytm's screen, and in 0.3.0 the key combinations, the source lists and the poly tracks' link. Built on elekloader. |
| **The engine** | Pi 4B or Pi 5 | renders the voices, the send effects and the user machines, records, and serves the display and the web page. Sidecar 0.3.0 adds the poly-track sequencer, the insert FX and the OUT route, the pools and the sample library, project bundles, the sampler and the song recorder. |
| **The patcher** | your browser or Python | patches your own stock OS 1.73 file. We never distribute firmware. |
| **The web tools** | your browser | the Pi's page at `sidecar.local`. |

## What the Rytm keeps doing

- Its own analog voices, sequencer, effects and outputs work as before.
- A Sidecar voice plays through the track's **own analog filter, overdrive and amp**, like an analog voice. Its p-locks, LFO and slides reach the Sidecar.
- The send effects return into the Rytm's master path: before its analog distortion and compressor (PRE), or after them (POST). You choose per effect.
- The kit stores everything: the machine choices, the knob values, the send levels and the effect types. A kit you save comes back the same way. What the Rytm cannot hold (the pools, the LFOs, the inserts, poly tracks' steps) is kept per project and kit on the Sidecar's card, and a [bundle](/sidecar-expander/using/projects-bundles/) carries it to another Sidecar.

## Where to go next

- [What works now](/sidecar-expander/introduction/what-works-now/)
- [Hardware you need](/sidecar-expander/introduction/hardware/)
- [Key combinations](/sidecar-expander/using/key-combinations/)
