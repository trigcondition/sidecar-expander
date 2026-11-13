---
title: PHASER and BBD (user effects)
description: "PHASER, a stereo phaser, and BBD, a bucket-brigade delay: two send FX plugins for the Pi, with every knob, the tempo-synced values and the Rytm's knob names."
sidebar:
  order: 2.05
---

<span class="sc-test">in testing</span> New in 0.5.0 (Sidecar on the Pi).

**PHASER** and **BBD** are **user effects**: plugins that play in a send FX slot, next to the [send effects](/sidecar-expander/using/send-effects/). They are Plugin API 3 packages, so they need the Sidecar 0.5.0.

- A user effect takes a send FX slot's TYPE 64..67 (UFX1..UFX4). The send level is its mix: the return is the effect only, as for the built-in effects.
- It has **four knobs**, on the Rytm's P2..P5 of the SEND FX page (P1 is the ROUTE, PRE / POST).
- **The Rytm shows the effect's own knob names** and the names of the zones of a stepped knob. It needs no Rytm update for that.
- **Put one in a slot** with the console: `um=fx:<n>:<id>`, with `n` the slot 1..4 and `id` `fx.phaser` or `fx.bbd`. The slots are kept per project.
- The input is mono (the tracks' sends added up). The return is stereo.

## PHASER

A stereo phaser for chords and pads: up to eight allpass stages a channel, swept by a sine LFO, with feedback. The return is the whole phaser, input and swept copy mixed inside it. On its own it sounds like a phaser. With the track's dry sound also on the main mix the notches are shallower: turn the send up, or the track's own level down, for more.

| Knob | Values | What it does | Default |
|---|---|---|---|
| **RATE** | 0..63 `FREE n`, then 64..127 `8BAR` `4BAR` `2BAR` `1BAR` `1/2` `1/4` `1/8` `1/16` | FREE: the sweep's speed, 0.02 Hz at 0, about 0.2 Hz at 24, 0.9 Hz at 40 and 8 Hz at 63. A note value: one sweep per value at the Rytm's tempo. While the Rytm plays, it locks to the song position | 28 (FREE, about 0.3 Hz) |
| **DPTH** | 0..127 | how far the sweep goes either side of 600 Hz. 0 holds it there. 127 sweeps 2.5 octaves each way (about 106 Hz to 3.4 kHz) | 96 |
| **FDBK** | 0..127 | feedback around the stages, up to 0.9: sharper notches and ringing peaks. Soft-limited | 40 |
| **SPRD** | `4ST n`, `6ST n`, `8ST n` | the stage count (4: two notches, gentle; 6: three; 8: four, the deepest) and the stereo spread inside each: the right channel's sweep runs behind the left's. 0 is mono, 21 a quarter cycle, 42 opposite (8ST goes to 41). A change of stage count crossfades | 64 (`6ST 21`) |

With a note value, the sweep starts with the song's bars, not with each pattern loop.

## BBD

A bucket-brigade style analog delay: a model of how such pedals behave, not of one circuit.

- **A longer time is a slower clock,** so the repeats get darker and noisier.
- **A compander** around the delay line gates the hiss under quiet repeats and lets it breathe with loud ones.
- **The line soft-clips,** and turning TIME bends the pitch of the repeats.
- **Two output taps** with their own wobble give width when W/F is up.

| Knob | Values | What it does | Default |
|---|---|---|---|
| **TIME** | 0..63 `FREE n`, then 64..127 `1/16` `1/8T` `1/8` `1/4T` `1/8D` `1/4` `1/4D` `1/2` | FREE: 20 ms at 0, 54 ms at 16, 146 ms at 32, 395 ms at 48, 1 s at 63. A note value: the time at the Rytm's tempo, up to 2.4 s (longer is held at the line's length) | 40 (FREE, about 240 ms) |
| **FDBK** | 0..127 | the repeats, up to 1.08. At noon each repeat is about 5 dB quieter than the last. From about 120 up, with W/F low, the loop runs away and holds itself at about -10 dBFS: turn it down to let it die | 56 |
| **W/F** | 0..127 | wow and flutter on the clock, gentle in the lower half. The two outputs wobble a quarter cycle apart, so it also widens the repeats | 24 |
| **TONE** | 0..127 | a low-pass on the repeats inside the loop, from 400 Hz up to open at 127. Lower, and each repeat is darker than the one before | 80 |

- **Memory:** the line is 2.5 s long where there is room, and 1.1 s at least. A slot takes about 1.9 MB.
- **The line keeps its audio** when the slot's TYPE moves to another effect. Going back to BBD can replay the old repeats for a moment.
