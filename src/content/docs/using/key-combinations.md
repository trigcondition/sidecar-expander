---
title: Key combinations
description: "Every key combination the Sidecar adds to the Analog Rytm MKII, in one table: the remote pages, poly tracks, step locks, the pools and the touchscreen's pages."
sidebar:
  order: 1.1
---

:::caution[New in 0.3]
For the 0.3 test line: Rytm build `rui1045` with the Sidecar's 0.3 test build, Sidecar (Pi). Rows marked 0.2 also work with the 0.2.0 release's `rui1027d`.
:::

**Hold UP** on the Rytm's main screen for the cheat sheet: the Rytm shows the **KEYS** page and lights T1..T10 in their pages' colours; the touchscreen shows the same map. Let go of UP to close it. The **SIDECAR MENU** (TRK + YES, then YES) lists every Sidecar page with its shortcut. While a Sidecar page has the Rytm's keys, TRK's LED blinks.

"Hold" means hold the first key, then press the second. "T1".."T16" are the trig keys.

| Keys | Where | Does |
|---|---|---|
| **TRK + YES** | anywhere | the Sidecar's remote pages (SIDECAR first); again: leave. 0.2 |
| **YES** | the SIDECAR page | the **SIDECAR MENU**: every page with its shortcut |
| **NO** | a remote page | back a level: page > SIDECAR > leave |
| **LEFT / RIGHT** | a remote page | the previous / next page |
| **UP** (held alone) | the main screen | the KEYS page and the UP + T map; let go: back |
| **TRK + TRIG** | any track | the SEQ page; on a track that is no poly track, the make prompt (or why not) |
| **TRK + LFO** | anywhere | the [LFO page](/sidecar-expander/using/lfo/) |
| **TRK + FX** | anywhere | the [INSERT page](/sidecar-expander/using/insert-fx/) |
| **UP + T1..T5** | anywhere | touchscreen: HOME, SEQ, PAT, VOICE, SET |
| **UP + T6** | anywhere | touchscreen: INSERT FX |
| **UP + T7** | anywhere | SAMPLE on the Rytm's screen; again: AUTO |
| **UP + T8 / T9 / T10** | anywhere | REC / SCOPE / SIDECAR STATUS: on the touchscreen when one is connected, else on the Rytm's screen |
| **AMP**, AMP again | a track | AMPLITUDE 2: the track's sends to SEND FX 1 and 2. 0.2 |
| **SRC** / **SMPL** again | the FX track | SEND FX 1 / SEND FX 2. 0.2 |
| **STOP STOP** | anywhere | the Sidecar's send effects fade out and clear. 0.2 |
| **FUNC + CHRO** | a track | the track menu with the user slots U1..U5. 0.2 |
| **knob A** turned | SRC page of GRANULAR, WAVETABLE, MULTISAMPLE | the [bank list](/sidecar-expander/using/pools/#choosing-and-loading-on-the-rytm) of the machine's POOL |
| **SMP** (knob D) turned | SMPL page of DSP SAMPLE | the bank list of SAMPLES |
| **LEFT / RIGHT**, **YES**, **NO** | the bank list | the bank / choose / cancel |
| **FUNC + YES** | the bank list | the card's browser, aimed at the row: load a file into it |
| **trigs held + YES** | the bank list (GRID REC) | lock the row on those steps |
| **RECORD** | a poly track selected | GRID REC: the trig keys, PAGE and the knobs under a held trig edit the Sidecar's steps |
| **trig** tapped | GRID REC on a poly track | the step on / off |
| **trig held + pads** (or a keyboard) | GRID REC on a poly track | the step's notes; several at once: a chord |
| **trig held + A..H** | poly track | the step's NOTE, VEL, LEN, MICRO, CHD, INV, STRUM, SEL |
| **TRIG** | poly track | the SEQ page; again: the TRIG view (NOTE VEL LEN MICRO / COND STRUM CHD INV) |
| **trig held + YES** | poly track | step preview: the held steps play |
| **trig held + SRC / SMPL / FX / FX FX** | poly track | step locks: P1..P8 / P9..P16 / send FX / inserts |
| **NO** / knob **pushed** | a lock page | clear every lock of the held steps / that knob's lock |
| **trig held + FUNC + RECORD / STOP / PLAY** | poly track | copy / paste / clear the held steps |
| **FUNC + RECORD / STOP / PLAY** | outside / in GRID REC | the pattern / track: copy, paste, clear (the Rytm's own; the poly steps follow) |
| **PAGE held + FUNC + RECORD / STOP / PLAY** | GRID REC | the page: copy, paste, clear |
| **PAGE** / PAGE held / **PAGE + trig** | poly track | next page / the page map on the trig LEDs / jump to that page |
| **FUNC + PAGE** | poly track, also over the SEQ page | the Rytm's SCALE menu |
| **YES** (no trig held) | the SEQ page | the poly track's menu: BACK, TURN OFF, LENGTH, QUANTISE |
| **RECORD + PLAY** | poly track | live recording on the Sidecar's grid |
| **YES**, YES again | the INSERT page | the BUS view, then the OUT view ([OUT route](/sidecar-expander/using/stereo-out/#where-to-set-it)) |
| **FUNC + G** | the INSERT page | another track |
| **knobs A..D**, **YES** | the POOL page | list, bank, row, action; do it ([POOL page](/sidecar-expander/using/pools/#the-pool-page-on-the-rytm)) |
| **T1..T5**, **knob A / H** | the PROJECT page | export, import, info, delete, eject; the project / the drive ([PROJECT page](/sidecar-expander/using/projects-bundles/#the-rytm-the-project-page)) |
| **T1 / T2 / T3 / T4** | the SONG page | arm / replay / marker / setup checklist ([Song recorder](/sidecar-expander/using/song-recorder/)) |

![The touchscreen's combo map while UP is held: UP + TRIG ON THE RYTM, T1 HOME .. T10 STATUS](../../../assets/touch/oled-combo-map.png)

PLAY, STOP and RECORD always reach the Rytm, also while a Sidecar page is open.
