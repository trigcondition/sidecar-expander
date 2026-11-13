---
title: LIVE IN machine
description: "Play the Rytm's AUDIO IN (a guitar, a synth, a mic) through a Sidecar voice: its insert FX (amp captures, drive, EQ), the send FX and the OUT route, gated by the Rytm's trigs or open all the time."
sidebar:
  order: 3.12
---

<span class="sc-ok">hardware</span> (Pi 4)

The **LIVE IN** machine plays the Rytm's **AUDIO IN** through a Sidecar voice instead of making a sound of its own. Plug a guitar (through a DI), a synth or a mic preamp into the Rytm's AUDIO IN. You can then run it through:

- the voice's two [insert FX](/sidecar-expander/using/insert-fx/), such as an AMP with a NAM capture, DRIVE, EQ or COMP;
- the [send FX](/sidecar-expander/using/send-effects/), such as SPACE or the tape echo;
- the voice's [OUT route](/sidecar-expander/using/stereo-out/).

It plays all the time as an effects lane, or opens on the track's trigs like an Octatrack thru machine.

It works on the Pi 4 and the Pi 5. The Sidecar Mini has no insert FX and no LIVE IN.

## Choosing it

Choose **LIVE IN** in a track's machine list (machine 48, after GRANULAR). It is mono: one voice, no poly. With the default MON ALW, it sounds as soon as it is chosen; no trig is needed.

From the console or the web page's console, `livein=voice:V` makes voice V (0..7) play LIVE IN whatever machine its track has, and `livein=voice:V:off` undoes it. You only need this on a Rytm firmware without LIVE IN in the list.

## The knobs

| Page | A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|---|
| SRC | INPT | GAIN | GATE | HOLD | MON | ATK | DEC | SUS |
| SMPL | REL | | | | | | | |

- **INPT**, the input: **L** or **R** (AUDIO IN L or R), **L+R** (their mono sum), or **STR** (the stereo pair). STR keeps L and R apart on a PRE or POST route; on TRK it plays the mono sum.
- **GAIN:** -24 to +24 dB; 64 is 0 dB. Sets the level into the gate and the insert FX.
- **GATE**, a noise gate after GAIN: 0 is OFF, 1..127 set the threshold from -80 to -20 dBFS. It closes 3 dB under the threshold.
- **HOLD:** how long the gate stays open after the input falls under the threshold, 0 to 1 s.
- **MON**, the monitor mode:
  - **ALW** passes the input all the time.
  - **TRIG** opens an envelope on each trig, for rhythmic gating.
- **ATK, DEC, SUS, REL:** TRIG's envelope.
  - **ATK:** 0.5 ms to 2 s.
  - **DEC:** 5 ms to 5 s.
  - **SUS:** 0..127. SUS 0 is a one-shot (ATK then DEC), which suits the Rytm's trigs; no note-off is needed.
  - **REL** (on the SMPL page): 5 ms to 5 s after the note-off.

In TRIG mode the envelope opens on the track's Rytm trigs, the Sidecar sequencer's notes and the pads bound to the voice. Velocity and pitch are not used. The output level is set by the route: the Rytm's AMP and VOL on TRK, OUT LEV on PRE or POST, and the insert AMP's LEV.

## TRK, PRE and POST

- **On TRK** (the default) the input goes through the Rytm's track: its filter, overdrive, AMP envelope and sends. The Rytm only lets a voice through while its AMP envelope is open. So on TRK the track's own AMP page already gates the input at each trig. For a continuous effects lane on TRK, hold the AMP open (a long hold on a trig).
- **On PRE or POST** there is no Rytm AMP in the way. MON ALW is a continuous lane, and MON TRIG is the gate. The insert FX run in stereo here. STR keeps L and R apart, except through an AMP: the AMP plays mono and puts its output in the centre.

## Latency

From the AUDIO IN jack to the Rytm's outputs, LIVE IN adds the USB round trip. That is about **8 ms** in total on a Pi on USB. <span class="sc-test">estimated</span>

To measure your own setup:

1. Patch the Rytm's MAIN OUT L (or the headphones' L) into its AUDIO IN L, with the main volume around 9 o'clock.
2. Put the voice on LIVE IN with its route on **POST**, GAIN at 0 dB and the gate OFF, with nothing else playing.
3. Type `livein=measure:V` in the console. The voice mutes for about 3 s while five clicks go round the loop.
4. Type `livein` to read the result.
5. **Remove the cable** before you play.

## Feedback guard

If the voice's output gets back into AUDIO IN, the loop can howl. This happens with the outputs patched back into the input, a mixer's aux loop, or an Overbridge routing that loops. LIVE IN protects you in two ways:

- **A limiter** after the insert FX keeps the voice under -1 dBFS.
- **A feedback check:** when the input keeps rising while the voice plays, the voice dips briefly to test for a loop. If the input dips with it, the voice is muted for 2 s, and the log and STATUS say so.

Even so, don't monitor the Rytm's outputs into its own AUDIO IN. The start of a howl is loud.

## STATUS and the console

The touchscreen's STATUS page shows a LIVE IN voice as:

- **LIVE -18DB:** the input's peak after GAIN;
- **LIVE GATED:** the gate is shut;
- **LIVE NO IN:** no audio from the Rytm (it isn't streaming);
- **LIVE MUTED:** the feedback guard muted it.

`livein` in the console shows the inputs, each LIVE IN voice's level, its gate and knobs, and the latency.

## Good to know

- **The Rytm's SRC page** on its own screen shows the LIVE IN labels with the Rytm firmware that has LIVE IN in the list. With the `livein=voice:V` override, it shows the track's own machine's labels instead; the knob positions are the same.
- **CPU:** LIVE IN itself costs well under 1 % of a Pi core. An AMP insert costs about 1.5 %.
- **Granular on the live input:** GRANULAR can use AUDIO IN (the IN row of the SAMPLES pool) as its source. See [Poly machines](/sidecar-expander/using/poly-machines/#granular).
