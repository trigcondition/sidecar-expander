---
title: Architecture
description: The shared core, the Pi engine on Circle, the Teensy host build, and the Rytm mods.
sidebar:
  order: 1
---

Sidecar has three code bases: the **engine** (one shared core with a Teensy, a Pi and a Mac port), the **Rytm mods** (built on elekloader), and the **web tools** (the patcher and the consoles). The source of the engine and the mods follows in a later release; until then the [written offer](/sidecar-expander/about/licence/#written-offer-for-source-code) applies.

```
              USB (the Sidecar is the host, Overbridge mode)
 Analog Rytm MKII  ─────────────────────────────────────────  Sidecar (Teensy 4.1 or Pi 4B)
 ┌───────────────────────┐   audio: 12 ch in / 12 ch out      ┌──────────────────────────────┐
 │ patched OS 1.73        │ ◄────────────────────────────────► │ platform layer               │
 │  + elekloader core     │   USB MIDI: host-link SysEx        │   USB host, Overbridge, MIDI │
 │  + Sidecar mods        │   F0 7D 52 54 <cmd> ... F7         │ core/  (shared, C++17)       │
 │    EXT machines, pages │ ◄────────────────────────────────► │   voices, host link, pool,   │
 │    report trigs/knobs  │                                    │   send FX, user slots, UI    │
 └───────────────────────┘                                    └──────────────────────────────┘
```

## The audio path

- The Sidecar is the Rytm's **USB host** and runs the Overbridge stream: 48 kHz, 12 channels each way, in blocks of 7 frames (about 6857 blocks a second). The Rytm's clock paces everything.
- **Rytm to Sidecar:** MAIN L/R, the 8 voice outputs (stems), the audio inputs.
- **Sidecar to Rytm:** each Sidecar voice goes on its **voice's own Overbridge input**. The Rytm adds that input into the voice before its analog filter, so a Sidecar voice is filtered, driven and enveloped by the Rytm's analog circuitry. The send effects return on MAIN FX (before the Rytm's analog distortion and compressor) or MAIN (after them).
- An output FIFO between the render and the USB stream absorbs jitter: 96 frames (2 ms) on both boards.

## The shared core (`core/`)

Portable C++17, built from one source for the Teensy, the Pi and the Mac (tests, emulator link).

| Part | What |
|---|---|
| `platform.h`, `engine.h`, `hooks.h` | what a board provides (clock, cycle counter, log, files, sample RAM) and the core's entry points: `engine_begin`, `engine_sysex`, `render_voices`, idle work |
| `voices.*`, `machines.h` | the 8 voices and the machines; the voice byte's machine bits select PLAITS, JUNO, DAISYSP, DSP SAMPLE, DIGIDRUM, 6-OP FM or U1..U5 |
| `host_link.*`, `sysex.*`, `slots.*` | the host-link protocol in and out ([Host-link protocol](/sidecar-expander/developers/host-link-protocol/)) |
| `notes.*` | the note adapter: a stock Rytm's MIDI notes as the mods' reports |
| `main_out.h` | the voices summed on MAIN for a stock Rytm, with a fade-in and a -12 dBFS limit |
| `fx/` | the send effects (`SendFx`, header-only, no allocation) and their knob labels |
| `pool/`, `presets/` | the card index, the per-project sample pool, the JUNO and DX7 libraries |
| `user/` | the user machine glue for the Pi and the Mac (scan, slots, loading) |
| `ui/` | the remote UI: 1-bit canvas, fonts, widgets, page declarations, the remote host (in testing) |

Rules: one engine per program; one `render_voices` call per 12-frame block, or disjoint voice ranges on several cores (the Pi); the render path never allocates, blocks or logs; every new SysEx message goes through `sysex.*` with a test against the protocol reference.

## The Pi engine (`pi/engine`)

A **bare-metal kernel on Circle** for the Pi 4: no Linux, four cores with fixed roles.

| Core | Role |
|---|---|
| 0 | the USB host interrupt (Overbridge in/out), USB plug and play, the Rytm's USB MIDI, the USB-C gadget, the network and web server (Circle tasks), the display (LVGL), the recorder's card writes, the console, the watchdog |
| 1 | voices 0-3 of each block |
| 2 | voices 4-7, then the send effects |
| 3 | the control core: MIDI parsing, host-link messages and console commands into the core, block pacing, card work (FatFs, sample streaming), the remote UI host |

- **Overbridge host:** a Circle USB driver for the Rytm's streaming interfaces, with two patches to Circle's xHCI.
- **USB-C gadget:** a composite USB Audio Class 2 + USB MIDI device of our own for a computer, on the Pi's USB-C port (in testing).
- **Network and web:** Ethernet with a static link-local address, mDNS (`sidecar.local`, patched for macOS's lookups), Circle's HTTP server with at most 4 connections; Wi-Fi in testing (either/or with Ethernet).
- **Display:** LVGL 9 on core 0's loop, an 800x480 frame buffer, USB HID touch with error recovery.
- **Heap buffers:** the send effects (about 4.7 MB) and the core's large buffers are allocated from Circle's heap once at boot, so the kernel image stays small.
- **Guard:** each voice's render is timed; a voice over budget three blocks running, or one that faults, is muted while the others play. A render core that misses 20 ms is fatal: a clean stop and a reboot. A hardware watchdog covers core 0.
- **SD boot:** the card holds `sdboot.img`, a small loader patched from Circle's serial bootloader, and `engine.img` (the kernel with a checked header). sdboot checks the image and starts it after a 1 s window in which a development flasher can take over. Boot to the first audio: about 11.5 s.

## The Teensy host build (`teensy/`)

The Teensy 4.1 runs the same core in one Arduino sketch, `voiceloop`, built with the USB host transport (`RYTM_USB_HOST`): the Rytm on the 5-pin host port, the console (and in testing, USB audio) on the micro-USB device port.

- One core, so voices render in the USB host interrupt's cadence; hot code sits in ITCM, everything else in flash (`CORE_COLD`). The build checks ITCM and RAM headroom and refuses a build that grows past its limits.
- The plugin store is 4 MB of flash (LittleFS); loaded machines run from a 32 KB executable arena.
- No PSRAM is required for anything. PSRAM only adds headroom.

## The Rytm mods

The mods patch the Rytm's MAIN OS 1.73 image and nothing else (the bootloader, FPGA and other sections are untouched; the build checks they come back byte-identical).

- **elekloader** provides the code space: its Rytm core (`core-ar2`) appends a blob to the OS that is copied at early boot into a fixed 128 KB DDR area, where the larger mods live. Each mod is built as an elekloader module whose patch sites are pinned to the stock bytes they replace.
- **Patch sites, conceptually:** small detours at a few firmware entry points hand control to mod code: a hidden machine slot becomes an EXT machine (its source silenced, its trig and knob values reported); a page's key press cycles to an extra page; the sample browser's directory model gains the TEENSY folder; the SysEx router passes our messages to the mods; the screen and key path gain the remote page. Reports go out over the Rytm's own USB MIDI sender, without waiting on a busy USB link.

| Mod | What |
|---|---|
| 0021 ext | the EXT machines, their pages and reports, the user slots and the slot menu, sound fingerprints |
| 0022 router | the host-link SysEx router (from the looper experiment) |
| 0023 drive | the TEENSY folder in the sample browser, the per-project pool |
| 0025 sendfx report | sends the send levels and the FX values to the host; stores the effect knobs |
| 0026 remote UI | the remote page: blit and input only |
| 0027 elekloader | builds the image with elekloader's core and DDR area |
| 0029 sendfx UI | AMPLITUDE 2 and the SEND FX 1/2 pages, labels and stepped knobs |

Every claim on code space and every patch site is recorded in a registry with the stock bytes it expects, so a wrong address or a collision stops the build instead of patching the wrong place.
