---
title: Voices and machines
description: "PLAITS, JUNO, 6-OP FM, DAISYSP, DIGIDRUM, DSP SAMPLE and GRAIN, knob by knob; in 0.3 the poly machines, the POOL lists, the OUT route and the insert FX on every voice."
sidebar:
  order: 3
---

The Sidecar renders up to **8 voices**, one per Rytm voice: all 12 tracks can choose a Sidecar machine, and like the Rytm's own pairs, RS/CP, MT/HT, CH/OH and CY/CB share one voice, so eight sound at once. A track on a Sidecar machine sends its trigs and knob values to the Sidecar, which plays the voice and returns it on the track's own channel, through the track's analog filter and amp.

:::caution[New in 0.3]
The 0.3 test line (Rytm build `rui1048` with the Sidecar's 0.3 test build, Sidecar (Pi) only) adds to every machine on this page:

- three polyphonic machines, **MULTISAMPLE**, **WAVETABLE** and **GRANULAR**, and poly tracks on 6-OP FM: see [Poly machines](/sidecar-expander/using/poly-machines/) and [Poly mode](/sidecar-expander/using/sequencer/);
- two [insert FX](/sidecar-expander/using/insert-fx/) slots per voice, and the [OUT route](/sidecar-expander/using/stereo-out/): a voice on its track (TRK, as before) or in stereo on the Rytm's main mix (PRE / POST);
- the project's [POOL lists](/sidecar-expander/using/pools/) as the source of samples, wavetables and instruments.
:::

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
| Page 2 | TMD MMD FM AUX / FIN VEL GLD VOL (as the Rytm shows them): timbre and morph modulation, frequency modulation, the aux output, fine tune, velocity, glide and volume |

The drum models are left out (DIGIDRUM plays drums), and the six-op FM models are their own machine (6-OP FM).

## JUNO

A Juno-106 style poly-synth voice, our own implementation following the open AMY model of the 106.

| Knob | |
|---|---|
| PAT | the patch: the 106's factory patches (A11..B88), or the project's JUNO list when it has one |
| CUT, RES, ENV | the patch's filter cutoff, resonance and envelope amount |
| ATK, DEC, REL | the envelope |
| LEN | the gate; 127 holds until the note-off or the next trig |

Choosing a patch writes its own slider values onto CUT..REL, so the knobs show the patch.

**Presets (JUNO and 6-OP FM).** The release's **starter content** (`sidecar-content-<version>.zip`, already on the Pi's SD card package) puts the Juno-106's 128 factory patches in `/JUNO/Factory/` and three DX7 banks in `/DX7/` on the card, ready for LOAD TO PROJ. PAT steps through the project's list, up to 127 patches, and can be p-locked. Add patches with **LOAD TO PROJ** from the SIDECAR folder in the Rytm's sample browser (the `/JUNO` and `/DX7` folders of `.syx` files on the Sidecar's card), or with **Save current** on the web page's Presets tab (Pool & presets in 0.2.0). Without a project list, PAT shows the factory list (JUNO A11..B88, the FM ROM voices). The lists and the patch libraries live on the Sidecar's card. <span class="sc-ok">hardware</span> (PAT presets on the Pi)

Put Juno-106 patch dumps (`.syx`, single patches or banks) in `/JUNO` on the Sidecar's card, browse them in the SIDECAR folder and LOAD TO PROJ to build the project's JUNO list.

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

Put packed 32-voice DX7 banks (4104-byte `.syx`) in `/DX7`. In the SIDECAR folder each bank is a folder of its 32 voices; LOAD TO PROJ on a voice adds it to the project's FM list. Banks are found by their content, so renaming or moving a bank keeps the list working.

## DAISYSP

Physical-model resonators from DaisySP, excited by the Rytm.

| Knob | |
|---|---|
| ENG | MODAL, STRING or RESON |
| STR, BRI, DMP | structure, brightness, damping |
| INP | the exciter: INT (internal), NAT (the track's own analog voice), NOISE, or another analog voice's output |
| EXC | exciter amount |
| TUN, LEV | tuning, level |
| Page 2 | EXCITER: OUT FB XLV XTN / XDC XP4 XP5 WID (as the Rytm shows them). OUT at 64 or above sends the resonance to MAIN; below, back to the voice |

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

- **SMP** picks the sample from the project's Sidecar pool (0 OFF). Fill the pool with LOAD TO PROJ in the SIDECAR folder. In the 0.3 test line SMP picks a row of the project's SAMPLES [pool](/sidecar-expander/using/pools/) in any of its eight banks: turning it (or **UP + SRC**) opens the bank list, and FUNC + YES loads a file into a row.
- **MOD** is the playback mode, a stepped list (one item a detent): ONE, LOOP, SLICE, GRAIN, STRCH, PLUCK, WAVE. The STA, END and LOP labels change with it (STA END SLC for SLICE, POS SIZ DNS for GRAIN, and so on).
- On the Pi, samples play from memory (256 MB by default).
- In the 0.3 test line a stereo sample plays in stereo when the voice is on PRE or POST (on TRK, as before, the sum of its two channels), and the OUT view's **DEC** sets DSP SAMPLE's decay there ([Stereo and the OUT route](/sidecar-expander/using/stereo-out/)).

## GRAIN

DSP SAMPLE's **GRAIN** mode: a granular voice over the pool sample, from memory, with position, size and density on STA END LOP. Each Pi render core can sound up to 32 grains. In the 0.3 test line the polyphonic **GRANULAR** machine is a granular machine of its own, with its source from the SAMPLES pool (card samples, built-ins or the Rytm's live audio): see [Poly machines](/sidecar-expander/using/poly-machines/#granular).

For a stand-alone granular machine with its own built-in sample, see the GRAIN user machine in the starter set ([User machines](/sidecar-expander/using/user-machines/)).

## CPU

Measured on the Pi 4, each voice costs about 0.2 % (DIGIDRUM) to 1.2 % (6-OP FM) of one core, so eight voices leave most of the Pi free. A voice that runs over its budget, or crashes, is muted on its own; the others keep playing.
