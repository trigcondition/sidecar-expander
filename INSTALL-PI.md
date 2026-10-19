# Install: Sidecar (Raspberry Pi 4B)

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

Sidecar, the full Raspberry Pi 4B version of Sidecar | Expander, (the package follows on 2026-10-20). It runs bare-metal: there is no Linux and no login, and it boots straight into the engine from its SD card. It works together with the Rytm mods, so patch and flash those first ([PATCHER.md](PATCHER.md)).

## You need

- A **Raspberry Pi 4 Model B**, 2 GB or more.
- The official **USB-C power supply** (5.1 V, 3 A), or one as good.
- A **microSD card**, any size from 1 GB up. Its contents are replaced.
- A **USB A-to-B cable** from the Pi to the Rytm.
- Optional:
  - an **800x480 HDMI display** (a USB touch panel works too);
  - an **Ethernet cable** to your computer, for the status page.
- From the [Releases](https://github.com/trigcondition/sidecar-expander/releases) page: `sidecar-pi4-sd-<commit>.zip` and its `.sha256`, and the `plugins/` folder (optional, the starter user machines).

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
- **Wi-Fi is off** in the package; see [Wi-Fi](#wi-fi-off-by-default). There is no Bluetooth.
- The page has no password. Use it on a direct cable or a network you trust.

## Starter content

The SD card package already holds the **starter content**: `/JUNO/Factory/` (the Juno-106's 128 factory patches) and `/DX7/` (three 32-voice DX7 banks), with `STARTER-CONTENT-README.txt` and its notice. It is also a zip of its own, `sidecar-content-<version>.zip`, on the Releases page: extract it to the card's root (or upload the folders on `sidecar.local`, Files, Upload folder) if you set up the card before. It only adds files; your own files stay.

On the Rytm: the sample browser's SIDECAR folder → `JUNO/Factory` or `DX7` → **LOAD TO PROJ** adds a patch to the project's list, and the JUNO or 6-OP FM machine's **PAT** knob steps through it.

## Starter user machines

The release's `plugins/` folder holds six starter machines as Pi packages: `sc_acid.a64.rmp`, `sc_wavepad.a64.rmp`, `sc_metal.a64.rmp`, `sc_snare.a64.rmp`, `sc_pluck.a64.rmp`, `sc_grain.a64.rmp` (MIT; check them against `SHA256SUMS`). Upload them on `sidecar.local`, tab **Machines**, or copy them into `/Plugins/` on the card before you put it in the Pi. The Teensy's `.rmp` files do not load on the Pi.

## The remote UI

The remote pages of the `rui1027` Rytm build (TRK + YES on the Rytm) need this release's kernel (1021 or later); tested on hardware. With an older kernel the pages open without any text. The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing.

## Wi-Fi without a cable: sidecar-wifi.txt

<span class="sc-test">in testing</span> To set up Wi-Fi with no Ethernet cable and no web page, put a text file called `sidecar-wifi.txt` at the **root of the Pi's SD card** (the top folder, next to `Plugins`; it shows in the Mac Finder and Windows Explorer). Three lines are enough:

```
ssid=MyNetwork
psk=MyPassword
```

1. Make sure the Wi-Fi chip firmware is on the card in `/firmware/` (see [below](#wi-fi-off-by-default)).
2. Save `sidecar-wifi.txt` at the card root, put the card in the Pi and power it on. The Pi reads the file at the **next boot**, before Wi-Fi starts.
3. The Pi joins the network (DHCP, `sidecar.local`). It stores only the **derived key**, never your password, in `/.rytm/wifi.txt`, and then **deletes `sidecar-wifi.txt`** from the card (if it cannot delete it, it overwrites the contents and renames it `sidecar-wifi.used`).
4. If the network does not come up within **90 seconds** (wrong password, not found, no address), the Pi falls back to its previous setting (Ethernet when Wi-Fi was off) and restarts, so a typo cannot lock you out.

Options (one per line): `band=2g`, `band=5g` or `band=any` (2.4 GHz is the default), and `open=1` for an open network without a password (leave `psk=` out). `password=` works as another name for `psk=`. Lines starting with `#` are comments; spaces around `=` and quotes around the values are fine. The password is 8 to 63 characters, or a 64-digit hex key; the network name is 1 to 32 characters.

If the file cannot be used, the Pi deletes it anyway and writes **`sidecar-wifi-error.txt`** at the card root with a short reason (for example "password must be 8-63 characters"); it never contains your network name or password. Fix the file and try again; a successful import removes the error file.

The alternative is the web page's **Wi-Fi settings** (Status tab, over Ethernet). **Never share the card, or a photo of it, while `sidecar-wifi.txt` is on it**: the password is in it in plain text until the next boot.

## Wi-Fi (off by default)

The SD card package has **Wi-Fi off**: it ships no Wi-Fi settings and no Wi-Fi chip firmware. Joining works on hardware; the **Wi-Fi settings** section on the web page's Status tab (scan, Connect and save, a 90 s fallback) is in testing. The network is either Ethernet or Wi-Fi, chosen at boot. To try it:

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

## Updating, and going back

- To update, copy the new release's files over the old ones on the card. Your samples, recordings, `/Plugins/` and `/.rytm/` stay. Each package's `BUILD-INFO-pi.txt` names the kernel it carries.
- To stop using Sidecar, reformat the card or use it for something else. Nothing on the Pi itself is changed.

## Check that it works

1. Power the Pi with the Rytm connected (with the patched OS).
2. On the Rytm, pick an external machine on a track and play it. Then set a SEND FX TYPE, such as CLOUDSEED, and send a track to it with AMPLITUDE 2.
3. The display, or `sidecar.local`, shows the engine's status and that the Rytm is connected.

If something is off, see [KNOWN-ISSUES.md](KNOWN-ISSUES.md), then open a tester report.
