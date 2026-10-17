---
title: Patch and flash the Rytm
description: Patch your own stock OS 1.73 file in the browser or with Python, check it, and send it to the Rytm.
sidebar:
  order: 3
---

The Rytm side of Sidecar is a set of mods to the Rytm's OS 1.73. We do not distribute firmware, stock or modified. You patch **your own** stock OS 1.73 file on your own computer, and the patcher checks that the result is bit-identical to the build we tested.

:::caution
Back up first: use Transfer to back up your projects, kits, sounds and samples. Read [Recovery to stock](/sidecar-expander/getting-started/recovery/) before you flash.
:::

## What you need

- The stock file `Analog-Rytm_MKII_OS1.73.syx` from the official download page. Only the unmodified file is accepted. Its SHA-256 is:

  ```
  8ad671087ec30433d5407c7380d2396e0915ab931c5d3dd18a78bf284d3d1e52
  ```

- One of the two patchers below. Both give the same result, byte for byte.

## Pick a build

| Build | What |
|---|---|
| `sfx1017` (recommended) | EXT machines on every track, the SEND FX 1/2 pages (AMPLITUDE 2; TYPE and P1..P5 with the Sidecar's labels), user slots, and the TEENSY folder in the sample browser |
| `rui1017` | everything in `sfx1017`, plus the early remote UI page (TRK + YES). The Sidecar does not serve remote pages in this release: the page stays blank and closes within a second |

## Option A: in the browser

Open the [patcher](/sidecar-expander/patcher/).

1. Pick the build.
2. Drop your stock `.syx` on the page, or click to choose it.
3. Press **Patch**, then **Save**.

The file is read and patched by JavaScript in the page itself. Nothing is uploaded: the page fetches only its own patch files. You can check that in your browser's network panel.

## Option B: the Python script

Python 3.8 or newer, no extra packages. From a copy of the repository:

```sh
python3 public/patcher/sidecar_patch.py ~/Downloads/Analog-Rytm_MKII_OS1.73.syx public/patcher/patches/sidecar-sfx1017.json
```

This writes `Analog-Rytm_MKII_OS1.73_sfx1017.syx` next to the stock file (`-o` chooses another path).

## Check the result

Both patchers check the result themselves and save nothing if it is wrong. To check it yourself:

```sh
shasum -a 256 Analog-Rytm_MKII_OS1.73_sfx1017.syx
```

| Build | SHA-256 |
|---|---|
| sfx1017 | `118671e8daa5989061d00934e4b6e9d02f9293f14a7e60164c40a4cc2ed5f415` |
| rui1017 | `c795ed5f472c4eae1563e63e1b6414eb907de1c96991d831196d15ef58f2ae67` |

## Send it to the Rytm

Send the patched file as an OS update, exactly as you would send an official one:

- **Transfer (USB)**: drop the `.syx` on Transfer while the Rytm is connected and confirm on the unit.
- **STARTUP menu (DIN MIDI)**: hold FUNC while you power on, press TRIG 4 (OS UPGRADE), and send the file from Transfer's legacy OS upgrade mode, or any SysEx tool, through a DIN MIDI interface. This route works even if the OS does not boot. It is slow: about 16 minutes or more.

After the update the Rytm may stay on "Success! Rebooting". That is stock behaviour: power cycle it.

## How the patcher works

A patch file describes the modified OS image as records against your decoded stock image:

- bytes we wrote: the mods' code, their hooks and data, and elekloader's core and boot copier;
- copies: "take this many bytes from this place in your own stock image". Any run of 4 or more of our bytes that also occurs in the stock firmware is stored this way, so a patch file never carries firmware bytes.

The patcher checks the stock file's hash, decodes the SysEx transport and unpacks the MAIN OS section, applies the records and checks the image's hash, packs the image and rebuilds the `.syx` from your file's other sections (recomputing every checksum and counter), and compares the result with the tested build's hash.

The codec is elekloader's (GPL-2.0-or-later), which comes from digikit. The browser patcher is a line-for-line port, tested to give the same bytes as the Python on every build.
