---
title: Web UI
description: "The Pi's page at sidecar.local, tab by tab: status with storage and the sample library, sound, send FX, LFO, record, user machines, and in 0.3 the Pool, Presets and Project tabs; the file browser."
sidebar:
  order: 6
---

## The Pi's page: sidecar.local

The Pi serves its own page. Open <http://sidecar.local> from any browser on the same cable or network ([how to connect](/sidecar-expander/getting-started/install-pi/#first-boot-over-ethernet-sidecarlocal)). Nothing is sent anywhere else.

| Tab | What |
|---|---|
| **Status** | CPU of the render cores, buffer levels, underruns, the Overbridge stream, whether the Rytm is attached, USB-C, temperature, the **Power** tile ("too weak" with a warning when the supply is, e.g. a Pi 5 not on its 27 W adapter), the SD card speed test, the **Wi-Fi** section and the **Storage** section (below) |
| **Sound** | MIDI notes, output to tracks or MAIN, the **IN L/R source** (Inputs or the Rytm's FX return), computer audio, a machine per voice and a test drone; **Display**: screensaver and brightness (the UI style through the console, `uistyle=oled` or `uistyle=classic`) |
| **Send FX** | the two effects' TYPE and the tracks' send levels as the Rytm's kit sets them (read only); Kill tails |
| **LFO** | the eight [LFOs](/sidecar-expander/using/lfo/): target, wave (with the DESIGN grid), rate, retrig, depth |
| **Record** | the [recorder](/sidecar-expander/using/recorder/): record, arm, channels, and the takes with a play button per channel |
| **User machines** | [user machines](/sidecar-expander/using/user-machines/): installed list, upload, delete, rescan, the project's U1..U5, export and import of the slot list, memory bars |
| **Pool** (0.3) | the project's [POOL lists](/sidecar-expander/using/pools/#on-the-web-page) (below) |
| **Presets** | the JUNO and 6-OP FM lists and the user machine presets; **Save current** adds what a voice plays now to its list <span class="sc-ok">hardware</span>. Called **Pool & presets** in 0.2.0, where it also held the sample pool |
| **Project** (0.3) | [projects and bundles](/sidecar-expander/using/projects-bundles/#the-web-page-project-tab) (below) |
| **Files** | the file browser (below) |
| **Log & console** | the live log and a command line for the console commands |
| **About** | address, build, versions |

The choice buttons are **segmented toggles that show the device's own state**: a click shows the choice as pending until the Sidecar confirms it, and a refused change is put back. <span class="sc-ok">hardware</span>

The page has no password. Use it on a direct cable or a network you trust.

![sidecar.local, Status tab with the Wi-Fi section](../../../assets/ui/pi-status.png)
![sidecar.local, Sound tab: segmented toggles for MIDI notes, output, IN L/R source and computer audio; machine, drone, FIFO target; the display settings](../../../assets/ui/pi-sound.png)
![sidecar.local, Record tab: record and arm, bit depth, the channels, and two takes with a play button per channel](../../../assets/ui/pi-record.png)
![sidecar.local, User machines tab: the project's U1..U5 and the six starter machines with their size, CPU and fit](../../../assets/ui/pi-machines.png)
![sidecar.local, Files tab: the card's folders, protected boot files, upload files and folders](../../../assets/ui/pi-files.png)
![sidecar.local in dark mode on a phone, Status tab](../../../assets/ui/pi-status-mobile.png)

<small>Screenshots: the 0.2 page with mock data (`mock_web.py`: made-up addresses, takes and machines).</small>

:::caution[New in 0.3]
The Sidecar's 0.3 test build (Sidecar (Pi) only) adds the **Pool** and **Project** tabs, the **Storage** section and the sample library's line on the Status tab, and the Files tab's pool buttons. The 0.2.0 tab **Pool & presets** is now **Presets**. <span class="sc-test">in testing</span> (Mac, with the mock page)
:::

### Pool

SAMPLES / WAVETABLES / INSTRUMENTS, banks A..H, the project and the pool RAM. Per row: the name, the state, the size, how often it played and the voices on it now. **Accept** (a changed file), **Replace** (from a small file browser), **Unload**, **Select unused**, **Select none**, **Unload selected**, **Undo**, **Refresh**. A row in use asks first, and replacing or unloading it is refused while the Rytm plays. The Rytm's bank list and the touchscreen show the same rows. See [Pools](/sidecar-expander/using/pools/).

### Project

- **Projects**: every project on the card (the Rytm's current one marked `*`, an imported one the Rytm has not named yet `imp.`), with its Sidecar files and their size. **Download** (the browser saves the bundle), **To card** (`/Bundles/`), **To USB** (the stick's `/SIDECAR`), **Rytm file…** (the Rytm project file you exported with Elektron Transfer, for the project's next export), **Delete** (the project's Sidecar files; its samples stay).
- **Bundles on the card** and **Import a bundle…** (or drop a `.sidecar.zip` on the list): checked, then a summary before anything is written.
- **USB stick**: the mounted sticks with their free space, **Eject**, and the stick's bundles with **Import**.
- While a job runs the tab shows its phase and progress, and **WAITING (PLAYING)** or **WAITING (RECORDING)** while the Rytm plays or the recorder records.

See [Projects and bundles](/sidecar-expander/using/projects-bundles/).

### Storage and the library

On the Status tab, **Storage**:

- the SD card, the mounted [USB drives](/sidecar-expander/using/storage/#usb-drives) (FAT32 with the MBR scheme) and, on the Pi 5, an NVMe SSD, with their free space; a drive that cannot be mounted says why (GPT, exFAT);
- **Eject** before pulling a drive;
- **Run bench**: the [storage bench](/sidecar-expander/using/storage/#measuring-a-drive-storbench) on a drive, with its result as a table;
- **Library**: one line for the [sample library](/sidecar-expander/using/pools/#the-sample-library): how many files it knows, how much is hashed, duplicates, missing files, and whether it waits (while the Rytm plays).

### Wi-Fi settings

<span class="sc-test">in testing</span>. The Status tab's **Wi-Fi** section: on / off, a network list from a scan (signal, a lock for secured networks, the band), "Other network…", a password field (never pre-filled), **Connect and save**, **Forget network**, and the current connection. Sidecar uses one network at a time, so **Connect and save restarts the Pi** and tries the new network at that boot. If it is not up within 90 seconds (a wrong password, no address, not found), the previous setting comes back and the Pi restarts on it, so a typo cannot lock you out. The password is stored only as the network's key, never shown again. Wi-Fi stays off in the SD card package; turning it on here works over Ethernet. The page has no login yet, so anyone on the same network can change these settings. With no cable at all, use the card-root file instead: see [Wi-Fi without a cable: sidecar-wifi.txt](/sidecar-expander/using/wifi/#wi-fi-without-a-cable-sidecar-wifitxt).

### The file browser

- Browse, download, upload (several files, drag and drop), delete, new folder, rename, free space.
- **Folders:** drop a folder (or "Upload folder") and it is uploaded whole, with progress per file and overall, and one Cancel. macOS junk files are skipped.
- **Safe writes:** an upload is written to a temporary file, each piece is read back and checked, and it replaces the old file only when the whole file's checksum matches. An interrupted upload resumes.
- **Protected:** the boot files cannot be changed from the page, and `/.rytm`, `/Samples` and `/Plugins` cannot be deleted or renamed (their contents can).
- Dot-files are hidden unless "show hidden" is on. A Recordings button jumps to your takes.
- **Into the pool** (0.3): **+SMP** / **+WT** next to a WAV or AIFF and **+INST** next to an `.sfz` put the file into the first free row of the bank picked above the table. **Fill bank** on a folder fills that bank's empty rows in name order (SAMPLES and WAVETABLES).

Uploading during play works, but a large upload can compete with sample streaming from the card. Prefer uploading while the sequencer is stopped.
