---
title: Poly mode (the Sidecar sequencer)
description: "Poly tracks on the Rytm: a Sidecar sequencer per track, with chords, more than 4 pages, p-locks, step preview and a piano roll on the touchscreen. Key combos, features and limits."
sidebar:
  order: 3.2
---

:::caution[New in 0.3]
New in 0.3 (until 0.3.0 is released: the test line, Rytm build `rui1039` with the Sidecar's 0.3 test build). Built and tested in the emulator; first used on a real Rytm with a Pi 4. Sidecar (Pi) only.
:::

A Rytm track plays one note per step. In **poly mode** the Sidecar sequences the track itself: chords and several notes per step, each note with its own velocity, length and micro timing, up to 8 pages of 16 steps, and p-locks on the Sidecar's parameters. You still edit on the Rytm: GRID REC, the trig keys, the pads and the knobs. The Rytm stays the master: PLAY, STOP, tempo, pattern changes and mutes are the Rytm's, and the Sidecar follows them.

<span class="sc-test">in testing</span>

## How it works

1. **A seq track** is a Rytm track on a Sidecar poly machine that you marked for the Sidecar sequencer. Its steps live on the Sidecar's card, one file per project and pattern (`/.rytm/seq/<project>/pNNN.sqp`), saved a second after each edit and at STOP. The Rytm's own track stays empty.
2. **The clock.** While playing, the Rytm reports each step of each seq track to the Sidecar, stamped to its audio block. The Sidecar plans the notes ahead and starts them early by the measured round trip, so they land with the Rytm's own trigs. The round trip is measured automatically, once, after the Rytm connects (5 short clicks while stopped).
3. **The analog chain is held open.** On a seq track the Rytm's analog amp stays open and the filter envelope is off, so the Sidecar's notes, each with its own envelope, pass through the track's filter, overdrive and amp. FRQ, RES, the filter type, OVR, level, pan and the sends stay yours. A seq track that has nothing sounding is closed again after 400 ms.
4. **Pattern changes.** The Sidecar loads the next pattern's steps as soon as the change is queued and switches on the Rytm's switch, with the next pattern's first steps already planned.

### Which machines

A seq track needs a polyphonic Sidecar machine on its SRC page. The Rytm's make prompt says how many notes the machine plays.

| Machine | Notes per voice | Notes in all (pool) |
|---|---|---|
| 6-OP FM | 6 | 24 |
| MULTISAMPLE | 16 | 64 |
| WAVETABLE | 8 | 32 |
| GRANULAR | 6 | 24 (and up to 64 grains per voice) |

JUNO, PLAITS, DAISYSP, DSP SAMPLE, DIGIDRUM, user machines and the analog machines are mono: on those tracks TRK + TRIG explains why instead of making a seq track.

![The make prompt on the Rytm: MAKE LT A SIDECAR SEQ TRACK? WAVETABLE, 8 POLY NOTES. YES: MAKE IT, NO: BACK](../../../assets/rytm/sc-seq-make.png)
![The explanation on an analog track: SD PLAYS ANALOG, NOT A SIDECAR MACHINE. SEQ TRACKS NEED 6-OP FM, MULTISAMPLE, WAVETABLE OR GRANULAR](../../../assets/rytm/sc-seq-explain.png)

## Getting started

1. Pick **6-OP FM**, **MULTISAMPLE**, **WAVETABLE** or **GRANULAR** on a track's SRC page (see [Poly machines](/sidecar-expander/using/poly-machines/)).
2. Select the track (TRK + pad), hold **TRK** and press **TRIG**. The Rytm asks **MAKE BD A SIDECAR SEQ TRACK?**
3. Press **YES** (TRK may still be held). The track is a seq track, saved per project. The Rytm shows the Sidecar's SEQ page for it, and the touchscreen switches to its piano roll.
4. Press **RECORD** (GRID REC) to edit steps on the trig keys. This is **seq mode**: the trig keys, PAGE and the knobs under a held trig are the Sidecar's.
5. Press **PLAY**.

To leave the SEQ page: TRK + TRIG again, or NO. To turn a track back into a normal track: on the SEQ page, with no trig held, turn **B** down and answer **TURN SEQ OFF ON BD?** with YES. The steps stay on the card; turn B up again to get them back.

![The turn-off prompt: TURN SEQ OFF ON LT? ITS STEPS STAY SAVED. YES: TURN OFF, NO: KEEP](../../../assets/rytm/sc-seq-off.png)

## Entering notes

In seq mode (a seq track selected, GRID REC on):

- **Tap a trig key**: the step on or off, with the last chord or note you played.
- **Hold a trig + play pads** (or keys on a MIDI keyboard on the Sidecar): those notes become the step's notes; several at once make a chord.
- **Hold a trig + turn A..H**: NOTE, VEL, LEN, MICRO, CHD, INV, STRUM, SEL. Turning on an empty step starts it at C3 (the track's default note).
- **Chords**: CHD picks a chord on the step's note (OFF MAJ MIN SUS2 SUS4 7 MAJ7 MIN7 DIM AUG 6 MIN6 9 ADD9 MIN9 5), INV an inversion (0..3), STRUM spreads the notes in time.
- **Live recording**: RECORD + PLAY and play the pads or a keyboard. The Sidecar records the notes on its own grid, at the nearest step with the micro offset kept (QNT OFF) or snapped to 1/16 (QNT 1/16), with the length from the note-off. Overdub adds notes. The Rytm writes nothing on a seq track.
- **The touchscreen** has a piano roll for the same steps: draw, move and resize notes, stamp chords, strum and humanise. See [The touchscreen](/sidecar-expander/using/touchscreen/#seq-the-piano-roll).

![The SEQ page with a step held: a keyboard, N C4, V96, L6.00, M+0, MIN, INV1, S+16, ALL 3](../../../assets/rytm/sc-seq-held.png)

### Step preview

Hold one or more trigs and press **YES**: the held steps play on the track's voice, the whole chord with each note's velocity, length and micro timing, and the first held step's p-locks. Works stopped or playing; nothing is recorded or toggled.

## P-locks on seq steps

Hold one or more trigs and press a page key. The SEQ page becomes a lock page with the machine's knobs:

| Page key | Locks |
|---|---|
| **SRC** | A..H: P1..P8 of the track's Sidecar machine |
| **SMPL** | A..H: P9..P16 (for example CHD INV SPR VOI) |
| **FX** | A..D: SEND FX 1 P2..P5, E..H: SEND FX 2 P2..P5 |
| **FX** again | the **INS** page: A..D INSERT A P1..P4, E..H INSERT B P1..P4 ([Insert FX](/sidecar-expander/using/insert-fx/)) |

- Turn a knob: it is locked on every held step (with FUNC held: 8 steps a detent).
- **NO**: clears every lock of the held steps. **Push** a knob: clears that knob's lock.
- Locking an empty step makes a **lock trig**: locks without notes, which change the sound under a ringing note.
- A locked knob is framed with its label inverted; the bottom bar shows the step and the value (`S5 LEV:34 LOCK`).
- A lock holds until the track's next step with notes or locks; STOP gives every knob its own value back. An LFO on a locked parameter moves around the lock.
- Up to 12 locks per step. Copy, paste, clear and undo carry the locks with the steps.

FLTR, AMP and LFO under a held trig show a page explaining that the analog side and the Sidecar's LFOs are not locked per step.

![LOCK SRC on a 6-OP FM track: TIM and LEV framed, S3 LEV:13 LOCK](../../../assets/rytm/sc-seq-lock-src.png)
![LOCK INS: the insert chain's knobs, SHPE framed, S5 SHPE:9 LOCK](../../../assets/rytm/sc-seq-lock-ins.png)

Where locks show: the trig LEDs (a step with locks magenta, a lock trig dim magenta), the SEQ page (a tick over the step per lock, a lock trig as a hollow box) and the touchscreen's lock lane.

## Pages, length and SCALE

- A seq track has up to **8 pages of 16 steps** (128 steps).
- **PAGE**: the next page. **PAGE held**: the trig LEDs show a page map (pages in the pattern dim, the page you edit bright, the playing page white); a trig key while PAGE is held jumps to that page. The 4 PAGE LEDs show the position within the group of 4.
- **SCALE**: FUNC + PAGE opens the Rytm's own SCALE menu, also over the SEQ page. A seq track follows a length you set there. NO (or FUNC + PAGE again) brings the SEQ page back.
- On the SEQ page with no trig held: **A** the track, **B** seq on / off, **C** the length, **D** record quantise (QNT), **E** follow, **F** the latency (set by hand; it is measured automatically otherwise).

## Copy, paste, clear, undo

The Rytm's own gestures act on the Sidecar's steps too, with one undo per level as on the Rytm:

| Gesture | Acts on |
|---|---|
| FUNC + RECORD / STOP / PLAY (outside GRID REC) | the pattern: copy / paste / clear |
| GRID REC, FUNC + RECORD / STOP / PLAY | the track: copy / paste / clear |
| GRID REC, PAGE held + FUNC + RECORD / STOP / PLAY | the page: copy / paste / clear |
| The same paste or clear again | undo |

Paste on another pattern: select it (BANK + trig), then paste, as on the Rytm. Pattern and track copy / paste with seq tracks: <span class="sc-ok">hardware</span>. Copying held steps is listed under [Limitations](#limitations).

## The touchscreen from the Rytm

Hold **UP** and press a trig key to switch the Pi touchscreen's page (no trig is placed):

| Keys | Page |
|---|---|
| UP + T1 | HOME |
| UP + T2 | SEQ (the piano roll) |
| UP + T3 | PAT (the Rytm's own pattern) |
| UP + T4 | VOICE (the selected track) |
| UP + T5 | SET (settings) |
| UP + T6 | INSERT FX |
| UP + T7 | SAMPLE on the Rytm's screen (again: AUTO) |
| UP + T8 | REC (the recorder) |
| UP + T9 | SCOPE on the Rytm's screen |
| UP + T10 | SIDECAR on the Rytm's screen |

SEQ, VOICE and the machine view follow the track you select on the Rytm.

## What the screens show

**The Rytm** (the SEQ page): SIDECAR SEQ and the track, the pattern, the page (`PG1/4`), the length and the transport; a step strip with the page's steps; a piano roll of the page. With a trig held: a keyboard with the step's notes, a timing lane, and the eight values. The playhead on the page moves at most 4 times a second; the trig LEDs show every step.

![The SEQ page playing: A01 PG1/4 64, the step strip and the page's notes](../../../assets/rytm/sc-seq-roll.png)
![The SEQ page with lock ticks over the steps and a lock trig as a hollow box](../../../assets/rytm/sc-seq-locks.png)

**The trig LEDs** in seq mode: a note blue, a chord cyan, the playing step white, held steps amber, steps with locks magenta, steps past the length dark.

**The touchscreen** (SEQ): the piano roll of the same track, the velocity lane, the lock lane, the page strip and the tools.

![The touchscreen's SEQ piano roll in the OLED theme: tracks T9 T10, pages 1..8, notes across two pages, the velocity lane](../../../assets/touch/oled-seq-roll.png)

<small>Screenshots: rendered off-device by the Sidecar's own page code, with made-up data.</small>

## The song recorder

The [song recorder](/sidecar-expander/using/song-recorder/) records the Rytm's pattern changes, mutes and knobs. A seq track's notes are not events in the take: they are in the pattern's file on the Sidecar, so when the take (or its replay) changes pattern, the seq track plays that pattern's steps.

## Key combos

| Keys | Where | Does |
|---|---|---|
| TRK + TRIG | any track | the SEQ page; on a non-seq track the make prompt (or why not) |
| YES / NO | make prompt | make the seq track / back |
| TRK + TRIG or NO | SEQ page | leave |
| RECORD | seq track selected | GRID REC = seq mode |
| trig tap | seq mode | step on / off |
| trig held + pads / keys | seq mode | the step's notes |
| trig held + A..H | seq mode | NOTE VEL LEN MICRO CHD INV STRUM SEL |
| trig held + YES | seq mode or SEQ page | step preview |
| trig held + SRC / SMPL / FX / FX FX | seq mode | lock pages: P1..P8 / P9..P16 / send FX / inserts |
| lock page: turn / NO / push | trig held | lock / clear all / clear that knob |
| PAGE / PAGE held / PAGE + trig | seq mode | next page / page map / jump to page |
| FUNC + PAGE | seq mode, also over the page | SCALE |
| RECORD + PLAY | seq track | live record on the Sidecar's grid |
| B down (no trig held) | SEQ page | turn seq off (prompt) |
| UP + T1..T10 | anywhere | the touchscreen's pages (above) |

## Features

- Poly tracks on 6-OP FM, MULTISAMPLE, WAVETABLE and GRANULAR, up to 4 seq tracks at once.
- Up to 8 notes per step, each with its own velocity, length and micro timing (1/96 of a step).
- Chords by CHD, INV and STRUM, or played on the pads; chord stamp, strum and humanise on the touchscreen.
- Up to 8 pages of 16 steps per track, with a page map on the trig LEDs.
- P-locks on the Sidecar machine's 16 parameters, the send FX and the inserts; lock trigs.
- Step preview (trig held + YES), live recording with quantise off or 1/16.
- Follows PLAY, pause, STOP, tempo, pattern changes (queued, chained), mutes and SCALE lengths.
- Copy, paste, clear and undo of patterns, tracks and pages through the Rytm's own gestures.
- Notes rendered ahead by the measured round trip, so they line up with the Rytm's own trigs.
- The SEQ page on the Rytm and a piano roll on the touchscreen, both following the selected track.

## Limitations

- **Sidecar (Pi) only.**
- **Analog tracks are not polyphonic.** A seq track must play 6-OP FM, MULTISAMPLE, WAVETABLE or GRANULAR. JUNO is mono in this build.
- **Voices per machine** are capped (table above); a note past the cap steals the oldest.
- **Shared voices.** RS/CP, MT/HT, CH/OH and CY/CB share one voice; a poly track is best on BD, SD, BT or LT.
- **No analog p-locks on seq steps**: FLTR, AMP and the Rytm's own FX are not locked per step, and the Sidecar's LFOs are not locked per step.
- **No trig conditions or probability yet**, no retrigs. FILL is seen but not used.
- Seq tracks use the Sidecar's own swing, set per track.
- The first steps after PLAY are late by the round trip (PLAY cannot be predicted); after that, and across pattern changes, notes are rendered ahead.
- Steps live on the Sidecar's card. A stock OS, a SysEx or Transfer backup, or a project shared without the card's files does not carry them.
- A project renamed or copied on the Rytm starts with empty seq tracks (the files are keyed by the project's name).
- The SEQ page's playhead moves at most 4 times a second, to keep the Rytm's UI responsive.
- First hardware use on a Pi 4. Nothing is confirmed on a Pi 5 yet.

**Known bugs, being fixed:**

- Copy, paste and clear of held steps (trig held + FUNC + RECORD / STOP / PLAY) on seq steps.
- Seq mode does not always follow a track change, and the pads can behave chromatically in poly mode.
- The page keys under a held trig do not always show the page that is locked.
