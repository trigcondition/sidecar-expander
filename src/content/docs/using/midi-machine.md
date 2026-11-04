---
title: MIDI machine
description: "New in 0.4.0. Machine 50 on every track sends the track's notes and locks as MIDI to the Rytm's DIN out, the computer (USB-C) or USB MIDI devices on the Pi (USB-A)."
sidebar:
  order: 3.05
---

New in 0.4.0. The **MIDI machine** sends MIDI instead of playing a sound: a track's trigs, notes and locks go out on a destination and channel you choose. It has no audio and uses no voice CPU.

Choose **MIDI** in a track's machine list (machine 50, on every track). Everything on it is a sound parameter, so it is saved with kits and sounds, locked per step, and modulated by the Rytm's and the Sidecar's LFOs.

## The knobs

| Page | A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|---|
| SRC | DST | CHAN | BANK | SBNK | PROG | PB | AT | MW |
| SMPL | VAL1 | VAL2 | VAL3 | VAL4 | SEL1 | SEL2 | SEL3 | SEL4 |

- **DST**, the destination: OFF; **DIN**, the Rytm's own MIDI OUT (the default); **USBC**, the computer on the Pi's USB-C port; **USBA**, every USB MIDI device in the Pi's USB-A ports. DST can be locked per step: a note's off goes where its on went.
- **CHAN:** 1..16.
- **BANK, SBNK, PROG:** 0 is off; otherwise bank select (CC 0), bank select LSB (CC 32) and the program change send the value minus one. When one changes, all three go out together, in that order.
- **PB**, pitch bend: 0 is off, 64 is the centre. **AT**, aftertouch, and **MW**, the mod wheel: 0 is off.
- **SEL1..SEL4** pick a CC for **VAL1..VAL4**: 0 is off, otherwise VALn goes out on CC number SELn minus one.
- **FLTR and AMP** do nothing on this machine: the track is silent.

## Notes

Notes come from trigs (NOTE, VEL, LEN), the pads in CHRO, the Sidecar's [poly tracks](/sidecar-expander/using/sequencer/) and keyboards on the Pi. A trig is mono on its track; the others are polyphonic, so chords come from a poly track, the pads or a keyboard. The [arpeggiator](/sidecar-expander/using/arpeggiator/) works on the MIDI machine too.

## Good to know

- **Clock stays the Rytm's.** Its own MIDI clock settings reach DIN and USB-C; while a track sends to USB-A, the Rytm's clock and transport go there too.
- **Notes never wait.** Other data has a budget (about 2400 bytes a second on DIN). If a USB device can't keep up, clock goes first, then values, then note-ons; note-offs last, and a refused note-off is tried again for a second.
- **Unplugging the Rytm** ends the notes on USB.
- **A DAW echoing the notes back** (MIDI thru): an echo within 200 ms is dropped; a slower loop is not caught, so turn the thru off.
