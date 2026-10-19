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
| `sfx1021` (option: without the remote pages) | EXT machines on every track, the SEND FX 1/2 pages (AMPLITUDE 2; TYPE and P1..P5 with the Sidecar's labels), stepped list knobs, user slots, and the SIDECAR folder in the sample browser. For the Teensy and the Pi |
| `rui1027d` (default, recommended) | everything in `sfx1021`, plus the remote pages: a connect screen when the Sidecar comes up, the Rytm's FX return on IN L/R for recording and SCOPE, and with TRK + YES the SIDECAR and SYSTEM status pages, SCOPE and meters, the REC page (with playback on the Pi) and the voice pages, in the Rytm's own font, on Sidecar Mini and Sidecar. The page catches only the keys and knobs it uses: PLAY, STOP, RECORD, the pads, mutes, FILL and tap tempo work as usual |

:::note
The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. On OS 1.74 (or any other version), first flash the stock OS 1.73 `.syx` with Transfer, as any OS update, then patch and flash it. The remote pages ran on a real Rytm with Sidecar Mini and Sidecar on 2026-10-18; see [What works now](/sidecar-expander/introduction/what-works-now/) for what is still in testing. Keep the stock file at hand to go back.
:::

## Option A: in the browser

Open the [patcher](/sidecar-expander/patcher/).

1. Pick the build.
2. Drop your stock `.syx` on the page, or click to choose it.
3. Press **Patch**, then **Save**.

The file is read and patched by JavaScript in the page itself. Nothing is uploaded: the page fetches only its own patch files. You can check that in your browser's network panel.

## Option B: the Python script

Python 3.8 or newer, no extra packages. From a copy of the repository:

```sh
python3 public/patcher/sidecar_patch.py ~/Downloads/Analog-Rytm_MKII_OS1.73.syx public/patcher/patches/sidecar-sfx1021.json
```

This writes `Analog-Rytm_MKII_OS1.73_sfx1021.syx` next to the stock file (`-o` chooses another path).

## Check the result

Both patchers check the result themselves and save nothing if it is wrong. To check it yourself:

```sh
shasum -a 256 Analog-Rytm_MKII_OS1.73_sfx1021.syx
```

| Build | SHA-256 |
|---|---|
| sfx1021 | `e86805ff1e2c5a2e2784bf455fe5fdd6c2336463da04892442e451445fa82f4e` |
| rui1027d | `4843848805c0e08b3cf7c69bf5b68ca7e1453bb643d351709bdad9f59468dce8` |

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
