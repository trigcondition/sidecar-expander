---
title: Writing user machines
description: The plugin C ABI, the manifest, the RMP1 and RMPA packages, building and the limits.
sidebar:
  order: 4
---

A user machine is a plain C (or C++) sound generator with a fixed C ABI. One source builds a Teensy package (RMP1) and a Pi package (RMPA), and a native library for tests on a Mac.

## The ABI

The header is `sdk/rmp/rmp_api.h` (API 2; API-1 plugins still load). A plugin exports exactly one table, `rmp_entry`:

```c
#include "rmp_api.h"

typedef struct { float phase, freq, amp, env; } voice_t;   /* per-voice state */

static int32_t init(const rmp_host *h) { (void)h; return 0; }             /* nonzero refuses */
static void voice_init(void *s) { /* state arrives zeroed */ }
static void note_on(void *s, float note, float vel) { voice_t *v = s; v->freq = 440.0f * exp2f((note - 69.0f) / 12.0f); v->env = vel; }
static void note_off(void *s) { }
static void params(void *s, const float *p) { voice_t *v = s; v->amp = p[7] / 127.0f; }  /* P1..P16 */
static void render(void *s, float *out, int32_t n) { /* write n mono samples, nominal +-1 */ }

RMP_ENTRY const rmp_plugin rmp_entry = {
  .magic = RMP_PLUGIN_MAGIC, .api = RMP_API,
  .state_bytes = sizeof(voice_t), .cpu_permille = 40,
  .init = init, .voice_init = voice_init, .note_on = note_on,
  .note_off = note_off, .params = params, .render = render,
};
```

| Member | |
|---|---|
| `state_bytes` | per voice, zeroed before `voice_init`. All 8 voices may play the same slot, each with its own state. Keep everything mutable here: the image's globals are shared by every voice and slot using the package |
| `cpu_permille` | declared CPU per voice, in 1/1000 of the Teensy; the guard's budget. Declare it from the **peak** render call, not the average. The Teensy refuses more than 500; the Pi does not check it |
| `init(host)` | once after loading. The host table gives `sample_rate` (48000), `max_block` (12), `log()` (not from `render`), `random()` |
| `note_on(state, note, velocity)` | a trig: note in semitones (60 = C4), velocity 0..1 |
| `note_off(state)` | the gate closed |
| `params(state, p)` | P1..P16 as floats, 0..127 plus the fraction. P1..P8 are the SRC page, P9..P16 page 2 |
| `render(state, out, n)` | n = 1..12 samples, mono, **written** (not added), nominal level ±1 |

API 2 adds, in reserved slots (`RMP_FN(f)`; NULL turns a feature off): `load_entry` (native preset files), `voice_enter` / `voice_leave`, and on the host side `pool_info` / `pool_read` (read the project's pool samples; on the Pi from the sample RAM's copy, mono int16: the first `pool_info` for a slot answers NOT_READY, EMPTY without sample RAM). Presets work on both: `/PRESETS/<id>/<name>.txt` (`P<n> <value>` lines) or `<name>.<preset_ext>` through `load_entry`, at most 127 a machine, chosen with the PRE knob.

## The manifest

`manifest.json` next to the source:

```json
{
  "id": "my.machine", "version": "1.0.0", "compatible_from": "1.0.0",
  "name": "MYMACH", "short": "MYM", "licence": "MIT", "page2": "sample",
  "knobs": [
    {"p": 1, "long": "Tune", "short": "TUN", "look": "centred", "text": "bipolar", "default": 64},
    {"p": 2, "long": "Shape", "short": "SHP", "look": "list", "text": "enum", "names": ["SINE", "TRI", "SAW"]},
    {"p": 8, "long": "Level", "short": "LEV", "look": "fader", "text": "number", "default": 100}
  ]
}
```

- `id`: up to 31 printable characters, no spaces or slashes; it names the package and its fingerprint (sounds remember it). `version` and `compatible_from` as `a.b.c`.
- `name` up to 10 characters, `short` up to 4, `licence` up to 48.
- `page2`: `"sample"` (the Rytm's sample layer) or `"params"` (eight more knobs, P9..P16, with `page2_title`, up to 13 characters).
- `preset_ext`: the file extension of native preset files, up to 7 letters or digits (not `txt`).
- Knobs (up to 32): `p` 1..16, `long` (12), `short` (4) — the label the Rytm shows —, `look` (`dial`, `centred`, `fader`, `list`), `text` (`number`, `bipolar`, `enum`, `list`, `note`, `time`, `preset`, `pool`), `names` for list knobs (1..16 names of up to 7 characters), `role` (`free`, `preset`, `offset`), `min`, `max`, `default`.
- At most one knob has `text: "preset"`, and it must have role `free`; at most 255 enum names in all.
- Other keys are refused.

## Build

```make
# Makefile
NAME := my_machine
SRCS := machine.c
include ../../sdk/rmp/plugin.mk
```

| Command | Output |
|---|---|
| `make` | `my_machine.rmp` (Teensy, RMP1: Cortex-M7 Thumb-2) and `libmy_machine.dylib` (the Mac test build) |
| `make a64` | `my_machine.a64.rmp` (Pi, RMPA: AArch64; the toolchain runs in Docker if it is not installed) |

The packer links the code into one position-independent image and turns the relocations into the package's relocation table, so the loader can place it anywhere. On the Pi, code and read-only data go into an executable arena and data into ordinary memory: plugin code never writes its own code pages.

## Rules

- **No static constructors or destructors**, no function-local statics with dynamic initialisation. Construct in `voice_init`.
- **No host symbols:** no `malloc`, no `printf`. Everything comes from your code, the SDK shim (`memcpy` and friends, C++ stubs) and libm.
- Watch what libm calls pull in: a double `pow` brings large tables.
- Never write outside your state and your image. The guard catches faults and overruns, not stray writes.
- A render that runs over its budget, or faults, mutes that slot (`!NAME`); the other voices play on. On the Pi, `init`, `voice_init`, `params`, `note_on` and `note_off` are not yet guarded: a fault there restarts the engine.

## Limits

| | Teensy 4.1 | Pi 4B |
|---|---|---|
| Package size | 64 KB (the store's cap) | image up to 1 MB; code under the 4 MB arena |
| Loaded code, all slots | 32 KB arena | 4 MB code, 4 MB data |
| State per voice | 16 KB without PSRAM | 64 KB |
| Render call | 12 samples at 48 kHz | 12 samples at 48 kHz |

## Test

- The native library runs in the test harness on a Mac, and the RMPA package runs as-is in the Mac core library (real AArch64 code).
- Install on the Sidecar from the web page or console, assign a slot, play, and read the measured CPU per voice on the Machines tab.

The starter set (`plugins/sc_*`: ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN) is a good set of examples.
