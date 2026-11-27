---
title: MORPH (scenes)
description: "New in 0.5.2. Scenes A and B and the fader that morphs between them: twelve scenes of locked parameter values per kit, the MORPH page (UP + T14), scene edit on the Rytm's own pages with PAGE + T15 / T16, the knob press that removes a lock, the sources of the fader and what cannot be locked."
sidebar:
  order: 3.23
---

New in 0.5.2 (Sidecar on the Pi 4 and Pi 5). MORPH was switched off in 0.5.0 and 0.5.1; it is on in 0.5.2. A project that used the Sidecar's morph in 0.5.0 keeps its scenes: they were never deleted (`/.rytm/scene/` on the card) and work again. **The Rytm side needs the Rytm firmware 0.5.2** (OS 1.74): scene edit on the Rytm's own pages and the knob press are in its two files ([Patch and flash](/sidecar-expander/getting-started/patch-and-flash/)).

A **scene** is a list of parameters, each locked at a value. There are **12 scenes** for each kit, with up to 64 locks each. Two of them are the ends of a **fader**: scene **A** at the left, scene **B** at the right. Move the fader and the locked parameters glide from A's values to B's.

| The parameter is locked in | The fader moves it |
|---|---|
| A and B | from A's value to B's value |
| A only | from A's value to the parameter's own value (its knob, its p-lock) |
| B only | from the parameter's own value to B's value |

A list parameter (an engine, a filter type) cannot glide: it takes one side whole and switches half way along the fader. The morph never writes the kit or the pattern: save a kit in the middle of a morph and it keeps the knobs, not the morph. A parameter you turn yourself while the morph holds it stays where you put it until the fader moves again.

## Where to move the fader

Whichever source moved last has the fader. The page's header names it (KNOB, MIDI, PAGE, TCH, WEB).

- **The MORPH page** on the Rytm (knob A), the touchscreen and the web page.
- **The Rytm's QUICK PERF knob:** its left end is scene A. By default it moves the fader only while the PERF macros are muted (FUNC + QPER); the MIDI page's **QPERF FADER** row sets MUTED ONLY, OFF or ALWAYS.
- **A MIDI controller**, learned on the MIDI page: see below.
- **The XY pad and an LFO:** MORPH is one of their targets (the fader, set to its position before the touch plus the pad's move).

### Learn rows on the MIDI page

The MIDI page (SIDECAR MENU > MIDI) has three rows for a controller: **LEARN FADER**, **LEARN SCENE A** and **LEARN SCENE B**. Press **YES** on a row, then move the control: the next CC the Sidecar hears (from the Rytm's MIDI or a USB-A device, for example a crossfader) drives the fader, or picks scene A or B. Learning again replaces the route. YES or NO while it waits stops it.

## Opening the page

- **UP + T14** opens the MORPH page on the Rytm's screen. It **replaces the Rytm's page** like the SRC view does. Leave with **NO**. The SIDECAR MENU has a MORPH row too.
- On the touchscreen, **Settings > Send FX > Morph**. On the web page, the **Morph** tab.
- **T15** and **T16** are the Rytm's own keys everywhere except on this page and under PAGE (below).

## The page

The top row is the 12 scenes: the selected one is inverted, and a dot under a scene means it has locks. Below it the fader is a bar, with A's scene on its left and B's on its right (A and B are framed in the row; the bar is hollow while one of them is not set). The values under it are **FADER** (in percent) and **LOCKS** (the selected scene's count). A tick under the bar shows where the QUICK PERF knob is when the fader is elsewhere.

| Control | Does |
|---|---|
| knob **A** | the fader. **FUNC** for fine steps |
| **T1..T12** | select that scene |
| **T15** held + a scene key | that scene becomes **A** (the fader stays where it is) |
| **T16** held + a scene key | that scene becomes **B** |
| **LEFT / RIGHT** | the scene before / after |
| **NO** | leave |

The trig LEDs show the scenes: A blue, B orange, the selected one white, a scene with locks dim white. T15 and T16 carry the A and B colours. A kit change shows `KIT n LOADED` (or `KIT n: NO SCENES`) in the header for 2 seconds.

### A scene's lock list

**Hold a scene key** (T1..T12) for a moment, or turn a knob while holding it: the page shows that scene's locks, seven rows at a time, each as the parameter's name and value (`V1:HRM 64`). A lock whose parameter is gone (a machine that does not have it) shows its name with `?`.

| Control | Does |
|---|---|
| knobs **B..H** | change the value of the row beside them (**FUNC**: bigger steps) |
| **LEFT / RIGHT** | scroll the list |
| **NO** | removes the first row (B's). **NO again within 2 seconds** puts it back |
| **YES** | asks `CLEAR S3? YES AGAIN`. YES again clears the whole scene, NO backs out |

The list's last row is **ADD**: scrolled to the top, knob **B** picks the track (RT1..RT12, RFX, V1..V8), **C** its page, **D** the parameter and **E** the value, and **YES** adds the lock. A 65th lock in a scene is refused with `SCENE FULL`.

## Scene edit: PAGE + T15 / T16

On any Sidecar page (a voice's page, an INSERT or the master page) and on the Rytm's own pages, **hold PAGE and then T15 for scene A, or T16 for scene B, and turn a knob**: the scene locks that parameter at the value you turn to. Every page's header says `EDIT A` or `EDIT B` while you hold it, and the footer says `SET A: T1-12`: while you hold, **T1..T12** picks the scene that side edits. Let go of T15 / T16 and the edit ends. Nothing is locked until you turn a knob. A side needs a scene first: without one the Rytm's own pages show `SET A FIRST` and the Sidecar pages' footer shows `SET A: T1-12`.

**On the Rytm's own pages, press the knob to remove the lock.** While PAGE + T15 / T16 is held, pressing a knob removes that parameter's lock from the scene. The readout says `A FRQ CLR`, or `A FRQ NONE` when the scene had no lock on it. The press does not do the Rytm's own thing (stock's trig-held knob press clears a p-lock): under a held side it is only the scene edit's.

A Send FX lock that the pattern save would drop is refused with the Rytm's own `LOCK MEM FULL!`.

### What cannot be locked

- **A Sidecar machine's source** on its SRC page: the sample, wavetable or preset knob (GRANULAR's and SAMPLER's SRC, WAVETABLE's TBL and TBL B, MULTISAMPLE and CHOP, DSP SAMPLE's SMP, the JUNO and 6-OP FM presets). A lock would sweep through the pool's rows. Under a held side these knobs show `NOT LOCKABLE`, **open no pool list**, and the knob press there removes nothing. **FUNC + YES** on the SRC view, which opens the list otherwise, does nothing under a held side, and neither does UP + SRC. The readout shows over the SRC view.
- **The Rytm's own scene and PERF macros** are not scene targets (the Rytm's own parameters are: [The Rytm's own parameters](/sidecar-expander/using/rytm-params/)).
- A parameter with no place in a scene shows `NOT LOCKABLE` and nothing is sent.

## Saved with the kit

Scenes are saved **per kit** in `/.rytm/scene/<project>/kNNN.txt` on the Sidecar's card, a second after your last edit. A kit with no file of its own uses the project's. A file that a newer Sidecar wrote and this one cannot fully read is loaded as far as it can be and then **left alone**: the page's header says `LOCKED`.

## Older Rytm firmware

- **A Pi 0.5.2 with the Rytm firmware 0.5.1.1** is built to keep working (what worked keeps working), but that pair is not tested on hardware. Scene edit on the Rytm's own pages, the knob press and the Rytm-side morph need the 0.5.2 files.
- **A Pi 0.5.1.2 or older** has no morph: the page, its scenes and its fader are hidden there.
