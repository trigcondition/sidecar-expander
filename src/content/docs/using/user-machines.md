---
title: User machines
description: Installing machine plugins, the slots U1..U5, fingerprints, inheritance and the !NAME warnings.
sidebar:
  order: 4
---

User machines are **machine plugins**: small sound generators in `.rmp` files that you install on the Sidecar and play in the Rytm's slots **U1..U5**. Each project has its own choice of machine per slot.

One plugin source builds for both Sidecars, but the package is per board: **RMP1** for the Teensy, **RMPA** for the Pi. Each Sidecar refuses the other's package with a clear message.

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

## Install

**On the Pi:** open `sidecar.local`, tab **User machines**, and upload the `.a64.rmp` files (or copy them into `/Plugins/` on the card). Each package is checked (header, size, CRC, API version, target) before it goes in place. Press **Rescan** if you copied files by hand.

**On the Teensy:** open the [web console](/sidecar-expander/console/), tab **User machines**, and upload the `.rmp` files. They go into the Teensy's own plugin store (4 MB of flash). Installing waits for the Rytm's transport to stop (STOP TO INSTALL).

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
| `!ROOM NAME` | no code space left: the package does not fit in the memory that is left (on the Sidecar Mini the 32 KB plugin space) |
| `!CRSH NAME` | it crashed and was muted |
| `!TIME NAME` | it took too long (a timeout, or over its CPU budget three times in a row) and was muted |
| `!MISS NAME` | the package is not installed, or not in the version range the slot needs |
| `!BAD NAME` | the package failed its checks |
| `!SAFE NAME` | the Sidecar started in safe mode and did not load user machines |
| `NAME...` | it is being loaded |

The web console (Sidecar Mini) and the web page (Sidecar) show the full reason in the slot list, for example "no room: needs N B, M B free" or "muted: timed out".

A machine name with a plain `!` and no reason means the track's sound was made for another machine than the slot now plays. The track stays silent until a trig with a matching sound.

## Limits

| | Sidecar Mini (Teensy 4.1) | Sidecar (Pi 4B) |
|---|---|---|
| Code space for loaded machines | 32 KB in all | 4 MB code + 4 MB data |
| State per voice | 16 KB (more with PSRAM) | 64 KB |
| Installed machines listed on the Rytm | up to 32 | up to 32 |
| Presets (`/PRESETS/<id>/`, the PRE knob, up to 127 a machine) | yes | yes |
| Sample pool access (`pool_info` / `pool_read`) | yes | yes, from the sample RAM |

Writing your own: [Writing user machines](/sidecar-expander/developers/writing-user-machines/).
