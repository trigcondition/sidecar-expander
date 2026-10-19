---
title: Remote UI pages
description: Page declarations and widgets for pages the Sidecar draws on the Rytm's screen.
sidebar:
  order: 6
---

Part of the tester release: the `rui1027` Rytm build with the test line's Sidecar firmware (Pi kernel or Sidecar Mini firmware).

For examples of what the pages can show (the connect screen, SCOPE and meters, sample waveforms, the recorder, machine graphics), see [The remote UI](/sidecar-expander/using/rytm-side/#more-pages). New pages and graphics are Sidecar code only; the Rytm needs no new flash for them.

The Rytm side of the remote UI is a dumb terminal: it blits a 1 KB frame at its 20 Hz UI tick and reports keys and encoders. All layout and drawing is Sidecar code in `core/ui`, shared by the Pi, the Teensy and the Mac.

## The canvas

- 128x64, 1 bit, in the Rytm's own framebuffer layout, so an 8x8 tile is the 8 bytes the panel takes and a frame goes out as-is.
- Drawing: pixels, lines, rectangles, fills, invert, a 50 % dither, a clip rectangle, text in two original pixel fonts (3x5 for labels, 5x7 for titles and values, 5x7 at scale 2 for large values).
- No allocation (two canvases, 2 KB), integer drawing; on the Teensy all of it lives in flash.
- Each frame is diffed against what the Rytm holds; only changed tiles are sent.

## The grid

A page mirrors the Rytm's encoders: an 8-pixel header, then two rows of four 32x28 cells, encoders A..D over the top row and E..H over the bottom. Labels are drawn under each encoder's column.

## Widgets

| Kind | Inputs | Draws |
|---|---|---|
| `kKnob` / `kKnobBi` | value | a 270° ring, the value, the label (bipolar: from the top, shown -64..+63) |
| `kBar` / `kPan` | value | a level bar / a pan bar from the centre (L12 / R12) |
| `kList` | value | an enum list: the selected item inverted, its neighbours, a scroll mark |
| `kFilter` | cutoff, resonance, type | the response from 20 Hz to 20 kHz: LP, BP, HP or notch |
| `kEnv` | A D S R, A D, or A H D | an envelope shape |
| `kWave` | shape, pulse width | an oscillator over two cycles: sine, triangle, saw, square, pulse, noise |
| `kLfo` | shape, depth | an LFO with its depth band |
| `kSample` | start, end | a waveform (min/max per column), slices, the played region |
| `kText` | | lines of small text (status pages) |

Widgets are static graphics drawn from parameter values, with no animation. Each draws only inside its rectangle, so a page redraws one widget when its inputs change.

## Page declarations

```c++
struct Cell {
  uint8_t kind;                  // kKnob kKnobBi kBar kPan kList kFilter kEnv kWave kLfo kSample kText
  uint8_t col, row, cols, rows;  // grid position and span
  uint8_t in[4];                 // parameters feeding it: the voice's P1..P16 = 0..15, kNone unused
  uint8_t arg;                   // per kind: envelope shape, fixed filter type or wave, sample or text id
  const char* names;             // kList: "A\0B\0...\0"
};
struct Page {
  char title[12];
  uint8_t machine;               // the voice byte's machine this page is for
  uint8_t ncells; const Cell* cells;
  uint8_t enc[8];                // encoder A..H -> parameter
  char label[8][5];              // encoder labels
};
```

The same page as JSON, for plugin manifests and a future browser page designer (maps 1:1 onto the structs; not loaded yet):

```json
{"title": "PLAITS", "machine": 0,
 "enc": [0, 1, 2, 3, 4, 5, 6, 7], "label": ["ENG", "HRM", "TIM", "MOR", "DEC", "LPG", "TUN", "LEV"],
 "cells": [{"kind": "list", "at": [0, 0, 1, 1], "in": [0], "names": ["VA VCF", "PHASEDST"]},
           {"kind": "knob", "at": [1, 0, 1, 1], "in": [1]},
           {"kind": "env", "at": [0, 1, 1, 1], "in": [null, 4], "shape": "ad"}]}
```

A new built-in page is a `Cell` array, a `Page`, and one row in the machine table.

## The host

- `30 on` (TRK + YES) opens the SIDECAR status page; then one page per voice whose machine has a page. LEFT / UP previous, RIGHT / DOWN / PAGE next, NO back to SIDECAR.
- An encoder changes the voice's parameter through the same path as a knob report. The edit holds over the Rytm's later reports of the same value and gives way when the Rytm's own value moves.
- Every 50 ms: changed widgets are redrawn, the frame diffed, changed tiles sent as `38` runs and one `39`; nothing when nothing changed; a `3C` keepalive after 250 ms of silence.
- It runs on the control side (the Pi's core 3; the Teensy's loop), never in the render path.

Protocol: [Remote UI messages](/sidecar-expander/developers/host-link-protocol/#remote-ui-303f).
