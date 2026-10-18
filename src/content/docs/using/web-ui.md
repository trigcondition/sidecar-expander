---
title: Web UI
description: The Pi's page at sidecar.local and the Teensy's web console, tab by tab, and the file browser.
sidebar:
  order: 6
---

## The Pi's page: sidecar.local

The Pi serves its own page. Open <http://sidecar.local> from any browser on the same cable or network ([how to connect](/sidecar-expander/getting-started/install-pi/#first-boot-over-ethernet-sidecarlocal)). Nothing is sent anywhere else.

| Tab | What |
|---|---|
| **Status** | CPU of the render cores, buffer levels, underruns, the Overbridge stream, whether the Rytm is attached, USB-C, temperature |
| **Sound** | MIDI notes on/off, output to tracks or MAIN, computer audio, a machine per voice and a test drone; **Display**: screensaver and brightness |
| **Send FX** | the two effects' TYPE and the tracks' send levels as the Rytm's kit sets them (read only); Kill tails |
| **Record** | the [recorder](/sidecar-expander/using/recorder/) |
| **Machines** | [user machines](/sidecar-expander/using/user-machines/): installed list, upload, delete, rescan, the project's U1..U5, export and import of the slot list, memory bars |
| **Pool & presets** | the project's sample pool, the JUNO and FM lists, and user machine presets <span class="sc-test">in testing</span> (1021) |
| **Files** | the file browser (below) |
| **Log** | the live log and a command line for the console commands |
| **About** | address, build, versions |

The page has no password. Use it on a direct cable or a network you trust.

<!-- SCREENSHOT-PENDING: The Pi's page at sidecar.local (Status, Machines and Pool & presets tabs) -->
:::note[Screenshot coming]
The Pi's page at sidecar.local (Status, Machines and Pool & presets tabs): the page is being restyled for this release; the picture follows when that is done.
:::

### The file browser

- Browse, download, upload (several files, drag and drop), delete, new folder, rename, free space.
- **Folders:** drop a folder (or "Upload folder") and it is uploaded whole, with progress per file and overall, and one Cancel. macOS junk files are skipped.
- **Safe writes:** an upload is written to a temporary file, each piece is read back and checked, and it replaces the old file only when the whole file's checksum matches. An interrupted upload resumes.
- **Protected:** the boot files cannot be changed from the page, and `/.rytm`, `/Samples` and `/Plugins` cannot be deleted or renamed (their contents can).
- Dot-files are hidden unless "show hidden" is on. A Recordings button jumps to your takes.

Uploading during play works, but a large upload can compete with sample streaming from the card. Prefer uploading while the sequencer is stopped.

## The Teensy web console

Open the [console](/sidecar-expander/console/) in **Chrome or Edge on a desktop computer** and press **Connect**. It talks to the Teensy over WebSerial through the micro-USB port. Nothing is sent to any server.

| Tab | What |
|---|---|
| **Status** | the live status line: CPU, the USB stream, MIDI |
| **Sound** | MIDI notes on/off, output to tracks or MAIN, the FIFO target |
| **USB** | the USB mode (in testing) |
| **Machines** | user machines: install, delete, rescan, the project's slots, export/import, memory map |
| **Files** | the SD card: browse, upload with resume, download, new folder, delete |
| **Log** | the log and the console commands |
| **About** | the build |

The tester release's console shows the log, the status and the commands; the Machines and Files tabs are <span class="sc-test">in testing</span>.

<!-- SCREENSHOT-PENDING: The Teensy web console (Status and Machines tabs) -->
:::note[Screenshot coming]
The Teensy web console (Status and Machines tabs): the page is being restyled for this release; the picture follows when that is done.
:::

**Teensy rules:** card writes, deletes and installs wait for the Rytm's transport to stop (the page shows "paused" and continues). Reads go on during play, slowly. `/`, `/Samples` and `/.rytm` are protected.

Use the console to check that the Rytm is streaming (`ob: streaming`, `MIDI attached`) and to copy logs for a tester report.
