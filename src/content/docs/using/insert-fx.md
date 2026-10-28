---
title: Insert FX and FX buses
description: "Two insert slots on every Sidecar voice, three FX buses, p-locks and LFOs on them."
sidebar:
  order: 2.1
---

:::caution[New in 0.3]
New in 0.3 (until 0.3.0 is released: the test line, Rytm build `rui1048` with the Sidecar's 0.3 test build), Sidecar (Pi) only. Built and tested on the Mac and in the emulator; not yet confirmed on a real Rytm.
:::

Every Sidecar voice gets an **INSERT** chain of two slots, A and B, before it goes back into the Rytm's track. Three **FX buses** take sends from the voices. <span class="sc-test">in testing</span>

## Signal flow

```
Sidecar voice -> INSERT A -> INSERT B -> OUT: TRK  the Rytm's track (analog filter, amp)
                                           PRE  the Rytm's main mix, before its master FX (stereo)
                                           POST the Rytm's main mix, after its master FX (stereo)
                                      \-> sends to bus 1, 2, 3
bus 1 = SEND FX 1 -> its chain (A, B) -> PRE or POST
bus 2 = SEND FX 2 -> its chain (A, B) -> PRE or POST
bus 3 = dry       -> its chain (A, B) -> PRE or POST (ROUTE)
```

- Buses 1 and 2 **are** the two [send effects](/sidecar-expander/using/send-effects/): their TYPE, P1..P5 and the Rytm tracks' sends are unchanged. A kit without insert settings sounds exactly as before.
- Bus 3 has no send effect of its own: a dry bus of the voices' sends through its two slots (a bus compressor, a shared filter, ...).
- A voice's sends are taken after its inserts: the bus hears the inserted voice, not the Rytm's analog processing of it.
- **The OUT route** decides where the voice goes after its inserts: its own track (**TRK**, the default) or the Rytm's main mix in stereo, before (**PRE**) or after (**POST**) the Rytm's master distortion and compressor. On PRE and POST the insert chain runs in stereo. See [Stereo and the OUT route](/sidecar-expander/using/stereo-out/).

## Effects

| TYPE | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| FILTER | CUT 20 Hz..20 kHz | RES | MODE LP > BP > HP | DRV 0..+24 dB |
| CRUSH | RATE | BITS 16..2 | DRV 0..+18 dB | MIX |
| DRIVE | DRV 0..+30 dB | SHPE saturation > fold | TONE | MIX |
| EQ | LOW shelf ±15 dB | MID bell ±15 dB | HIGH shelf ±15 dB | FREQ (the bell) 200 Hz..8 kHz |
| COMP | THR 0..-40 dB | RAT 1..20 | SPD (attack and release) | GAIN 0..+24 dB |
| DELAY | TIME 1..80 ms | FDBK | MOD | MIX |
| TREMOLO | RATE 0.1..20 Hz | DPTH | SHPE sine > square | PAN |
| RINGMOD | FREQ 10 Hz..5 kHz | SHPE sine > square | MOD | MIX |

Changing TYPE crossfades without a click and loads the effect's defaults. Parameters are smoothed, so p-lock jumps do not zipper.

## Editing

- **On the Rytm:** **UP + FX** opens the remote page **INSERT** (or INSERT FX in the SIDECAR MENU; TRK + FX, the older form, still works). The TRACK view shows the selected track's voice: a strip `[A TYPE] > [B TYPE] > [OUT]`, A..D the slot's P1..P4, E SLOT, F TYPE, G BUS, H SEND. FUNC + G picks another track. **YES**: the BUS view (A..D, E SLOT, F TYPE, G BUS 1..3, H ROUTE for bus 3); **YES** again: the OUT view (A OUT, B LEV, C PAN, D WID, E DEC); NO goes back. **UP + AMP** opens the page straight on the selected track's OUT view. **RIGHT**, from any of its views, opens the **EQ view**: a post EQ after the two slots, A HPF, B LPF, C LOW, D HIGH (LEFT or NO goes back; YES swaps between the voice's EQ and its bus's). The EQ has no p-locks.

The INSERT page **replaces the Rytm's page** like SRC: no page dots and no LEFT / RIGHT siblings. Leave with **NO**, or press **UP + FX** again; **UP + AMP** again aims the OUT view at the track now selected.
![The INSERT page's TRACK view on the Rytm: CRUSH in slot A, B empty, OUT POST; RATE BITS DRV MIX, SLOT TYPE BUS SEND; YES: BUSES, FUNC+G: TRACK](../../../assets/rytm/sc-insert-out-box.png)

<small>Render of the Rytm-screen page: the Sidecar's own page code on the host, with made-up data.</small>

- **On the touchscreen:** the **INSERT FX** page (FX, UP + T6 on the Rytm, or Settings > Send FX > Inserts): the voice's two slots as dials with their values, a key per track, the three sends, each bus's chain and return, and the **OUT** row (TRK / PRE / POST, LEV, PAN, WID). It follows the Rytm's selected track; the knobs are the Rytm's (`KNOBS ON RYTM`), the TYPE and OUT keys edit.
- **P-locks:** on a [poly track](/sidecar-expander/using/sequencer/#p-locks-on-poly-steps), hold trigs and press **FX** twice: the INS lock page (A..D INSERT A P1..P4, E..H INSERT B P1..P4).
- **LFOs:** targets I1..I8 (the voices' chains) and B1..B3 (the buses' chains), on top of the knob or lock; O1..O8 move the OUT route's LEV, PAN and WID ([LFOs](/sidecar-expander/using/lfo/#targets)).

![The touchscreen's INSERT FX page (OLED): SD, A FILTER, B DELAY, CUT RES MODE DRV TIME FDBK MOD MIX, the sends to B1..B3 with each bus's chain, OUT POST with LEV, PAN and WID](../../../assets/touch/oled-insfx-voice.png)

<small>Screenshot: rendered off-device by the Sidecar's own page code, with made-up data.</small>

Settings, the OUT route included, are saved per kit on the Sidecar's card (`/.rytm/ins/<project>/kNNN.txt`), a second after the last edit. <span class="sc-plan">coming</span> With the next Rytm firmware they follow the Rytm's kit SAVE and RELOAD.

## Limitations

- Sidecar (Pi) only.
- The web page shows the chains (in its status) but has no editor for them yet.
- Insert locks exist only on poly tracks.
- CPU: 8 voices with two slots each cost about 1.3 to 2.2 % of a Pi 4 core (estimated from the Mac).
