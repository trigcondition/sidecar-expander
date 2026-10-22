---
title: Storage
description: "The SD card, USB drives and the Pi 5's NVMe SSD: how to format them (FAT32, MBR), mount and eject them, and measure them with stor=bench."
sidebar:
  order: 6.6
---

:::caution[New in 0.3]
New in 0.3 (until 0.3.0 is released: the test line with the Sidecar's 0.3 test build). Built and tested on the Mac; the drives are not yet measured on a Pi. Sidecar (Pi) only.
:::

The Sidecar boots from its **SD card**, which stays the place of record: projects, pools and samples live there. Besides it, it mounts **USB drives** as they are plugged in and, on the Pi 5, an **NVMe SSD**. In this build the extra drives are used for [bundles](/sidecar-expander/using/projects-bundles/#usb-sticks) and the storage bench. <span class="sc-test">in testing</span>

| Drive | Name | Board |
|---|---|---|
| SD card | `SD` | Pi 4B, Pi 5 |
| USB drives (up to three) | `USB`, `USB2`, `USB3` | Pi 4B, Pi 5 |
| NVMe SSD on the PCIe connector | `NVME` | Pi 5 |

## Formatting a USB drive

**FAT32 with the MBR scheme** ("Master Boot Record"):

- **Mac:** Disk Utility, View > Show All Devices, select the **device** (not the volume), Erase, Format **MS-DOS (FAT)**, Scheme **Master Boot Record**.
- **Windows:** sticks come with MBR. Pick FAT32; Windows' own dialog offers it only up to 32 GB, so use a FAT32 tool for larger drives.

Not mounted in this build:

- **GPT** (Disk Utility's default "GUID Partition Map");
- **exFAT** (the default of macOS and Windows for large drives).

The log and the web page say which it is: "GPT partition table: use the MBR scheme (FAT32)", "exFAT: FAT32 only in this build". FAT32 limits a file to 4 GB, which is fine for samples and bundles. Drives with 4 KB logical sectors are refused.

## USB drives

- **Plug it in:** a blue USB 3 port on the Pi 4 (the Rytm sits on a black USB 2 port), any port on the Pi 5. It mounts within a second. It shows on the touchscreen's STATUS page (UP + T10) under LINKS (`USB DRIVE`) and on the web page's Status tab under *Storage*.
- **Eject before pulling it:** the web page's **Eject**, the PROJECT page's EJECT, or `stor=eject:USB` on the console. It then says "ejected: safe to remove". A drive pulled while mounted is unmounted at once; a write in progress can be lost (FAT32 has no journal).
- An ejected drive left plugged in: `stor=rescan` (Pi 4) brings it back; on the Pi 5 unplug and plug it.
- A drive that did not mount (wrong format) and was re-formatted: plug it in again, or `stor=mount:USB`.
- Some sticks need `usbpowerdelay=1500` in `cmdline.txt` to be found.

## NVMe SSD (Pi 5)

- An M.2 HAT on the Pi 5's PCIe connector (the official M.2 HAT+ or a bottom-mount NVMe base).
- Format it **FAT32 with the MBR scheme**, as above (on Windows a 256 GB+ SSD needs a FAT32 tool). 512-byte sectors only.
- **The NVMe driver is experimental.** Use an SSD with nothing on it you cannot lose; the SD card stays the boot drive and the place of record.
- It is looked for once at boot (no hot-plug). `nvme=0` in `cmdline.txt` skips the search.
- `stor=eject:NVME` unmounts it; it stays listed as ejected until the next boot (`stor=mount:NVME` mounts it again).

## Measuring a drive: `stor=bench`

The storage bench measures a drive's sequential and random speed, and how much it disturbs the Sidecar while the audio runs. It never runs by itself and never formats anything: it writes two test files and removes them.

Start it with the Rytm connected but **stopped** and nothing recording, from the web page's **Status** tab (*Storage*, **Run bench**) or the console (the web page's *Log & console*, or the serial console with a `:` before each line):

```
stor                 # the drives: state, format, free space, link
stor=bench:SD        # the SD card (a few minutes; the sound may drop out)
stor=bench:USB       # a USB stick or SSD
stor=bench:NVME      # Pi 5: the NVMe SSD
stor=last            # the last result again
stor=cancel          # stop it, remove its files
```

- Options: `stor=bench:USB:512` sets the test file's size in MB (default 256), `n=` the number of random reads.
- Refused while the Rytm plays, a take plays back, the recorder is armed or records, or the drive is not mounted.
- The result is a table in the log and on the web page, also saved as `/.rytm/storbench-<drive>.txt` on the SD card.
- The [streaming budget](/sidecar-expander/using/stereo-out/#the-streaming-budget) uses the bench's numbers: how many sample streams a drive can carry.

What to expect (estimates, to be measured on the Pi): SD card 15-22 MB/s read, 8-12 MB/s write; USB 2 stick 20-35 MB/s; USB 3 stick or SSD 80-250 MB/s; NVMe about 280 MB/s reads.

## Limitations

- Sidecar (Pi) only. The drives are not yet measured on a Pi.
- FAT32 with MBR only: exFAT and GPT are a build option that is off (tested on the Mac only).
- In this build the extra drives hold bundles; projects, pools and samples play from the SD card. The [sample library](/sidecar-expander/using/pools/#the-sample-library) does not index USB drives.
- NVMe is experimental (one queue, no power management): test SSDs only.
- A drive pulled without eject can lose a write in progress.
