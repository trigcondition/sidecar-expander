---
title: Experimenting with the Digitakt
description: A starting point for developers (and their AI coding agents) who want to try Digitakt support on the 0.2.0 engine.
sidebar:
  order: 10
---

:::caution[Experimental, not supported]
Nothing on this page has been tried with a Digitakt yet. It is a map for developers who want to experiment, written against the **0.2.0** engine source. Anything marked **(to verify)** is not confirmed in that source: check it on your own device. None of the commands were run while this page was written.
:::

**Getting the source.** The engine is public: [trigcondition/sidecar-firmware](https://github.com/trigcondition/sidecar-firmware). Work from the **`v0.2.0`** tag (`git clone https://github.com/trigcondition/sidecar-firmware && cd sidecar-firmware && git checkout -b digitakt v0.2.0`). File paths below are relative to that repository.

## 1. What the Sidecar is, and what "Digitakt support" can mean for now

The Sidecar is a Raspberry Pi 4 (the 0.2.0 branch also builds for the Pi 5) running a
bare-metal program built on the Circle library (no Linux). It plugs into the drum machine's
USB port and acts as its **USB host**. It speaks **Overbridge**, Elektron's multichannel audio
over USB, and **USB MIDI**. It runs extra synth "machines" (Plaits, JUNO, 6-OP FM, DaisySP,
DigiDrum, DSP SAMPLE, user plugins) and sends their audio back into the drum machine over
Overbridge. Today it is built for the **Analog Rytm MKII**. The deep integration (the Rytm's
own SIDECAR pages, choosing a machine per track, per-voice audio, parameter reports over SysEx)
needs **patched Rytm firmware ("rytm-mods")**. Nothing like that exists for the Digitakt, and
for this experiment none will be made.

The branch already has a **stock-firmware path** for the Rytm: MIDI notes on channels 1..8
play voices 0..7 (`core/notes.*`), and the voices are summed onto the Overbridge MAIN L/R
inputs (`core/main_out.h`, the Pi's `out=main`). So a realistic first Digitakt experiment is:
**the Pi sees the Digitakt, runs a clean Overbridge stream in both directions, plays Sidecar
machines from the Digitakt's MIDI notes, and sends their mix into the Digitakt's main
inputs.** No firmware changes and no Digitakt UI integration.

---

## 2. Getting set up on v0.2.0

### Get the branch
```
git clone https://github.com/trigcondition/sidecar-firmware
cd sidecar-firmware
git checkout -b digitakt v0.2.0      # your branch, starting at the 0.2.0 release
```

### Host tools (Mac)
The scripts assume a Mac. `core/engines/setup_engines.sh` uses BSD `sed -i ''`, so on Linux
it needs changes **(to verify)**.
- A C++17 compiler (`c++`), `make`, `git`.
- [uv](https://docs.astral.sh/uv/) for Python: `uv sync` creates `.venv/` from `pyproject.toml` (README).
- Node.js for the web tests and the Pi flasher (`flashy`, see `pi/circle/flash.sh`).
- Docker, for the Pi kernel.
- Homebrew `libusb` if you build the Mac Overbridge test host (below).

### Host tests (no hardware)
From the repo root:

| command | what | last line on success |
|---|---|---|
| `make -C core engines` | once: fetches and copies the engine sources (Plaits, DaisySP, DigiDrum, JUNO/AMY, sampler; **needs network the first time**, via `teensy/setup_*_lib.sh`) | - |
| `make -C core test` | every core test (plus the multi-core and the small-FX variants) | `ALL CORE TESTS PASS` |
| `make -C pi/engine/tests` | the Pi engine's portable parts (output stage, MIDI parser, guard, recorder, ...) | `ALL PI PORTABLE TESTS PASS` |
| `make -C pi/engine/tests content` | the Pi's self-test content on the core's Mac port | - |
| `c++ -std=c++17 -Wall -I teensy/libraries/RytmHost teensy/libraries/RytmHost/extras/ob_block_test.cpp -o /tmp/ob_test && /tmp/ob_test` | the Overbridge block format and descriptor scan | - |
| `make -C core lib`, then `uv run python -m unittest sim/tests/test_core_sysex.py sim/tests/test_core_stream.py sim/tests/test_core_engine.py sim/tests/test_core_sendfx.py` | the Python tests against the core (`docs/core.md`) | - |
| `node web/stream.test.mjs` (and the other `web/*.test.mjs`) | the web console tests (`web/README.md`) | - |

Run all of them once **before** you change anything and keep the output as your baseline.

### Building the Pi kernel
Source: `docs/pi-engine.md`, "Build and run", and the scripts' own header comments.
1. `pi/circle/build.sh`: builds the Docker image `rytm-circle` (`pi/circle/Dockerfile`: Debian
   bookworm and the Arm GNU Toolchain 13.3.rel1 `aarch64-none-elf`), clones Circle tag
   `Step51.1.1` into `pi/circle/build/circle` (git-ignored) and applies two USB patches from
   `pi/circle/spike2/`. The Dockerfile downloads the *aarch64-hosted* toolchain, so it expects
   an arm64 Docker host such as an Apple Silicon Mac. On x86 the toolchain URL must change **(to verify)**.
2. `pi/engine/build.sh`: makes the engine's Circle tree `pi/circle/build/circle-engine`, the
   engines, the web page, LVGL and Wi-Fi parts (some are fetched once with git), and builds
   `pi/engine/kernel8-rpi4.img`. After that, `pi/engine/build.sh kernel` rebuilds only the
   engine. The Pi 5: `RASPPI=5 pi/engine/build.sh` gives `pi/engine/kernel_2712.img` (`docs/pi5.md`).
3. The built kernel links Circle (GPLv3), so the image is GPLv3 as a whole (`docs/pi-engine.md`).

### Installing on a Pi
- **SD card set (release style):** `pi/circle/make-sd-dual.sh` builds one FAT32 card set for the
  Pi 4 and the Pi 5 (`pi/circle/out/sidecar-sd/`, copied to the root of a FAT32 MBR card). It
  needs both kernels and `pi/circle/out/sdboot.img` (`pi/circle/build-sdboot.sh`) built from a
  clean (not "dirty") tree. The ready-made 0.2.0 card set is on the
  [Raspberry Pi install page](/sidecar-expander/getting-started/install-pi/).
- **Development loop (Pi 4):** `pi/engine/build.sh kernel && CIRCLE_TREE=circle-engine pi/circle/flash.sh ../engine 45`
  uploads the kernel into RAM over the serial cable and logs 45 s to `pi/circle/out/`. The SD
  card is not changed, and the next power cycle boots the card's build again.
- **Make a build permanent:** `uv run --with pyserial python pi/circle/sdboot.py install`.
  `sdboot.py previous` swaps back to the build before.
- **Options** go on one line in `cmdline.txt` on the SD card (`sdboot.py cmdline "..."` writes it).
  For a stock (unmodified) device, use `out=main notes=on`. The defaults are `out=tracks` and
  `notes=off`, which suit the Rytm mod build (`pi/engine/kernel.cpp`, the boot defaults).

### Hardware
- Raspberry Pi 4B (the docs' measurements use a 4 GB board) with the **official 15 W (5.1 V 3 A)
  supply**. The 0.2.0 engine warns on screen and on the web page when the supply is too weak.
  The Pi 5 build also runs, but it has no `sdboot`/`flash.sh` yet (`docs/pi5.md`).
- A microSD card (FAT32, MBR).
- A 3.3 V USB-to-serial adapter for the console and flashing: GND to pin 6, adapter RX to pin 8
  (GPIO14), adapter TX to pin 10 (GPIO15), VCC not connected; the engine's console runs at
  921600 baud (`pi/circle/README.md`, `docs/pi-engine.md`). `flash.sh` looks for `/dev/cu.usbserial-*`.
- Optional: Ethernet for the web page (`http://sidecar.local`), an HDMI or DSI display.
- A Digitakt (MK1 or II) and a USB cable to one of the Pi's USB-A ports. Listen through the
  Digitakt's own outputs.

---

## 3. Map of the code that matters for a new device

### Overbridge host
| file | what | device-neutral? |
|---|---|---|
| `teensy/libraries/RytmHost/ob_block.h` | the wire format: 32-byte header (`0x07FF` host->device, `0x0700` device->host, a big-endian frame counter +7 per block, 28 unknown bytes sent as zeros), then **7 frames x N channels x int32 big-endian**. Helpers: `block_bytes()`, `channels_for(wMaxPacketSize)`, `find_layout()` (finds the alt-3 interrupt endpoints and the channel count *per direction*), `write_header`, `block_sample`, `put_be32` | mostly yes. Rytm-specific: `kPidRytmMk2 = 0x0B48`, `kChannels = 12`, `kVoiceToRytm` / `kVoiceFromRytm`, and the assumption of 4-byte samples |
| `pi/engine/ob_usb.h/.cpp` (`CObUsb`) | the Pi's Overbridge driver on Circle: `ScanDescriptors()` logs the whole configuration descriptor, `Configure()` sends SET_INTERFACE alt 0 then alt 3 on interfaces 1 and 2, keeps `oburbs` URBs in flight, `InDone()` checks headers and counter gaps, `FillOut()` builds OUT blocks, `PumpOut()` paces one OUT block per IN block (the device is the clock), `LogAllStats()` | **no**: `kBlk` is fixed at 368 B (12 channels) for *both* directions, and `ScanDescriptors()` accepts only endpoints with `wMaxPacketSize == 368` |
| `pi/circle/spike2/circle-usbdevicefactory.patch` | the hook in Circle's device factory: claims a device named `"ven1935-b48"` (VID 0x1935, PID 0x0B48) via the weak function `RytmObDeviceCreate()` in `ob_usb.cpp`. Circle names vendor devices `ven%x-%x` (Circle's `lib/usb/usbdevice.cpp` in the checkout) | no: one PID only |
| `teensy/libraries/RytmHost/RytmHost.*` | the Teensy's host driver. Already sizes IN and OUT blocks separately from `find_layout()`, but refuses more than 12 channels | partly |
| `teensy/libraries/RytmHost/extras/mac_obhost.cc` | **a Mac libusb Overbridge test host** (build line in its header; the Elektron Overbridge app must be closed). Hard-coded to the Rytm's PID, 368 B and 12 channels. The easiest place to try a new device without a Pi | no, but small |
| `pi/linux/engine/engine.c` | an older Linux/libusb spike, `#define PID 0x0b48` | no |

### Output toward the device
- `pi/engine/output.h/.cpp` (`Output`): 8 voices in, 12 Overbridge channels out (`kChannels = 12`).
  Mode `kMain` sums the voices onto MAIN L/R (channels 0, 1) through `core::MainOut`; mode
  `kTracks` puts each voice on its Rytm track's channel (`ob::kVoiceToRytm`, mod build only).
- `core/main_out.h` (`core::MainOut`): sum x0.5, **200 ms fade-in after every new stream, hard
  limit at -12 dBFS**. Keep this safety stage for any new device.

### USB MIDI and what plays the machines
- `pi/engine/kernel.cpp`: finds Circle's USB MIDI device (`umidi1`) and reads it. Circle's
  own `CUSBMIDIHostDevice` claims class 1/3 (MIDIStreaming) interfaces (`pi/circle/README.md`).
- `pi/engine/midi_in.cpp` (`MidiIn`): the byte parser (SysEx, channel messages, real-time).
- `pi/engine/cores.cpp`: `OnChannel()` passes channel messages to `core::NoteAdapter` when
  `notes=on`. `FromRytm()` switches the adapter off once the device sends any `F0 7D 52 54`
  SysEx (the mods' messages). A Digitakt never sends that, so the adapter stays on.
- `core/notes.*` (`core::NoteAdapter`): **channel N (1..8) plays voice N-1**. Note-on triggers,
  note-off releases, CC 16..31 set P1..P16. `SetMachine(v, name)` picks a voice's machine (`plaits juno daisy dsps grain dd fm`).
  Console: `:notes=1`, `:notemach=V:NAME`. Test: `core/tests/test_notes.cpp`. **This is the
  device-neutral way to drive machines.**
- `core/host_link.*`, `core/sysex.*`: the mods' SysEx protocol (`F0 7D 52 54 <cmd> ... F7`,
  `sim/protocol.py`). Rytm-mods only. A Digitakt has no use for it.
- `pi/engine/midi_filter.h`: blocks Elektron OS-update SysEx (`F0 00 20 3C <dev> 00 7E|7F ...`)
  toward the device on the computer pass-through. Keep that protection.

### Rytm-specific assumptions to fence off
- 12 channels each way, with fixed meanings: device->host channels 2..9 are the Rytm's voices
  (`InDone()` feeds them to the send FX, the scope and the recorder; `core/fx/send_fx.h`
  `kTracks = 12, kStems = 8`).
- Track names: `core/ui/remote.cpp` `kTrackName[12]`, `core/rec/rec_names.cpp`,
  `core/ui/page_scope.cpp`, `pi/ui/sidecar_ui.c` `kSendName`, `pi/engine/sidecar_gadget.cpp`,
  `pi/engine/www/index.html`.
- The USB-C gadget (`pi/engine/sidecar_gadget.*`) mirrors the Rytm's 12 channels to a computer.
- The remote UI on the Rytm screen, user-machine slots, SENDFX values: all go over the mods' SysEx.

### Device-neutral parts
`core/` voices and machines, `render_voices`, `core::NoteAdapter`, `core::MainOut`, the
`Output` FIFO and limiter, `MidiIn`, the guard and watchdog, the SD card, the web page and the
display framework.

---

## Testing without a Digitakt: the analog-emu emulator

[analog-emu](https://github.com/trigcondition/analog-emu) runs the devices' own OS on emulated
hardware, and it runs the **Digitakt MK1 (OS 1.53)** as well as the Rytm (it is a fork of
rouletrro, a Digitakt MK1 emulator). You supply the OS file for your device; it is not included
and must never be committed anywhere. Its `docs/INSTALL.md` goes from installing Rust to the
first boot; see also [Emulator testing](/sidecar-expander/developers/emulator-testing/).

What it gives you for this experiment:
- the Digitakt's screen and keys on your Mac, to set up MIDI tracks and see what the OS does;
- virtual USB MIDI ports (`rytm-emu usb in/out`), so a host on the Mac can receive the
  Digitakt's MIDI notes (Stage C) without hardware;
- the Sidecar engine's emulator link: the 0.2.0 engine can use an emulator over the network
  instead of USB (`link=tcp`, `emuhost=` in `cmdline.txt`; see `pi/engine/kernel.cpp`), and the
  emulator serves the host->device Overbridge stream with `--ob-link`. Both are built around the
  Rytm's 12-channel stream: whether they work in Digitakt mode is **(to verify)**. Extending the
  emulator's Overbridge link to the Digitakt's channel counts is a good way to work on Stage B
  before touching a real device. The emulator is open source: if something in its Digitakt mode is missing or
  broken, fix it with your agent and send the fix back as a pull request to analog-emu.

The emulator does not replace the hardware run: USB timing, descriptors and levels still have
to be measured on a real Digitakt.

## 4. Staged plan (smallest useful step first)

### Stage A: detect the Digitakt
Known from the repo's research notes (`docs/research-rytm-usb.md`, which cites Overwitch's
device table, GPL-3):
- Elektron's vendor ID is **0x1935** (also in `ob_block.h`).
- The Overwitch protocol comment the notes quote was "written for the Digitakt". The notes say
  its "24 blocks (total 8832 Bytes)" example matches a **12-channel Digitakt device->host
  stream** (block = 32 + 7 x 12 x 4 = 368 B). That points to Digitakt MK1 sending 12 channels
  to the host **(to verify)**.
- **Digitakt II** (with Digitone II) uses Overbridge "version 2.1": **3-byte samples** and
  **42 device->host tracks**. Overwitch lists them under PIDs **2859 and 2868** (0x0B2B,
  0x0B34). Which PID is the Digitakt II is **(to verify)**.
- **Not in the repo (to verify on the device):** the Digitakt MK1's PID, its host->device channel
  count, whether it uses the same interfaces/endpoints as the Rytm (interface 1/2, alt 3,
  interrupt 0x83/0x03, MIDI on interface 5), its `wMaxPacketSize` and `bInterval`, that it is a
  USB High Speed device, and the Digitakt II's host->device count.

Steps:
1. On the Mac: read the descriptors with the Digitakt in Overbridge mode (System Information or
   a small libusb program; `lsusb -v` on Linux) **(to verify which tool works best)**. Write down
   VID, PID, interfaces, alt settings, endpoints, `wMaxPacketSize`, `bInterval`, and the MIDI interface class.
2. Add a host test to `ob_block_test.cpp`: feed `find_layout()` the dumped descriptor bytes and
   check the channel counts per direction. For the Digitakt II, `channels_for()` assumes 4-byte
   samples. Make the sample width a parameter, not a guess.
3. On the Pi: add the Digitakt's name (`ven1935-<pid in hex>`) to the factory hook and let
   `ScanDescriptors()` log the descriptor. **Build gotcha:** the patch is applied only once (its
   `grep` guard), into `pi/circle/build/circle`, which is then copied to `circle-engine`
   (`.engine-ready` marks it done). After you edit the patch, rebuild those trees: delete them
   and rerun `pi/circle/build.sh` and `pi/engine/build.sh`. Ask the maintainer for a cleaner way
   **(to verify)**.

**Done when:** the Pi's serial log shows the Digitakt claimed, with its full descriptor dump, and
the Rytm still enumerates as before. All host tests pass, plus a new descriptor test.

### Stage B: Overbridge audio both ways without dropouts
1. Introduce a small per-device layout (in `ob_block.h`, host-tested). It holds the name, PID,
   IN and OUT channel counts, sample bytes, and the indices of MAIN L/R toward the device. The
   Rytm entry must give exactly today's values (`static_assert(block_bytes(12) == 368)` stays).
2. Make `CObUsb` use separate IN and OUT block sizes from that layout (`kBlk`, `kBufSize`,
   `ScanDescriptors`, `InDone`, `FillOut`). `RytmHost` already shows how.
3. For any device that is not the Rytm, skip the Rytm-only consumers of IN channels 2..9
   (send FX, scope, recorder names, the USB-C gadget) for now.
4. Try it first with `mac_obhost.cc` (made layout-aware) on the Mac: send silence, then a quiet tone on MAIN only.
5. Then on the Pi with `out=main`. Measure with the stats line: IN gaps / lost, OUT blocks,
   `fifo ... under`, and `pi/engine/tests/pi_run.py gaps SECS` (all 8 voices droning). The
   capture (`w` on the console, `pi/circle/capture.py`) records IN MAIN L/R as WAV.

Which host->device channels a *stock* Digitakt actually plays is **(to verify)**. The stock
Rytm OS plays only MAIN L/R (`docs/core.md`, "MAIN output").

**Done when:** 10 minutes with the Digitakt streaming: 0 IN gaps, 0 lost blocks, 0 output
underflows, and a clean tone heard through the Digitakt at a low level. The same run with the
Rytm gives the same numbers as before your change.

### Stage C: play Sidecar machines from Digitakt MIDI (no firmware changes)
1. `cmdline.txt`: `out=main notes=on`. `:notemach=0:plaits` (etc.) picks machines per voice.
2. On the Digitakt: MIDI tracks send notes on channels 1..8 to USB **(to verify the menu names
   and that the Digitakt sends MIDI over USB while in Overbridge mode)**. Make sure no other
   track sends notes on those channels **(to verify)**.
3. Check the stats line's `notes N ch C,...` to see which channels arrive.
4. If the Digitakt's MIDI interface is not a standard class 1/3 interface, Circle's MIDI driver
   will not claim it **(to verify)**.

**Done when:** a Digitakt MIDI track plays a Sidecar machine and you hear it through the
Digitakt's main path. Note-off and CC 16..31 work, latency is measured (the capture's note
markers, `pi/circle/spike3/latency.py`), and all Rytm tests still pass.

### Stage D: out of scope (needs firmware work, not now)
The Rytm's side of that work is public in [sidecar-mods](https://github.com/trigcondition/sidecar-mods)
(patch sources and build; bring your own stock OS): read it to see what firmware integration
involves, but none of it applies to a Digitakt as it is.
- Machines chosen on the Digitakt's screen, a SIDECAR page, parameter reports, p-locks of
  Sidecar machines (on the Rytm all of these come from rytm-mods' SysEx).
- Per-track audio into Digitakt tracks beyond what stock Overbridge allows.
- Anything using the 28 unknown header bytes.

---

## 5. How to work

- **Test first on the Mac.** Put new logic (layouts, channel maps, descriptor parsing) in
  portable headers like `ob_block.h` and test it under `pi/engine/tests` or `core/tests` before you touch the Pi.
- **Keep Rytm behaviour unchanged.** Every existing test must still pass: `make -C core test`,
  `make -C pi/engine/tests`, the `ob_block` test, the Python and web tests. If you have a Rytm,
  rerun the Stage B measurement with it too.
- **Small commits**, one idea each. The message says what changed and how it was tested.
- **Measure on hardware** and write down the numbers (counters, durations, firmware versions of
  the Pi build and the Digitakt OS). Mark what you measured and what you inferred, as the
  repo's docs do ([C]/[I], "measured", "inferred").
- **Report back** on Discord or with the **Tester report** form under
  [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose): the descriptor
  dump, the channel counts, the stats from a 10-minute run, what worked and what did not, and
  your branch.

---

## 6. Rules and boundaries

- **Never flash modified firmware onto a Digitakt.** Work only through standard USB: Overbridge
  and USB MIDI, with the stock OS. Do not use firmware mod loaders. Do not send OS-update
  SysEx (the engine's `midi_filter.h` blocks it on the pass-through; keep it that way).
- **Clean-room.** The README: "No Elektron firmware, and nothing derived from it, is ever
  committed here." Elektron-like features are clean-room only: behaviour is defined from the
  manuals and from listening, never from Elektron code. For this experiment: no Elektron
  firmware or binaries, and no disassembled or decompiled code. Allowed sources: Elektron's
  manuals, your own observation of the device (descriptors, captures, listening), and the open
  **Overwitch** project. Overwitch is GPL-3: the repo reads it "for understanding only; nothing
  copied" (`ob_block.h`) and says to "reimplement from the documented format rather than
  copying code" (`docs/research-teensy-host.md`). Cite your source next to every new constant.
- **Elektron USB IDs:** the host side already has the Rytm's ID in `ob_block.h`. Ask the
  maintainer how Digitakt IDs should be stored before you add them.
- **Licence and contributions:** Sidecar's code is GPL-2.0-or-later; the Pi binary as a whole is
  GPLv3 because it links Circle (`LICENSE`, `NOTICE`; [Licence](/sidecar-expander/about/licence/)).
  The repository's `CONTRIBUTING.md` is the workflow: fork, a branch per change, tests with it
  (`tools/run_portable_tests.sh`, `make -C core engines && make -C core test`), a focused pull
  request against `main` that says what you tested it on.
- **Safe power and levels.** Use the official Pi supply. Keep `core::MainOut`'s 200 ms fade-in
  and -12 dBFS limit on every path toward the Digitakt. **Turn speakers and headphones down
  before you test an untested audio path:** a wrong channel count or byte order shows up as
  loud full-scale noise. Start with silence, then a quiet tone, then music.

---

## 7. Prompt to give your agent

```
You are helping me experiment with Elektron Digitakt support in the "Sidecar", a bare-metal
Raspberry Pi 4 (Circle) USB host for Elektron drum machines. The source is github.com/trigcondition/sidecar-firmware; work on a branch from the v0.2.0 tag. Read the page "Experimenting with the Digitakt" on the Sidecar docs site
(developers section) first, then docs/research-rytm-usb.md,
docs/pi-engine.md, docs/core.md, teensy/libraries/RytmHost/ob_block.h, pi/engine/ob_usb.cpp,
pi/engine/output.h and core/notes.h. Treat anything marked "(to verify)" as unknown.

Goal, in stages: (A) detect the Digitakt and log its USB descriptors; (B) stream Overbridge
audio both ways with the Digitakt's own channel counts (they differ from the Rytm's 12/12),
with zero gaps and underflows over 10 minutes; (C) play Sidecar machines from the Digitakt's
MIDI notes (channels 1..8 -> voices 0..7, core::NoteAdapter), mixed onto MAIN L/R (out=main).
Stage D (anything that needs Digitakt firmware changes) is out of scope.

How to work: first run every host test and save the baseline (make -C core engines;
make -C core test; make -C pi/engine/tests; the ob_block test; the Python and web tests).
Write a failing host test before each change. Keep the Rytm's behaviour identical: every
existing test must still pass. Make small commits. Never guess a USB ID, channel count or
sample format. Ask me to read it from the device, and note the source next to each constant.

Without hardware, use the analog-emu emulator (github.com/trigcondition/analog-emu), which runs
the Digitakt MK1's own OS 1.53 (I supply the OS file; never commit it): its virtual USB MIDI
ports for Stage C, and its Overbridge link (built for the Rytm; Digitakt mode to verify) for
Stage B. If the emulator falls short for the Digitakt, fix the emulator first (a separate pull
request to analog-emu). Hardware still decides.

Hard rules: never flash or modify Digitakt firmware, and do not use firmware mod tools. No
Elektron firmware, binaries, disassembly or decompiled code. Overwitch (GPL-3) may be read
for understanding, not copied. Keep the -12 dBFS limit and the fade-in on every output path.
Before any test that sends audio to the device, remind me to turn my speakers down. Start by
proposing the Stage A steps and the descriptor dump you need from me.
```
