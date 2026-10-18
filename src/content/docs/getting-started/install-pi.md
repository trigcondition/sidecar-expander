---
title: Install Sidecar (Raspberry Pi 4B)
description: The SD card, first boot, the display, and sidecar.local over Ethernet.
sidebar:
  order: 2
---

Sidecar, the full version on the Raspberry Pi 4B, runs **bare metal**: there is no Linux and no login. It boots straight into the engine from its SD card. It works together with the Rytm mods, so patch and flash those first ([Patch and flash the Rytm](/sidecar-expander/getting-started/patch-and-flash/)).

## You need

- A Raspberry Pi 4 Model B (2 GB or more), its 5.1 V 3 A USB-C supply, and a microSD card (its contents are replaced).
- A USB A-to-B cable to the Rytm.
- Optional: an 800x480 HDMI display (USB touch works too) and an Ethernet cable.
- From the [Releases](https://github.com/trigcondition/sidecar-expander/releases) page: `sidecar-pi4-sd-<commit>.zip` and its `.sha256`, and the `plugins/` folder (optional, the starter user machines).

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
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the Overbridge mode. That is the only setting the Sidecar needs: the Rytm's MIDI port settings (USB MIDI in and out) do not have to be changed for the voices, send effects, user machines or remote pages (tested on hardware). Only STUTTER's tempo sync and the recorder's armed mode use the Rytm's clock and transport over USB (MIDI CONFIG: CLOCK SEND and TRANSPORT SEND).
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

Wi-Fi is off in the package; see [Wi-Fi (off by default)](#wi-fi-off-by-default) below and [Wi-Fi](/sidecar-expander/using/wifi/).

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

## Starter user machines

The release's `plugins/` folder holds six starter machines as Pi packages: `sc_acid.a64.rmp`, `sc_wavepad.a64.rmp`, `sc_metal.a64.rmp`, `sc_snare.a64.rmp`, `sc_pluck.a64.rmp`, `sc_grain.a64.rmp` (MIT; check them against `SHA256SUMS`). Upload them on `sidecar.local`, tab **Machines**, or copy them into `/Plugins/` on the card before you put it in the Pi. The Teensy's `.rmp` files do not load on the Pi.

## The remote UI

The `rui1021` Rytm build's remote pages (TRK + YES on the Rytm) need this release's kernel (1021); tested on hardware. With an older kernel the pages open without any text. The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing.

## Wi-Fi (off by default)

The SD card package has **Wi-Fi off**: it ships no Wi-Fi settings and no Wi-Fi chip firmware. Wi-Fi is in testing (a join has worked on hardware; there is no setup page yet). The network is either Ethernet or Wi-Fi, chosen at boot. To try it:

1. Put the Pi 4's Wi-Fi chip firmware in a folder `/firmware/` on the card: `brcmfmac43455-sdio.bin`, `brcmfmac43455-sdio.clm_blob` and `brcmfmac43455-sdio.txt`. They come from the Raspberry Pi firmware-nonfree repository (`cypress/cyfmac43455-sdio-minimal.bin` and `cypress/cyfmac43455-sdio.clm_blob`, renamed, and `brcm/brcmfmac43455-sdio.txt`), under their own licences.
2. Boot with Ethernet, open `sidecar.local` and, in the command line, enter `wifi=scan` to list the networks, then `wifi=join:<network>:<passphrase>`. The Pi stores a derived key in `/.rytm/wifi.txt`, never the passphrase itself, and never logs it. Reboot: the Pi joins with DHCP and stays `sidecar.local`.
3. `wifi=off` goes back to Ethernet at the next boot. To forget the network, delete `/.rytm/wifi.txt` from the card.

You can also write `/.rytm/wifi.txt` by hand:

```
on=1
country=GB
band=2g
ssid=YOUR-NETWORK
psk=YOUR-PASSPHRASE
```

`country=` is your two-letter country code; `band=` is `2g` (the default; 5 GHz DFS channels did not get an address in our test), `5g` or `any`. A file written by hand holds the passphrase in plain text, so prefer `wifi=join`. Never share a card, a log or a screenshot that contains this file. The web page has no password: on a shared network anyone can open it.

## Updating and going back

- To update, copy the new release's files over the old ones on the card. Your samples, recordings, `/Plugins/` and `/.rytm/` stay. Each package's `BUILD-INFO-pi.txt` names the kernel it carries.
- To stop using Sidecar, reformat the card. Nothing on the Pi itself is changed.

## Check that it works

1. Power the Pi with the Rytm connected (with the patched OS).
2. On the Rytm, pick an EXT machine on a track and play it. Then set a SEND FX TYPE, such as CLOUDSEED, and send a track to it with AMPLITUDE 2.
3. The display, or `sidecar.local`, shows "Rytm connected" and the engine's status.

If something is off, see [Troubleshooting](/sidecar-expander/using/troubleshooting/), then open a tester report.
