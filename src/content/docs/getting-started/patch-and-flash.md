---
title: Patch and flash the Rytm
description: "The Rytm firmware 0.4.0 (for Sidecar 0.4.0, 0.4.1, 0.4.2 and 0.4.3): patch your own stock OS 1.74 (or 1.73) file in the browser patcher, check it, and send it to the Rytm with Transfer. You can move between 1.73 and 1.74 in both directions with Elektron's own files. Advanced: build the same file with elekloader. The 0.2.0 builds."
sidebar:
  order: 2
---

The Rytm side of Sidecar is a set of mods to the Rytm's OS. The Rytm firmware 0.4.0, which Sidecar 0.4.0, 0.4.1, 0.4.2 and 0.4.3 all use, has two builds of the same mods, one for **OS 1.74** and one for **OS 1.73**. We do not distribute firmware, stock or modified. You build the modified firmware from **your own** stock OS file on your own computer, and check that the result is bit-identical to the build we tested.

:::caution
Back up first: use Transfer to back up your projects, kits, sounds and samples. Read [Recovery to stock](/sidecar-expander/getting-started/recovery/) before you flash.
:::

## The Rytm firmware 0.4.0: patch it in your browser

Sidecar 0.4.0, 0.4.1, 0.4.2 and 0.4.3 need the Rytm firmware 0.4.0: a Rytm on 0.3.1 must be flashed. Sidecar 0.4.1, 0.4.2 and 0.4.3 change only the Pi: a Rytm that already runs the Rytm firmware 0.4.0 needs no new flash. (The 0.3.1 build: the [0.3 docs](/sidecar-expander/0.3/getting-started/patch-and-flash/).) For an Analog Four MKII, see [Analog Four MKII](/sidecar-expander/using/analog-four/#install).

The [patcher](/sidecar-expander/patcher/) turns your stock OS file into the Rytm firmware 0.4.0 in your browser. Nothing is uploaded: the page reads your file and fetches only its own patch files.

1. Download the stock OS from Elektron's Analog Rytm MKII support page: `Analog-Rytm_MKII_OS1.74_dist.zip`. Unzip it: you need `Analog-Rytm_MKII_OS1.74.syx`.
2. Open the [patcher](/sidecar-expander/patcher/). Leave the build on **`rel0-4-0-os1.74`** (the default; for a stock 1.73 file pick `rel0-4-0`).
3. Drop the stock `.syx` on the page, or click to choose it. Only the unmodified file is accepted.
4. Press **Patch**, then **Save .syx**. The page checks the result itself and saves nothing if it is wrong.
5. Send the saved file to the Rytm with Transfer ([below](#send-it-to-the-rytm)).

The result is bit-identical to the elekloader build we tested ([below](#advanced-build-it-with-elekloader)). To check it yourself:

| Build | Saved file | SHA-256 |
|---|---|---|
| `rel0-4-0-os1.74` | `Analog-Rytm_MKII_OS1.74_rel0-4-0.syx` | `538ae6fa1a66dfb72141743036c40b4f3845ed73a4ea59f7e3b6aa9e51fab337` |
| `rel0-4-0` | `Analog-Rytm_MKII_OS1.73_rel0-4-0.syx` | `07780e9eb4bce7f71c83da3134ede4782f7ea7af211eb6787c670607707bff18` |

### Which OS: 1.74 or 1.73

- **OS 1.74** is what Elektron offers now: their Rytm MKII support page has only `Analog-Rytm_MKII_OS1.74_dist.zip`, with the stock `Analog-Rytm_MKII_OS1.74.syx` inside. If you don't have a 1.73 file, use 1.74. The 1.74 build has run on a real Rytm: stock 1.74 first, then the Sidecar's 1.74 build, with the Sidecar machines, the pages, the send FX (including ROUTE PRE), the MASTER page and kit save and reload all working.
- **OS 1.73** stays supported in 0.4.0 for people who have its stock file. Elektron no longer offers 1.73 for download, so if you want it, keep your own copy of `Analog-Rytm_MKII_OS1.73.syx`.
- **Use the build for the OS of your stock file.** elekloader refuses a module made for another OS.
- **Moving between 1.73 and 1.74 works in both directions.** Flashing Elektron's stock 1.73 or stock 1.74 file always works (checked on a unit), whether the Rytm runs stock or the Sidecar's build. Recovery is the stock file of the OS you want to be on. Back up your projects before any OS change, as always. Elektron's site now offers only 1.74, so to be able to go back to 1.73 you need your own copy of that file.

**The recommended way to 1.74:** first flash Elektron's stock 1.74 file, over DIN through the STARTUP menu if you can ([Recovery to stock](/sidecar-expander/getting-started/recovery/#if-the-rytm-does-not-boot-the-startup-menu)). That proves that recovery works on your unit. Then patch and flash the Sidecar's 1.74 build from the same stock file.

**Directly:** a Rytm on 1.73, stock or with the Sidecar's 1.73 build, can also take the Sidecar's 1.74 build straight away, since the file is a whole OS. It is the same move, without the recovery check first.

**Projects should carry over** to 1.74: its project, kit, sound and pattern code is 1.73's with its addresses moved, and it only adds the Outbox's main-output routing. That was checked in the code and in the emulator, and a kit saved and reloaded on a real Rytm on 1.74. Back up every project first, as before any OS change.

## Advanced: build it with elekloader

You do not need this: the patcher above makes the same file. If you would rather build it yourself, the 0.4.0 Rytm firmware also comes as an [elekloader](https://github.com/irpina/elekloader) **bundle**: two module files that elekloader's web page (or its command line) puts into your stock OS file. The result is one `.syx` that you flash like any OS update. It works with the Sidecar 0.4.0 card.

### What you need

**OS 1.74:**

| File | What | SHA-256 |
|---|---|---|
| `Analog-Rytm_MKII_OS1.74.syx` | the stock OS 1.74, in Elektron's `Analog-Rytm_MKII_OS1.74_dist.zip` | `cb0f99d620edde994fb860c0e79cc2464e427d06882828cfdfb00fc53700e123` |
| `core-0.1-os1.74.elemod` | elekloader's core 0.1 for OS 1.74: the base every elekloader mod builds on | `89c00065e8f83ce839978c45a32200e09879682b8b95cbff0bdb71ca09dc3c8a` |
| `rytm-sidecar-0.4.0-os1.74.elemod` | the Sidecar mods, all in one module, for OS 1.74 | `794448662bb11fd2b9ece677640a431e2a6d9e169952aa3378cd0e3d9834e545` |

**OS 1.73:**

| File | What | SHA-256 |
|---|---|---|
| `Analog-Rytm_MKII_OS1.73.syx` | the stock OS 1.73 (Elektron no longer offers it: use the file you have) | `8ad671087ec30433d5407c7380d2396e0915ab931c5d3dd18a78bf284d3d1e52` |
| `core-0.1.elemod` | elekloader's core 0.1 for the Rytm | `33de51c098ab0ecd9cc57e9dfc3efa3d95f8133b1f4a4e6abd80d5fdba2dd825` |
| `rytm-sidecar-0.4.0.elemod` | the Sidecar mods, all in one module | `d003a738374ae3cb643c5d6c4cd4622dd1f7931398dcdfaf016b82576c956c44` |

Each OS's two `.elemod` files are on the [Rytm firmware 0.4.0 release page](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.4.0) with `SHA256SUMS`, `LICENSE`, `NOTICE`, `TOOLCHAIN.txt` and the source of elekloader's parts (1.74: `elekloader-13fa795-core-ar2-src.tar.gz`; 1.73: `elekloader-8972d70-core-ar2-src.tar.gz`; both: `elekloader-c150ac5-src.tar.gz`). Check both hashes before you use them. Both builds come from the same source and do the same; the 1.74 one differs only by the firmware addresses that moved between the two OSes. The mods are licensed **GPL-2.0-or-later**.

### Build the `.syx`

1. Open the elekloader page: <https://irpina.github.io/elekloader/>.
2. Choose your stock firmware, `Analog-Rytm_MKII_OS1.74.syx` (or `Analog-Rytm_MKII_OS1.73.syx`). The page knows it by its hash.
3. Add that OS's core and module as your own mods: `core-0.1-os1.74.elemod` and `rytm-sidecar-0.4.0-os1.74.elemod` (1.73: `core-0.1.elemod` and `rytm-sidecar-0.4.0.elemod`). Use our core file, not one the page lists: the page's own Rytm cores for 1.74 are newer ones, which are refused (below).
4. Tick `rytm-sidecar`. That ticks the core it needs. The check should say there are no conflicts.
5. **Set the version to your OS: `1.74` (or `1.73`).** The page's default for the Rytm is `2.0a`. **Never flash a build whose version is not your stock file's.**
6. Build and download the `.syx`. Its SHA-256 must be:

   | Build | SHA-256 |
   |---|---|
   | version 1.74 | `538ae6fa1a66dfb72141743036c40b4f3845ed73a4ea59f7e3b6aa9e51fab337` |
   | version 1.73 | `07780e9eb4bce7f71c83da3134ede4782f7ea7af211eb6787c670607707bff18` |

   If yours differs, do not flash it. The page may run a newer elekloader; build with the command line at the tested commit instead:

   ```sh
   git clone https://github.com/irpina/elekloader && cd elekloader
   git checkout c150ac583a4b7e6d64680d5592f4a40f409193f7
   python3 -m elekloader.patch --stock Analog-Rytm_MKII_OS1.74.syx --mod core-0.1-os1.74.elemod \
       --mod rytm-sidecar-0.4.0-os1.74.elemod --out sidecar.syx --version 1.74
   ```

   For 1.73: `--stock Analog-Rytm_MKII_OS1.73.syx --mod core-0.1.elemod --mod rytm-sidecar-0.4.0.elemod --version 1.73`.

Then send it to the Rytm ([below](#send-it-to-the-rytm)).

- **Never share the `.syx` you built:** it contains Elektron's firmware. Share the `.elemod` files instead.
- **Use core 0.1 only.** A newer core keeps its settings in the same spare bytes the Sidecar mods use; elekloader refuses that combination with a message that the sites "overlap". Untick the newer core.
- **No mixing with other mods** for now: other people's Rytm mods for 1.74 need a newer core, and patch some of the same places, so elekloader refuses the set. The Sidecar module is all or nothing.
- What is in the module: the external machines, the SysEx router, the SIDECAR folder, the send FX pages, the remote UI and FX in. Not in it: the **REMOTE KEYS** mod (development and testing only). It does hold a **freeze probe**: if the Rytm's screen ever stops for over 2 seconds, the Sidecar's log shows `FREEZE PROBE` with where it stopped (please report it).
- To go back, flash the stock file of the OS you want to be on (1.73 or 1.74): see [Recovery to stock](/sidecar-expander/getting-started/recovery/). Use a scratch project for your first session under the mods.

## The 0.2.0 builds (older)

The 0.2.0 release used two patch builds of OS 1.73, `rui1027d` and `sfx1021`, made with our patcher. Use them only with a 0.2.0 Sidecar card.

### What you need

- The stock file `Analog-Rytm_MKII_OS1.73.syx` from the official download page. Only the unmodified file is accepted. Its SHA-256 is:

  ```
  8ad671087ec30433d5407c7380d2396e0915ab931c5d3dd18a78bf284d3d1e52
  ```

- One of the two patchers below. Both give the same result, byte for byte.

### Pick a build

| Build | What |
|---|---|
| `sfx1021` (option: without the remote pages) | EXT machines on every track, the SEND FX 1/2 pages (AMPLITUDE 2; TYPE and P1..P5 with the Sidecar's labels), stepped list knobs, user slots, and the SIDECAR folder in the sample browser. |
| `rui1027d` (default, recommended) | everything in `sfx1021`, plus the remote pages: a connect screen when the Sidecar comes up, the Rytm's FX return on IN L/R for recording and SCOPE, and with TRK + YES the SIDECAR and SYSTEM status pages, SCOPE and meters, the REC page (with playback on the Pi) and the voice pages, in the Rytm's own font. The page catches only the keys and knobs it uses: PLAY, STOP, RECORD, the pads, mutes, FILL and tap tempo work as usual |

The 0.2.0 builds are for OS 1.73 only: the patched file is a whole OS (1.73 plus the mods), made from Elektron's stock OS 1.73 `.syx`.

### Option A: in the browser

Open the [patcher](/sidecar-expander/patcher/).

1. Pick the build.
2. Drop your stock `.syx` on the page, or click to choose it.
3. Press **Patch**, then **Save**.

The file is read and patched by JavaScript in the page itself. Nothing is uploaded: the page fetches only its own patch files. You can check that in your browser's network panel.

### Option B: the Python script

Python 3.8 or newer, no extra packages. From a copy of the repository:

```sh
python3 public/patcher/sidecar_patch.py ~/Downloads/Analog-Rytm_MKII_OS1.73.syx public/patcher/patches/sidecar-sfx1021.json
```

This writes `Analog-Rytm_MKII_OS1.73_sfx1021.syx` next to the stock file (`-o` chooses another path).

### Check the result

Both patchers check the result themselves and save nothing if it is wrong. To check it yourself:

```sh
shasum -a 256 Analog-Rytm_MKII_OS1.73_sfx1021.syx
```

| Build | SHA-256 |
|---|---|
| sfx1021 | `e86805ff1e2c5a2e2784bf455fe5fdd6c2336463da04892442e451445fa82f4e` |
| rui1027d | `4843848805c0e08b3cf7c69bf5b68ca7e1453bb643d351709bdad9f59468dce8` |

## Send it to the Rytm

Send the patched (or built) file as an OS update, exactly as you would send an official one:

- **Transfer (USB)**: drop the `.syx` on Transfer while the Rytm is connected and confirm on the unit.
- **STARTUP menu (DIN MIDI)**: hold FUNC while you power on, press TRIG 4 (OS UPGRADE), and send the file from Transfer's legacy OS upgrade mode, or any SysEx tool, through a DIN MIDI interface. This route works even if the OS does not boot. It is slow: about 16 minutes or more.

After the update the Rytm may stay on "Success! Rebooting". That is stock behaviour: power cycle it. After an OS upgrade the Rytm may also update its bootstrap at the first restart: do not turn the power off then.

**First start with 0.3 (from 0.2.0):** the Sidecar moves your existing projects' files to their Rytm slots by itself ([Projects by slot](/sidecar-expander/using/projects-bundles/#projects-belong-to-the-rytms-slot)).

## How the patcher works

A patch file describes the modified OS image as records against your decoded stock image:

- bytes we wrote: the mods' code, their hooks and data, and elekloader's core and boot copier;
- copies: "take this many bytes from this place in your own stock image". Any run of 4 or more of our bytes that also occurs in the stock firmware is stored this way, so a patch file never carries firmware bytes.

The patcher checks the stock file's hash, decodes the SysEx transport and unpacks the MAIN OS section, applies the records and checks the image's hash, packs the image and rebuilds the `.syx` from your file's other sections (recomputing every checksum and counter), and compares the result with the tested build's hash.

The codec is elekloader's (GPL-2.0-or-later), which comes from digikit. The browser patcher is a line-for-line port, tested to give the same bytes as the Python on every build.
