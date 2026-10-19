---
title: Remote UI pages
description: Page declarations and widgets for pages the Sidecar draws on the Rytm's screen.
sidebar:
  order: 6
---

Part of the tester release: the `rui1027` Rytm build with the test line's Sidecar firmware (Pi kernel or Sidecar Mini firmware).

For examples of what the pages can show (the connect screen, SCOPE and meters, sample waveforms, the recorder, machine graphics), see [The remote UI](/sidecar-expander/using/rytm-side/#more-pages). New pages and graphics are Sidecar code only; the Rytm needs no new flash for them.

The Rytm side of the remote UI blits a 1 KB frame at its 20 Hz UI tick and reports keys and encoders. It also draws the text in its own fonts (`3D` / `3E`), echoes a turned value in the bottom bar itself (`3F`), lets only the page's keys and knobs through (`37`), and reports machines (`33`), the active kit (`3B`) and the SRC view (`29` / `2A`); it drives the trig key LEDs (`34`) and shows the connect screen (`35` / `36`). All layout and drawing is Sidecar code in `core/ui`, shared by the Pi, the Teensy and the Mac.

## The canvas

- 128x64, 1 bit, in the Rytm's own framebuffer layout, so an 8x8 tile is the 8 bytes the panel takes and a frame goes out as-is.
- Drawing: pixels, lines, rectangles, fills, invert, a 50 % dither, a clip rectangle, and text items: on the Rytm the text is drawn by the Rytm in its own fonts (a font named by the Rytm's index; `kRSmall` is the stock screens' font). Two original pixel fonts (3x5, 5x7, CC0) remain for previews and tests only.
- No allocation (two canvases, 2 KB), integer drawing; on the Teensy all of it lives in flash.
- Each frame is diffed against what the Rytm holds; only changed tiles and changed text items (`3D`) are sent.

## The grid

A page mirrors the Rytm's stock pages: a 9-row title bar (rows 0..8), two rows of four 32x22 cells, and a bottom bar on rows 55..63, encoders A..D over the top row and E..H over the bottom. Labels are drawn under each encoder's column.

## Widgets

| Kind | Inputs | Draws |
|---|---|---|
| `kDraw` | an extra.h draw id | drawn by code (the waveform, the FM algorithm, the JUNO envelope, GRAIN's cloud) |
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

- `30 on` (TRK + YES) opens SIDECAR; the pages are SIDECAR, SYSTEM, then one page per track on a Sidecar machine (titled by the track, BD..CB, decided by the `33` reports), then the pages drawn by code: LFO, REC, SCOPE. TRK + LFO opens the LFO page (`30` page 1). LEFT / UP previous, RIGHT / DOWN / PAGE next, NO back to SIDECAR, NO on SIDECAR leaves (`3A 0 0`).
- An encoder changes the voice's parameter through the same path as a knob report. The edit holds over the Rytm's later reports of the same value and gives way when the Rytm's own value moves.
- At most every 25 ms, and 8 ms after a key or a turn: changed widgets are redrawn, the frame diffed, changed tiles sent as `38` runs with the changed `3D` text items and one `39` (the turned knob's cell and the bottom bar first); `37` goes out before a frame when the mask changes, `3F` binds each numeric encoder to the bottom bar; nothing when nothing changed; a `3C` keepalive after 250 ms of silence.
- **The SRC view:** when the stock SRC page shows a track with a Sidecar machine (`29 t 1`), the host draws that track's page over it from the `2A` values, without catching any key or knob; a track whose machine has no page gets nothing, and `3A 0 0` gives the screen back.
- It runs on the control side (the Pi's core 3; the Teensy's loop), never in the render path.

Protocol: [Remote UI messages](/sidecar-expander/developers/host-link-protocol/#remote-ui-29-2a-303f).
