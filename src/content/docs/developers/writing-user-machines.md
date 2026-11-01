---
title: Writing user machines
description: Port a synth or drum engine to the Sidecar on the Pi. Toolchain, a tested example, the plugin ABI, the manifest, presets, polyphony, drum kits, the limits, 0.3.2 against 0.4.0, and the licence rules.
sidebar:
  order: 4
---

A user machine is a plain C or C++ sound generator with a fixed C ABI. It is built for the Pi's AArch64 CPU, packed into an `.rmp` file, copied to the card and played in one of the Rytm's slots **U1..U5**. The engine loads it at runtime: no kernel build, no Rytm flash.

The same source can also build a Sidecar Mini package (RMP1) and a native library for tests on a Mac. This page is about the Pi.

:::note[How far this was tested]
The build steps, the example and the host tests below were run on an Apple silicon Mac, from a clean checkout of the 0.3.2 engine. The steps that need a Sidecar (copying to a real card, the web page, the Rytm's menu) were not part of that run. The console assign was run on the Mac core library, not on a Pi.
:::

## Build a machine in ten minutes

### 1. Get the source and the tools

You need git, Docker, [uv](https://docs.astral.sh/uv/) and Python 3.12 or later.

```sh
git clone https://github.com/trigcondition/sidecar-firmware
cd sidecar-firmware
git checkout v0.3.2
uv sync
docker build -t rytm-circle pi/circle
```

- `uv sync` makes `.venv`, where `plugin.mk` looks for Python. The packer itself needs only the standard library: `make a64 PY=python3` works without `uv sync`.
- `pi/circle/Dockerfile` installs Arm GNU Toolchain 13.3.rel1 (`aarch64-none-elf`). It downloads the arm64 host build, so it suits Docker on Apple silicon. On another machine, put Arm's `aarch64-none-elf-gcc` on your `PATH` instead (not tested here). `make a64` uses the one on `PATH` first and Docker only when there is none.
- Docker mounts only the repository, so keep your machine under `plugins/`. For sources elsewhere, add mounts with `A64_DOCKER_ARGS`.

### 2. Write the machine

Make `plugins/my_tone/` with three files.

`Makefile`:

```make
NAME := my_tone
SRCS := tone.c
include ../../sdk/rmp/plugin.mk
```

`manifest.json`:

```json
{
  "id": "my.tone", "version": "1.0.0", "name": "MY TONE", "short": "TONE",
  "licence": "MIT", "page2": "sample",
  "knobs": [
    {"p": 1, "long": "Wave", "short": "WAVE", "look": "list", "text": "enum", "names": ["SINE", "SQR"], "default": 0},
    {"p": 2, "long": "Decay", "short": "DEC", "look": "dial", "text": "number", "default": 64},
    {"p": 3, "long": "Level", "short": "LEV", "look": "fader", "text": "number", "default": 100}
  ]
}
```

`tone.c`:

```c
#include <math.h>
#include "rmp/rmp_api.h"

typedef struct {
  float phase, inc, env, keep, level;
  int square;
} tone;

static float g_rate;   /* set once in init, read by every voice: a constant is fine in a global */

static int32_t t_init(const rmp_host *h) { g_rate = h->sample_rate; return 0; }

static void t_params(void *st, const float *p) {
  tone *s = st;
  s->square = (int)p[0] * 2 >> 7;                     /* a list knob: zone = value * count >> 7 */
  float secs = 0.02f + 2.0f * p[1] / 127.0f;
  s->keep = expf(-6.9f / (secs * g_rate));            /* -60 dB in secs */
  s->level = p[2] / 127.0f;
}

static void t_note_on(void *st, float note, float vel) {
  tone *s = st;
  s->inc = 440.0f * powf(2.0f, (note - 69.0f) / 12.0f) / g_rate;
  s->env = vel;
}

static void t_note_off(void *st) { (void)st; }        /* a one-shot: the decay ends it */

static void t_render(void *st, float *out, int32_t n) {
  tone *s = st;
  for (int32_t i = 0; i < n; ++i) {
    float x = s->square ? (s->phase < 0.5f ? 0.5f : -0.5f) : sinf(6.2831853f * s->phase);
    out[i] = x * s->env * s->level;
    s->env *= s->keep;
    s->phase += s->inc;
    if (s->phase >= 1.0f) s->phase -= 1.0f;
  }
}

static void t_voice_init(void *st) { (void)st; }      /* the state arrives zeroed */

RMP_ENTRY const rmp_plugin rmp_entry = {
  .magic = RMP_PLUGIN_MAGIC, .api = RMP_API,
  .state_bytes = sizeof(tone), .cpu_permille = 25,
  .init = t_init, .voice_init = t_voice_init, .note_on = t_note_on, .note_off = t_note_off,
  .params = t_params, .render = t_render,
};
```

### 3. Build and pack

```sh
make -C plugins/my_tone a64
```

The last line shows the id and the sizes:

```
my_tone.a64.rmp: my.tone image 4096 B + bss 8 B, 10 relocations
```

`plugins/sine_test` builds the same way (`make -C plugins/sine_test a64`), but it is a test fixture: it is API 1 on purpose and its `init` checks for an API 1 host table. Copy the example above or `plugins/sc_acid`, not `sine_test`.

### 4. Install and assign

Copy the package to `/Plugins/` on the card, or upload it on `sidecar.local`, tab **User machines**. The package's id names it, not the file name. Press **Rescan** if you copied by hand. Then assign it, in any of these ways:

- on the Rytm: the track menu (FUNC + CHRO), `U1..U5`, YES steps through the installed machines;
- on the web page: the project's U1..U5 selects;
- on the console: `um=rescan`, then `um=assign:1:my.tone`.

Then pick U1 as a track's machine. [User machines](/sidecar-expander/using/user-machines/) has the details for players. In 0.3.x, a rescan or an upload during play can cause short dropouts: stop the sequencer first.

## How a machine runs on the Pi

| | |
|---|---|
| Sample rate | 48000 Hz (`host->sample_rate`) |
| Block | `render` writes 12 samples, 250 µs of audio (`host->max_block`; the Pi always asks for 12, but write your loop for `n`) |
| Output | mono float, written not added, nominal ±1. The host clips to ±1 and turns a NaN into 0 |
| Voices | 8 at most, each with its own state. Voices 0-3 render on core 1, voices 4-7 on core 2, at the same time |
| Control calls | `init`, `voice_init`, `params`, `note_on`, `note_off`, `load_entry` run on core 3, between render blocks, never at the same time as `render` |
| State | `state_bytes` per voice, 64 KB at most, zeroed before `voice_init` |
| Memory | no allocator. Everything mutable goes in the state |

### The ABI

The header is `sdk/rmp/rmp_api.h` (API 2; API 1 plugins still load). A plugin exports exactly one table, `rmp_entry`, declared with `RMP_ENTRY`.

| Member | |
|---|---|
| `state_bytes` | per voice. All 8 voices may play the same slot, each with its own state |
| `cpu_permille` | declared CPU per voice, in 1/1000 of a Teensy. The Pi reads it only on poly tracks ([Polyphony](#polyphony)). The Teensy uses it as the guard's budget and refuses more than 500 |
| `init(host)` | once after loading. Nonzero refuses the package. The host table gives `sample_rate`, `max_block`, `log()` (not from `render`) and `random()` |
| `voice_init(state)` | a voice starts this slot; the state was just zeroed |
| `note_on(state, note, velocity)` | a trig: note in semitones (60 = C4), velocity 0..1 |
| `note_off(state)` | the gate closed: pad released, trig length elapsed, or sequencer stopped |
| `params(state, p)` | P1..P16 as floats, 0..127 plus the fraction |
| `render(state, out, n)` | n samples, mono |

### Render budget and the guard

Keep `render` to a steady, bounded amount of work: no waiting, no logging, no card access. Audio stops if a core is late.

- **The voice budget** is 50 % of a block at 1500 MHz, scaled to the CPU clock (`voicebudget=` on the card). That is 125 µs at 1500 MHz.
- **What actually mutes:** a voice over its budget while its render core is overloaded (the core's block took 80 % or more), 200 blocks in a row (50 ms). A short burst never mutes.
- **Plan for less than the budget.** Four voices share a core, so a machine meant for every voice should stay under about 50 µs a block (20 % of a block). Over that, the machine plays alone but glitches in a full kit, and nothing mutes it if each voice is under budget.
- **A fault in `render`** mutes that voice at once. The other voices play on. The stats show `!<MACHINE>`, the touchscreen MUTED, until the console's `:unmute` or until the voice changes machine.
- **A hang in `render` is fatal.** A render core that does not finish its block in 20 ms stops the engine, which reboots. The guard does not cut off an endless loop on the Pi.
- **The control calls have no guard.** A fault in `init`, `voice_init`, `params`, `note_on` or `note_off` stops the engine and reboots it. They also delay core 3, which feeds the audio FIFO: keep them to microseconds. A heavy setup belongs spread over `render` blocks.
- **Stray writes are not caught.** The guard sees faults and overruns only.

The web page's installed list shows the measured time per voice once a machine has played (`ns` and `block_ns` in `GET /um`). Timings on a Mac are about 13 times too good for a Pi 4 core.

### Rules of the build

- **No static constructors or destructors,** and no function-local statics with dynamic initialisation. The packer refuses them. Construct in `voice_init`.
- **No host symbols:** no `malloc`, no `printf`. The link fails with an undefined reference. You have your own code, libm and the SDK shim (`memcpy` and friends, C++ stubs).
- **Watch what libm pulls in.** Prefer `sinf` and `powf`: a double `pow` brings large tables.
- **Keep the plain-C ABI.** C++ works, without exceptions or RTTI.
- **Denormals:** flush them yourself in feedback paths and filters. Nothing in the ABI does it for you.

## What a Rytm track gives a machine

| From the Rytm | What the machine sees |
|---|---|
| A trig | `params` with all of P1..P16, then `note_on` with the note and the velocity (1..127 scaled to 0..1) |
| P-locks | the locked values, in the `params` of that trig. Any P can be locked, list knobs too, so a step can change a drum's TYPE |
| A knob turn, a slide, the Rytm's or Sidecar's LFOs | another `params`, at most about 90 a second per voice. Values may carry a fraction |
| Gate closed | `note_off` |
| The kit | P1..P16 are the track's sound parameters, so the Rytm stores them per track, per kit |

A machine's audio goes back to the track's own Overbridge input. It then passes the Rytm's analog filter, amp and FX like any Sidecar voice, so a machine does not need its own output stage to fit in.

The ABI has no tempo, transport, step number, track number or voice number. Use the host's [LFOs](/sidecar-expander/using/lfo/) rather than building your own for slow modulation.

**The sound tag.** Each sound remembers a fingerprint of the machine's `id`. A trig whose tag belongs to another machine stays silent until a matching trig. So keep the `id` stable across versions: a new id orphans your users' sounds.

## Knobs: P1..P16, labels, ranges, lists

`manifest.json` sits next to the source. The packer refuses unknown keys.

| Key | |
|---|---|
| `id` | up to 31 printable characters, no spaces, slashes or leading dot |
| `version`, `compatible_from` | `a.b.c`, each 0..255. A slot plays the version its map names, or else the newest installed one whose `compatible_from` allows it |
| `name`, `short` | up to 10 and 4 characters |
| `licence` | up to 48 characters |
| `page2` | `"sample"`: the SMPL page is the Rytm's sample layer. `"params"`: it holds P9..P16, titled `page2_title` (up to 13 characters) |
| `preset_ext` | the extension of native preset files, up to 7 letters or digits, not `txt` |
| `max_voices`, `pitch` | see [Polyphony](#polyphony) |
| `type_labels` | see [Labels that follow a list](#labels-that-follow-a-list) |
| `knobs` | one per P, 16 at most |

Each knob:

| Key | |
|---|---|
| `p` | 1..16, each once. P1..P8 are the SRC page |
| `long`, `short` | up to 12 and 4 characters; `short` is the label on the Rytm |
| `look` | `dial`, `centred`, `fader`, `list` |
| `text` | `number`, `bipolar`, `enum`, `list`, `note`, `time`, `preset`, `pool` |
| `min`, `max`, `default` | 0..127; defaults 0, 127 and 64 |
| `names` | for `look: "list"`: 1..16 names of up to 7 characters (36 from 0.4.0), at most 255 in a package |
| `role` | `free`, `preset`, `offset`: see [Presets](#presets) |

**Reading a list knob.** The value is split in equal zones: `zone = (int)value * count >> 7`. Use this exact formula, so what plays matches the name the Rytm shows.

### Labels that follow a list

A knob that picks a type can rename other knobs. `plugins/mdkit` does this: each drum names P1..P8 for itself.

```json
{
  "id": "my.kit", "version": "1.0.0", "name": "MY KIT", "short": "KIT", "page2": "params", "pitch": "none",
  "knobs": [
    {"p": 1, "long": "Pitch", "short": "PTCH"},
    {"p": 2, "long": "Snap", "short": "SNAP"},
    {"p": 9, "long": "Type", "short": "TYPE", "look": "list", "text": "enum", "names": ["BD", "SD"], "default": 0}
  ],
  "type_labels": {
    "knob": 9,
    "params": [1, 2],
    "sets": [
      [["Pitch", "PTCH"], ["Click", "CLK"]],
      [["Tone", "TONE"], ["Snap", "SNAP"]]
    ]
  }
}
```

`sets` has one row per name of the list knob, and each row one `[long, short]` or `null` per entry of `params`. Give the knobs a sensible static label too: an older host shows those.

With `follows` and `lists` as well, the names of one list follow another list (MD's ENGINE picks the TYPE list; see `plugins/mdkit/md.json`). Such a package is format 4, which needs 0.3.0 or later.

One slot shows one set of labels. If two tracks on a slot have different TYPEs, the Rytm shows the selected track's.

## Presets

Presets live on the card in `/PRESETS/<id>/`, at most 127 a machine.

- **Generic:** `<name>.txt`, with one `P<n> <value>` line per knob.
- **Native:** `<name>.<preset_ext>`, up to 4 KB, handed to your `load_entry`, which is how a port reads its original patch format.

Add one knob with `"text": "preset"` and role `free`; it picks the preset. The other knobs say what a preset does to them:

```json
{
  "id": "my.pad", "version": "1.0.0", "name": "MY PAD", "short": "PAD", "preset_ext": "syx",
  "knobs": [
    {"p": 1, "long": "Preset", "short": "PRE", "look": "list", "text": "preset"},
    {"p": 2, "long": "Cutoff", "short": "CUT", "role": "preset"},
    {"p": 3, "long": "Bright", "short": "BRT", "role": "offset"}
  ]
}
```

| Role | |
|---|---|
| `preset` | a preset sets it, and the value is written back to the Rytm's knob |
| `offset` | stays where it is, and is applied on top of the preset |
| `free` | never touched |

A p-locked PRE on a trig plays that preset for the trig without writing it back. The console's `um=save:<slot>:<name>` writes a generic preset of what the slot plays now.

### The API 2 functions

Put these in the table's `reserved[]` with `RMP_FN(f)`. NULL turns a feature off.

```c
RMP_ENTRY const rmp_plugin rmp_entry = {
  .magic = RMP_PLUGIN_MAGIC, .api = RMP_API,
  /* ... */
  .reserved = {
    [RMP_P_LOAD_ENTRY] = RMP_FN(my_load_entry),
    [RMP_P_VOICE_ENTER] = RMP_FN(my_voice_enter),
    [RMP_P_VOICE_LEAVE] = RMP_FN(my_voice_leave),
  },
};
```

| Function | When |
|---|---|
| `load_entry(state, bytes, len, values)` | a native preset: set the voice's hidden state and fill `values[k]` for P(k+1)'s 0..127 (-1 untouched). 0 means taken. Runs on core 3, between render blocks |
| `voice_enter(state)` | after `voice_init`, each time a voice starts this slot |
| `voice_leave(state)` | before the voice leaves the slot, or the slot unloads |
| `host` `pool_info`, `pool_read` | read the project's pool samples: get them with `rmp_pool_info_of(host)` and `rmp_pool_read_of(host)`. On the Pi they read the sample RAM's copy, mono int16. The first `pool_info` for a slot answers NOT_READY; EMPTY without sample RAM. `pool_read` works from `render`; `plugins/sc_grain` keeps a built-in sample instead, `plugins/v2_test` shows the pool calls |

## Polyphony

By default a machine is mono: one state on one voice, and a new trig reaches the same state. That is how glide on a mono track works (HUSH1, RAFFO).

Set `"max_voices"` to 2..8 in the manifest to opt into **instancing**. On a Sidecar [poly track](/sidecar-expander/using/sequencer/) the host then runs up to that many states of your plugin on one voice, one for each note, from a pool of 32 shared by all poly tracks.

- `voice_init`, `params`, `note_on` and `note_off` go to each instance, with its own state. The instances mix into the voice's channel, and that voice's budget and guard cover them all.
- **Everything `render` writes must be in the state.** Constants and the host table in globals are fine.
- **Declare `cpu_permille` honestly.** The host reads it as `permille × 0.158 %` of a Pi 4 core per instance, and × 2.5 for the worst case, and cuts VOICES when a track would pass the budget.
- On a track's AUTO setting you get 4 notes at most. The note is a float: UNISON detunes it.
- `"pitch": "none"` says a drum has no pitch: AUTO is then 1 voice and the host sends note 60 on a poly track. On a plain track the machine still gets the trig's note, so a drum simply ignores it.

Packages without these keys stay mono. Examples: `plugins/nusaw`, `plugins/raffo`.

## A drum engine: one track, one voice

A kit on the Sidecar is **not** one engine playing twelve sounds. Each Rytm track that picks a U slot gets its own voice, its own state and its own render call. All 12 tracks can use one slot, and eight voices sound at once: RS/CP, MT/HT, CH/OH and CY/CB share a voice, as they do on the Rytm.

What that means for a port:

| You get | You do not get |
|---|---|
| A different drum, and its own knob values, on each track, stored in the kit | One call that renders the whole kit |
| A pair like CH/OH sharing one voice and state, so a pair plays one at a time, the way a hat choke works | Choke groups across other tracks |
| Each track through its own analog filter, amp and sends | A shared bus, kit compressor or internal mixer: use the Rytm's and the [send effects](/sidecar-expander/using/send-effects/) |
| Every drum on a track paying for itself | A cheaper price because the sounds are in one kit: eight tracks cost eight voices |

### The worked example: MD (`plugins/mdkit`)

MD holds 30 drums from the [mdkit](https://github.com/soejrd/mdkit) project in one machine. Read `mdk.c`, `families.h` and `md.json`.

1. **One machine, a list knob for the drum.** P9 ENGINE picks the family (FM, PI, TRX), P10 TYPE the drum, on the SMPL page (`"page2": "params"`). P1..P8 are that drum's own controls, named through `type_labels` with `follows`. P11 is the level.
2. **State as a union.** The drums' states share one union, so a voice costs the largest drum's state: 25,968 B, under the 64 KB limit, in an image of 568 KB. Only the chosen drum renders. The other 29 cost memory in the image and no CPU.
3. **Set a drum up from zero.** On a TYPE change, `setup()` zeroes that drum's state and runs its init. `params` calls it on core 3, so it must stay short.
4. **No click on a change.** A TYPE change may arrive with the trig itself, by a p-lock. `note_on` renders the old drum's next 2 ms, fading out, under the new hit.
5. **A drum's note and gate.** `"pitch": "none"`, `"max_voices": 1`, and `note_off` does nothing: the drum's own decay ends it. Velocity scales the hit, and tuning is a knob.
6. **Another sample rate.** mdkit runs at 44.1 kHz. MD keeps that inside and resamples per voice to 48 kHz, which keeps the voices exact.

```sh
make -C plugins/mdkit FAM=md a64     # mdk_md.a64.rmp
make -C plugins/mdkit packages       # MD and its three family machines, in out/
make -C plugins/mdkit check          # runs the packages on an arm64 Mac against mdkit's own render
```

On the Mac core library, two voices on one U slot with FM BD and FM SD each rendered on their own channel, each with its own state. MD is also [built into the engine](/sidecar-expander/using/machines/#md): a voice can play it with no slot taken. A user machine needs a slot, and five exist.

## Shared state between tracks

The image's `.data` and `.bss` exist, but they are one copy for all voices of a slot, and for every slot naming the same package.

| Works | Does not work |
|---|---|
| Tables computed once in `init`, read by every voice | Anything per voice in a global |
| Tables in `const` data | One voice writing a global that another reads: core 1 and core 2 render at the same time, in no set order, and the ABI has no lock |
| The host table in a global | Writing a global from `render` in a machine with `max_voices` over 1 |

There is no way, in 0.3.2 or 0.4.0, for a machine to:

- hear another voice's audio, or the Rytm's (no sidechain, no shared bus);
- learn which track or voice it is on, or the tempo, or the step;
- produce stereo: `render` is mono;
- read card files, other than presets and pool samples;
- allocate memory.

## The package

`make a64` builds and then runs the packer. By hand:

```sh
.venv/bin/python tools/rmp_pack.py plugins/my_tone/my_tone.a64.elf plugins/my_tone/manifest.json my_tone.a64.rmp
```

The build compiles with `-mcpu=cortex-a72 -fno-pic -mcmodel=small -ffixed-x18 -mno-outline-atomics` and links with `sdk/rmp/plugin_a64.ld`. Add flags with `CFLAGS_EXTRA` and include folders with `INCS` before the `include` line.

An RMPA file is:

| Part | |
|---|---|
| Header, 96 B | magic `RMPA`, format, API, id, version, compatible_from, sizes, entry offset, relocation count, flags (`max_voices`, `pitch`), CRC-32 of the body, the data part's offset |
| Image | entry table first, code and read-only data; then, on its own page, data. Bss is zeroed at load |
| Relocations | 64-bit words, and ADRPs that reach the data part. The loader places the two parts apart: code in an executable arena, data in ordinary memory |
| Manifest | names, knobs, list names, labels |

The packer refuses static constructors, undefined symbols, other relocation types, extra loadable sections, an image over 1 MB and a bad manifest, with a message that says which.

The format number tells a host what it must understand: **3** the plain case, **4** a list that follows another (RLB2 labels), **5** a list over 16 names (0.4.0). A host that does not know a format refuses the package with "format not supported" rather than show wrong names.

At the scan, the engine checks the header, CRC, entry table, manifest, target and sizes. A Sidecar Mini package is refused on the Pi. RMP1 for the Mini comes from a plain `make`, which needs Teensyduino's `arm-none-eabi-gcc`; that was not run here. `make -C plugins/my_tone libmy_tone.dylib` builds only the Mac library, without it.

## Test on the host

Two checks, neither needs a Sidecar. Put both scripts in `plugins/my_tone/tests/`, and run them from the repository's root.

**The native library** (`native.py`): your C code built for the Mac, through the same plugin table.

```python
import os, sys
import numpy as np
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, os.path.join(REPO, "sim"))
import rmpvoice

v = rmpvoice.RmpVoice(os.path.join(REPO, "plugins", "my_tone", "libmy_tone.dylib"))
p = [0.0] * 16
p[1], p[2] = 64.0, 127.0
v.params(p)
v.note_on(69.0, 1.0)
x = v.render(4800)
print("peak", round(float(np.abs(x).max()), 3), "Hz", np.argmax(np.abs(np.fft.rfft(x))) * 10)
```

```sh
make -C plugins/my_tone libmy_tone.dylib
.venv/bin/python plugins/my_tone/tests/native.py
```

It prints `peak 0.996 Hz 440`.

**The real package in the real engine** (`core.py`). On an arm64 Mac the engine's core library runs the exact RMPA image, with the same scan, loader, slots and sound tag as on the Pi.

```python
import os, sys, tempfile, shutil
import numpy as np
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, os.path.join(REPO, "sim"))
import protocol as P
from coreengine import CoreEngine

card = tempfile.mkdtemp()
os.makedirs(card + "/Samples"); os.makedirs(card + "/Plugins")
shutil.copy(REPO + "/plugins/my_tone/my_tone.a64.rmp", card + "/Plugins/")
e = CoreEngine(card, um=True)
e.report(P.HDR + bytes([0x10]) + b"TONETEST" + b"\xf7"); e.idle()
print(e.um_command("um=assign:1:my.tone")); e.idle()
e.report(P.trig_params(0x50, 69, 100, [0, 64 << 7, 127 << 7] + [0] * 13, None)); e.idle()
a = e.frames(4800)[:, 0].astype(float)
print("peak", a.max(), "Hz", np.argmax(np.abs(np.fft.rfft(a))) * 10)
print([x for x in e.um_json() if x["t"] == "slot"][0])
```

```sh
make -C core engines lib
.venv/bin/python plugins/my_tone/tests/core.py
```

`make -C core engines lib` takes a few minutes the first time. The script prints `U1 = my.tone`, a peak, `Hz 440`, then the slot with `'state': 'READY'` and the measured `ns`. `0x50` is voice 0 on U1 (the low 3 bits are the voice, `0x50 58 60 68 70` the slots), the three P values are the knobs in 14-bit form.

For bigger checks, each ported machine has a `make check` to copy from, for example `make -C plugins/nusaw check`: it runs a chord, levels, finite output, the release and the cost on the Mac. To hear a machine against the real Rytm OS, see [Testing with the emulator](/sidecar-expander/developers/emulator-testing/).

## 0.3.2 and 0.4.0

:::caution
0.4.0 is not released. This section describes the development line and may change.
:::

The plugin ABI does not change: API 2, the same `sdk/rmp`, the same build. Packages made for 0.3.2 load on 0.4.0.

| | 0.3.2 | 0.4.0 |
|---|---|---|
| Names in a list knob | 16 | **36** |
| Package format | up to 4 | up to **5** |
| More than 16 names | the packer refuses it | packed as format 5 |
| A format 5 package on the engine | refused, "format not supported" | loads |
| Plugins scan and rescan | on the control core; can cause short dropouts during play | off the control core |

Details of the longer lists:

- Only a list over 16 names makes a format 5 package. Every other package stays format 3 or 4, so it still loads on 0.3.2.
- With a Rytm that still has 0.3.x mods, a 0.4.0 engine serves 16 names, evenly spaced over the list, each one the name its step really plays (about every 2.25th of 36). The knob's long name then ends in `16/36`, cut to its first 6 characters, like `Osc 1 16/36`. Name your long labels with that in mind. The engine logs a line asking for a mods update.
- Your plugin needs no change for this: it reads `(int)value * 36 >> 7` in both cases.
- A knob named by `type_labels` as the list that picks a label set keeps the limit of 16 names, and all the lists of `lists` together have at most 32 names.
- The example is MODEL E (`plugins/modele`, 0.4.0), with 36 oscillator range and wave pairs on P1..P3. These lists have been tested in the emulator only, not on a Rytm.

## Licence and bundling

The repository is **GPL-2.0-or-later**. The starter machines and the ported machines in `plugins/` are MIT, as each folder says. `NOTICE` lists the exceptions. This is how the project handles it; it is not legal advice.

**Porting a third-party engine:**

- Check its licence first. It must be compatible with how you will ship. No licence file means no permission: ask the author and get the answer in writing. A non-commercial clause does not fit the GPL: Noise Plethora's NC framework is why the Sidecar's NP packages are built without it.
- Keep the source's copyright and licence unchanged. In `plugins/`, that means a `LICENSE.<name>` with the upstream text and a `NOTICE` saying where the code came from (URL and commit), what you changed, and which licence covers what. `plugins/nusaw`, `plugins/raffo` and `plugins/mdkit` are the patterns.
- Say it in the manifest's `licence` field too.
- If it goes in the repository, add it to `NOTICE`. Prefer a pinned fetch or a vendored copy with its commit noted.
- Use your own names for machines. Keep out other companies' product names and anything taken from their firmware.

**Shipping a package:** keep its source and licence with it.

- `make package` in `plugins/nusaw` shows the minimum: the `.rmp`, a `LICENSE.txt` with every licence involved, the `NOTICE`, checksums.
- A package with GPL code is GPL as a whole, so its complete source goes with the binary, and whoever passes it on passes the source on too. MODEL E is GPL-2.0-or-later because of its oscillators, and its `make package` adds a source archive with everything the build reads.
- `sdk/rmp/` has no licence header of its own and is not an exception in `NOTICE`, while the plugin folders' notices call the shim MIT. If that decides whether you can ship, open an [issue](https://github.com/trigcondition/sidecar-firmware/issues) before you do.

## Limits

| | Pi | Sidecar Mini (Teensy 4.1) |
|---|---|---|
| Image | 1 MB; an upload 2 MB | 64 KB package (the store's cap) |
| Loaded, all slots | 4 MB code, 4 MB data | 32 KB arena |
| State per voice | 64 KB | 16 KB without PSRAM |
| Render call | 12 samples at 48 kHz | 12 samples at 48 kHz |
| Machines listed on the Rytm | 32 | 32 |
| Presets per machine | 127 | 127 |

A slot with the same package as another shares its image. When the arenas fill up, the engine reloads everything once; if the machine still does not fit, the slot shows `!ROOM`.

The starter set (`plugins/sc_*`: ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN) holds small, MIT-licensed examples. `tools/um_starter.sh CARD_DIR` builds all six and copies them to a card or folder.
