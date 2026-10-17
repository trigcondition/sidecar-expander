---
title: Voices and machines
description: PLAITS, JUNO, 6-OP FM, DAISYSP, DIGIDRUM, DSP SAMPLE and GRAIN, knob by knob.
sidebar:
  order: 3
---

The Sidecar renders up to **8 voices**, one per Rytm voice. A track on a Sidecar machine sends its trigs and knob values to the Sidecar, which plays the voice and returns it on the track's own channel, through the track's analog filter and amp.

All knobs are 0..127 with the Rytm's fine resolution. List knobs (ENG, PAT, MOD) split their range into equal zones, one per item.

## PLAITS

The Mutable Instruments Plaits macro oscillator, curated to 17 models.

| Knob | |
|---|---|
| ENG | the model: VA VCF, PHASE DIST, WAVE TERRAIN, STRING MACH, CHIPTUNE, VA, WAVESHAPE, 2-OP FM, GRANULAR, HARMONIC, WAVETABLE, CHORDS, SPEECH, SWARM, PARTICLE, STRING, MODAL |
| HRM, TIM, MOR | Plaits' HARMONICS, TIMBRE and MORPH |
| DEC, LPG | the decay and colour of the low-pass gate, pinged by each trig |
| TUN | semitones from the centre (64) |
| LEV | output level |
| Page 2 | FM FIN AUX TMD MMD VEL GLD VOL: frequency modulation, fine tune, the aux output, timbre and morph modulation, velocity, glide and volume |

The drum models are left out (DIGIDRUM plays drums), and the six-op FM models are their own machine (6-OP FM).

## JUNO

A Juno-106 style poly-synth voice, our own implementation following the open AMY model of the 106.

| Knob | |
|---|---|
| PAT | the patch: the 106's factory patches (A11..B88), or the project's JUNO list when it has one |
| CUT, RES, ENV | the patch's filter cutoff, resonance and envelope amount |
| ATK, DEC, REL | the envelope |
| LEN | the gate; 127 holds until the note-off or the next trig |

Choosing a patch writes its own slider values onto CUT..REL, so the knobs show the patch. Put Juno-106 patch dumps (`.syx`, single patches or banks) in `/JUNO` on the Sidecar's card, browse them in the TEENSY folder and LOAD TO PROJ to build the project's JUNO list.

## 6-OP FM

Plaits' six-operator FM engine playing DX7 voices.

| Knob | |
|---|---|
| PAT | the voice: from the project's FM list, or else 96 built-in ROM voices |
| TIM, MOR | timbre and morph offsets on the voice as stored (64 = as stored) |
| DEC, LPG | decay and colour of a low-pass gate after the voice; DEC 127 turns it off so held notes sustain |
| TUN | semitones from 64 |
| LEV | output level |
| LEN | the gate, as JUNO's |

Put packed 32-voice DX7 banks (4104-byte `.syx`) in `/DX7`. In the TEENSY folder each bank is a folder of its 32 voices; LOAD TO PROJ on a voice adds it to the project's FM list. Banks are found by their content, so renaming or moving a bank keeps the list working.

## DAISYSP

Physical-model resonators from DaisySP, excited by the Rytm.

| Knob | |
|---|---|
| ENG | MODAL, STRING or RESON |
| STR, BRI, DMP | structure, brightness, damping |
| INP | the exciter: INT (internal), NAT (the track's own analog voice), NOISE, or another analog voice's output |
| EXC | exciter amount |
| TUN, LEV | tuning, level |
| Page 2 | EXCITER: XTN XDC FB OUT XP4 XLV XP5 WID. OUT at 64 or above sends the resonance to MAIN; below, back to the voice |

With INP on an analog voice, an analog drum rings a Sidecar resonator.

## DIGIDRUM

Machinedrum-style digital drum engines from the open digidrum project.

| Knob | |
|---|---|
| ENG | EFM-BD, EFM-SD, EFM-XT, EFM-CP, EFM-RS, EFM-CB, EFM-HH, EFM-CY, TRX-RS, TRX-CB, TRX-CL |
| B..H | the engine's controls; their labels change with ENG (PTCH, DEC, ...) |

The track's sample layer stays and plays under the drum. The engine's PTCH sets the pitch; the note is not used.

## DSP SAMPLE

A sample from the Sidecar's card, played through a resonator.

| Knob | |
|---|---|
| ENG | MODAL, STRING or RESON |
| STR, BRI, DMP | structure, brightness, damping |
| MIX | dry sample against the resonator |
| FB | feedback |
| TUN, LEV | tuning, level |
| Page 2 (SD SAMPLE) | TUN FIN SMP MOD STA END LOP LEV |

- **SMP** picks the sample from the project's Sidecar pool (0 OFF). Fill the pool with LOAD TO PROJ in the TEENSY folder.
- **MOD** is the playback mode: ONE, LOOP, SLICE, GRAIN, STRCH, PLUCK, WAVE. The STA, END and LOP labels change with it (STA END SLC for SLICE, POS SIZ DNS for GRAIN, and so on).
- On the Pi, samples play from memory (256 MB by default). On a Teensy without PSRAM, samples stream from the card and play once (ONE).

## GRAIN

DSP SAMPLE's **GRAIN** mode: a granular voice over the pool sample, from memory, with position, size and density on STA END LOP. Pi, or a Teensy with PSRAM. Each Pi render core can sound up to 32 grains.

For a stand-alone granular machine with its own built-in sample, see the GRAIN user machine in the starter set ([User machines](/sidecar-expander/using/user-machines/)).

## CPU

Measured on the Pi 4, each voice costs about 0.2 % (DIGIDRUM) to 1.2 % (6-OP FM) of one core, so eight voices leave most of the Pi free. On the Teensy, eight PLAITS voices average about 5 % each, so the Teensy's budget is the limit for heavy models (MODAL peaks near 10 %). A voice that runs over its budget, or crashes, is muted on its own; the others keep playing.
