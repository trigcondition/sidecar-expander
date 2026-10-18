---
title: Install Sidecar Mini (Teensy 4.1)
description: Wiring, loading the firmware, the SD card and the first check.
sidebar:
  order: 1
---

The Teensy version works together with the Rytm mods. Patch and flash those first ([Patch and flash the Rytm](/sidecar-expander/getting-started/patch-and-flash/)).

## You need

- A Teensy 4.1 with a USB host cable on its 5-pin host header (soldered pins).
- A micro-USB **data** cable.
- Optional: a microSD card (FAT32 or exFAT).
- From the [Releases](https://github.com/trigcondition/sidecar-expander/releases) page: `sidecar-teensy41-<commit>.hex` and its `.sha256`. Optional: the `plugins/` folder (the starter user machines).

## Wiring

```
 Analog Rytm MKII                     Teensy 4.1                          computer or USB power
 [USB-B] ---- USB A-to-B cable ----> [host cable, USB-A socket]
                                      on the 5-pin USB host header
                                     [micro-USB] <---- micro-USB cable ---- [USB]
```

- Plug the Rytm straight into the host cable. Do not use a hub.
- The Rytm has its own power. The Teensy is powered from its micro-USB port.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the Overbridge mode. That is the only setting the Sidecar needs: the Rytm's MIDI port settings (USB MIDI in and out) do not have to be changed for the voices, send effects, user machines or remote pages (tested on hardware). Only STUTTER's tempo sync and the recorder's armed mode use the Rytm's clock and transport over USB (MIDI CONFIG: CLOCK SEND and TRANSPORT SEND).

## Load the firmware

Check the file first: `shasum -a 256 sidecar-teensy41-*.hex` must print the value in the `.sha256` file.

### Option A: Teensy Loader (the app)

1. Install the **Teensy Loader** from PJRC: <https://www.pjrc.com/teensy/loader.html>. It also comes with Teensyduino.
2. Connect the Teensy with the micro-USB cable. Unplug the Rytm from the host cable while you do this.
3. In Teensy Loader: **File > Open HEX File**, and choose the `.hex`.
4. Press the white **program button** on the Teensy. The Loader writes the file and reboots the board.

### Option B: the command line

```sh
teensy_loader_cli --mcu=TEENSY41 -w -v sidecar-teensy41-<commit>.hex
```

Press the program button when it says "Waiting for Teensy device". On Linux, install PJRC's udev rules first: <https://www.pjrc.com/teensy/00-teensy.rules>.

To go back, load any other Teensy 4.1 program the same way. The Teensy's bootloader cannot be overwritten.

## SD card (optional)

A FAT32 or exFAT microSD card in the Teensy's built-in slot. Create `/Samples/` yourself; the Teensy creates `/.rytm/` on first boot.

| Folder | What |
|---|---|
| `/Samples/` | your samples (WAV), browsable from the Rytm's sample browser under **SIDECAR** |
| `/JUNO/`, `/DX7/` | patch banks for the JUNO and 6-OP FM machines (optional) |
| `/.rytm/` | the Sidecar's own state: card index, pools, slot maps (do not edit) |
| `/MACHINES/`, `/PRESETS/` | user machine exports and presets (created when used) |

With no card the Teensy still runs. The SIDECAR folder on the Rytm is then empty.

## Defaults

- **out=tracks**: each voice returns on its own track's channel. The mods expect this.
- **notes off**: the Rytm's MIDI notes do not trigger the voices. The mods trigger them.

Both can be changed from the [web console](/sidecar-expander/using/web-ui/#the-teensy-web-console), but the defaults are right for the mods.

## Starter user machines

The release's `plugins/` folder holds six starter machines as Teensy packages: `sc_acid.rmp`, `sc_wavepad.rmp`, `sc_metal.rmp`, `sc_snare.rmp`, `sc_pluck.rmp`, `sc_grain.rmp` (MIT; check them against `SHA256SUMS`). Install them from the web console, tab **Machines**: they go into the Teensy's own plugin store, and installing waits until the Rytm's transport is stopped. The Pi's `.a64.rmp` files do not load on the Teensy. The console's Machines tab is in testing on the Teensy.

## Which Rytm build

`rui1022` (the default) or `sfx1021` (without the remote pages). The remote pages work with this firmware (tested on hardware): TRK + YES opens SIDECAR, SYSTEM and the voice pages. The Teensy has no recorder and no network, so its SYSTEM page shows neither. The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing.

## User machine space on the Teensy

The Teensy has 32 KB of plugin code space. The six starter machines fit together, but only **one** of the large NoisePlethora packages (NP VOICES, NP CLUST1, NP CLUST2) fits at a time: a second shows `!` (no room). Use one per project (ATARI fits next to NP CLUST1). Smaller packages and a clearer reason on the Rytm are in progress. The Pi has no such limit.

## Check that it works

1. Power the Teensy, then plug in the Rytm (with the patched OS).
2. Open the [web console](/sidecar-expander/console/) in Chrome or Edge and connect. The log shows `ob: streaming` and `MIDI attached`.
3. On the Rytm, pick an EXT machine (PLAITS, say) on a track and play it.
4. Open the sample browser: FUNC + SMPL, DOWN, FUNC + YES. **SIDECAR** appears at the +Drive root.

If something is off, see [Troubleshooting](/sidecar-expander/using/troubleshooting/), then open a tester report.
