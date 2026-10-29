---
title: LFOs
description: "The Sidecar's own LFOs on the voices, the send effects and, in 0.3, the insert chains and the OUT route's level, pan and width; the LFO page on the Rytm (UP + LFO) and the DESIGN wave."
sidebar:
  order: 3
---

<span class="sc-test">in testing</span> (new in 0.1.0; saved per kit in `/.rytm/lfo/<project>/kNNN.txt` on the Sidecar's card)

The Sidecar has its own LFOs: **8**. Each one modulates one parameter of a Sidecar voice or effect, on top of the value the Rytm sets (its knob or a p-lock). They are global, not tied to a track, and are **saved per kit**, like the Rytm's own LFOs. Since 0.3.0 they follow the Rytm's kit **SAVE** and **RELOAD** (YES + KIT / NO + KIT, or the KIT menu), the way poly patterns follow pattern SAVE and RELOAD: change an LFO, reload the kit, and the saved LFO comes back ([Saving and reloading](/sidecar-expander/using/key-combinations/#saving-and-reloading-the-rytms-own-keys)).

## Targets

| Target | What moves |
|---|---|
| **V1..V8** | a Sidecar voice's parameters (the engine's voices: V1 BD, V2 BT, V3 SD, V4 LT, V5 CH/OH, V6 MT/HT, V7 CY/CB, V8 RS/CP), by the machine's own names (HRM, CUT, STA, ...), user machines too |
| **FX1, FX2** | the send effect's P2..P5, by the effect's labels (HALO's DCY, CHORUS's DPTH, ...) |
| **I1..I8** (0.3) | a voice's [insert chain](/sidecar-expander/using/insert-fx/): INSERT A P1..P4 and INSERT B P1..P4, by the effect's labels |
| **B1..B3** (0.3) | an FX bus's insert chain, the same eight parameters |
| **O1..O8** (0.3) | a voice's [OUT route](/sidecar-expander/using/stereo-out/): LEV, PAN, WID |

:::caution[New in 0.3]
The I, B and O targets need Sidecar 0.3.0 (Sidecar (Pi) only). On an insert or the OUT route an LFO is an offset on top of the knob or the step lock. <span class="sc-test">in testing</span>
:::

Two LFOs on one parameter add up. Selectors that are read only at a trig (6-OP FM's PAT, DSP SAMPLE's SMP) do not follow an LFO. On a [poly track](/sidecar-expander/using/sequencer/#p-locks-on-poly-steps), an LFO on a locked parameter moves around the lock. The LFOs never change the Rytm's own sound parameters, so a kit you save is never altered by a running LFO.

## Waves, rate, retrig, depth

- **Waves:** SINE, TRI, SAW+, SAW-, SQR, S&H, RND (smooth random) and **DESIGN**: 16 steps you draw, each a value and a shape: HOLD (the value until the next step), RAMP (a line to the next step) or SMTH (an S-curve to it). Presets: RAMP, TRI, STEPS, RND.
- **Rate:** free (0.02 to 20 Hz), or synced to the Rytm's clock, from 1/32 to 8 bars, with triplets and dotted values. Synced LFOs follow the song position while the Rytm plays.
- **Retrig:** FREE, TRIG (the target's trig) or PLAY (the Rytm's start).
- **Depth:** -64 to +63 steps around the Rytm's value; negative inverts the wave.

## The LFO page on the Rytm

Hold **UP** and press **LFO** to open the remote pages straight on the LFO page, or pick LFO in the SIDECAR MENU (UP + YES, then YES). TRK + LFO, the older form, still works; with the 0.2.0 release's `rui1027d` it is the only one.

- **The page replaces the Rytm's page** like SRC: no page dots and no siblings. **LEFT / RIGHT** step to the previous / next LFO (the same as knob A; in the design view they step the design step). Leave with **NO** (from the design view, NO goes to the main view first) or **UP + LFO** again; leaving drops the design view.
- **Main view:** the wave over one cycle with a dot at the phase. A **LFO** (which one), B **TGT** (OFF, V1..V8, FX1, FX2, and in 0.3 I1..I8, B1..B3, O1..O8), C **PAR** (by name), D **DEP**, E **WAVE**, F **RATE** (FUNC: steps of 8), G **SYNC** (FREE / CLK), H **TRIG** (FREE / TRIG / PLAY).
- **YES** opens the **design view**: the 16 steps with the playhead. The trig keys **T1..T16** pick a step, B sets its value, C its shape, D applies a preset. YES or NO goes back.

![The LFO page: LFO 1 on voice 3's TIM, a sine synced to 1/8, retrig on the trig](../../../assets/rytm/remote-lfo.png)
![The LFO design view: 16 steps with HOLD, RAMP and SMTH shapes, step 7 selected](../../../assets/rytm/remote-lfo-design.png)

<small>Screenshots: the emulator with the Sidecar's host code (mock values).</small>

## On the web page and the console

The web page has an **LFO** tab with the same settings per LFO: target, parameter, wave, rate, sync, retrig, depth, and the design steps. In 0.3.0 its target list has the I, B and O targets too.

![The Pi page's LFO tab: LFO 1 on V3, LFO 2 on FX1 with a DESIGN wave, the design grid with HOLD / RAMP / SMTH and the presets](../../../assets/ui/pi-lfo.png)

<small>Screenshot: the 0.1.0 web page with mock data.</small>

The console's `lfo` prints a summary; `lfo=N:KEY:VALUE` sets one LFO (for example `lfo=1:tgt:v3`, `lfo=1:dep:20`, `lfo=1:pre:tri`).
