---
title: MORPH (scenes)
description: "The MORPH page on the Rytm (UP + T14): twelve scenes of locked parameter values, two of them on the ends of a fader, how to pick A and B, edit a scene's locks and what the keys do."
sidebar:
  order: 3.23
---

<span class="sc-test">in testing</span> New in 0.5.0 (Sidecar on the Pi 4 and Pi 5). The page opens with **UP + T14** when the Rytm runs the Rytm firmware 0.5.0.

A **scene** is a list of parameters, each locked at a value. There are **12 scenes** for each kit, with up to 64 locks each. Two of them are the ends of a **fader**: scene **A** at the left, scene **B** at the right. Move the fader and the locked parameters glide from A's values to B's, like the crossfader of an Octatrack.

| The parameter is locked in | The fader moves it |
|---|---|
| A and B | from A's value to B's value |
| A only | from A's value to the parameter's own value (its knob, its p-lock) |
| B only | from the parameter's own value to B's value |

A list parameter (an engine, a filter type) cannot glide: it takes one side whole and switches half way along the fader. The morph never writes the kit or the pattern: save a kit in the middle of a morph and it keeps the knobs, not the morph. A parameter you turn yourself while the morph holds it stays where you put it until the fader moves again.

## Opening it

- **UP + T14** opens the MORPH page on the Rytm's screen. It **replaces the Rytm's page** like the SRC view does. Leave with **NO**.
- The **SIDECAR MENU** (UP + YES, then YES) has a MORPH row too. Use it on a Rytm without the 0.5.0 firmware: there UP + T14 stays the Rytm's own key.
- On the touchscreen, **Settings > Send FX** has a **Morph** key beside XY.
- **UP + T15** and **UP + T16** are not Sidecar keys. They stay the Rytm's own. Inside the page, **T15** and **T16** pick A and B (below).
- On a Sidecar from before 0.5.0, with the 0.5.0 Rytm firmware, UP + T14 does nothing.

## The page

The top row is the 12 scenes: the selected one is inverted, and a dot under a scene means it has locks. Below it the fader is a bar, with A's scene on its left and B's on its right (`A3`, `B7`; `A-` when none is set). The four values under it are **FADER** (in percent), **LOCKS** (the selected scene's count), **SCN** and **PERF**.

| Control | Does |
|---|---|
| knob **A** | the fader. **FUNC** for fine steps |
| knob **G** (SCN) | links the selected scene to one of the Rytm's own scenes, OFF or 1..12 |
| knob **H** (PERF) | links the selected scene to one of the Rytm's PERF macros, OFF or 1..12 |
| **T1..T12** | select that scene |
| **T15** held + a scene key | that scene becomes **A** (the fader stays where it is) |
| **T16** held + a scene key | that scene becomes **B** |
| **LEFT / RIGHT** | the scene before / after |
| **FUNC + YES** | EDIT on or off (below) |
| **NO** | leave |

The trig LEDs show the scenes: A blue, B orange, the selected one white, a scene with locks dim white. T15 and T16 carry the A and B colours. T13 and T14 do nothing on this page.

The **Rytm's QUICK PERF knob** also moves the fader (with the Rytm firmware 0.5.0): its left end is scene A.

### A scene's lock list

**Hold a scene key** (T1..T12) for a moment, or turn a knob while holding it: the page shows that scene's locks, seven rows at a time, each as the parameter's name and value (`V1:HRM 64`).

| Control | Does |
|---|---|
| knobs **B..H** | change the value of the row beside them (**FUNC**: bigger steps) |
| **LEFT / RIGHT** | scroll the list |
| **NO** | removes the first row (B's) |
| **YES** | asks `CLEAR S3? YES AGAIN`. YES again clears the whole scene, NO backs out |

A 65th lock in a scene is refused with `SCENE FULL`.

### Locking parameters: EDIT

Press **FUNC + YES** on the MORPH page to switch **EDIT** on. Now on any Sidecar page (a voice's page, an INSERT or the master page), **hold a scene key and turn a knob**: the scene locks that parameter at the value you turn to, and the page shows the locked value while the key is held. With EDIT off, the trig keys on those pages work as before. The Rytm's own pages lock nothing.

## The Rytm's scenes and PERF

A scene can lock the Rytm's own scene (knob G) and one of its PERF macros (knob H). When the fader crosses half way, the Sidecar switches the Rytm to that scene, and a PERF macro follows the fader. The Rytm's own parameters can be morphed too: see [The Rytm's own parameters](/sidecar-expander/using/rytm-params/).

## Saved with the kit

Scenes are saved **per kit** in `/.rytm/scene/<project>/kNNN.txt` on the Sidecar's card, a second after your last edit. A kit with no file of its own uses the project's. A file that a newer Sidecar wrote and this one cannot fully read is loaded as far as it can be and then **left alone**: the page's header says `LOCKED`.
