---
title: Insert FX and FX buses
description: "Two insert slots on every Sidecar voice, three FX buses, p-locks and LFOs on them."
sidebar:
  order: 2.1
---

:::caution[0.3 test line]
New in the 0.3 test line, Sidecar (Pi) only. Not in the 0.2.0 release. Built and tested on the Mac and in the emulator; not yet confirmed on a real Rytm.
:::

Every Sidecar voice gets an **INSERT** chain of two slots, A and B, before it goes back into the Rytm's track. Three **FX buses** take sends from the voices. <span class="sc-test">in testing</span>

## Signal flow

```
Sidecar voice -> INSERT A -> INSERT B -> the Rytm's track (analog filter, amp)
                                      \-> sends to bus 1, 2, 3
bus 1 = SEND FX 1 -> its chain (A, B) -> PRE or POST
bus 2 = SEND FX 2 -> its chain (A, B) -> PRE or POST
bus 3 = dry       -> its chain (A, B) -> PRE or POST (ROUTE)
```

- Buses 1 and 2 **are** the two [send effects](/sidecar-expander/using/send-effects/): their TYPE, P1..P5 and the Rytm tracks' sends are unchanged. A kit without insert settings sounds exactly as before.
- Bus 3 has no send effect of its own: a dry bus of the voices' sends through its two slots (a bus compressor, a shared filter, ...).
- A voice's sends are taken after its inserts: the bus hears the inserted voice, not the Rytm's analog processing of it.

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

- **On the Rytm:** the remote page **INSERT** (open the remote pages with TRK + YES, then LEFT from SIDECAR; listed once a track plays a Sidecar machine or a chain is set). The TRACK view shows the selected track's voice: a strip `[A TYPE] > [B TYPE] > sends`, A..D the slot's P1..P4, E SLOT, F TYPE, G BUS, H SEND. FUNC + G picks another track. **YES**: the BUS view (A..D, E SLOT, F TYPE, G BUS 1..3, H ROUTE for bus 3); NO or YES goes back.
- **On the touchscreen:** the **INSERT FX** page (UP + T6 on the Rytm, or Settings > Send FX > Inserts): the voice's two slots as dials with their values, V1..V8, the three sends and each bus's chain and return. It follows the Rytm's selected track.
- **P-locks:** on a [seq track](/sidecar-expander/using/sequencer/#p-locks-on-seq-steps), hold trigs and press **FX** twice: the INS lock page (A..D INSERT A P1..P4, E..H INSERT B P1..P4).
- **LFOs:** targets I1..I8 (the voices' chains) and B1..B3 (the buses' chains), on top of the knob or lock.

![The touchscreen's INSERT FX page (OLED): V3, A FILTER, B DELAY, CUT RES MODE DRV TIME FDBK MOD MIX, the sends to B1..B3 and each bus's chain](../../../assets/touch/oled-insfx-voice.png)

<small>Screenshot: rendered off-device by the Sidecar's own page code, with made-up data.</small>

Settings are saved per kit on the Sidecar's card (`/.rytm/ins/<project>/kNNN.txt`), a second after the last edit.

## Limitations

- Sidecar (Pi) only.
- No TRK + FX shortcut to the INSERT page yet: use LEFT / RIGHT on the remote pages, UP + T6, or the touchscreen.
- The web page shows the chains (in its status) but has no editor for them yet.
- Insert locks exist only on seq tracks.
- CPU: 8 voices with two slots each cost about 1.3 to 2.2 % of a Pi 4 core (estimated from the Mac).
