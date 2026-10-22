---
title: Poly mode (the Sidecar sequencer)
description: "Poly tracks on the Rytm: a Sidecar sequencer per track, with chords, more than 4 pages, trig conditions, p-locks, step preview, step copy and a piano roll on the touchscreen. Key combos, features and limits."
sidebar:
  order: 3.2
---

:::caution[New in 0.3]
New in 0.3 (until 0.3.0 is released: the test line, Rytm build `rui1048` with the Sidecar's 0.3 test build). First used on a real Rytm with a Pi 4 (build `rui1039`); the fixes and additions since (the TRIG view, trig conditions, step copy, pattern reload and save, jumps, UP as the Sidecar key, poly tracks on every Sidecar machine, POLY CONFIG, the seeded random) are tested in the emulator and on the Mac. Sidecar (Pi) only.
:::

A Rytm track plays one note per step. In **poly mode** the Sidecar sequences the track itself: chords and several notes per step, each note with its own velocity, length and micro timing, up to 8 pages of 16 steps, trig conditions, and p-locks on the Sidecar's parameters. You still edit on the Rytm: GRID REC, the trig keys, the pads and the knobs. The Rytm stays the master: PLAY, STOP, tempo, pattern changes and mutes are the Rytm's, and the Sidecar follows them. The Rytm's screens call such a track a **POLY TRACK**.

<span class="sc-test">in testing</span>

## How it works

1. **A poly track** is a Rytm track on a Sidecar poly machine that you handed to the Sidecar sequencer. Its steps live on the Sidecar's card, one file per project and pattern (`/.rytm/seq/<project>/pNNN.sqp`), saved a second after each edit and at STOP. The Rytm's own track stays empty.
2. **The clock.** While playing, the Rytm reports each step of each poly track to the Sidecar, stamped to its audio block. The Sidecar plans the notes ahead and starts them early by the measured round trip, so they land with the Rytm's own trigs. The round trip is measured automatically, once, after the Rytm connects (5 short clicks while stopped).
3. **The analog chain is held open.** On a poly track the Rytm's analog amp stays open and the filter envelope is off, so the Sidecar's notes, each with its own envelope, pass through the track's filter, overdrive and amp. FRQ, RES, the filter type, OVR, level, pan and the sends stay yours. A poly track that has nothing sounding is closed again after 400 ms.
4. **Pattern changes.** The Sidecar loads the next pattern's steps as soon as the change is queued and switches on the Rytm's switch, with the next pattern's first steps already planned. DIRECT JUMP and TEMP JUMP (FUNC + BANK C / D) play the new pattern from the old position at once.

### Which machines

**Every Sidecar machine** can be a poly track: PLAITS, JUNO, DAISYSP, DIGIDRUM, DSP SAMPLE, 6-OP FM, MULTISAMPLE, WAVETABLE, GRANULAR and user machines. Only the analog machines cannot: the Rytm's analog voice is mono. How many notes a track plays at once is its [POLY CONFIG](#poly-config); AUTO gives each machine its default:

| Machine | VOICES on AUTO | Where the notes play |
|---|---|---|
| 6-OP FM | 6 | the machine's own pool |
| MULTISAMPLE | 16 (its pool, as before; VOICES 1..8 caps it) | the machine's own pool |
| WAVETABLE | 8 | the machine's own pool |
| GRANULAR | 6 | the machine's own pool |
| JUNO | 6 | the instance pool |
| PLAITS, DAISYSP | 4 | the instance pool |
| DIGIDRUM | 1 (mono: a new note cuts the old) | the voice, or the instance pool with VOICES above 1 |
| DSP SAMPLE | 1 (mono only: one card stream a voice) | the voice |
| user machines | 1 for a drum, else up to 4 (the package declares its maximum) | the instance pool, when the package allows it |

- **The instance pool** holds 32 instances shared by the poly tracks, each with its own engine state, so a PLAITS track with VOICES 4 plays four PLAITS at once. They are rendered into the track's own channel, before its inserts, so the voice's CPU budget covers them: every built-in machine fits 8. A heavy user machine is cut to what fits (`CUT` on the pages).
- **The note's pitch:** on PLAITS, JUNO, DAISYSP, DSP SAMPLE and the note machines the note is the pitch (plus TUN / FIN); DIGIDRUM takes it as an offset on PTCH; a user machine for a fixed-pitch drum ignores it.
- A user machine package declares its voices (`max_voices`) and whether pitch matters; older packages stay mono.
- A poly track's own Rytm trigs make no note; its pad in the normal pad mode still plays its voice.

The Rytm's make prompt names the machine and its notes, and where POLY CONFIG is.

![The make prompt on the Rytm: MAKE BT A POLY TRACK? SIDECAR SEQUENCES IT. PLAITS, 4 NOTES. PADS: CHRO FOR NOTES. FUNC+CHRO: POLY CONFIG. YES: MAKE IT, NO: BACK](../../../assets/rytm/sc-seq-make.png)
![On an analog track: BT PLAYS ANALOG: THE RYTM'S VOICE IS MONO. FOR A POLY TRACK PICK A SIDECAR MACHINE ON SRC](../../../assets/rytm/sc-seq-explain.png)

## Getting started

1. Pick a **Sidecar machine** on a track's SRC page: PLAITS, JUNO, 6-OP FM, MULTISAMPLE and the rest (see [Machines](/sidecar-expander/using/machines/) and [Poly machines](/sidecar-expander/using/poly-machines/)).
2. Select the track (TRK + pad), hold **UP** and press **TRIG**. The Rytm asks **MAKE BD A POLY TRACK?**
3. Press **YES** (UP may still be held). The track is a poly track, saved per project. The Rytm shows the Sidecar's SEQ page for it, and the touchscreen switches to its piano roll.
4. Press **RECORD** (GRID REC) to edit steps on the trig keys. This is **seq mode**: the trig keys, PAGE and the knobs under a held trig are the Sidecar's.
5. Press **PLAY**.

To leave the SEQ page: UP + TRIG again, or NO. Selecting a track that is no poly track closes it too, and the trig keys are the Rytm's again.

**The poly track's menu:** on the SEQ page with no trig held, press **YES**: **BACK TO THE SEQ**, **TURN OFF (STEPS KEPT)**, **LENGTH (KNOB C)**, **QUANTISE (KNOB D)**. UP / DOWN pick, YES confirms. TURN OFF asks once more; the steps stay on the card, and turning knob **B** up makes it a poly track again with its steps.

![The poly track's menu: LT: POLY TRACK, BACK TO THE SEQ, TURN OFF (STEPS KEPT), LENGTH (KNOB C), QUANTISE (KNOB D)](../../../assets/rytm/sc-seq-menu.png)
![The turn-off prompt: LT: POLY TRACK OFF? ITS STEPS STAY SAVED. B UP: BACK ON. YES: TURN OFF, NO: KEEP](../../../assets/rytm/sc-seq-off.png)

## POLY CONFIG

Each poly track has a **POLY CONFIG**, named and modelled after the Analog Four MKII's. On the Rytm it is the last item of the Rytm's own **track menu**: **FUNC + CHRO**, then **POLY CONFIG** (after TRIGS SETUP, PAD SCALE, RELOAD TRACK, SAVE TRACK and the user slots U1..U5; FUNC + DOWN moves five rows) and **YES**. The Sidecar draws the page on the Rytm's screen; the SIDECAR MENU lists it too.

| Knob | Setting | Values |
|---|---|---|
| **A** VOIC | **VOICES**: the most notes at once | AUTO (the machine's default), 1..8 |
| **B** ALLC | **ALLOCATION**: which voice a new note takes | REASSIGN (the default: the same note held retriggers its voice), ROTATE, RESET |
| **C** UNIS | **UNISON**: instances stacked per note | OFF, 2..8 |
| **D** DTUN | **DETUNE** of the stack | 0..127 (127: ±50 cents at the stack's edges; FUNC: by 8) |
| **E** SPRD | **SPREAD**: the stack across the stereo field | 0..127 (needs the voice on OUT [PRE / POST](/sidecar-expander/using/stereo-out/); FUNC: by 8) |
| **F** GRP | **GROUP** | OFF, 1..4: stored, not played yet |

- The line under the title says what the config resolves to now: `4 NOTES 4 INST 2.92%` (notes, instances, their share of a core), with `CUT` when the budget or the machine's maximum cut it.
- 6-OP FM, MULTISAMPLE, WAVETABLE and GRANULAR allocate from their own pools: they take **VOICES** only, B..E read `-`.
- On a Sidecar track that is no poly track yet, the page says so and **YES** makes it one. On an analog track it explains that the Rytm's voice is mono.
- **NO** goes back to the Rytm's own screen.
- **Where it is stored:** in the pattern, and as the track's default in the project. A track plays its pattern's config, else its default (the last one set on it), so a track keeps its voicing across patterns, and a pattern may still differ.
- The same config is on the touchscreen's SEQ page (the **POLY** tool), the web page (**Sound > Poly tracks**) and the console (`seq=poly:T:voices=4,alloc=rotate,unison=2,detune=30,spread=64`).

![POLY CONFIG on the Rytm: 3 NOTES 6 INST 4.38%, VOICES 3, ROTATE, UNISON 2, DETUNE 5, SPREAD 8, GROUP 1: STORED ONLY](../../../assets/rytm/sc-poly-config.png)
![POLY CONFIG on a Sidecar track that is no poly track yet: PLAITS: NOT A POLY TRACK, YES: MAKE IT A POLY TRACK](../../../assets/rytm/sc-poly-new.png)
![POLY CONFIG on 6-OP FM: 6 NOTES 6 INST, VOICES only (FM: VOICES ONLY)](../../../assets/rytm/sc-poly-fm.png)
![POLY CONFIG on an analog track: RS PLAYS ANALOG: THE RYTM'S VOICE IS MONO](../../../assets/rytm/sc-poly-analog.png)
![The touchscreen's SEQ page with the POLY tool: VOICES AUTO..8, ALLOCATION REASGN / ROTATE / RESET, UNISON, and the line POLY T9: FM 4 INST 4 NOTES 4.88%](../../../assets/touch/oled-seq-poly.png)

<span class="sc-test">in testing</span> (emulator, `rui1048`)

## Seeded randomness

Every random choice the sequencer makes (today: a step's probability) comes from one **seed**, so it can repeat exactly.

- **Per pattern:** **FREE** (the default: a new seed at each PLAY, kept through pauses and pattern changes) or a **fixed seed** 0..9999, saved with the pattern. With a fixed seed a 50 % step makes the same choices on every PLAY, after an edit and after a reload.
- **Per track:** a track may have a seed of its own, and may make the same choices on every loop.
- Set it on the console for now: `seq=seed:free`, `seq=seed:41`, `seq=tseed:T:N|follow`. A page for it on the Rytm comes with the rest of the sequencer (below).

<span class="sc-test">in testing</span> (Mac)

## Entering notes

In seq mode (a poly track selected, GRID REC on):

- **Tap a trig key**: the step on or off, with the last chord or note you played.
- **Hold a trig + play pads** (or keys on a MIDI keyboard on the Sidecar): those notes become the step's notes; several at once make a chord. The pads play notes in the Rytm's **CHRO** mode; in the normal pad mode they play the tracks as on the stock Rytm.
- **Hold a trig + turn A..H**: NOTE, VEL, LEN, MICRO, CHD, INV, STRUM, SEL. Turning on an empty step starts it at C3 (the track's default note).
- **Chords**: CHD picks a chord on the step's note (OFF MAJ MIN SUS2 SUS4 7 MAJ7 MIN7 DIM AUG 6 MIN6 9 ADD9 MIN9 5), INV an inversion (0..3), STRUM spreads the notes in time.
- **Live recording**: RECORD + PLAY and play the pads or a keyboard. The Sidecar records the notes on its own grid, at the nearest step with the micro offset kept (QNT OFF) or snapped to 1/16 (QNT 1/16), with the length from the note-off. Overdub adds notes. The Rytm writes nothing on a poly track.
- **The touchscreen** has a piano roll for the same steps: draw, move and resize notes, stamp chords, strum, humanise and swing. See [The touchscreen](/sidecar-expander/using/touchscreen/#seq-the-piano-roll).

![The SEQ page with a step held: a keyboard with the step's notes and its eight values](../../../assets/rytm/sc-seq-held.png)

### Step preview

Hold one or more trigs and press **YES**: the held steps play on the track's voice, the whole chord with each note's velocity, length and micro timing, and the first held step's p-locks. Works stopped or playing; nothing is recorded or toggled.

## The TRIG view and trig conditions

On a poly track, **TRIG** opens the SEQ page; with the page open, TRIG switches between the notes and the **TRIG view**, like the Rytm's own TRIG page beside the grid.

- **With trigs held:** NOTE VEL LEN MICRO / **COND** STRUM CHD INV of the first held step. Turning a knob edits every held step (FUNC: coarse).
- **With nothing held:** the track's defaults for new steps (NOTE VEL LEN) and **SWING** (50..80).

**COND** is one knob, as on the Rytm:

| Value | Plays the step |
|---|---|
| `---` | always |
| FILL / !FILL | while FILL is held / not held |
| PRE / !PRE | when this track's last condition was true / false |
| NEI / !NEI | when the track before's last condition was true / false |
| 1ST / !1ST | on the first loop since PLAY or a pattern change / on every loop but the first |
| 1:2, 2:2, 1:3 .. 8:8 | on loop A of every B, counted per track from PLAY or a pattern change |
| 1% .. 99% | with that probability |

Conditions are saved with the step and carried by copy, paste and undo. The touchscreen's piano roll marks them on its ruler.

![The SEQ page with a step held: N C4, V96, L6.00, M+0 over MIN, INV1, S+22 (strum, selected), ALL 3, and BD S1 STRUM in the bottom bar](../../../assets/rytm/sc-trig-notes.png)
![The TRIG view with a step held: NOTE VEL LEN MICRO / COND STRUM CHD INV as dials, COND selected, STEP COND:1:2](../../../assets/rytm/sc-trig-cond.png)

<small>Renders of the Rytm-screen pages: the Sidecar's own page code on the host, with made-up data.</small>

## P-locks on poly steps

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
- Letting go of the trigs goes back to the view you were on.

FLTR, AMP and LFO under a held trig show a page explaining that the analog side and the Sidecar's LFOs are not locked per step.

![LOCK SRC on a 6-OP FM track: the locked knobs framed, the step and value in the bottom bar](../../../assets/rytm/sc-seq-lock-src.png)
![LOCK INS: the insert chain's knobs](../../../assets/rytm/sc-seq-lock-ins.png)

Where locks show: the trig LEDs (a step with locks magenta, a lock trig dim magenta), the SEQ page (a tick over the step per lock, a lock trig as a hollow box) and the touchscreen's lock lane.

## Pages, length and SCALE

- A poly track has up to **8 pages of 16 steps** (128 steps).
- **PAGE**: the next page. **PAGE held**: the trig LEDs show a page map (pages in the pattern dim, the page you edit bright, the playing page white), and the footer names the LED colours; a trig key while PAGE is held jumps to that page. The 4 PAGE LEDs show the position within the group of 4.
- **SCALE**: FUNC + PAGE opens the Rytm's own SCALE menu, also over the SEQ page. A poly track follows a length you set there. NO (or FUNC + PAGE again) brings the SEQ page back.
- On the SEQ page with no trig held: **A** the track, **B** the poly track on, **C** the length, **D** record quantise (QNT), **E** follow, **F** the latency (set by hand; it is measured automatically otherwise).

## Copy, paste, clear, undo

The Rytm's own gestures act on the Sidecar's steps too, with one undo per level as on the Rytm:

| Gesture | Acts on |
|---|---|
| FUNC + RECORD / STOP / PLAY (outside GRID REC) | the pattern: copy / paste / clear |
| GRID REC, FUNC + RECORD / STOP / PLAY | the track: copy / paste / clear |
| GRID REC, PAGE held + FUNC + RECORD / STOP / PLAY | the page: copy / paste / clear |
| GRID REC, trigs held + **UP** + RECORD / STOP / PLAY | the held steps: copy / paste onto them (a shorter clipboard repeats) / clear |
| The same paste or clear again | undo |

Held-step copy is one-handed: hold the trigs first, then UP, then RECORD, STOP or PLAY (UP first and then a trig would be a page request). On a poly track UP is taken at once while a trig is held; on a normal track UP + RECORD / STOP / PLAY stays the Rytm's own.

Paste on another pattern: select it (BANK + trig), then paste, as on the Rytm. Pattern and track copy / paste with poly tracks: <span class="sc-ok">hardware</span>.

## Saving and reloading

The Rytm's **SAVE PATTERN** and **RELOAD PATTERN** (the PATTERN menu, FUNC + SCNE) and **SAVE TRACK** / **RELOAD TRACK** (the TRACK menu, FUNC + CHRO) act on the poly tracks too:

- SAVE keeps the working steps as the pattern's saved state (`pNNN.sqs`).
- RELOAD brings the saved state back, keeping the working copy first (`pNNN.prv`). A pattern the Sidecar never saw saved keeps its steps.

**Pattern files from 0.3 on.** A pattern that uses a new feature (a fixed seed, a track's own seed, a poly config) is saved in a newer format (`.sqp` version 4) and needs a 0.3 or later Sidecar; every other pattern is saved as before and still plays on an older Sidecar.

**A pattern file that does not load is locked.** A file from a newer Sidecar, or a damaged one, is never written over: edits stay in memory and the footer says `A05 FROM NEWER SIDECAR: LOCKED` or `A05 FILE DAMAGED: LOCKED`.

## The touchscreen from the Rytm

Hold **UP** and press a trig key to switch the touchscreen's page (no trig is placed); hold UP alone to see the map. See [Key combinations](/sidecar-expander/using/key-combinations/).

| Keys | Page |
|---|---|
| UP + T1 | HOME |
| UP + T2 | SEQ (the piano roll) |
| UP + T3 | PAT (the Rytm's own pattern) |
| UP + T4 | VOICE (the selected track) |
| UP + T5 | SET (settings) |
| UP + T6 | INSERT FX |
| UP + T7 | SAMPLE on the Rytm's screen (again: AUTO) |
| UP + T8 | REC |
| UP + T9 | SCOPE |
| UP + T10 | SIDECAR STATUS |
| UP + T11 | SONG |
| UP + T12 | PROJECT |
| UP + T13 | POOL |

T8..T13 open on the touchscreen when it has the page, else on the Rytm's screen. SEQ, VOICE and the machine view follow the track you select on the Rytm.

## What the screens show

**The Rytm** (the SEQ page): SIDECAR SEQ and the track, the pattern, the page (`PG1/4`), the length and the transport; a step strip with the page's steps; a piano roll of the page. With a trig held: a keyboard with the step's notes, a timing lane, and the eight values. The playhead on the page moves at most 4 times a second; the trig LEDs show every step.

![The SEQ page playing: A01 PG1/4 64, the step strip and the page's notes, TAP:STEP HOLD+PADS:NOTES](../../../assets/rytm/sc-seq-roll.png)
![The SEQ page with lock ticks over the steps and a lock trig as a hollow box](../../../assets/rytm/sc-seq-locks.png)

**The trig LEDs** in seq mode: a note blue, a chord cyan, the playing step white, held steps amber, steps with locks magenta, steps past the length dark.

**The touchscreen** (SEQ): the piano roll of the same track, the velocity lane, the lock lane, the page strip and the tools. While the Rytm plays the roll opens in **VIEW**: tap DRAW to edit.

![The touchscreen's SEQ piano roll in the OLED theme](../../../assets/touch/oled-seq-roll.png)

<small>Screenshots: rendered off-device by the Sidecar's own page code, with made-up data.</small>

## The song recorder

The [song recorder](/sidecar-expander/using/song-recorder/) records the Rytm's pattern changes, mutes and knobs. A poly track's notes are not events in the take: they are in the pattern's file on the Sidecar, so when the take (or its replay) changes pattern, the poly track plays that pattern's steps.

## Key combos

| Keys | Where | Does |
|---|---|---|
| UP + TRIG | any track | the SEQ page; on a track that is no poly track the make prompt (or why not) |
| YES / NO | make prompt | make the poly track / back |
| UP + TRIG or NO | SEQ page | leave |
| YES (no trig held) | SEQ page | the poly track's menu |
| RECORD | poly track selected | GRID REC = seq mode |
| TRIG | poly track | the SEQ page / the TRIG view |
| trig tap | seq mode | step on / off |
| trig held + pads / keys | seq mode | the step's notes |
| trig held + A..H | seq mode | NOTE VEL LEN MICRO CHD INV STRUM SEL (TRIG view: COND) |
| trig held + YES | seq mode or SEQ page | step preview |
| trig held + SRC / SMPL / FX / FX FX | seq mode | lock pages: P1..P8 / P9..P16 / send FX / inserts |
| lock page: turn / NO / push | trig held | lock / clear all / clear that knob |
| trig held + UP + RECORD / STOP / PLAY | seq mode | copy / paste / clear the held steps (one hand) |
| PAGE / PAGE held / PAGE + trig | seq mode | next page / page map / jump to page |
| FUNC + PAGE | seq mode, also over the page | SCALE |
| RECORD + PLAY | poly track | live record on the Sidecar's grid |
| FUNC + CHRO, POLY CONFIG, YES | a track | the track's [POLY CONFIG](#poly-config) |
| UP + T1..T13 | anywhere | the pages (above) |

:::note[Older forms]
TRK + TRIG and trig held + FUNC + RECORD / STOP / PLAY, from the earlier 0.3 test builds, still work.
:::

## Features

- Poly tracks on every Sidecar machine, up to 4 poly tracks at once, each with its POLY CONFIG (VOICES, ALLOCATION, UNISON, DETUNE, SPREAD).
- Probability from a seed: FREE, or fixed per pattern and per track.
- Up to 8 notes per step, each with its own velocity, length and micro timing (1/96 of a step).
- Chords by CHD, INV and STRUM, or played on the pads; chord stamp, strum, humanise and swing on the touchscreen.
- Trig conditions (FILL, PRE, NEI, 1ST, A:B) and probability per step.
- Up to 8 pages of 16 steps per track, with a page map on the trig LEDs.
- P-locks on the Sidecar machine's 16 parameters, the send FX and the inserts; lock trigs.
- Step preview (trig held + YES), live recording with quantise off or 1/16.
- Follows PLAY, pause, STOP, tempo, pattern changes (queued, chained, jumps), mutes and SCALE lengths.
- Copy, paste, clear and undo of patterns, tracks, pages and held steps through the Rytm's own gestures; SAVE and RELOAD of patterns and tracks.
- Notes rendered ahead by the measured round trip, so they line up with the Rytm's own trigs.
- The SEQ page on the Rytm and a piano roll on the touchscreen, both following the selected track.

## Limitations

- **Sidecar (Pi) only.**
- **Analog tracks are not polyphonic.** A poly track must play a Sidecar machine. FREEZE (below) is planned for analog sounds.
- **Voices** are capped by VOICES (at most 8) and the shared instance pool (32); a note past the cap steals one (the same pitch, then the quietest released tail, then the oldest).
- DSP SAMPLE (and GRAIN) play one note at a time.
- On 6-OP FM, MULTISAMPLE, WAVETABLE and GRANULAR, ALLOCATION and UNISON do not apply (VOICES only).
- **GROUP** is stored, not played: tracks pooled into one instrument come later.
- SPREAD needs the voice on OUT PRE or POST; on TRK the track is mono.
- **Shared voices.** RS/CP, MT/HT, CH/OH and CY/CB share one voice; a poly track is best on BD, SD, BT or LT.
- **No analog p-locks on poly steps**: FLTR, AMP and the Rytm's own FX are not locked per step, and the Sidecar's LFOs are not locked per step.
- **No retrigs.** A FILL latched on the Rytm is not seen (only FILL held).
- A condition is decided when its step is planned (about 32 ms ahead); an edit just then can decide a PRE or A:B step again.
- Poly tracks use the Sidecar's own swing, set per track.
- The first steps after PLAY are late by the round trip (PLAY cannot be predicted); after that, and across pattern changes, notes are rendered ahead.
- Steps live on the Sidecar's card. A stock OS, a SysEx or Transfer backup, or a project shared without the card's files does not carry them: use a [bundle](/sidecar-expander/using/projects-bundles/).
- The files are keyed by the project's name. After a rename or SAVE PROJECT AS on the Rytm the Sidecar [asks whether to move them](/sidecar-expander/using/projects-bundles/#renamed-on-the-rytm).
- The SEQ page's playhead moves at most 4 times a second, to keep the Rytm's UI responsive.
- First hardware use on a Pi 4. Nothing is confirmed on a Pi 5 yet.

## Coming in 0.3

<span class="sc-plan">in progress</span> Not in the test builds yet. The rest of the sequencer's top 8, in build order, and FREEZE:

1. **Speed ratios per track** (3/4, 2/3, 5/4 ...), for polyrhythms beyond the Rytm's own scale.
2. **Play direction per track:** forward, reverse, pendulum, ping-pong, random, brownian.
3. **Scale and key per pattern**, with scale-aware edits; live transpose after it.
4. **Seeded random notes in a scale**, with a **modulatable SEED** (from the Sidecar's LFOs, and from the Rytm's scenes and PERF).
5. **Conditions and probability per lock**, not only per step.
6. **Chord-aware ratchets and a per-step arpeggiator.**
7. **Parameter slides** between locks.
8. **A tracker-style FX column** per step, with random and bounded jumps.

**FREEZE** turns an analog track into a poly track: the auto-sampler samples the track's current sound over a range of notes, **2 round robins per note**, writes a multisample, and the track becomes a MULTISAMPLE poly track with it. The kit's analog sound stays as it was, so the track can go back. A quick way to play an analog sound polyphonically, not a replacement: locks and LFOs on the analog sound's own parameters are baked in.

See the [roadmap](/sidecar-expander/roadmap/).
