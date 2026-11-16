---
title: MIST (texture machine)
description: "MIST, a granular texture user machine for the Pi: clouds, smears and frozen pads from a built-in oscillator; its sixteen knobs, the buffer formats and what it needs."
sidebar:
  order: 4.1
---

<span class="sc-test">in testing</span> New in 0.5.0 (Sidecar on the Pi).

**MIST** is a [user machine](/sidecar-expander/using/user-machines/): a plugin you install and play in a slot **U1..U5**. It makes granular textures: clouds, smears, and a frozen pad that keeps playing after the note is gone. Its sound engine is Beads, the texture synthesizer by Emilie Gillet (MIT licence).

- **A plugin, not built in.** It is the package `mist.a64.rmp`, shipped on its own: it is not in the starter set. Install it like any user machine ([Install](/sidecar-expander/using/user-machines/#install)).
- **Needs Plugin API 3** (the Sidecar 0.5.0). An older Sidecar refuses it when it scans the plugins.
- **Memory:** about 883 KB a voice.

## What it does

A built-in wavetable oscillator plays the trig's note into a buffer that records all the time. Grains read the buffer back: short or long, forwards or reversed, transposed, spread across the stereo field, fed back into the buffer and sent through a reverb. **FRZ** stops the recording, so the grains keep playing what the buffer holds.

- **It plays an oscillator, not the track's audio.** A user machine has no audio input yet.
- **Pitch.** The cloud follows the trig's note (C3, note 48, is the oscillator's root). **PTCH** transposes the grains on top.
- **Trigs.** A trig restarts the oscillator's envelope. With **DENS** at the centre, each trig makes one grain.
- **ENG SYNTH** plays wavetable grains at the note instead, with no buffer.

## The knobs

Two pages of eight knobs, P1..P8 on SRC and P9..P16 on MORE. The defaults are in the last column.

| Page | Knob | What it does | Default |
|---|---|---|---|
| SRC | **TIME** | where the grains read the buffer: left is now, right is the oldest sound. In the delay mode, the delay time | 24 |
| SRC | **SIZE** | grain size. Below a third the grains play reversed. Fully right is the delay mode: no grains, a delay on the buffer | 72 |
| SRC | **DENS** | left of the centre a steady grain clock (faster to the left), the centre only the trigs, right of it random grains (denser to the right) | 92 |
| SRC | **PTCH** | the grains' transposition, in steps of 0, 1, 3, 4, 7, 12 and 24 semitones each way | 64 |
| SRC | **SHAP** | the grain envelope: square, decay, bell, reversed, from left to right | 64 |
| SRC | **FDBK** | how much of the grains goes back into the buffer | 40 |
| SRC | **SPRD** | random grain shapes and a wider stereo spread | 64 |
| SRC | **MIX** | dry oscillator to cloud | 96 |
| MORE | **RVB** | the reverb: more and longer to the right | 64 |
| MORE | **FRZ** | ON stops the recording. The grains play what the buffer holds: silence if it holds nothing yet | OFF |
| MORE | **QUAL** | the buffer's format ([below](#the-buffer-formats)) | DIGITAL |
| MORE | **BANK** | the oscillator's wavetable bank: SINE, TRISTK, ORGAN, TRISAW, BURST, FORMANT, DIGI, WAVES, FM 1, FM 2, FM 3, FM 4 | SINE |
| MORE | **WAVE** | the wave in the bank | 40 |
| MORE | **TRND** | random grain position: right of the centre a smooth drift, left of it jumps | 76 |
| MORE | **PRND** | random grain pitch, the same way | 64 |
| MORE | **ENG** | CLOUD (the buffer and its grains) or SYNTH (wavetable grains) | CLOUD |

TRND and PRND have a small dead zone around the centre.

## The buffer formats

| QUAL | Format |
|---|---|
| LOFI | 8-bit mu-law at 24 kHz, with wow and flutter. The longest buffer |
| TAPE | 12-bit at 24 kHz |
| VINTAGE | 12-bit at 48 kHz |
| DIGITAL | 16-bit at 48 kHz, 8 s |

LOFI, TAPE and VINTAGE use a darker reverb. A QUAL change fades the sound out, clears the buffer and fades back in: a gap of a few milliseconds, and the buffer is empty after it. With ENG SYNTH, TIME picks the grains' wave and QUAL their bit depth.

## Good to know

- **After a switch to MIST the buffer is empty,** so FRZ then plays silence until the buffer has recorded something.
