---
title: Arpeggiator
description: "New in 0.4.0. A track's held or sequenced chord played as a pattern in time with the Rytm: MODE, SPD, RNG, GATE and SWNG per sound, on any Sidecar machine and the MIDI machine, with arp locks per step."
sidebar:
  order: 3.25
---

New in 0.4.0. The arpeggiator plays a track's held or sequenced chord as a pattern, in time with the Rytm. It works on **any Sidecar machine**, polyphonic or not, and on the [MIDI machine](/sidecar-expander/using/midi-machine/).

## The ARP page

**UP + FLTR** opens the ARP page of the selected track. It is also in the SIDECAR MENU. One **NO** leaves it. **UP and DOWN stay the Rytm's** on the page: in CHRO pad mode they move the pads' range, so you can play the arp higher or lower (0.4.4; before, the page took them).

| Knob | Name | Values |
|---|---|---|
| A | **MODE** | OFF, UP, DOWN, UPDN, RND, PLAY (in the order played) |
| B | **SPD** | 1/4, 1/8, 1/8T, 1/16 (default), 1/16T, 1/32 |
| C | **RNG** | 1, 2 or 3 octaves |
| D | **GATE** | 25, 50 (default), 100 % (legato) |
| E | **SWNG** | 50 (straight), 58, 66 %: every second note late |

The settings belong to the **sound**: they are saved with the sound and the kit, and the pool carries them. A sound from before 0.4.0 reads OFF. With MODE OFF nothing changes.

## What it plays

- A Rytm trig, until its LEN or until you let go of the pad. On 6-OP FM, MULTISAMPLE, WAVETABLE and GRANULAR a trig's CHD chord is arpeggiated.
- The notes of a [Sidecar poly track](/sidecar-expander/using/sequencer/): whatever a step holds, for their own length.
- The pads in CHRO, and keyboards on the Pi. With the arpeggiator on, these reach any Sidecar machine, not just the polyphonic ones.

One note sounds at a time. On a poly track it plays with that track's POLY CONFIG; elsewhere on the track's own machine, mono.

An arpeggiated track holds the Rytm's amp open, as a poly track does: the notes are the Sidecar's, so the Rytm's amp and filter envelopes do not shape each one. (Not on the MIDI machine, which has no audio.)

## Timing

The grid is the Rytm's sequencer clock. A chord that starts just after a grid point plays at once (a trig always does); otherwise at the next point. Stopped or paused, it runs free from the first note at the last tempo. Keys and pads held when you press STOP keep running; a trig's and the sequencer's notes end.

When the held notes are gone, the last note plays out its gate. A hold shorter than the time to its first grid point (a short trig, a slow SPD) plays its first note at the release. STOP, another kit, a machine change, MODE OFF or the Rytm unplugged leave nothing playing.

## Arp locks

On a Sidecar poly track, a step can lock any of the five settings for that step only: hold the step and press **FLTR** for **LOCK ARP**, then turn A..E. The bottom bar names the value (`S3 SPD:1/32 LOCK`). NO clears the held steps' locks, an encoder's push clears that knob's lock, as with any lock. The touchscreen's **ARP** tool sets them on the selected note's step.

- **That step only.** Other locks hold to the next trig; arp locks end at the next step, even an empty one.
- **A slot like any other lock:** copied, pasted and cleared with the step. A lock on an empty step changes a chord held over several steps on that one step.
- **MODE locked OFF** on a step: its notes play without the arpeggiator. **MODE locked on** with the sound's OFF: that step's notes are arpeggiated with the sound's other values.
- Not on a plain Rytm track. A pattern with arp locks needs 0.4.0 or later: an older Sidecar refuses to play or save it.

Sequencer details: [Poly mode](/sidecar-expander/using/sequencer/). The RTRG page's ratchets and per-step arps are a separate feature of the sequencer.
