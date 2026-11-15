---
title: FILL (p-lock a track's trigs)
description: "FILL writes a range of values (samples, engines, presets, velocity) onto a track's trigs as p-locks, in order or at random: UP + RIGHT, the knobs, what it writes, undo, and the messages."
sidebar:
  order: 3.22
---

<span class="sc-test">in testing</span> New in 0.5.0 (Sidecar on the Pi 4 and Pi 5, with the Rytm firmware 0.5.0). The Sidecar Mini has no FILL.

**FILL** writes one target of one track (the sample, the engine, a preset or the velocity) onto that track's trigs as the Rytm's own p-locks. You give a range of values, FROM and TO, and an order: in order, backwards or at random. Use it to p-lock every trig of a track with a run of samples, as the fill functions of a tracker do.

## Opening it

- **UP + RIGHT** (hold UP, press RIGHT) opens FILL on the selected track. Press **UP + RIGHT** again, or **NO**, to close it.
- The **SIDECAR MENU** (UP + YES, then YES) has a FILL row too.
- FILL is not on the LEFT / RIGHT page ring: there LEFT / RIGHT change the target.
- **UP + LEFT** is taken for a later release. It does nothing you can use yet.

On a Rytm without the 0.5.0 firmware, UP + RIGHT stays the Rytm's own key. Open FILL from the SIDECAR MENU instead.

## The knobs

The knobs **A..H** set the values below, in this order, and the page keeps each knob's letter beside its value. The page also shows how many of the pattern's 72 lock tracks are in use (not the number of locks). The footer names what **YES** and **NO** do. Holding **FUNC** changes it to the clear and undo keys below.

| Knob | | |
|---|---|---|
| A | TARGET | the track's targets ([below](#targets)): the machine's main one first, VELOCITY last. LEFT / RIGHT change it too |
| B | FROM | the first value: a pool row, an engine, a preset or 1..127. With FUNC held: a bank, or 16 at a time |
| C | TO | the last value. Below FROM, it fills downwards |
| D | ORDER | UP, DOWN, PING, RND, SHUF, SPRD |
| E | TRIGS | ALL, EMPTY (only trigs with no value of this target yet) or LOCKED (only those with one) |
| F | EVERY | 1..16, counted over the trigs TRIGS leaves |
| G | OFFSET | 0..EVERY-1 |
| H | SEED | 0..999 for RND and SHUF. It is new each time the page opens |

- **YES** fills.
- **FUNC + YES** clears the target on those trigs: the lock is removed, and a velocity goes back to the default.
- **FUNC + NO** undoes the last fill or clear (one level).
- **NO** goes back (leaves FILL).

Defaults: the machine's main target, ORDER UP (VELOCITY: RND), TRIGS ALL and a fresh seed. Empty or OFF pool rows and empty preset rows are skipped. For SAMPLE, FROM and TO start on the rows of your last quick load (RIGHT in the sample list, or several files in one go), or else on the sample the kit plays.

Only trigs are filled. Steps without a trig, and steps past the track's length, are left alone.

## Targets

The track's machine says what it can fill.

| Machine | Target | Values |
|---|---|---|
| SAMPLER, DSP SAMPLE | SAMPLE | the SAMPLES pool's rows |
| GRANULAR, WAVETABLE, MULTISAMPLE | SOURCE, TABLE, INST | the rows of its pool list |
| MD | ENGINE, TYPE | the engines; TYPE: the types of the track's current ENGINE |
| PLAITS | ENGINE | the curated models |
| DAISYSP | ENGINE | MODAL, STRING, RESON |
| JUNO, 6-OP FM | PRESET | the project's preset rows |
| a user machine (U1..U5) | PRESET, SAMPLE, or a list knob | its presets, a pool slot 1..127, the knob's names (at most 4 targets) |
| every track | VELOCITY | 1..127 |

MD's TYPE lists the types of the engine the track plays now. A TYPE fill over trigs whose ENGINE is p-locked to other engines writes type numbers that those engines read as their own types.

## What it writes

- The values become p-locks in the **active pattern**. The Sidecar reads the pattern, changes the one target, writes it back and reads it again to check it. Everything else in the pattern stays as it was.
- **A fill is kept in the pattern the Rytm stores**, so it survives a power-off of the Rytm.
- **FILL needs to know the active pattern.** If the Rytm has not told the Sidecar yet, the page shows `PATTERN UNKNOWN` and writes nothing. FILL does not write while the pattern is changing, and a project load stops it.
- **Stop the Rytm first.** While it plays, YES answers `STOP TO FILL`.
- A pattern holds 72 lock tracks. When they are used up, FILL writes nothing (`LOCKS FULL (72)`).
- **The undo** is gone after a pattern change or a project load. It refuses (`CHANGED SINCE: NO UNDO`) when you edited the filled target since, on the Rytm or by a take. It never writes old values over newer ones. Edits to other parameters or other tracks do not matter.
- A fill made while a [SONG](/sidecar-expander/using/song-recorder/) take is armed is undone when the take restores. The SONG will not arm or undo while a fill is writing, and a fill stops (`SONG BUSY`) when the SONG starts its own transfers.

- **SONG Restore still uses the old write** until a later release. A fill that a SONG Restore removed comes back after a power-off. Save the pattern after a restore if you want the restored one kept.

## The messages

| Note | Meaning |
|---|---|
| `FILLED 8` / `CLEARED 8` | done and checked, 8 trigs written. A hint for the undo may follow |
| `NO CHANGE` / `NOTHING TO CLEAR` | the pattern already held those values |
| `NO TRIGS TO FILL` | no trig on the track within its length, through TRIGS, EVERY and OFFSET |
| `NO VALUES IN RANGE` | FROM .. TO holds only empty or OFF rows |
| `LOCKS FULL (72)` | the pattern's 72 lock tracks are used. Nothing written |
| `STOP TO FILL` | the Rytm is playing |
| `PATTERN UNKNOWN` | the Sidecar does not know the active pattern yet. Nothing read or written |
| `SONG BUSY` | the SONG is reading or writing the pattern. Nothing written |
| `PATTERN BUSY` | the pattern kept changing while it was read (3 tries). Nothing written |
| `CHANGED MEANWHILE: CHECK` | the pattern was changed or switched while the fill was writing. Nothing written back. Look at the pattern |
| `PROJECT LOADED: STOPPED` | a project was loaded since the fill started. Nothing written or written back |
| `NOT TAKEN: UNCHANGED` | the Rytm did not take the write. Nothing written back |
| `VERIFY FAILED: RESTORED` | the check differed, so the pattern as read before was written back |
| `NOT CONFIRMED: CHECK IT` | no check came back and the pattern moved meanwhile. Look at the pattern |
| `NO ANSWER` | the Rytm did not answer the pattern request (5 tries) |
| `UNDONE` | the undo is done |
| `UNDO EXPIRED (PATTERN)` / `UNDO EXPIRED (PROJECT)` | a pattern change or a project load came since the fill |
| `CHANGED SINCE: NO UNDO` | the filled target was edited since. Nothing written |

## Give UP + RIGHT back to the Rytm

On the console, `fill=keys:off` gives UP + RIGHT back to the Rytm until `fill=keys:on`. A planned restart or power-off of the Sidecar gives the keys back too.
