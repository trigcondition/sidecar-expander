---
title: Host-link protocol
description: The SysEx messages between the modded Rytm and the Sidecar.
sidebar:
  order: 3
---

The Rytm and the Sidecar talk over the Rytm's **USB MIDI** with SysEx under the non-commercial manufacturer ID `0x7D`, which the stock OS ignores:

```
F0 7D 52 54 <cmd> <payload...> F7          ("RT")
```

All payload bytes are 7-bit. 14-bit values go as two bytes, high 7 bits first. Text is ASCII 0x20..0x7E (anything else `_`), NUL padded. A receiver ignores a command it does not know, and from the user slots on, every message carries a version byte (`01`) right after the command, except `26` / `27`. The reference implementation and its tests are `sim/protocol.py` in the engine repository; the core's C++ is tested against it.

Audio never goes over SysEx: the Overbridge stream carries it.

## Voice reports (Rytm to host)

| Cmd | Name | Payload |
|---|---|---|
| `04` | TRIG+PARAMS | `<voice byte> <note> <velocity> <P1..P16 as 14-bit> [<tag hi> <tag lo>]` |
| `03` | PARAMS | `<voice byte> <P1..P16> [<tag>]`: knob, LFO or slide changes, at most ~90 a second per voice |
| `11` | NOTE_OFF | `<voice>`: the gate closed (pad released, trig length elapsed, sequencer stopped) |

- **Voice byte:** the physical voice (0..7) in the low 3 bits, the machine in `voice & 0x78`: `00` PLAITS, `08` JUNO, `10` DAISYSP, `20` DSP SAMPLE, `40` DIGIDRUM, `48` 6-OP FM, `50 58 60 68 70` U1..U5. Anything else plays as PLAITS.
- **P values** are 14-bit: the 0..127 value, then the fraction in 1/128 steps (slides and the LFO move it). LFO modulation is included.
- **List knobs** (ENG and others) are equal zones: `zone = min((value * N) >> 7, N - 1)`.
- **Tag:** the owner track's sound tag. For U1..U5 it is the fingerprint of the machine the sound was made for (0 untagged). A host plays a user-slot voice only when the tag is 0 or matches.

## Project, pool and names

| Cmd | Dir | |
|---|---|---|
| `10` | R→H | the Rytm's project name; the pool, JUNO and FM lists are per project |
| `0D` / `0E` | R→H / H→R | list a SIDECAR folder / a page of 6 entries (folders and files, sizes, names) |
| `0F` | R→H | LOAD TO PROJ on a Sidecar file: add it to the project's pool (or JUNO / FM list) |
| `12` | R→H | assign pool slot N to a file |
| `13` | R→H | ask for the pool table and names now |
| `14` | H→R | the pool table, 6 slots a message |
| `15` | H→R | a JUNO voice's patch sliders, so the Rytm's knobs show the patch |
| `16` / `17` | H→R | the project's JUNO / FM list names, 8 a message |
| `18` | R→H | ask for the FM names |

## User slots: `19`..`1E`, `25`

| Cmd | Dir | Name | |
|---|---|---|---|
| `19` | R→H | ASK | a slot's metadata, a knob's enum names, a preset page, or the installed machines |
| `1A` | H→R | METADATA | a slot's state (EMPTY READY LOADING MISSING BAD NO_ROOM MUTED), name, short name, page-2 title, fingerprint, then the knob descriptors (look, kind, role, range, default, names) |
| `1B` | H→R | LIST NAMES | 8 names a message: a knob's enum list, the slot's presets, or the installed machines |
| `1C` | H→R | KNOBS | knob values written back to a track (a preset's knobs) |
| `1D` | H→R | SLOTS | the five slot generations and the installed list's; with an answer to a `1E` (READY, NOT INSTALLED, NO ROOM, STOP TO INSTALL, NOT ON CARD, BAD, LOADING) |
| `1E` | R→H | ASSIGN | assign an installed machine to a slot, clear it, or install it from the card |
| `25` | R→H | SLOT PRINTS | `<seq> <flags> <n> {<slot> <fp hi> <fp lo> <count>}`: every (slot, fingerprint) the project's sounds use, at most 16; sent after a `10` and every ~5 s with the same `seq` (from `sfx1019`, in testing) |

Generations (1..127 per slot) let the Rytm cache metadata and ask only when something changed. `1F` is reserved.

## Send FX: `20`..`24`

| Cmd | Dir | Name | Payload |
|---|---|---|---|
| `20` | R→H | SENDFX | track 0..11: `<t> <hi> <lo>`, the track's SEND FX 1 (hi) / 2 (lo) levels. Track 12: six hi/lo pairs, each FX's TYPE, P1..P5. Track 13: the kit's user-effect tags. Sent in the block a changed value plays, and one track in turn every ~43 ms, so a new host has every value within ~0.6 s |
| `21` | H→R | SENDFX NAMES | the TYPE list: `<replace> <total> {<id> <name 13>}`, 8 a message |
| `22` | H→R | SENDFX STATE | per FX: id, state (EMPTY / READY / MISSING), a 10-character name for `!NAME` |
| `23` | R→H | SENDFX ASK | answered by `21`, the `24`s and both `22`s |
| `26` | H→R | FXIN | `<0 AUDIO IN \| 1 the FX return on IN L/R \| 7F ask>` (no version byte) |
| `27` | R→H | FXIN STATE | `<on>`: the answer to every `26`, and unasked when the Rytm's USB port comes up (no version byte) |
| `24` | H→R | SENDFX LABELS | per TYPE: four 4-character labels for P2..P5, and up to 12 zones `<knob \| show<<2 \| step<<3> <lo> <base> <name 5>` |

TYPE ids are stable: 0 OFF, 1 CHORUS, 2 COMB, 6 RINGS, 8 CLOUDSEED, 15 STUTTER, 16 CRUSH, 17 RINGMOD, 18 HALO; the other ids up to 63 are reserved for planned built-ins (a Sidecar without one reports it MISSING); 64..67 are the user-effect slots UFX1..UFX4. P1 is ROUTE on every TYPE (0..63 PRE, 64..127 POST); the Rytm shows it itself. A zone with `show` displays `name` and `v - lo + base`; `step` makes the Rytm step the knob one zone per detent.

## Remote UI: `29`, `2A`, `30`..`3F`

Part of the release (the `rui1027d` Rytm build). Every message carries `<ver 1>`.

| Cmd | Dir | Payload |
|---|---|---|
| `29` | R→H | SRC view: `<track 0..11> <on>`: the stock SRC page of a Sidecar track shows or hides |
| `2A` | R→H | SRC view values: `<track> <first> <n> {<int> <frac>}`: P1..P8 the SRC knobs A..H, P9..P16 the SMPL page; all 16 after each `29 t 1`, then the changed span each tick |
| `30` | R→H | `<page> <on> <reason>`: the page opened or closed (0 user, 1 host, 2 timeout, 3 local escape); `page` 0 SIDECAR, 1 the LFO page (TRK + LFO, also sent again while open); a close is always 0 |
| `31` | R→H | `<code hi> <code lo> <down>`: every key while the page is open |
| `32` | R→H | `<encoder> <delta + 64> <func>`: encoder turns summed per 50 ms tick |
| `38` | H→R | `<seq> <col0> <page0> <ncols> <npages> <packed>`: a rectangle of 8x8 tiles of the 128x64 screen into staging |
| `39` | H→R | `<seq>`: commit staging to the screen (a partial frame never shows) |
| `33` | R→H | machines: `<t0> <n> {<machine 0..52> <vb>}` per track, `vb` 7F = not a Sidecar machine; a change at the next UI tick, all 12 after each hello and when the page opens |
| `34` | H→R | trig key LEDs: `00` gives them back to stock, `01 <c1..c16>` palette colours 0..111 |
| `35` | R→H | hello: `<uptime hi> <lo> <caps>` when the Rytm's USB port comes up |
| `36` | H→R | splash: `<ticks>`: the connect screen for that long, every key and knob stock's (0 ends it) |
| `37` | H→R | catch mask: `<e0 e1 e2> <k0..k36>`: which encoders and keys go to the Sidecar; the rest stay the Rytm's |
| `3A` | H→R | `<page> <on>`: open or close the page; `3A 0 0` also gives the screen back from the SRC view |
| `3B` | R→H | the active kit `<kit 0..127>` (for the per-kit LFOs) |
| `3D` | H→R | a text item: `<seq> <slot> <x> <y> <font> <flags> <chars>`, drawn by the Rytm in its own font |
| `3E` | H→R | clear all text items |
| `3F` | H→R | local echo: binds an encoder to the bottom bar, which the Rytm updates itself on a turn |
| `3C` | H→R | keepalive; the Rytm leaves after 1 s without a valid `3x` |

The framebuffer is 1024 bytes, column-major in the Rytm's panel layout: pixel (x, y) is byte `(7 - y/8) + 8x`, bit `y % 8`. `packed` carries 8-bit data in 7-bit bytes: groups of up to 7 bytes, each group preceded by a byte of their top bits.

## Other

- `05`..`08`: the looper experiment (mode, pads, slot states, mutes).
- `09`, `0B`, `0C`: the retired folder walk; ignored.
- `02` and `01` (audio over SysEx) are reserved and unused.
