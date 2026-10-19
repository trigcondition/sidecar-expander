# Install: Sidecar Mini (Teensy 4.1)

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

Sidecar Mini, the Teensy 4.1 version of Sidecar | Expander: the cheap way to get started. It works together with the Rytm mods: patch and flash those first ([PATCHER.md](PATCHER.md)).

## You need

- A **Teensy 4.1** (PJRC). A stock board is enough: no PSRAM chips are needed (only GRAIN and stems recording need PSRAM).
- A **USB host cable** on the Teensy's 5-pin USB host header. PJRC sells one (the "USB Host Cable for Teensy 4.1"). It needs 5 male header pins soldered to the Teensy's host pads.
- A **micro-USB cable**, for power and for loading the firmware. Use a data cable, not a charge-only one.
- Optional: a **microSD card** (FAT32 or exFAT) in the Teensy's own card slot, for samples.
- The release file `sidecar-teensy41-<commit>.hex` from the [Releases](https://github.com/trigcondition/sidecar-expander/releases) page, and its `.sha256`.
- Optional: the release's `plugins/` folder (the starter user machines).

## Wiring

```
 Analog Rytm MKII                     Teensy 4.1                          computer or USB power
 [USB-B] ---- USB A-to-B cable ----> [host cable, USB-A socket]
                                      on the 5-pin USB host header
                                     [micro-USB] <---- micro-USB cable ---- [USB]
```

- Plug the Rytm straight into the host cable. Do not use a hub.
- **Solder the Teensy 4.1's USB host header** (5 V, D-, D+, GND, shield). Press-fit or unsoldered pins make the host port flaky: the Rytm connects only after a reboot or after many retries (the link comes up at full speed and drops), and the Teensy's own USB to the computer can drop when the host port's power switches on. Use a short, good USB cable to the Rytm.
- The Rytm has its own power. The Teensy is powered from its micro-USB port.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the Overbridge mode.

## Load the firmware

First check the file: `shasum -a 256 sidecar-teensy41-*.hex` must print the value in the `.sha256` file.

### Option A: Teensy Loader (the app)

1. Install the **Teensy Loader** from PJRC: <https://www.pjrc.com/teensy/loader.html>. It also comes with Teensyduino.
2. Connect the Teensy with the micro-USB cable. Unplug the Rytm from the host cable while you do this.
3. In Teensy Loader: **File > Open HEX File**, and choose `sidecar-teensy41-<commit>.hex`.
4. Press the white **program button** on the Teensy. The Loader writes the file and reboots the board.

### Option B: teensy_loader_cli (command line)

```
teensy_loader_cli --mcu=TEENSY41 -w -v sidecar-teensy41-<commit>.hex
```

Press the Teensy's program button when it says "Waiting for Teensy device". On Linux, install PJRC's udev rules first: <https://www.pjrc.com/teensy/00-teensy.rules>.

To go back, load any other Teensy 4.1 program the same way. The Teensy's bootloader cannot be overwritten.

## SD card (optional)

A FAT32 or exFAT microSD card in the Teensy's built-in slot. Create `/Samples/` yourself; the Teensy creates `/.rytm/` on first boot. **For recording without PSRAM, use a fast card** (A1/A2, U3/V30); takes go to `/Recordings`.

| Folder | What |
|---|---|
| `/Samples/` | your samples (WAV), browsable from the Rytm's sample browser under **SIDECAR** |
| `/JUNO/`, `/DX7/` | patch banks for the JUNO and 6-OP FM machines (optional) |
| `/.rytm/` | the Sidecar's own state (created and managed by the firmware; do not edit) |
| `/MACHINES/`, `/PRESETS/` | plugin exports and presets (created when used) |

With no card the Teensy still runs. The SIDECAR folder on the Rytm is then empty.

## Defaults

- **out=tracks:** each voice returns on its own track's channel. The mods expect this.
- **notes off:** the Rytm's MIDI notes do not trigger the Sidecar's voices. The mods trigger them.

You can change both from the web console, but the defaults are right for the mods.

## The web console (optional)

<https://trigcondition.github.io/sidecar-expander/console/> talks to the Teensy over WebSerial, through its micro-USB port.
- It needs Chrome or Edge on a desktop computer.
- It shows the live log and a status line (CPU, USB stream, MIDI), and sends console commands.
- Nothing is sent to any server.

Use it to check that the Rytm is streaming. The log shows `ob: streaming` and `MIDI attached`. The console is also how you get logs for a tester report.

## Starter content

`sidecar-content-<version>.zip` on the Releases page holds `/JUNO/Factory/` (the Juno-106's 128 factory patches) and `/DX7/` (three 32-voice DX7 banks), with a README and the licence notice. Extract it to the **root** of the Teensy's microSD card (it only adds files; merge with your folders).

On the Rytm: the sample browser's SIDECAR folder → `JUNO/Factory` or `DX7` → **LOAD TO PROJ** adds a patch to the project's list, and the JUNO or 6-OP FM machine's **PAT** knob steps through it.

## Starter user machines

The release's `plugins/` folder holds six starter machines as Teensy packages: `sc_acid.rmp`, `sc_wavepad.rmp`, `sc_metal.rmp`, `sc_snare.rmp`, `sc_pluck.rmp`, `sc_grain.rmp` (MIT; check them against `SHA256SUMS`). Install them from the web console, tab **Machines**: they go into the Teensy's own plugin store, and installing waits until the Rytm's transport is stopped. The Pi's `.a64.rmp` files do not load on the Teensy. The console's Machines tab is in testing on the Teensy.

## Which Rytm build

`rui1027` (the default) or `sfx1021` (without the remote pages). The remote pages work with this firmware (tested on hardware): TRK + YES opens SIDECAR, SYSTEM, SCOPE, the REC page, the LFO page and the voice pages. The Mini has no network, so its SYSTEM page shows no network line; its recorder row shows IDLE, ARM or REC m:ss. Playback and channel picking on the REC page are the Pi's for now. The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing.

## User machine space on the Teensy

The Teensy has 32 KB of plugin code space. The six starter machines fit together, and so do two (some three) of the smaller NoisePlethora packages; only one of the old large ones (NP VOICES, NP CLUST1, NP CLUST2) fits at a time. When a machine does not fit, the Rytm shows `!ROOM` (tested on hardware). With PSRAM a second code space takes more (in testing). The Pi has no such limit.

## Check that it works

1. Power the Teensy, then plug in the Rytm (with the patched OS).
2. On the Rytm, pick an external machine (PLAITS or DAISYSP) on a track and play it.
3. Open the sample browser: FUNC+SMPL, DOWN, FUNC+YES. **SIDECAR** appears at the +Drive root.

If something is off, see [KNOWN-ISSUES.md](KNOWN-ISSUES.md), then open a tester report.
