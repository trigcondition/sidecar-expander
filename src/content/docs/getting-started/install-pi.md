---
title: Install on the Raspberry Pi 4B
description: The SD card, first boot, the display, and sidecar.local over Ethernet.
sidebar:
  order: 2
---

The Pi version runs **bare metal**: there is no Linux and no login. It boots straight into the engine from its SD card. It works together with the Rytm mods, so patch and flash those first ([Patch and flash the Rytm](/sidecar-expander/getting-started/patch-and-flash/)).

## You need

- A Raspberry Pi 4 Model B (2 GB or more), its 5.1 V 3 A USB-C supply, and a microSD card (its contents are replaced).
- A USB A-to-B cable to the Rytm.
- Optional: an 800x480 HDMI display (USB touch works too) and an Ethernet cable.
- From the [Releases](https://github.com/trigcondition/sidecar-expander/releases) page: `sidecar-pi4-sd-<commit>.zip` and its `.sha256`.

## Make the SD card

1. Check the download: `shasum -a 256 sidecar-pi4-sd-*.zip` must match the `.sha256` file.
2. Format the card as **FAT32** with one partition (MBR):
   - macOS: Disk Utility > Erase, Format "MS-DOS (FAT)", Scheme "Master Boot Record".
   - Windows: the SD Association's "SD Card Formatter", or `format X: /FS:FAT32` for cards of 32 GB or less.
   - Linux: `mkfs.vfat -F 32`.
   - Raspberry Pi Imager's "Erase" does it too.
3. Unzip the file and copy **the files themselves** (not the folder) to the card's top level.
4. Eject the card and put it in the Pi.

| File | What |
|---|---|
| `start4.elf`, `fixup4.dat`, `bcm2711-rpi-4-b.dtb` | the Raspberry Pi boot firmware (unmodified; see `LICENCE.broadcom` and `COPYING.linux`) |
| `armstub8-rpi4.bin` | the ARM boot stub (from Circle) |
| `config.txt` | boot settings: the display, then the Sidecar boot block |
| `cmdline.txt` | Sidecar options, one line |
| `sdboot.img` | the small loader that checks and starts the engine |
| `engine.img` | the Sidecar engine |

## Connect and power on

```
 Analog Rytm MKII [USB-B] ---- USB A-to-B ----> [USB-A] Raspberry Pi 4B [USB-C] <---- power supply
                                                        [micro-HDMI 0] --> 800x480 display (optional)
                                                        [Ethernet] ------> computer (optional)
```

- Use a USB-A port for the Rytm, with no hub.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the Overbridge mode.
- Connect the display before power-on: the screen is set up at boot.
- Power on. A boot screen with a progress bar appears within a second of the engine starting; the engine runs about 11 seconds after power-on.

## First boot over Ethernet: sidecar.local

The Pi serves a web page with the status, the live log and its controls.

1. Connect an Ethernet cable **directly** from the Pi to your computer.
2. Open <http://sidecar.local>.

How it finds each other:
- The Pi has a fixed **link-local address, 169.254.61.60**. A computer with no address set on that port gives itself a 169.254.x.y address after a few seconds (macOS and Windows do this by default), so the page works with no network settings at all.
- If your computer's port has a manual address, set it to 169.254.61.59, netmask 255.255.0.0. Or set `ip=` and `netmask=` in `cmdline.txt` to fit your network.
- There is no DHCP client on Ethernet, so a router network only works with a matching `ip=`.
- `sidecar.local` is answered by the Pi itself (mDNS). A second Sidecar on the same network becomes `sidecar-1.local`.
- The page has no password. Use it on a direct cable or a network you trust.

Wi-Fi is in testing; see [Wi-Fi](/sidecar-expander/using/wifi/).

## Options (`cmdline.txt`)

One line of `name=value` options, separated by spaces. The release sets `sdport=0`, which turns off writing boot files over the network. Leave it in.

| Option | Default | |
|---|---|---|
| `out=tracks\|main` | tracks | voices on their tracks' channels (what the mods expect), or summed on MAIN (a stock Rytm) |
| `notes=on\|off` | off | the Rytm's MIDI notes trigger voices (not needed with the mods) |
| `display=0\|1` | 1 | the HDMI display and touch |
| `web=0\|1` | 1 | the web page at `http://sidecar.local` |
| `ip=`, `netmask=` | 169.254.61.60, 255.255.0.0 | the Pi's Ethernet address |
| `width=`, `height=` | the display's | the frame buffer size, for a display other than 800x480 |
| `touchscreen=minx,maxx,miny,maxy` | | touch calibration, if the touch is off |
| `screensaver=MIN`, `brightness=PCT` | 60, 100 | override the display settings at boot |
| `recbuf=MB` | 64 | the recorder's memory; 0 turns recording off |

Example: `sdport=0 display=0` for a Pi without a display.

## The display

`config.txt` sets HDMI to 800x480 at 60 Hz:

```
[all]
hdmi_force_hotplug=1
hdmi_group=2
hdmi_mode=87
hdmi_cvt=800 480 60 6 0 0 0
disable_overscan=1
```

For another display, change the `hdmi_cvt` line to its resolution and add `width=` and `height=` with the same values to `cmdline.txt`. Leave the block that starts `# sidecar sdboot begin` as it is: without it the Pi does not start the engine.

## Updating and going back

- To update, copy the new release's files over the old ones on the card.
- To stop using Sidecar, reformat the card. Nothing on the Pi itself is changed.

## Check that it works

1. Power the Pi with the Rytm connected (with the patched OS).
2. On the Rytm, pick an EXT machine on a track and play it. Then set a SEND FX TYPE, such as CLOUDSEED, and send a track to it with AMPLITUDE 2.
3. The display, or `sidecar.local`, shows "Rytm connected" and the engine's status.

If something is off, see [Troubleshooting](/sidecar-expander/using/troubleshooting/), then open a tester report.
