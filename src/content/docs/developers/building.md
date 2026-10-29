---
title: Building
description: Building the Pi engine, the Teensy firmware, the Rytm mods, and this site.
sidebar:
  order: 2
---

:::note
The engine and mods repositories are not public yet. These are the commands as they work in them today.
:::

## Pi engine

Everything builds in Docker (an image with the AArch64 toolchain and Circle).

```sh
pi/circle/build.sh            # once: the image and Circle with our USB patches
pi/engine/build.sh            # once: the engine's Circle tree, the engines' sources, the kernel
pi/engine/build.sh kernel     # after a change: the kernel only -> pi/engine/kernel8-rpi4.img
```

- The kernel links Circle (GPLv3), so the image is distributed under the GPLv3 as a whole.
- Build options: `PI_IP`, `PI_NETMASK` (the Ethernet defaults), `EMUHOST` (the emulator host), `GADGET` (the USB-C device), `SIDECAR_CH_IN` (12 or 20 computer channels), `SIDECAR_NAME` (the USB name).
- Development flashing goes through Circle's serial bootloader into RAM (`pi/circle/flash.sh`); `pi/circle/sdboot.py install` writes a build to the card as `engine.img`, checked and with the previous one kept.
- The SD card file set for a release: `scripts/package_pi.sh <checkout> <commit>` in this repository.

### Pairing tools with the Sidecar

Since 0.3.0 the Pi's network side is gated by the [pairing code](/sidecar-expander/using/web-ui/#pairing-a-browser): an 8-digit code drawn at every boot and shown only on the Rytm (SIDECAR MENU > WEB UI, the SIDECAR page's PAIR line, a 30 s popup) and the touchscreen's STATUS page. A card made by the release scripts has no `paircode=` in `cmdline.txt`, so the gate is on.

- **`sdboot.py`** (installs, `ls`, `cmdline` over TCP 7310): run it once with the code; it keeps a client id and secret in `~/.config/sidecar/pair.json` (0600; `SIDECAR_PAIR_FILE` moves it) and authenticates by itself from then on:

  ```sh
  SIDECAR_PAIR_CODE=12345678 uv run --with pyserial python pi/circle/sdboot.py install
  ```

  Without the variable it asks on the terminal. An engine from before 0.3.0 has no gate; `sdboot.py` sees that from the engine's answer and goes on unauthenticated.
- **HTTP scripts:** pair once with `curl -s -d code=12345678 -d remember=1 -d name=deploy http://sidecar.local/pair` (it answers a `token`, a `client` and a `secret`: keep the last two, the secret in a 0600 file). Later runs trade them for a token at `POST /pair/resume` (`-d client=<id> --data-urlencode secret@<file>`). Send the token as the `X-Sidecar-Auth` header, never in the URL (`?tok=` is refused). `/fs/*` reads also need `-H "Origin: http://sidecar.local"`.
- **Open without the code:** `/`, `/health`, `/status`, `/log` and the pairing endpoints. The serial console (`:sdf`) is never gated.
- **A unit with no display:** the engine writes this boot's code to `/sidecar-paircode.txt` at the card's root, or fix the code with `paircode=<8 digits>` in `cmdline.txt` (shown as FIXED on STATUS).
- **The development bypass:** `paircode=0` in `cmdline.txt` turns the gate off. The engine says so at boot, once a minute, in `/health`, `/status` and on the STATUS page. Never on a shipped card: `sdboot.py cmdline` shows the line, `sdboot.py cmdline "<the line without paircode=0>"` writes it.
- Revoking: SIDECAR MENU > WEB UI > FORGET DEVICES, the console's `pair=revoke`, or delete `/.rytm/pair.txt` from the card.

## Teensy firmware

Arduino CLI with Teensyduino, `-O2`:

```sh
RMP_EXTRA_FLAGS="-DRYTM_USB_HOST=1" teensy/run_sketch.sh voiceloop   # the host build: compile, upload, serial log
teensy/host_stereo.sh                                               # the Sidecar Mini release build: USB host + stereo USB audio + USB MIDI
teensy/host_uac2.sh                                                 # the 20 in / 12 out USB audio build (in development)
teensy/gate.sh quick|full                                           # sizes, golden renders, end-to-end checks
```

- `-DRYTM_PLUGINS=0` builds without the machine plugins; `-DRYTM_NOTES=1 -DRYTM_OUT_MAIN=1` boots for a stock Rytm.
- `run_sketch.sh` copies `core/` into a generated Arduino library on every build and fails a build that grows ITCM or shrinks the stack past its limits.
- The release `.hex` (compile only, never uploads): `scripts/package_teensy.sh <checkout> <commit>` in this repository. It builds with `host_stereo.sh`'s flags by default (`BUILD=host` for the plain host build) and takes `tools/release/teensy_hex.sh` from the engine's `release-packaging` branch when the commit has none.

## Version

The `VERSION` file at the engine's root (`0.1.0`) is the only source of the version; `tools/gen_version.sh` writes it, with the short commit and a dirty flag, into the generated `core/version.h` on every build (Mac, Pi and Teensy). See [Versioning](/sidecar-expander/about/versioning/).

## Rytm mods

Python 3.11+, `m68k-elf-binutils`, and your own stock OS 1.73 file in `stock/` (the build refuses any other).

```sh
make setup                                      # venv and the vendored tools at their pinned commits
.venv/bin/python tools/build.py --tag <tag> --mods <mods...> --param ...
.venv/bin/python tools/verify.py --tag <tag>    # re-check every claim and guard against the image
```

- `build.py` checks the layout and every expected stock byte, assembles the mods and hands the result to elekloader.
- `verify.py` asserts that the other firmware sections are byte-identical to stock.
- Read the whole build output: a failed build can leave an older image in place.
- `tools/release_patch.py` turns a build into a patch file for the patcher, refusing unless the records rebuild the image byte for byte and carry no stock bytes. In this repository: `scripts/make_patches.py` and `scripts/test_patcher.sh`.

## This site

Node 22.12 or newer (pinned: `.nvmrc`), packages pinned in `package-lock.json`:

```sh
npm ci
npm run dev       # local preview at http://localhost:4321/sidecar-expander/
npm run build     # the static site in _site/, internal links checked
```

The patcher and the web console are static files in `public/patcher/` and `public/console/`, served at `/patcher/` and `/console/`. `scripts/sync_console.sh` updates the console from the engine repository.
