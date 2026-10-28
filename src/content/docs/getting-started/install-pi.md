---
title: Install Sidecar (Pi 4B and Pi 5, one card)
description: One SD card for the Raspberry Pi 4B and the Raspberry Pi 5 - first boot, the display, and sidecar.local over Ethernet.
sidebar:
  order: 2
---

Sidecar, the full version on the Raspberry Pi, **works on the Pi 4B and the Pi 5** from the same SD card (the Pi 5's limits are [below](#raspberry-pi-5)). It runs **bare metal**: there is no Linux and no login. It boots straight into the engine from its SD card. It works together with the Rytm mods, so patch and flash those first ([Patch and flash the Rytm](/sidecar-expander/getting-started/patch-and-flash/)).

## You need

- A Raspberry Pi 4 Model B (2 GB or more) with its 5.1 V 3 A USB-C supply, or a Raspberry Pi 5 with its 27 W USB-C supply; and a microSD card (its contents are replaced).
- A USB A-to-B cable to the Rytm.
- Optional: a touch display (800x480 HDMI with USB touch, a 7" DSI display, or in the 0.3 test line 1024x600; see [The display](/sidecar-expander/using/display/#which-displays-work)) and an Ethernet cable.
- From the [Releases](https://github.com/trigcondition/sidecar-expander/releases) page: `sidecar-pi-sd-<commit>.zip` (one card for the Pi 4B and the Pi 5) and `SHA256SUMS`; optional: `sidecar-pi-plugins-<version>.zip` (the starter user machines).

## Make the SD card

1. Check the download: in the download folder, `shasum -a 256 -c SHA256SUMS --ignore-missing` must say `OK` for the zip (Windows: `certutil -hashfile <file> SHA256` and compare with `SHA256SUMS`).
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
| `kernel_2712.img`, `bcm2712-rpi-5-b.dtb`, `bcm2712d0-rpi-5-b.dtb`, `overlays/` | the Pi 5's engine and device trees (the Pi 5 keeps its boot firmware in its own memory) |
| `firmware/` | the Wi-Fi chip firmware for both boards (only used with Wi-Fi on; see `firmware/NOTICE`) |
| `config.txt` | boot settings: a `[pi4]` and a `[pi5]` section, the Pi 4's display, then the Sidecar boot block |
| `cmdline.txt` | Sidecar options, one line |
| `sdboot.img` | the small loader that checks and starts the engine |
| `engine.img` | the Sidecar engine |

## Connect and power on

```
 Analog Rytm MKII [USB-B] ---- USB A-to-B ----> [USB-A] Raspberry Pi 4B / 5 [USB-C] <---- power supply
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
| `width=`, `height=` | the display's | Pi 4: the frame buffer size, for a display other than 800x480; Pi 5: the UI's size (800x480 by default, scaled) |
| `res=800x480\|1024x600\|auto` | auto | 0.3: the UI's layout size ([Screen sizes](/sidecar-expander/using/display/#screen-sizes)) |
| `uistyle=oled\|classic` | oled | 0.3: the touchscreen's theme, also for the boot screen |
| `dsi=0` | | draw on HDMI even with a DSI display connected |
| `touchscreen=minx,maxx,miny,maxy` | | touch calibration, if the touch is off |
| `screensaver=MIN`, `brightness=PCT` | 60, 100 | override the display settings at boot |
| `recbuf=MB` | auto | the recorder's memory. Auto gives a Pi 4 256 MB (about 55 s of all channels) and a 1 GB board 64 MB; 0 turns recording off |
| `cpumhz=1500\|1200\|1000` | 1500 | the CPU clock in MHz (also Settings > System > CPU clock). Lower is cooler: [Keeping it cool](/sidecar-expander/using/troubleshooting/#keeping-it-cool) |
| `socmaxtemp=C` | 75 on the release card | the temperature in °C above which the Pi slows itself down to 600 MHz |

Example: `sdport=0 display=0` for a Pi without a display.

## The display

A display is **optional**. Without one the Sidecar works the same: its pages are drawn on the Rytm's own screen (UP + YES; hold UP for the map of every shortcut) and the web page at `sidecar.local` covers the setup. A touchscreen adds the piano roll, the scope and the status at a glance. For a Pi without a display you can set `display=0` (above).

`config.txt` sets HDMI to 800x480 at 60 Hz:

```
[pi4]
hdmi_force_hotplug=1
hdmi_group=2
hdmi_mode=87
hdmi_cvt=800 480 60 6 0 0 0
disable_overscan=1
```

For another display, change the `hdmi_cvt` line to its resolution and add `width=` and `height=` with the same values to `cmdline.txt`. For a 1024x600 display (0.3 test line) the lines are on [The display](/sidecar-expander/using/display/#screen-sizes). Leave the block that starts `# sidecar sdboot begin` as it is: without it the Pi does not start the engine.

The Pi 5 has display lines of its own under `[pi5]`; only `hdmi_force_hotplug=1` matters there (see [Raspberry Pi 5](#raspberry-pi-5)). A DSI display needs no line on either board.

## Starter content

The SD card package already holds the **starter content**: `/JUNO/Factory/` (the Juno-106's 128 factory patches) and `/DX7/` (three 32-voice DX7 banks), with `STARTER-CONTENT-README.txt` and its notice. It is also a zip of its own, `sidecar-content-<version>.zip`, on the Releases page: extract it to the card's root (or upload the folders on `sidecar.local`, Files, Upload folder) if you set up the card before. It only adds files; your own files stay.

On the Rytm: the sample browser's SIDECAR folder → `JUNO/Factory` or `DX7` → **LOAD TO PROJ** adds a patch to the project's list, and the JUNO or 6-OP FM machine's **PAT** knob steps through it.

## Starter user machines

The release's `sidecar-pi-plugins-<version>.zip` holds six starter machines as Pi packages, the same files for the Pi 4B and the Pi 5: `sc_acid.a64.rmp`, `sc_wavepad.a64.rmp`, `sc_metal.a64.rmp`, `sc_snare.a64.rmp`, `sc_pluck.a64.rmp`, `sc_grain.a64.rmp` (MIT; check them against `SHA256SUMS`). Upload them on `sidecar.local`, tab **User machines**, or copy them into `/Plugins/` on the card before you put it in the Pi.

## The remote UI

Use a Rytm build and a Sidecar build of the same line:

| Line | Rytm build | Sidecar build | Opens the Sidecar's pages |
|---|---|---|---|
| 0.2.0 release | `rui1027d` | the 0.2.0 SD card package (kernel 1021 or later) | TRK + YES |
| 0.3 test line | `rui1048` | the Sidecar's 0.3 test build | **UP + YES** (TRK + YES still works) |

The 0.2.0 pairing is tested on hardware; with a kernel older than 1021 the pages open without any text. The 0.3 test line is tested in the emulator. An older Sidecar build ignores the Rytm's newer requests (the combo map when UP is held, pages it does not have); update both together. Each package's `BUILD-INFO-pi.txt` names the kernel it carries. The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing.

:::caution[New in 0.3]
With the 0.3 test build, a USB stick in a blue USB 3 port of the Pi 4 (any port on the Pi 5) is mounted for [project bundles](/sidecar-expander/using/projects-bundles/#usb-sticks); keep the Rytm on a black USB 2 port. On the Pi 5 an NVMe SSD on the PCIe connector is mounted too ([Storage](/sidecar-expander/using/storage/)).
:::

## Wi-Fi without a cable: sidecar-wifi.txt

<span class="sc-test">in testing</span> To set up Wi-Fi with no Ethernet cable and no web page, put a text file called `sidecar-wifi.txt` at the **root of the Pi's SD card** (the top folder, next to `Plugins`; it shows in the Mac Finder and Windows Explorer). Three lines are enough:

```
ssid=MyNetwork
psk=MyPassword
```

1. The Wi-Fi chip firmware must be on the card in `/firmware/` (it is in the package; see [below](#wi-fi-off-by-default)).
2. Save `sidecar-wifi.txt` at the card root, put the card in the Pi and power it on. The Pi reads the file at the **next boot**, before Wi-Fi starts.
3. The Pi joins the network (DHCP, `sidecar.local`). It stores only the **derived key**, never your password, in `/.rytm/wifi.txt`, and then **deletes `sidecar-wifi.txt`** from the card (if it cannot delete it, it overwrites the contents and renames it `sidecar-wifi.used`).
4. If the network does not come up within **90 seconds** (wrong password, not found, no address), the Pi falls back to its previous setting (Ethernet when Wi-Fi was off) and restarts, so a typo cannot lock you out.

Options (one per line): `band=2g`, `band=5g` or `band=any` (2.4 GHz is the default), and `open=1` for an open network without a password (leave `psk=` out). `password=` works as another name for `psk=`. Lines starting with `#` are comments; spaces around `=` and quotes around the values are fine. The password is 8 to 63 characters, or a 64-digit hex key; the network name is 1 to 32 characters.

If the file cannot be used, the Pi deletes it anyway and writes **`sidecar-wifi-error.txt`** at the card root with a short reason (for example "password must be 8-63 characters"); it never contains your network name or password. Fix the file and try again; a successful import removes the error file.

The alternative is the web page's **Wi-Fi settings** (Status tab, over Ethernet). **Never share the card, or a photo of it, while `sidecar-wifi.txt` is on it**: the password is in it in plain text until the next boot.

## Wi-Fi (off by default)

The SD card package has **Wi-Fi off**: it ships no Wi-Fi settings. The Wi-Fi chip firmware for both boards is on the card in `/firmware/`. Joining works on hardware; the **Wi-Fi settings** section on the web page's Status tab (scan, Connect and save, a 90 s fallback) is in testing. The network is either Ethernet or Wi-Fi, chosen at boot. To try it:

1. The Wi-Fi chip firmware is already in `/firmware/` on the card (`brcmfmac43455-sdio.*` for the Pi 4, `brcmfmac43455-sdio.raspberrypi,5-model-b.*` for the Pi 5: the same files from the Raspberry Pi firmware-nonfree repository under each board's names, with their licences). For a card made before, copy that folder from the package. Wi-Fi works on the Pi 5 too (tested: saved from the web page, connected).
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

**First setup without a cable** (in testing): a `sidecar-wifi.txt` file at the card's root with `ssid=` and `psk=` lines is imported at boot (only the key is stored, the file is deleted; a problem goes to `sidecar-wifi-error.txt`). The Wi-Fi chip firmware in `/firmware/` is needed as above.

## Raspberry Pi 5

The same card boots a **Raspberry Pi 5** too: its `config.txt` has a section for each board, and each board only reads its own files. On the Pi 5 the voices, send effects, the Rytm over USB (replug included), the remote pages, `sidecar.local` over Ethernet and Wi-Fi work (<span class="sc-ok">hardware</span>, 2026-10-19); the user machines use the same `.a64.rmp` files as on the Pi 4. The shared card itself is <span class="sc-test">in testing</span> on both boards.

| | Raspberry Pi 4B | Raspberry Pi 5 |
|---|---|---|
| Use | **with a computer**: also the Sidecar's USB-C audio and MIDI interface (<span class="sc-ok">hardware</span>) | **standalone**: no USB audio or MIDI to the computer yet |
| Supply | official 5.1 V 3 A USB-C | official **27 W** USB-C, plugged in **directly** |
| HDMI display | 800x480, sharp (<span class="sc-ok">hardware</span>) | the 800x480 UI scaled to 1920x1080: works, slightly soft (<span class="sc-ok">hardware</span>) |
| DSI display | the firmware's: expected, being confirmed | driven by the engine: <span class="sc-test">in testing</span> |
| Wi-Fi | <span class="sc-ok">hardware</span> | <span class="sc-ok">hardware</span> |
| Updating | copy the new files over the old ones | the same (no network update on the Pi 5) |

What is different on the Pi 5 for now:

- **No USB audio or MIDI to the computer.** The Pi 5's USB-C port is power only in this version (on the Pi 4 it is also the Sidecar's audio and MIDI interface): even Raspberry Pi OS's own USB gadget did not connect on our Pi 5 powered from a computer, so it is left out.
- **HDMI display** (<span class="sc-ok">hardware</span>): connect the display to **micro-HDMI 0** (next to the USB-C) before power-on. The Pi 5's firmware always sends 1920x1080; the Sidecar scales its 800x480 UI to it, so the picture is slightly soft. Only `hdmi_force_hotplug=1` under `[pi5]` matters (it is on the card); the other `[pi5]` display lines are ignored by the Pi 5 and do no harm. `width=`/`height=` in `cmdline.txt` set the UI's size on the Pi 5 (`width=1920 height=1080`: unscaled, small).
- **DSI display** (<span class="sc-test">in testing</span>): the official 7" display v1 or a compatible on CAM/DISP 0 or 1 is found by itself, no `config.txt` line; with no DSI panel answering, the Sidecar uses HDMI. Upside down: `dsi_rotate=180` in `cmdline.txt`; `dsi=0` keeps it on HDMI.
- **Power**: use the official **27 W** USB-C supply, plugged in directly. Fed from a hub's port the Pi 5 ran in reduced-power mode and the web page over Wi-Fi became slow (pages of 5 s, "503 busy"); on the adapter directly it was fast. With a 3 A supply the Pi 5 also limits its USB ports to 600 mA in total. The Sidecar warns about a weak supply: in the log, on the web page's **Power** tile, and in red on the display's bottom line. The warning names the board's official supply: on a Pi 4 "use the official 15 W (5.1 V 3 A) supply" (display `POWER TOO WEAK: use 15 W supply`), on a Pi 5 "use the 27 W (5 V 5 A) adapter directly" (`POWER TOO WEAK: use 27 W adapter`).
- **Updating**: copy the new release's files over the old ones (as on the Pi 4). There is no update over the network on a Pi 5 yet.
- If the Pi 5 shows its boot diagnostics screen instead of starting, update its bootloader with Raspberry Pi Imager ("Misc utility images", "Bootloader"), then try again.
- The serial console (for tester reports) is on the same pins as the Pi 4's (GPIO14/15, pins 8 and 10, 921600 baud).

## Updating and going back

- To update, copy the new release's files over the old ones on the card. Your samples, recordings, `/Plugins/` and `/.rytm/` stay. Each package's `BUILD-INFO-pi.txt` names the kernel it carries.
- To stop using Sidecar, reformat the card. Nothing on the Pi itself is changed.

## Check that it works

1. Power the Pi with the Rytm connected (with the patched OS).
2. On the Rytm, pick an EXT machine on a track and play it. Then set a SEND FX TYPE, such as CLOUDSEED, and send a track to it with AMPLITUDE 2.
3. The display, or `sidecar.local`, shows "Rytm connected" and the engine's status.

If something is off, see [Troubleshooting](/sidecar-expander/using/troubleshooting/), then open a tester report.
