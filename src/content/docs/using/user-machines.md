---
title: User machines
description: Installing machine plugins, the slots U1..U5, fingerprints, inheritance and the !NAME warnings.
sidebar:
  order: 4
---

User machines are **machine plugins**: small sound generators in `.rmp` files that you install on the Sidecar and play in the Rytm's slots **U1..U5**. Each project has its own choice of machine per slot.

A user machine is an **RMPA** package for the Pi. The Sidecar refuses other packages (such as the Sidecar Mini's RMP1) with a clear message.

Status: loading and playing on the Pi <span class="sc-ok">hardware</span>; the slot menu fixes, slot fingerprints from the project <span class="sc-test">in testing</span>.

## The starter set

Six machines of our own (MIT licence), ready to install:

| Machine | What it is |
|---|---|
| ACID | 303-style bass: saw/square, resonant 4-pole, envelope mod, accent, slide, drive |
| WAVEPAD | morphing wavetable pad: 3 detuned voices, LFO on the morph, sub oscillator, slow envelope |
| METAL | metallic FM percussion: inharmonic ratios (BELL..TINE), index decay, pitch drop |
| SNARE | snare and noise designer: two tuned bodies, band-passed noise, snap |
| PLUCK | Karplus-Strong string with pick position and body |
| GRAIN | granular texture over a built-in sample: position, spray, size, density, pitch, reverse |

## New in 0.3.0: four more machines

<span class="sc-test">in testing</span> (Mac renders; not yet played on a Pi). Ports of open-source instruments, each its own
package (install like the starters):

| Machine | What it is | Knobs (P1..P8 / P9..) | Voices | Based on |
|---|---|---|---|---|
| NUSAW | supersaw for pads and stabs: 7 detuned saws, sine sub, resonant filter with its own envelope | DETN MIX CUT RES ENV ATK REL SUB / TUN DEC SUS FDEC FSUS VEL LEV | 8 | [NuSaw](https://github.com/charlesvestal/schwung-nusaw) by Charles Vestal (MIT) |
| VOX | a singing / speaking vocal tract: vowels, tongue and lips, consonant-like closures, breath, vibrato, glides | VOWL TONG CONS CDIA TENS BRTH VIBR NASL / ATK REL GLID WOBL VRAT VEL LEV | 4 (heavier) | [Pink Trombone](https://dood.al/pinktrombone/) by Neil Thapen (MIT) |
| HUSH1 | SH-101-style mono bass and lead: saw, pulse with PW, sub, noise, resonant filter, glide, VCA env / gate | SAW PULS PW SUB NOIS CUT RES ENV / ATK DEC SUS REL GLID TRK LEV VCA | 8 (glides on a mono track) | [schwung-hush1](https://github.com/charlesvestal/schwung-hush1) by Charles Vestal (MIT) |
| RAFFO | four oscillators into a ladder filter: fat basses and leads, slides on overlapping trigs | WAV1 WAV2 DTN2 MIX SUB CUT RES ENV / ATK DEC SUS REL FDEC FSUS GLID LEV | 8 | [RaffoSynth](https://github.com/nicoroulet/RaffoSynth) by Nicolas Roulet and Julian Palladino, via [schwung-moog](https://github.com/charlesvestal/schwung-moog) (MIT) |

On a poly track they play chords (one instance a note); on a plain track HUSH1 and RAFFO glide like the originals.
No LFOs of their own: use the Sidecar's LFOs on any knob.

## MD: Machinedrum-style drums

<span class="sc-test">in testing</span> (Pi). **MD** is one user machine with 30 drum voices in three families, built from the open [mdkit](https://github.com/soejrd/mdkit) project. Install it like any user machine and put it in a slot (U1..U5).

MD is also **built in** (in the machine slot that was DIGIDRUM, [Voices and machines](/sidecar-expander/using/machines/#md)). With the Rytm firmware 0.3.0 the built-in MD shows only DIGIDRUM's old page (11 types on knob 1); the MD user machine in a U slot shows MD's full page below, with all 30 types, until the next Rytm firmware gives the built-in MD the same page.

| Knob | Page | |
|---|---|---|
| **P9 ENGINE** | SMPL | the family: FM, PI or TRX |
| **P10 TYPE** | SMPL | the drum, from the list of that ENGINE |
| **P11 LEV** | SMPL | the output level |
| **P1..P8** | SRC | the voice's own controls |

| ENGINE | TYPEs |
|---|---|
| FM | BD SD XT CP RS CB HH CY |
| PI | BD SD MT ML MA RS RC CC HH |
| TRX | BD SD XT CP RS CB CH OH CY MA CL XC B2 |

- **The names follow.** Turn ENGINE and the TYPE list changes with it; turn TYPE and P1..P8 take the names of that drum's controls.
- **Turning ENGINE keeps TYPE's place** in the list (the first stays the first, the last the last), so BD stays BD.
- **P-lock ENGINE or TYPE per step** for a different drum on each step. The voice that is ringing fades out under the new hit, so there are no clicks.
- The knobs keep their values when TYPE changes: an SD after a BD plays with the BD's knob positions.
- MD is a mono drum voice: the trig's note is not used (tune with the voice's own PTCH), and the velocity scales the hit. Loudness differs a lot between voices; use LEV.
- Only the voice you are using costs CPU; the others in the machine cost nothing.
- MD needs Sidecar 0.3.0 or later. An older one refuses the package ("format not supported") rather than show the wrong TYPE names.
- Earlier test builds had three machines, MD-PI, MD-EFM and MD-TRX. MD replaces them.

## Install

**On the Pi:** open `sidecar.local`, tab **User machines**, and upload the `.a64.rmp` files (or copy them into `/Plugins/` on the card). Each package is checked (header, size, CRC, API version, target) before it goes in place. Press **Rescan** if you copied files by hand.

The installed list shows each machine's name, version, size, fingerprint, memory, CPU (measured once it has played), the slots that use it, and whether it fits.

## Assign a slot

Three ways, all ending in the same slot map:

- **On the Rytm:** the track menu (FUNC + CHRO), `U1..U5`, YES steps through the installed machines. See [User slots](/sidecar-expander/using/rytm-side/#user-slots-u1u5).
- **On the web page / console:** the project's U1..U5, each with an assign / clear select.
- **Import a slot list:** a JSON file exported from another Sidecar (`sidecar-slots` format). Machines that are not installed are named, so you know what to get.

Then pick U1..U5 as the track's machine. Choosing a slot sets the track's knobs to the machine's defaults.

## Which machine a slot plays

A slot list behaves as one instrument across your projects, and a project shared with another Sidecar finds its machines. When a project loads, per slot:

1. **A cleared slot stays empty.** "Start this project empty" clears all five.
2. **Fingerprints.** Every sound remembers the machine it was made for (a fingerprint of the machine's id). If the project's sounds on a slot point to one installed machine, the slot plays it. A changed assignment is shown as "updated from the project's sounds".
3. **The project's own saved list** decides for slots with no fingerprint information.
4. **Inherit.** A new project with no list takes the previous project's machines and saves them as its own.

When nothing fits, the web page says what is wanted: "a machine with fingerprint NNNN", with its name if known. Two installed machines with the same fingerprint are flagged as a collision.

## !NAME on the Rytm

A `!` before a machine name means it cannot play. Instead of a bare `!`, the Rytm shows the reason in front of a short name:

| On the Rytm | Reason |
|---|---|
| `!ROOM NAME` | no code space left: the package does not fit in the memory that is left |
| `!CRSH NAME` | it crashed and was muted |
| `!TIME NAME` | it took too long (a timeout, or over its CPU budget three times in a row) and was muted |
| `!MISS NAME` | the package is not installed, or not in the version range the slot needs |
| `!BAD NAME` | the package failed its checks |
| `!SAFE NAME` | the Sidecar started in safe mode and did not load user machines |
| `NAME...` | it is being loaded |

The web page shows the full reason in the slot list, for example "no room: needs N B, M B free" or "muted: timed out".

A machine name with a plain `!` and no reason means the track's sound was made for another machine than the slot now plays. The track stays silent until a trig with a matching sound.

## Limits

| | Sidecar (Pi) |
|---|---|
| Code space for loaded machines | 4 MB code + 4 MB data |
| State per voice | 64 KB |
| Installed machines listed on the Rytm | up to 32 |
| Presets (`/PRESETS/<id>/`, the PRE knob, up to 127 a machine) | yes |
| Sample pool access (`pool_info` / `pool_read`) | yes, from the sample RAM |

Writing your own: [Writing user machines](/sidecar-expander/developers/writing-user-machines/).
