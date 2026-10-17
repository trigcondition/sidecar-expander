# Install: Raspberry Pi 4B

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

The Raspberry Pi 4B version of Sidecar | Expander (available from 2026-10-20). It runs bare-metal: there is no Linux and no login, and it boots straight into the engine from its SD card. It works together with the Rytm mods, so patch and flash those first ([PATCHER.md](PATCHER.md)).

## You need

- A **Raspberry Pi 4 Model B**, 2 GB or more.
- The official **USB-C power supply** (5.1 V, 3 A), or one as good.
- A **microSD card**, any size from 1 GB up. Its contents are replaced.
- A **USB A-to-B cable** from the Pi to the Rytm.
- Optional:
  - an **800x480 HDMI display** (a USB touch panel works too);
  - an **Ethernet cable** to your computer, for the status page.
- From the [Releases](https://github.com/trigcondition/sidecar-expander/releases) page: `sidecar-pi4-sd-<commit>.zip` and its `.sha256`.

## Make the SD card

1. Check the download: `shasum -a 256 sidecar-pi4-sd-*.zip` must match the `.sha256` file.
2. Format the card as **FAT32** with one partition (MBR):
   - macOS: Disk Utility > Erase, Format "MS-DOS (FAT)", Scheme "Master Boot Record".
   - Windows: use the SD Association's "SD Card Formatter", or `format X: /FS:FAT32` for cards of 32 GB or less.
   - Linux: `mkfs.vfat -F 32`.
   Raspberry Pi Imager can do it too: "Erase", which formats as FAT32.
3. Unzip the file and copy **the files themselves** (not the folder) to the card's top level.
4. Eject the card and put it in the Pi.

The card then holds:

| File | What |
|---|---|
| `start4.elf`, `fixup4.dat`, `bcm2711-rpi-4-b.dtb` | the Raspberry Pi boot firmware (unmodified; see `LICENCE.broadcom` and `COPYING.linux`) |
| `armstub8-rpi4.bin` | the ARM boot stub (from Circle) |
| `config.txt` | boot settings: the display, then the Sidecar boot block |
| `cmdline.txt` | Sidecar options, one line (see below) |
| `sdboot.img` | the small loader that starts the engine |
| `engine.img` | the Sidecar engine |

If you cannot use the bundled boot firmware for some reason, get `start4.elf`, `fixup4.dat`, `bcm2711-rpi-4-b.dtb` and `LICENCE.broadcom` from the official repository instead: <https://github.com/raspberrypi/firmware/tree/master/boot>. The release was tested with commit `0641c5bf25d185d5bf25d8dcafd1da6dc8fdbf68`.

## Connect and power on

```
 Analog Rytm MKII [USB-B] ---- USB A-to-B ----> [USB-A] Raspberry Pi 4B [USB-C] <---- power supply
                                                        [HDMI 0] ----> 800x480 display (optional)
                                                        [Ethernet] ---> computer (optional)
```

- Use one of the Pi's USB-A ports for the Rytm, with no hub. The Rytm has its own power.
- On the Rytm: SETTINGS > SYSTEM > USB CONFIG set to the Overbridge mode.
- Power on the Pi. A boot screen with a progress bar comes up within a few seconds; then the engine runs.

## Options (`cmdline.txt`)

One line of `name=value` options, separated by spaces. The release sets:

```
sdport=0
```

`sdport=0` turns off writing boot files over the network. Leave it in. Every other option keeps its default:

| Option | Default | |
|---|---|---|
| `out=tracks\|main` | tracks | voices on their tracks' channels (what the mods expect), or summed on MAIN |
| `notes=on\|off` | off | the Rytm's MIDI notes trigger voices (not needed with the mods) |
| `display=0\|1` | 1 | the HDMI display and touch |
| `web=0\|1` | 1 | the status page at `http://sidecar.local` |
| `ip=`, `netmask=` | built in (see below) | the Pi's Ethernet address |

Example: `sdport=0 display=0` for a Pi without a display.

## Display (optional)

`config.txt` sets HDMI to 800x480 at 60 Hz:

```
[all]
hdmi_force_hotplug=1
hdmi_group=2
hdmi_mode=87
hdmi_cvt=800 480 60 6 0 0 0
disable_overscan=1
```

For another display, change the `hdmi_cvt` line to its resolution, and add `width=` and `height=` with the same values to `cmdline.txt`. Without a display these lines do no harm. Leave the block that starts `# sidecar sdboot begin` as it is: without it the Pi does not start the engine.

## Network and sidecar.local

- The Pi serves a status page with the live log and a few controls. Connect an Ethernet cable **directly** from the Pi to your computer, then open <http://sidecar.local>.
- The Pi has a fixed **link-local address, 169.254.61.60**.
  - A computer with no address set on that Ethernet port gives itself a 169.254.x.y address after a few seconds. macOS and Windows do this by default. The page then works with no network settings at all.
  - If your computer's port has a manual address, set it to 169.254.61.59, netmask 255.255.0.0. Or set `ip=` and `netmask=` in `cmdline.txt` to fit your network.
- The Pi has no DHCP client, so a router network only works with a matching `ip=`.
- `sidecar.local` is answered by the Pi itself (mDNS). If a second Sidecar is on the same network, it becomes `sidecar-1.local`.
- **Wi-Fi and Bluetooth are off.** The engine has no radio support at all.
- The page has no password. Use it on a direct cable or a network you trust.

## Updating, and going back

- To update, copy the new release's files over the old ones on the card.
- To stop using Sidecar, reformat the card or use it for something else. Nothing on the Pi itself is changed.

## Check that it works

1. Power the Pi with the Rytm connected (with the patched OS).
2. On the Rytm, pick an external machine on a track and play it. Then set a SEND FX TYPE, such as CLOUDSEED, and send a track to it with AMPLITUDE 2.
3. The display, or `sidecar.local`, shows the engine's status and that the Rytm is connected.

If something is off, see [KNOWN-ISSUES.md](KNOWN-ISSUES.md), then open a tester report.
