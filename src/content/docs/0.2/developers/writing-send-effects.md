---
slug: 0.2/developers/writing-send-effects
title: Writing send effects
description: How a built-in send effect is added to the core, and what user effects will look like.
sidebar:
  order: 5
---

Send effects are built into the core today (`core/fx/`). Loadable **user effects** (UFX1..UFX4) are designed, with their slots and tags reserved in the protocol, but no user-effect plugins exist yet. This page is about adding a built-in effect.

## The model

`fx::SendFx` (header-only, no allocation) runs both slots on one core: the Pi's render core 2 after its voices, the Teensy's USB host interrupt.

- **Input:** for each FX, the sum of the 8 voice stems times each track's send level (squared, 0..127). The paired tracks that share a voice take the louder send.
- **Output:** stereo, wet only, soft-limited, on the pair the slot's P1 names (PRE: MAIN FX, before the Rytm's analog distortion and compressor; POST: MAIN).
- **Values** arrive as bytes from the control core (`fx::Control`, host-link `0x20`), never shared with the voices.
- Each slot holds every type's state, so both slots can run any type (memory permitting).

## Adding an effect

1. **Pick a TYPE id.** Ids 1..63 are built-ins and are stable forever: a kit stores the id. Take a reserved id that matches (the protocol lists names for planned ones) or the next free one. Never reuse an id.
2. **Write the DSP** as a struct with `Process(in, n, out, knobs, sample_rate, ...)` and `Clear()`:
   - every knob's **0 is a usable default** (a kit's 0 must mean "no change"): no "centre = none" mappings;
   - smooth every parameter (10 ms), flush denormals in every feedback path;
   - no allocation, no locks, no logging; fixed buffers sized for 48 kHz;
   - large state (delay lines, reverb tanks) only where `RYTM_SENDFX_LARGE` is set (the Pi and the Mac). The Teensy builds a small set with 16-bit delay lines.
3. **Clearing:** a TYPE change fades out 10 ms, and the old state is zeroed in pieces of at most 2 KB a frame, never in one go. If your effect has a zone that swaps the algorithm, route it through the same fade and clear.
4. **Labels:** add a `KnobLabels` table next to the effect: four 4-character labels for P2..P5, and optional zones (knob, lo, base, show, a 5-character name, step). Mark a knob that is a pure selector with `step` so the Rytm steps it one zone per detent. Mirror the table in `sim/protocol.py`; the tests compare them.
5. **Register** the type in `SendFx`'s dispatch, its clear and the built list, so the `0x21` list and the `0x24` labels include it.
6. **Test** in `core/tests/test_send_fx.cpp`: impulse and sine responses, every knob at 0, the TYPE fade, NaN and runaway handling, and the CPU per 12-frame block (the test prints a table; multiply the Mac figure by about 13 for a Pi 4 core).

## Budgets

| | Pi 4 core 2 | Teensy |
|---|---|---|
| Whole send FX | two CLOUDSEEDs are about 13 % of the core | the small set is about 4-5 % |
| Memory | about 4.8 MB of heap for all types in both slots | a few tens of KB |

## STUTTER, an insert

STUTTER (TYPE 15) shows the other shape: it ignores the sends, takes the plain sum of the stems and returns it at unity, so it acts as an insert on the whole mix once the user takes the tracks off ROUTE TO MAIN. It reads the Rytm's MIDI clock (24 ppqn, start, stop, song position) through a packed word written by the control core. Only one slot may run it.

## User effects (later)

The design mirrors user machines: per project, a slot map `/.rytm/fxslots/<project>.txt` names the effect in UFX1..UFX4, and the kit stores the effect's tag, so a kit moved to a Sidecar where the slot holds another effect shows `!NAME` instead of playing the wrong one. See the [roadmap](/sidecar-expander/0.2/roadmap/).
