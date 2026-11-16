---
title: Plugin API 3
description: "Plugin API 3 for user machines and user effects on the Pi: what is built in Sidecar 0.5.0 (host header, loader, guard, arena, transport, stereo, send effects) and what is still planned (more effect positions, audio input, the signal bus, modulation hints, custom pages)."
sidebar:
  order: 4.5
  badge:
    text: partly built
    variant: tip
---

:::note[Partly built in Sidecar 0.5.0]
The host side of API 3 is built for the Pi 4 and Pi 5: `rmp_api3.h`, the loader, the guard, the slot arena, the transport snapshot, stereo output and **user effects in the send FX slots** (UFX1..UFX4). The rest is planned and marked **planned** below. Each section starts with its status. Where the engine differs from the first design, the section says what the engine does, and the names are the ones in `rmp_api3.h`. Build against [API 2](/sidecar-expander/developers/writing-user-machines/) for anything that must also run on the Sidecar Mini, which stays on API 2.
:::

For an outside developer, and their coding agent, porting ER-301 units or LXR engines on API 2. Read it to learn what is coming, then follow [Write it this way today](#write-it-this-way-today) so the port needs little work later.

| Area | API 2 | API 3 | Status in 0.5.0 |
|---|---|---|---|
| The header, discovery, capability flags | none | `rmp_api3.h`, `rmp3_host`, `rmp3_plugin` | <span class="sc-ok">built</span> |
| Loader: dual and API 3 only packages, table checks, `needs` | one table | both | <span class="sc-ok">built</span> |
| Tempo, transport, song position | none | `b->transport`, a snapshot in every block | <span class="sc-ok">built</span> |
| Memory | 64 KB of state per voice | a slot arena reserved at load | <span class="sc-ok">built</span> (pool sizes follow the board's RAM) |
| A crash in `init`, `voice_init`, `params`, `render` | the engine stops and reboots | caught, the slot is muted, the engine plays on | <span class="sc-ok">built</span>: `init` and `setup` run on the control core with a 1 ms limit, not on core 0 |
| Stereo | mono | `out_channels = 2` | <span class="sc-test">partly built</span>: PRE and POST routes; poly instances still render mono |
| Effects | none | `RMP3_KIND_EFFECT` in the send FX slots UFX1..UFX4 | <span class="sc-ok">built</span> |
| Effects on INSERT, bus and master positions | none | `places` | <span class="sc-plan">planned</span> |
| Audio input (`aux`) | none | `aux_channels`, `b->aux` | <span class="sc-plan">planned</span> |
| Reading another slot | none | a signal bus, one block late | <span class="sc-plan">planned</span> |
| Modulation of P1..P16 | the host's LFOs, `params` at most every 5 ms | `b->p`, manifest hints | <span class="sc-test">partly built</span>: the LFOs as before; `b->p` only for effects in a send slot; hints, CCs, PERF macros, envelope followers and morph scenes <span class="sc-plan">planned</span> (morph is off in 0.5.0) |
| Own pages | labels only | declared pages, no drawing code | <span class="sc-plan">planned</span> |
| Recovering from an endless loop | reboot | core 0 watches core 3, the slot is skipped | <span class="sc-plan">planned</span> |
| A muted slot shown as MUTED on the Rytm | none | a slot state | <span class="sc-plan">planned</span>: the web page's JSON and the log say `muted` and why; the Rytm sees the slot READY and silent |

For the shipped effects and how to put one in a slot, see [User effects](/sidecar-expander/using/user-effects/). The sources of the examples and of the shipped effects are the `plugins/ufx_*` folders in the firmware repository.

Sidecar Mini (Teensy) stays on API 2. API 3 is for the Pi 4 and Pi 5.

## The rules that do not change

**Status:** <span class="sc-ok">built</span>. The guard catches faults and overruns in every plugin call; it does not catch stray writes.

- **`render` runs in real time.** No waiting, no locks, no logging, no card, no allocator. A render core that misses 20 ms stops the engine.
- **Core 3 has 2 ms.** The output FIFO holds 96 frames, 2 ms. Every control call eats that budget.
- **No card access from a plugin, from any call.** Sound data comes through the pool, presets through `load_entry`. API 3 adds no file API.
- **Plugins run privileged.** The guard catches faults and overruns, not stray writes.
- **No static constructors, no host symbols.** The [rules of the build](/sidecar-expander/developers/writing-user-machines/#rules-of-the-build) stay.

### Budgets

From the current engine, on a Pi 4 at 1500 MHz. Numbers marked built below are limits the 0.5.0 engine enforces.

| | Number | Source |
|---|---|---|
| Block | 12 frames, 250 µs | fixed |
| Voice budget | 125 µs (50 % of a block), scaled by 1500 / clock | the guard |
| A core counts as overloaded | 200 µs (80 % of a block) | the guard |
| A machine meant for every voice | under 50 µs a block; four voices share a core | measured advice |
| A drum kit, eight voices | under 30 µs each (120 µs a core, room for the send FX on core 2) | proposed |
| `cpu_permille` | × 0.158 % of a Pi 4 core: 25 is about 10 µs | the poly track budget |
| Built-in AMP, one slot | about 4 % of a core, 10 µs | boot bench |
| Two CLOUDSEEDs | about 13 % of core 2, 32 µs | measured |
| User insert | under 10 µs a block | proposed |
| User send effect | under 30 µs a block; muted after 16 calls in a row over 120 µs a 12-frame block, or one call over 2 ms | built |
| User master effect | under 30 µs a block | planned |
| A control call | aim 50 µs; three in a row over 500 µs mute the slot, one over 2 ms mutes it at once; `init` and each `setup` call over 1 ms refuse the package | built (API 3 plugins) |
| `view` | 100 µs | planned |

A Pi 5 runs at 2400 MHz, where the guard's budget is 78 µs of time. Write for the Pi 4: a machine that fits there fits both. No per-plugin benchmark of a Pi 5 against a Pi 4 exists yet.

Eight voices at the LFOs' 5 ms, 50 µs a `params` call, take 8 % of core 3. That is why modulation moves [into the block](#how-values-arrive).

| Memory | Size |
|---|---|
| Image | 1 MB; loaded, all slots: 4 MB code, 4 MB data |
| State | 64 KB, 40 of them from the heap at boot (8 voices, 32 poly instances): 2.56 MB |
| Slot arena, new | [below](#memory-the-slot-arena) |

## Versioning and capability flags

**Status:** <span class="sc-ok">built</span>. A plugin that `needs` a capability the host lacks shows the slot BAD, "needs ...". The 0.5.0 host offers `RMP3_CAP_TRANSPORT`, `RMP3_CAP_STEREO`, `RMP3_CAP_EFFECT`, `RMP3_CAP_GUARD` and, when the board has a pool, `RMP3_CAP_ARENA`. It does not offer `RMP3_CAP_AUDIO_IN`, `RMP3_CAP_BUS`, `RMP3_CAP_BLOCK_P` or `RMP3_CAP_PAGES` (<span class="sc-plan">planned</span>). In `rmp3_host`, `board` is 4 or 5 and `cpu_mhz` is 0 for now. `RMP_API3` (3) is the `api` of an API 3 only table.

Two facts of the current loader decide this:

- The scan refuses a header `api` above the host's `RMP_API`, and the entry table's `api` must equal the header's.
- `rmp_host.reserved[2..10]` and `rmp_plugin.reserved[4..7]` are NULL or unread on every API 2 host.

So there are two ways to build.

| | Table `api` | Older host | Use it for |
|---|---|---|---|
| **Dual** | 2, with `reserved[RMP_P_V3]` set | loads it as a plain API 2 machine | machines, the default |
| **API 3 only** | 3 | refuses it at the scan | effects: an older host must not load an effect as a machine |

`host->api` stays what it was for a dual plugin, so a plugin that tests `api == 2` keeps working. Discovery goes through the reserved slot.

```c
/* sdk/rmp/rmp_api3.h (excerpt) */
#include "rmp_api.h"

#define RMP3_MAGIC 0x33504D52u   /* "RMP3" */
#define RMP3_MINOR 0u            /* grows with fields added at the end; size says how many */
#define RMP_API3 3u              /* rmp_plugin.api of an API 3 only table */
#define RMP_H_V3 2               /* rmp_host.reserved[2]: const rmp3_host *, NULL on an older host */
#define RMP_P_V3 4               /* rmp_plugin.reserved[4]: const rmp3_plugin *, NULL = plain API 2 */

enum {                           /* what a host has (rmp3_host.caps), a plugin needs or wants */
  RMP3_CAP_TRANSPORT = 1u << 0,  /* b->transport */
  RMP3_CAP_ARENA     = 1u << 1,  /* the slot arena */
  RMP3_CAP_GUARD     = 1u << 2,  /* guarded setup and control calls */
  RMP3_CAP_STEREO    = 1u << 3,  /* out[1] */
  RMP3_CAP_AUDIO_IN  = 1u << 4,  /* in[], aux[] */
  RMP3_CAP_EFFECT    = 1u << 5,  /* RMP3_KIND_EFFECT */
  RMP3_CAP_BUS       = 1u << 6,  /* the signal bus */
  RMP3_CAP_BLOCK_P   = 1u << 7,  /* b->p, modulation without params() */
  RMP3_CAP_PAGES     = 1u << 8,  /* the manifest's pages */
};

typedef struct rmp3_host {       /* 96 B on AArch64 */
  uint32_t magic;                /* RMP3_MAGIC */
  uint32_t size;                 /* sizeof as the host was built: never read past it */
  uint32_t minor;
  uint32_t caps;                 /* RMP3_CAP_* */
  uint32_t board;                /* 4 or 5; 0 on the Mac's test host */
  uint32_t cpu_mhz;              /* the clock now */
  uint32_t arena_limit;          /* the most one slot's arena may be, bytes */
  uint32_t reserved0;
  void *reserved[8];
} rmp3_host;

static inline const rmp3_host *rmp3_host_of(const rmp_host *h) {
  const rmp3_host *x = h->api >= 2u ? (const rmp3_host *)h->reserved[RMP_H_V3] : (const rmp3_host *)0;
  return x && x->magic == RMP3_MAGIC ? x : (const rmp3_host *)0;
}
```

- `needs` lists what a plugin cannot run without: a host lacking one shows the slot BAD, "needs ...". `wants` lists what it uses when there. A capability is never removed once a host has it.
- Fields are only added at the end of a struct. Each side reads `size` first and never reads past the smaller of the two.
- The host checks that `reserved[RMP_P_V3]` points inside the image, that the magic holds, and that every pointer in the table does too.

The plugin's side, read once at load:

```c
enum { RMP3_KIND_MACHINE = 1u << 0, RMP3_KIND_EFFECT = 1u << 1 };
enum {                           /* where a state runs (rmp3_plugin.places, rmp3_voice.place, b->place) */
  RMP3_AT_VOICE  = 1u << 0,      /* a machine on a voice */
  RMP3_AT_INSERT = 1u << 1,      /* a voice's INSERT slot */
  RMP3_AT_BUS    = 1u << 2,      /* a bus's INSERT slot */
  RMP3_AT_SEND   = 1u << 3,      /* a send FX slot */
  RMP3_AT_MASTER = 1u << 4,      /* the master chain */
};
```

The table itself, `rmp3_plugin`, follows [the block](#the-block), which it refers to.

## The block

One new render entry. Everything a block needs is data in one struct, not calls, so nothing in `render` crosses into the host.

```c
enum { RMP3_SIG_CONTROL = 0, RMP3_SIG_AUDIO = 1 };
enum { RMP3_U_AUDIO = 0, RMP3_U_BIPOLAR = 1, RMP3_U_UNIPOLAR = 2, RMP3_U_GATE = 3 };
typedef struct rmp3_sig_decl {   /* 12 B */
  char name[8];                  /* "ENV", NUL-padded: shown in the routing UI */
  uint8_t rate;                  /* RMP3_SIG_* */
  uint8_t unit;                  /* RMP3_U_* */
  uint16_t reserved;
} rmp3_sig_decl;
typedef struct rmp3_sig_in {     /* 16 B */
  const float *audio;            /* n frames of the block before, or zeros; never NULL */
  float value;                   /* the source's value at the end of the block before, or 0 */
  uint32_t flags;                /* RMP3_SI_ROUTED: a live source is behind it */
} rmp3_sig_in;
enum { RMP3_SI_ROUTED = 1u << 0 };

enum {
  RMP3_T_RUNNING = 1u << 0,      /* the Rytm's sequencer plays */
  RMP3_T_CLOCKED = 1u << 1,      /* a MIDI clock tick came in the last 250 ms */
  RMP3_T_LOCKED  = 1u << 2,      /* song_tick follows the Rytm's song position */
  RMP3_T_START   = 1u << 3,      /* Start or Continue in this block */
  RMP3_T_STOP    = 1u << 4,      /* Stop in this block */
  RMP3_T_JUMP    = 1u << 5,      /* song_tick moved by more than the block's time */
};
typedef struct rmp3_transport {  /* 32 B */
  uint32_t flags;                /* RMP3_T_* */
  float bpm;                     /* 60e6 / (24 x tick_us); 120 until measured */
  float tick_us;                 /* one 24 ppqn tick, smoothed */
  float free_tick;               /* 0..2304, wraps; runs on at the last tempo when stopped (the LFOs' clock) */
  int32_t song_tick;             /* ticks from the song's start, SPP x 6 + ticks; RMP3_T_LOCKED only, else -1 */
  float song_frac;               /* 0..1 inside song_tick */
  uint32_t step16;               /* song_tick / 6 */
  uint32_t lead_frames;          /* frames from this block's render to the Rytm's outputs (the estimate) */
} rmp3_transport;

enum {
  RMP3_B_MONO_OUT = 1u << 0,     /* out[1] is NULL: a mono route */
  RMP3_B_WET_ONLY = 1u << 1,     /* a send slot: write only the wet signal */
};
typedef struct rmp3_block {      /* 112 B */
  uint32_t size;                 /* sizeof as the host was built */
  int32_t n;                     /* frames, 1..16; 12 on a voice */
  uint32_t flags;                /* RMP3_B_* */
  uint32_t gen;                  /* the block's number, wraps */
  float *out[2];                 /* written, not added; nominal +-1 */
  const float *in[2];            /* an effect's input; in[1] NULL when mono; NULL on a machine */
  const float *aux[2];           /* the side input the user chose, or zeros; NULL if not declared */
  const float *p;                /* P1..P16 as they play now (RMP3_CAP_BLOCK_P), else NULL */
  uint32_t p_changed;            /* bit k: P(k+1) differs from the last block */
  uint32_t place;                /* RMP3_AT_* */
  const rmp3_transport *transport;   /* the block's snapshot, never NULL */
  const rmp3_sig_in *sig_in;     /* sig_in_n entries */
  float *const *sig_audio;       /* sig_out_n pointers: n frames to write, NULL for a control signal */
  float *sig_value;              /* sig_out_n floats: written whenever it changes, kept between blocks */
} rmp3_block;

typedef struct rmp3_setup {      /* 40 B */
  const rmp_host *host;
  const rmp3_host *host3;
  void *shared;                  /* the slot's shared part, zeroed; NULL if 0 bytes */
  uint32_t shared_bytes;         /* what was granted: want, else min */
  uint32_t voice_bytes;          /* the same, per state */
  uint32_t states;               /* states reserved */
  int32_t slot;                  /* U1..U5 = 1..5, UFX1..UFX4 = 64..67, the TYPE ids */
} rmp3_setup;
typedef struct rmp3_voice {      /* 40 B */
  void *shared;
  void *arena;                   /* this state's part; not zeroed again after the load */
  uint32_t shared_bytes;
  uint32_t arena_bytes;
  int32_t slot;
  int32_t voice;                 /* 0..7, -1 on a bus, send or master position */
  int32_t instance;              /* 0.. on a poly track */
  uint32_t place;                /* RMP3_AT_* */
} rmp3_voice;

enum { RMP3_VIEW_PEAKS = 1, RMP3_VIEW_TEXT = 2 };
typedef struct rmp3_view {       /* a page's live data */
  uint8_t kind;                  /* RMP3_VIEW_* */
  uint8_t start, end;            /* the played region, 0..127 */
  uint8_t nslices;
  uint16_t columns;              /* peaks: columns used, 1..128 */
  uint8_t lines;                 /* text: lines used, 1..8 */
  uint8_t selected;              /* text: the line shown inverted, 255 none */
  int8_t peaks[256];             /* min, max per column, -127..127 */
  uint8_t slices[16];            /* 0..127 */
  char text[8][33];              /* NUL-terminated, 32 characters at most */
} rmp3_view;

typedef struct rmp3_plugin {     /* 136 B */
  uint32_t magic;                /* RMP3_MAGIC */
  uint32_t size;                 /* sizeof as the plugin was built */
  uint32_t minor;                /* RMP3_MINOR */
  uint32_t kind;                 /* RMP3_KIND_* */
  uint32_t needs;                /* RMP3_CAP_*: without one the slot is BAD, "needs ..." */
  uint32_t wants;                /* used when the host has it */
  uint32_t shared_min, shared_want;   /* arena: one part per slot */
  uint32_t voice_min, voice_want;     /* arena: one part per state */
  uint16_t states;               /* states to reserve, 0 = the host's default */
  uint16_t latency_frames;       /* an effect's own delay, 0..4096 */
  uint8_t out_channels;          /* 1 or 2 */
  uint8_t in_channels;           /* an effect: 1 or 2; a machine: 0 */
  uint8_t aux_channels;          /* 0, 1 or 2 */
  uint8_t places;                /* RMP3_AT_* */
  uint8_t sig_out_n, sig_in_n;   /* 0..4 each */
  uint8_t pad[6];
  const rmp3_sig_decl *sig_out;
  const rmp3_sig_decl *sig_in;
  int32_t (*setup)(const rmp3_setup *s);                  /* after init, once per slot */
  void (*voice_attach)(void *state, const rmp3_voice *v); /* after voice_init */
  void (*render)(void *state, const rmp3_block *b);       /* replaces rmp_plugin.render */
  int32_t (*view)(void *state, int32_t id, rmp3_view *v); /* a page's live data */
  void *reserved[4];
} rmp3_plugin;
```

The block is filled per call, on the core that calls. `rmp_plugin.note_on`, `note_off`, `params`, `load_entry`, `voice_enter` and `voice_leave` stay as they are. In an API 3 only table `rmp_plugin.render` is NULL. An effect's `note_on` and `note_off` may be NULL too; on a voice's INSERT slot, when set, they get that voice's trigs.

Write `render` for any `n`. A voice gets 12, an effect up to 16.

## Host services: tempo, transport, song position

**Status:** <span class="sc-ok">built</span>. `b->transport` is in every block. The structure is `rmp3_transport` with the flags `RMP3_T_RUNNING`, `CLOCKED`, `LOCKED`, `START`, `STOP` and `JUMP`; `lead_frames` is the estimate of 385. Bar length and the time signature are not reported (<span class="sc-plan">planned</span>, they would need a Rytm change).

**Before 0.5.0** the engine had the clock but gave it to no plugin. Core 3 reads the Rytm's MIDI realtime bytes and song position (F8, FA, FB, FC, F2), keeps a tick length and a position, and the LFOs and GRANULAR read them.

**Built:** `b->transport`, a snapshot.

| | |
|---|---|
| Written by | core 3, once per block, before it starts the block |
| Read by | render cores 1 and 2, during the block: every voice of a block sees the same values |
| After the block (bus, send, master effects on core 2) | the snapshot of the block that last finished; the host keeps two and hands out the stable one |
| How often | once per block, 4000 a second on average; blocks come in bursts paced by the FIFO, so do not treat them as a clock |
| Underlying clock | updated about once a millisecond, ticks at 24 ppqn, tempo smoothed |

- **Tempo:** use `tick_us`. It is smoothed. For a synced delay time, derive it from `tick_us`, not from differences of position.
- **Phase:** `free_tick` always runs, also when stopped, as the host's LFOs do. It wraps at 2304 ticks. `song_tick` is valid only with `RMP3_T_LOCKED`.
- **Jumps:** a Start, a song position change or a Continue sets a flag for one block. Resync on `RMP3_T_START` or `RMP3_T_JUMP`.
- **Timing:** a block sounds `lead_frames` after its render: the FIFO's 96 frames plus the Rytm's 289-frame loop, 385 frames in all, about 8 ms. To land a slice on the beat, aim that far ahead.
- **Not there:** the Rytm reports no bar length, no pattern length and no time signature. `step16` is a position from the song's start, not the Rytm's page and step. The track number of a shared voice is not reported either: RS/CP, MT/HT, CH/OH and CY/CB share a voice, and the trig does not say which.

`voice`, `instance` and `slot` come once, in `voice_attach`.

## Memory: the slot arena

**Status:** <span class="sc-ok">built</span>. The pool is `plugram=` MB (the defaults in the table below; none under 2 GB), a slot's arena is at most a quarter of the pool, and the same sizes hold on the Pi 4 and the Pi 5. `states` defaults to 8 for a machine, 40 for a poly machine (the `RMP_HF_INSTANCES` flag) and 2 for an effect.

One arena per slot, reserved when the slot loads, before `setup`. `render` never asks for memory: there is no call to ask with.

```text
slot arena = shared part + states × voice part
```

- **The pool:** one block of `plugram=` MB, taken from the heap at boot, before the pool RAM. It has to be one boot-time block: Circle does not reuse a freed block over 512 KB.
- **`min` and `want`:** the host grants `want`, else `min`, else the slot shows `!ROOM`. Read what you got: a plugin sizes its buffers from `arena_bytes`, so the same package uses more on a bigger board.
- **Load:** the arena is zeroed on the control core in pieces of 256 KB, one in each idle step, and the slot stays LOADING meanwhile.
- **Reuse:** when a slot loads again, empties or takes another plugin, its block goes to the top of the pool or to a short list of free blocks that a later load reuses. Only when the free space is there but in pieces does a load reload every slot.
- **States:** default 8 for a machine, 40 for a package with the `RMP_HF_INSTANCES` flag (a poly machine), 2 for an effect. A voice past `states` stays silent, and the slot says so in words ("no room: ..."). `rmp3_voice.instance` is -1 for a voice's own state and the arena part of poly instance `i` is part `8 + i`.
- **No guard words:** arena parts are not cleared between occupants and an overrun into the next part is not caught.
- **After the load:** `voice_init` zeroes the state, not the arena. Keep offsets in the state, and clear what you need in pieces: the built-in send FX clear at most 24 KB a block.
- **Pointers:** the host gives them to `setup` and `voice_attach`. Keep them in the state, never in a global: slots naming one package share `.data` and `.bss`.
- **Not code:** arena memory is ordinary, not executable.

| Board RAM (Pi 4 or Pi 5) | Pool, default | One slot, at most |
|---|---|---|
| 2 GB | 64 MB | 16 MB |
| 4 GB | 128 MB | 32 MB |
| 8 GB or more | 256 MB | 64 MB |
| under 2 GB | none | a plugin that `needs` it is BAD |

The heap today holds sample RAM 256 MB, MULTISAMPLE 512 MB and pool RAM 1024 MB (3072 MB on 8 GB) at most, the pool taking what is left less 64 MB. So the arena comes out of the pool RAM on a small board.

**Pi 4 against Pi 5:** the sizes follow the RAM, not the board. What differs is speed. On the Pi 4, cores share 1 MB of L2, so several voices jumping around big buffers will miss the cache: read them in order, and measure with eight voices. Pi 5 memory speed is not measured here.

For scale: 8 s of stereo float is 3.84 MB. Today's 64 KB of state holds 0.68 s of mono float.

## Protected setup callbacks

**Status:** <span class="sc-ok">built</span>, with one difference from the first design: `init` and `setup` run on the control core (core 3) in the load's idle step, with a limit of **1 ms a call**, not in a core 0 task with 100 ms. A `setup` that needs more returns `RMP3_SETUP_MORE` and is called again from the next idle step, up to 4000 times, with the engine playing in between. The recovery from an endless loop is <span class="sc-plan">planned</span>.

**Before 0.5.0** a fault in `init`, `voice_init`, `params`, `note_on` or `note_off` ran outside the guard. The exception handler takes it as fatal, core 0 stops the stream and the Pi reboots. Only `render` on cores 1 and 2 is guarded.

**Built:** the same mechanism on the control side. The render guard already jumps back into its core's loop from the exception handler; each guarded core gets that jump buffer, and every plugin call goes through one trampoline.

| Call | Runs on | Time | A fault | Too long |
|---|---|---|---|---|
| `init`, `setup` | the control core (core 3), in the load's idle step | limit 1 ms a call; `setup` may return `RMP3_SETUP_MORE` | slot BAD, the package refused | package refused |
| `voice_init`, `voice_attach`, `voice_enter`, `voice_leave` | core 3 | aim 50 µs, limit 500 µs | every voice on the slot muted | three in a row: muted |
| `params`, `note_on`, `note_off`, `load_entry`, `view` | core 3 | the same | the same | the same |
| `render` | render core | as today | the voice muted | as today |
| effect `render` on core 2 | after the block | declared | the slot muted, returns silent | muted when core 2 is overloaded |

`setup` is where table building belongs: do it in pieces of under 1 ms and return `RMP3_SETUP_MORE` until done. A call over 1 ms is a refused package, not a stall.

**After a fault** the slot's states and shared part count as lost. The slot is muted: the web page's JSON says `muted` and why (`muted: crashed in params at +0x84`, the offset inside the code) and the log says it too. The Rytm still sees the slot READY, silent (planned as a slot state on the Rytm). A fault also mutes every slot that shares the faulting slot's image. The next assign or reload re-zeroes the states, zeroes the arena and runs `voice_init` again.

**What is caught**

- A data or instruction abort, an undefined instruction, a misaligned stack, inside the plugin's call on a guarded core.
- A call that returns late.

**What is not caught**

- Stray writes. All RAM is writable at the privilege plugins run at. A plugin can overwrite the host, and nothing will notice.
- Corrupt state that does not fault.
- A plugin that masks interrupts.
- An endless loop, at first. See below.

**An endless loop.** The baseline is a reboot. Core 3 already sees a render core miss 20 ms. New: core 0 watches core 3's heartbeat, which the crash breadcrumb already records. Either one stops the stream and reboots, and the breadcrumb, kept in RAM across the reboot, names the slot and the call. At the next boot that slot is skipped and shows `!CRASH` until it is assigned again, so a bad package cannot cause a reboot loop. Cutting the loop without a reboot needs a timer interrupt on core 3 that can leave the call: see [Open questions](#open-questions).

Host calls run inside the guard too. `log` copies its string with a bounded, fault-safe read, so a bad pointer costs the slot and leaves no host lock held.

## Stereo output

**Status:** <span class="sc-test">partly built</span>. `out_channels = 2` works on voices routed OUT PRE and POST (`out[1]` is written), and on TRK `out[1]` is NULL and `RMP3_B_MONO_OUT` is set. Poly instances of a stereo plugin still render mono (`out[1]` is NULL for them).

**Before 0.5.0** `render` was mono, and a voice on OUT PRE or POST is a stereo pair with L = R.

**Built:** declare `out_channels = 2`.

| OUT route | `b->out` | What goes back |
|---|---|---|
| TRK | `out[1]` NULL, `RMP3_B_MONO_OUT` set | a mono mix in `out[0]`: the Rytm's track is mono |
| PRE | both | Overbridge 2/3, before the master distortion and compressor |
| POST | both | Overbridge 0/1, after them |

- With `out_channels = 1` nothing changes: the host copies L to R.
- Write a sensible mono mix on TRK, not just L. Do not assume a route: it can change while a voice plays, with an 8 ms crossfade.
- The level, the clip to ±1 and NaN to 0 apply per channel, as they do to mono today.
- The voice's INSERT chain already runs in stereo on PRE and POST. LEV, PAN and WID stay the host's.
- Poly instances of a stereo plugin still render mono in 0.5.0: their `out[1]` is NULL.
- A stereo render costs what your code costs: one voice budget, not two.

## Effects and audio input

**Status:** <span class="sc-test">partly built</span>. **Built:** effects (`kind = RMP3_KIND_EFFECT`, API 3 only) in the **send FX slots**, the UFX1..UFX4 slots (TYPE ids 64..67). **Planned:** the INSERT, bus and master positions, and audio input (`aux`). Only `RMP3_AT_SEND` is accepted today.

One design: loadable effects (the reserved UFX1..UFX4) are packages with `kind = RMP3_KIND_EFFECT`, API 3 only. Same loader, same guard, same manifest, same page format. Built-in effects stay as they are.

A project's slot map `/.rytm/fxslots/<project>.txt` names the package in UFX1..UFX4. The kit stores the tag, so a kit on a Sidecar without that effect shows `!NAME`. TYPE ids 64..67 are UFX1..UFX4. In 0.5.0 they are on the send slots only; the INSERT positions are planned. One package can sit in several positions; each position is one state.

| Position (`places`) | Status | Runs on | `n` | Input | Output | Dry / wet |
|---|---|---|---|---|---|---|
| `RMP3_AT_INSERT`, 2 slots on each of 8 voices | planned | the voice's render core, after the voice | 12 | the voice: mono on TRK, stereo on PRE / POST | replaces it | the plugin's own MIX |
| `RMP3_AT_BUS`, 2 slots on each of 3 buses | planned | core 2, after its block | up to 16 | stereo | replaces it | the plugin's own MIX |
| `RMP3_AT_SEND`, FX1 and FX2 | built | core 2, after its block | up to 16 | mono: stems × send levels. `in[1]` NULL | stereo, **wet only** (`RMP3_B_WET_ONLY`) | the track's send knob |
| `RMP3_AT_MASTER`, in a build with a master chain | planned | core 2, after the send FX | up to 16 | stereo | replaces it | the plugin's own MIX; off is bypass, bit for bit |

- **A mono voice chain and a stereo effect:** `out[1]` and `in[1]` are NULL, as for a machine on TRK. Handle it, or leave `RMP3_AT_INSERT` out of `places`.
- **In a send slot, ignore your MIX knob.** `RMP3_B_WET_ONLY` says so.
- **Fades are the host's.** A TYPE change fades (10 ms on a send, 5 ms planned on an insert), then starts a fresh state, so a new effect never clicks. Do not fade in yourself.
- **Latency:** declare `latency_frames`, 0 to 4096 (85 ms, the built-in delay line). The host does not delay anything else to match: the Rytm's 12 tracks have no common delay compensation, and a voice arriving later is your sound. Keep your own dry path aligned if you have a MIX knob.
- **Knobs (send slot, built):** the slot's P2..P5 reach the effect as P1..P4 in `b->p`, with `p_changed`. The Rytm shows the effect's own knob names (the host sends them from the manifest). P1..P8 with labels and lists, as a machine's. On a Rytm send slot only four kit words exist (P2..P5 of the send page), so P1..P4 of the effect are the ones stored in the Rytm's kit and on its knobs. P5..P8 live in the Sidecar's kit file and on host-drawn pages. An INSERT slot has four knobs on today's page.
- **Effects are guarded and budgeted** on core 2: 16 calls in a row over 120 µs a 12-frame block, or one call over 2 ms, mute the effect.
- **Installing:** `um=fx:<n>:<id>` on the console, the USER SLOTS page on the Rytm (rows UFX1..UFX4) or the Effects section of the web page's User machines card put an installed effect in UFX`n`; the assignment is kept per project in `/.rytm/fxslots/<project>.txt`.

### Audio input

**Status:** <span class="sc-plan">planned</span>. `aux_channels`, `in[]` and `aux[]` are in the header, but the host does not offer `RMP3_CAP_AUDIO_IN`.

A machine or an effect may declare a side input with `aux_channels`: a vocoder, a sidechain key, a machine that plays the input. The user picks the source on a page. It is never the plugin's choice.

| Source | Overbridge IN | What it holds |
|---|---|---|
| AUDIO IN L, R | 10, 11 | the Rytm's input jacks |
| A stem | 2..9: BD SD RS/CP BT LT MT/HT CH/OH CY/CB | a voice after its filter and amp, before pan. Mono, no Rytm delay or reverb |
| MAIN L, R | 0, 1 | the analog mix after distortion and compressor, **including what the Sidecar returns** |
| A signal | the [signal bus](#host-signal-bus) | one block late |

- The reader works as LIVE IN does: each block takes the newest frames, a short read pads silence and counts. Today that ring serves AUDIO IN only, 2048 frames. Proposed for all 12 channels: 96 KB.
- **Latency:** the Sidecar adds the FIFO's 96 frames plus at most a block. AUDIO IN to the Rytm's outputs is 385 to 397 frames, 8.0 to 8.3 ms, inferred from the measured 289-frame loop.
- **MAIN is a feedback loop.** Both returns come back on it: measured POST -10.9 dB, PRE -2.0 dB, 282 frames round. The host applies LIVE IN's feedback guard, and refuses MAIN as the input of the master chain.
- **A voice's own stem** is a loop through the Rytm. The host refuses that route.
- An empty or refused source reads zeros. `b->aux` is never a dangling pointer.

## Host signal bus

**Status:** <span class="sc-plan">planned</span>. `sig_out`, `sig_in` and the block's signal fields are in the header. The host does not offer `RMP3_CAP_BUS`: a plugin that declares signals gets silence in and a sink out, and a plugin that `needs` the bus is refused.

Slots exchange audio and control signals through the host, never through shared globals. The ABI hooks come now; the routing UI comes later. Until then a route is set on the console, and an unrouted input reads silence.

- **Publisher:** a voice on a U slot, or an effect position. At most 16 publishers: 8 voices and 8 effect positions.
- **Declared:** 1 to 4 signals out and 0 to 4 in, in `sig_out` and `sig_in`. Each has a name, a rate and a unit.
- **Audio rate:** write `b->sig_audio[i][0..n-1]`. 12 frames.
- **Control rate:** write `b->sig_value[i]`. It holds until you write it again.
- **Read:** `b->sig_in[i].audio` and `.value`. Both are always valid.

```text
block g:    publishers write bank g & 1          readers read bank (g - 1) & 1
block g+1:  publishers write bank (g+1) & 1      readers read what g wrote
```

- **Double-buffered, one block late, always.** Also on the same core: render order never changes the sound. All of a block's voices finish before the next block starts, so banks need no lock and no swap, only the block number.
- **An empty source reads silence.** No voice on it, muted, not rendered this block, or no route: the host points the reader at a zero buffer and clears `RMP3_SI_ROUTED`.
- **A control signal read as audio** is held over the block. **An audio signal read as control** is its last sample.
- **Off the block:** bus, send and master positions run after their block, for up to 16 frames at a time, and are not in step with it. They publish and read at control rate only. An audio-rate declaration there reads as control.
- **Poly:** on a poly track only the first sounding instance publishes.
- **Size:** 16 publishers × 4 signals × 12 frames × 2 banks is 4.6 KB.
- **Routes** are stored per kit: `{reader, input, source, signal, gain}`.

A published control signal is also a [modulation source](#host-side-modulation).

## Host-side modulation

**Status:** <span class="sc-test">partly built</span>. The Sidecar's LFOs (26 on the Pi in 0.5.0) move P1..P16 of user machines through `params`, as before. `b->p` and `p_changed` are handed to **effects in a send slot** (the slot's P2..P5 as P1..P4), without `RMP3_CAP_BLOCK_P`. Machines do not get `b->p` yet. The manifest's `mod` hints, CCs, PERF macros, envelope followers and trigs as sources are <span class="sc-plan">planned</span>. Morph scenes are <span class="sc-plan">planned</span> too: morph is off in 0.5.0.

One modulation layer in the host, shared with morph scenes. No plugin cooperation is needed: every plugin, API 1 and 2 included, can be modulated on P1..P16.

| Source | State |
|---|---|
| The Sidecar's LFOs, 8 | exist; targets V1..V8 P1..P16 work on user machines today |
| CCs, PERF macros | planned |
| Envelope followers on a stem or a signal | planned, computed by the host |
| Trigs, a host envelope per track | planned |
| Morph scenes, 12 per kit | planned |
| Published control signals | through the bus |

The value that plays is the base (the Rytm's knob or p-lock) plus every offset, kept in range. It runs on core 3, once a millisecond at most, inside the 2 ms budget. Modulated values are never written back to the Rytm and never saved. The manual move wins until the fader moves, and list knobs do not change their shown labels.

### What a plugin declares

Per knob in `manifest.json`, all optional.

| Key | Values | Default | |
|---|---|---|---|
| `mod` | `cont`, `step`, `trig`, `off` | `cont`; `step` for `look: list`; `off` for `text: preset` and `pool` | `step` switches at the halfway point of a morph, `trig` takes the value at the next trig only, `off` hides the knob from targets |
| `mod_lo`, `mod_hi` | 0..127 | the knob's `min`, `max` | the modulated value stays inside, narrower than the knob's own range if the knob is safe only there |
| `smooth_ms` | 0.1..100 | 3 | the host's ramp to a new value on `cont`. 3 ms is what INSERT parameters use |

```c
enum { RMP3_MOD_CONT = 0, RMP3_MOD_STEP = 1, RMP3_MOD_TRIG = 2, RMP3_MOD_OFF = 3 };
typedef struct rmp3_knob_hint {  /* 6 B, packed from the manifest */
  uint8_t p;                     /* 1..16 */
  uint8_t mode;                  /* RMP3_MOD_* */
  uint8_t lo, hi;                /* the modulated value stays in lo..hi */
  uint16_t smooth_us;            /* 0 = the host's 3 ms */
} rmp3_knob_hint;
```

### How values arrive

| | Trig, p-lock, knob | A modulated value |
|---|---|---|
| No `RMP3_CAP_BLOCK_P` | `params` | `params`, at most every 5 ms, on core 3, as today |
| `RMP3_CAP_BLOCK_P` wanted | `params` | `b->p`, ramped per block on the render core; `b->p_changed` says which moved. No control call |

With `b->p`, recompute only what `p_changed` names, and keep that work inside the voice budget. Do not run `powf` on 16 knobs in a block.

Build the machine for a value that moves. Do not rebuild tables, reallocate or restart on a `cont` knob. If a knob restarts something, declare it `step` or `trig`.

## Custom pages

**Status:** <span class="sc-plan">planned</span>. `rmp3_page`, `rmp3_cell`, `rmp3_view` and the `view` call are in the header as declarations only. The host does not offer `RMP3_CAP_PAGES` and never calls `view`. A user machine's page is still the stock SRC page with its manifest labels.

A plugin declares its pages as data. It ships no drawing code, and it needs no Rytm flash: the Rytm side stays blit and input, and all layout is host code.

### What the remote UI allows today

| | |
|---|---|
| Screen | 128x64, 1 bit, sent as 8x8 tiles; a frame shows only when whole (`38`, `39`) |
| Text | 64 slots of 32 characters, drawn by the Rytm in its fonts 0..16, left, centred or right, inverted or not (`3D`) |
| Rate | the Rytm draws at 20 Hz. The host sends at most every 25 ms, 8 ms after a key or a turn. The wire to the panel carries about 1560 tiles a second, 12 full frames (inferred, not measured on hardware) |
| Input | encoders A..H and LEVEL as deltas with FUNC, their pushes, and the keys in the catch mask (`37`). RECORD, PLAY and STOP are always the Rytm's |
| Local echo | one value per encoder, shown by the Rytm before the round trip (`3F`) |
| LEDs | T1..T16, palette 0..111, while a page is open (`34`) |
| SRC view | the host's frame over the stock SRC page, **nothing caught**: knobs A..H edit P1..P8 of the kit as ever, pushes are reported, P1..P16 come back in `2A` |
| Lost host | the Rytm goes back to stock after 1 s without a message |
| Not possible | grey levels, animation beyond frames, own fonts, code on the Rytm per plugin |

Today a user machine has no page: the stock SRC page shows its manifest labels. Built-in machines use the `Cell` and `Page` structs in [Remote UI pages](/sidecar-expander/developers/remote-ui-pages/#page-declarations). This spec loads that format from a package.

### The spec

In `manifest.json`, `pages`. The JSON follows the existing page format; `machine` is implied.

```json
{
  "pages": [{
    "title": "GLITCH",
    "enc": [0, 1, 2, 3, 4, 5, 6, 7],
    "label": ["SIZE", "RPT", "RATE", "REV", "DRFT", "WIN", "MIX", "LEV"],
    "cells": [
      {"kind": "waveform", "at": [0, 0, 2, 1], "view": 0, "in": [0, 1]},
      {"kind": "enum",     "at": [2, 0, 1, 1], "in": [2], "names": ["1/16", "1/8", "1/4"]},
      {"kind": "knob",     "at": [3, 0, 1, 1], "in": [3]},
      {"kind": "knob",     "at": [0, 1, 1, 1], "in": [4]},
      {"kind": "knob",     "at": [1, 1, 1, 1], "in": [5]},
      {"kind": "knob",     "at": [2, 1, 1, 1], "in": [6]},
      {"kind": "meter",    "at": [3, 1, 1, 1], "sig": 0}
    ],
    "touch": [
      {"kind": "waveform", "at": [0, 0, 8, 3], "view": 0, "in": [0, 1]},
      {"kind": "meter",    "at": [0, 3, 8, 1], "sig": 0}
    ]
  }]
}
```

| Widget | Binds | Draws | Exists |
|---|---|---|---|
| `knob`, `knobbi` | `in[0]` | a ring and a value; `knobbi` from the centre | yes |
| `bar`, `pan` | `in[0]` | a level; a pan | yes |
| `enum` | `in[0]`, `names` or the knob's own list | the selected name and a position mark | yes (`kList`) |
| `filter`, `env`, `wave`, `lfo` | `in[]`, `arg` | a response, an envelope, an oscillator shape, an LFO shape | yes |
| `waveform` | `view`, `in[0..1]` start and end | min and max per column, slices, the played region | yes (`kSample`) |
| `text` | `view` | up to 8 lines | yes (`kText`) |
| `meter` | `sig` | a level from a published signal | new |
| `list` | `view` or `names`, `in[0]` | rows with the selected one inverted, scrolled | new |

Live data comes from `view`, a control call: `int32_t view(void *state, int32_t id, rmp3_view *v)`. It runs between blocks like any control call, so it needs no lock. The host calls it only while the page shows, on the state of the selected track's voice. Return 0 when filled, nonzero to keep the last one.

- **Parameter binding:** `in` and `enc` name P numbers 0..15 (P1 = 0). A turn goes through the path a Rytm knob takes, so kits, p-locks and the hold logic behave as ever.
- **The SRC view binds by position:** on page 0, `enc` must be 0..7 in order, because the Rytm's knobs edit P1..P8 there whatever the page says. The packer refuses anything else.
- **Further pages** appear in the Sidecar's page ring while the selected track plays that slot. There the host catches the encoders, so they may bind any P.
- **Labels:** 4 characters under the encoders, 11 in the title. Labels from `type_labels` win over `label`.

### Limits

| | |
|---|---|
| Pages | 8 a package |
| Cells | 12 a page per layout (`kMaxCells`), a page block under 8 KB in all |
| Text | 24 slots for a page's cells; the host keeps title, bottom bar, labels and values |
| Static cells | redrawn only when an input changes |
| Live cells (`sig`, `view`) | at most 10 Hz on either screen, at most 2 a page on the Rytm |
| Tiles | 40 a frame for live cells. Past that the host lowers the rate of live cells; keys and turns are never held back |
| Drawing | on core 3, inside its 2 ms |

### Screen sizes

| Screen | Grid | Cell, about |
|---|---|---|
| Rytm remote, 128x64 | 4 × 2 | 32 × 22 px, title and bottom bars around it |
| Touch 800x480 | 8 × 4 | 43 × 27 dots (OLED theme) |
| Touch 1024x600 | 8 × 4 | 57 × 42 dots |
| Touch 1280x720 | 8 × 4 | 73 × 57 dots |

`cells` is the Rytm's layout and `touch` the touchscreen's: one grid at all three sizes, drawn in the VOICE page's machine panel, under the eight knobs that page always shows. The themes keep the 42 px smallest target. Without `touch`, a Rytm cell spans 2 × 2 touch cells.

### Fallback

| Host | What shows |
|---|---|
| Without API 3 | the manifest's labels on the stock SRC page; the pages block is never read |
| API 3, a package without pages | a page made from the manifest: P1..P8 as knobs and lists, P9..P16 on a second page |
| A Rytm build without the SRC view | the pages in the page ring |
| A widget this host does not know | the cell's `fallback` kind, else a knob when it has `in[0]`, else an empty frame |

```c
enum {
  RMP3_W_KNOB, RMP3_W_KNOBBI, RMP3_W_BAR, RMP3_W_PAN, RMP3_W_ENUM, RMP3_W_FILTER, RMP3_W_ENV, RMP3_W_WAVE, RMP3_W_LFO,
  RMP3_W_WAVEFORM, RMP3_W_TEXT, RMP3_W_METER, RMP3_W_LIST
};
typedef struct rmp3_cell {       /* 16 B */
  uint8_t kind;                  /* RMP3_W_* */
  uint8_t fallback;              /* the kind an older host draws instead */
  uint8_t col, row, cols, rows;
  uint8_t in[4];                 /* P numbers 0..15, 255 unused */
  uint8_t arg;                   /* per kind, as core/ui/page.h */
  uint8_t sig;                   /* meter: signal 0..3 of this state, 255 none */
  uint8_t view;                  /* waveform, text, list: view id, 255 none */
  uint8_t flags;
  uint16_t names;                /* offset of '\0'-separated names in the block, 0 none */
} rmp3_cell;
typedef struct rmp3_page {       /* 64 B, then nrytm + ntouch cells */
  char title[12];
  uint8_t nrytm, ntouch;
  uint8_t flags;
  uint8_t reserved;
  uint8_t enc[8];                /* encoder A..H -> P number 0..15, 255 none */
  char label[8][5];
} rmp3_page;
```

## Compatibility

**Status:** <span class="sc-ok">built</span>. A test plays every API 2 package in the repository through the 0.5.0 host and compares the sound with the API 2 host's: the results are identical.

- **API 1 and API 2 plugins keep working, unchanged and not rebuilt.** `RMP_API_MIN` stays 1, every table stays its size, and format 3..5 packages load as they do.
- **An unchanged plugin on an API 3 host gains** guarded control calls, host modulation and a page made from its manifest. It stays mono, with no arena and no clock.
- **The `id` stays.** A new id orphans users' sounds through the sound tag. Add `compatible_from` as usual. Keep P numbers stable; add new ones at the end.

### One package for both

Build a dual package: an API 2 table with one extra pointer. On an older host the pointer is never read.

```c
static const rmp3_plugin g3 = {
  .magic = RMP3_MAGIC, .size = sizeof(rmp3_plugin), .minor = RMP3_MINOR,
  .kind = RMP3_KIND_MACHINE, .places = RMP3_AT_VOICE,
  .wants = RMP3_CAP_TRANSPORT | RMP3_CAP_ARENA | RMP3_CAP_STEREO,
  .voice_min = 1u << 20, .voice_want = 4u << 20,
  .out_channels = 2,
  .voice_attach = g_attach, .render = g_render3,
};

RMP_ENTRY const rmp_plugin rmp_entry = {
  .magic = RMP_PLUGIN_MAGIC,
  .api = 2u,                     /* a literal, not RMP_API: an api 3 table is refused by older hosts */
  .state_bytes = sizeof(st), .cpu_permille = 25,
  .init = g_init, .voice_init = g_voice_init, .note_on = g_note_on, .note_off = g_note_off,
  .params = g_params, .render = g_render,   /* API 2: mono, 64 KB */
  .reserved = { [RMP_P_V3] = RMP_FN(&g3) },
};
```

An API 3 host calls `g3.render` and never the old one. An older host calls `g_render`.

| Package part | Change | Why an older host is safe |
|---|---|---|
| Entry table | `reserved[4]` set | it never reads `[4..7]` |
| Header `api`, `format` | stay 2, and 3..5 | no new number to refuse |
| Manifest | a new block `RX31`, inside `manifest_size`, after the name table and before any `RLB1` / `RLB2` block, with its own footer (u32 length, magic) | it reads the knobs and the name table, and finds labels by the footer at the manifest's end |
| `manifest.json` | new keys `pages`, `mod`, `mod_lo`, `mod_hi`, `smooth_ms` | the packer is the new SDK's; the old one refuses unknown keys |

## Write it this way today

**Status:** the advice holds. The arena, the transport and stereo exist now, so steps 3 and 5 can use them; the others (audio input, the bus, pages) do not yet.

Do these now, on API 2. The retrofit then touches one file.

1. **Keep DSP and host glue apart.** No `rmp_*` type in the DSP. One glue file per API.
2. **Keep everything mutable in one struct,** with no globals except constants. Your memory is `state_bytes`, zeroed.
3. **Reach big buffers through a pointer and a length,** set in `voice_init` to an array in the state. An arena later changes one line.
4. **Render any block size.** `n` can be anything up to `max_block`. An engine with its own block size keeps its fill index in the state.
5. **Take `r` and `in` pointers that may be NULL,** and call `dsp_tempo` even if nothing does yet.
6. **Keep parameter tables in data,** with one pure function from a knob to a value. The manifest, the page and the modulation hints are then generated or checked from one table.
7. **Keep control calls short.** Build tables in `init`, and compute in pieces.
8. **Write `.api = 2u` literally.**
9. **Assume P moves** at any time, during a note, in steps of 5 ms today and per block later.

```c
/* dsp.h: no rmp_*.h here. It builds and tests on a Mac alone. */
typedef struct dsp {
  float rate, tick_us, *buf;
  uint32_t buf_len, pos;
  int running;
  float p[16];
} dsp;
typedef struct knob_map { float lo, hi; int curve; } knob_map;   /* one row per P: data, not code */
void dsp_reset(dsp *d, float rate, float *buf, uint32_t buf_len);
void dsp_param(dsp *d, int k, float value);                       /* value 0..127, pure mapping */
void dsp_trig(dsp *d, float note, float velocity);
void dsp_tempo(dsp *d, float tick_us, int running);               /* no caller on API 2 */
void dsp_render(dsp *d, float *l, float *r, const float *in, int n);   /* r, in may be NULL */
```

```c
/* glue2.c: all of API 2 */
typedef struct st { dsp d; float mem[8192]; } st;
static float g_rate;
static int32_t g_init(const rmp_host *h) { g_rate = h->sample_rate; return 0; }
static void g_voice_init(void *s) { st *x = s; dsp_reset(&x->d, g_rate, x->mem, 8192); }
static void g_params(void *s, const float *p) { for (int k = 0; k < 16; ++k) dsp_param(&((st *)s)->d, k, p[k]); }
static void g_note_on(void *s, float note, float v) { dsp_trig(&((st *)s)->d, note, v); }
static void g_note_off(void *s) { (void)s; }
static void g_render(void *s, float *out, int32_t n) { dsp_render(&((st *)s)->d, out, 0, 0, n); }
```

```c
/* glue3.c: the retrofit, later */
static void g_attach(void *s, const rmp3_voice *v) {
  st *x = s;
  if (v->arena) x->d.buf = v->arena, x->d.buf_len = v->arena_bytes / sizeof(float);
}
static void g_render3(void *s, const rmp3_block *b) {
  st *x = s;
  dsp_tempo(&x->d, b->transport->tick_us, (b->transport->flags & RMP3_T_RUNNING) != 0);
  dsp_render(&x->d, b->out[0], b->out[1], 0, b->n);
}
```

## Worked examples

**Status:** the two examples are design sketches, not shipped code. Shipped effects are PHASER, BBD, NIMBUS and GALACTIC, and PINGPONG is the tempo-synced stereo delay used as the example in the firmware repository (`plugins/ufx_*`).

These are shapes, not ported code. Before a port, check the project's licence: see [Licence and bundling](/sidecar-expander/developers/writing-user-machines/#licence-and-bundling). Use your own names. The ER-301's graph of units and its Lua layer are out of scope: a port is one unit, or one fixed chain, as C or C++.

### An ER-301 glitch unit

A repeat and slice effect over a recent buffer.

| | API 2 today | API 3 |
|---|---|---|
| Kind | a machine, over a pool sample or a built-in buffer | `RMP3_KIND_EFFECT`, API 3 only, on `INSERT`, `BUS`, `SEND` |
| Buffer | 64 KB of state: 0.68 s mono | `voice_min` 2 MB, `voice_want` 8 MB: 5 to 21 s of stereo, cleared in pieces |
| Timing | a free RATE knob | `tick_us`, slices on `RMP3_T_START` and `step16`, aimed `lead_frames` ahead |
| Trig | `note_on` on the track | the voice's trigs on `INSERT`; a `sig_in` gate on a bus or send |
| Stereo | no | `in_channels = 2`, `out_channels = 2`, NULL `[1]` handled on TRK |
| Modulation | `params` every 5 ms | SIZE `cont`, RATE `step`, REPEAT `trig`, `RMP3_CAP_BLOCK_P` |
| Publishes | - | control `SLCE`, a gate on each new slice |
| Page | labels | `waveform` of the buffer by `view`, `enum` RATE, `meter` |
| Budget | | under 10 µs on `INSERT`, 25 permille: two cursors, a short crossfade |

### An LXR drum voice

One drum per track, as on [one track, one voice](/sidecar-expander/developers/writing-user-machines/#a-drum-engine-one-track-one-voice).

| | API 2 today | API 3 |
|---|---|---|
| Kind | a machine, `"pitch": "none"`, `"max_voices": 1` | the same, dual |
| State | one struct under 64 KB; a TYPE list picks the voice, `type_labels` names the knobs | the same, with no arena |
| Its LFO | own code, free-running | `tick_us`, or leave it to the host's LFOs and drop it from the port |
| Velocity | `note_on` | the same |
| Stereo | no | `out_channels = 2` for its pan on PRE / POST; a mono mix on TRK |
| Kit bus | not possible | `sig_out` `ENV` control from a kick, read by a snare or a send effect to duck, one block late |
| Modulation | `params` | filter and decay `cont`, type `step`, transient `trig` |
| Page | labels | `env`, `filter`, `wave`, knobs |
| Budget | under 30 µs a block | the same; eight voices fill 120 µs a core |

What stays impossible on both: one call that renders the whole kit, and choke groups across tracks. A pair like CH/OH still shares a voice.

## Open questions

Answered by the 0.5.0 engine: **2** (`init` and `setup` run on the control core with a 1 ms limit, in pieces) and **9** (effect faults on core 2 are caught and mute the effect). Question 8 for a send slot: the effect gets a mono input and writes stereo wet. The rest are still open.

Plainly open, in the order they matter.

1. **Cutting an endless loop on core 3.** Faults are simple; a loop needs a timer interrupt that can leave a plugin's call, and none is built. Without it the answer is a reboot, then the slot skipped. Is that enough?
2. **Where `setup` runs.** 100 ms in a core 0 task delays card service and the web. USB runs in interrupts and should not notice. Not measured. A slower limit in pieces is the fallback.
3. **Bars and patterns.** The Rytm reports no bar length or pattern length. Does a Rytm mod report them, or does the plugin take a BAR knob? That would need a flash.
4. **Clock quality.** MIDI clock over USB has jitter, not measured here. `lead_frames` is an estimate, and on hardware it is untested for sample-tight slices.
5. **Arena defaults.** 64, 128 and 256 MB are a first guess, and they take from the pool RAM on a 2 GB board. `states` for poly machines is a blunt tool. Pi 5 boards over 8 GB are not checked.
6. **Off-block positions on the bus.** Bus, send and master effects run out of step with the block, so they are control-rate only. Is that enough for a sidechain from a send effect?
7. **Effect knobs.** Only four kit words exist on a send slot, and four knobs on today's INSERT page. P5..P8 in the Sidecar's kit file means two places for one sound.
8. **Stereo on a mono chain.** NULL `[1]` asks every effect to handle a mono case. Should the host sum instead?
9. **Effect faults on core 2.** Today's guard wraps voices only, and overloads from send FX mute nothing. It needs a new guard entry, and a rule for what is muted when one effect is in several positions.
10. **Modulation cost.** Block-rate `b->p` adds work on the render cores for every active target, and envelope followers add more. Not measured with a full matrix and morph.
11. **Page cost and reach.** The 1560 tiles a second is inferred, and the 10 Hz and 40 tile limits are guesses until measured on a Rytm. Reaching page 2 from the SRC view needs a gesture; the ring is the only one proposed.
12. **Poly and the bus.** "First sounding instance publishes" is simple, and wrong for some chords.
13. **Latency.** No delay compensation across voices is proposed. A plugin with long latency sounds late, and only its author can tell.
