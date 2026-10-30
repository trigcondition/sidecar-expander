---
title: Patch and flash the Rytm
description: "Sidecar 0.3.0: build the Rytm firmware from your own stock OS 1.73 file with elekloader (core 0.1 + rytm-sidecar-0.3.0.elemod), check it, and send it to the Rytm. The 0.2.0 builds: the patcher."
sidebar:
  order: 3
---

The Rytm side of Sidecar is a set of mods to the Rytm's OS 1.73. We do not distribute firmware, stock or modified. You build the modified firmware from **your own** stock OS 1.73 file on your own computer, and check that the result is bit-identical to the build we tested.

:::caution
Back up first: use Transfer to back up your projects, kits, sounds and samples. Read [Recovery to stock](/sidecar-expander/getting-started/recovery/) before you flash.
:::

## Sidecar 0.3.0: build it with elekloader

The 0.3.0 Rytm firmware comes as an [elekloader](https://github.com/irpina/elekloader) **bundle**: two module files that elekloader's web page (or its command line) puts into your stock OS file. The result is one `.syx` that you flash like any OS update. It works with the Sidecar 0.3.0 card. <span class="sc-test">in testing</span> (it ran in the emulator; on 2026-10-29 the first Rytm was flashed with it)

### What you need

| File | What | SHA-256 |
|---|---|---|
| `Analog-Rytm_MKII_OS1.73.syx` | the stock OS 1.73, from Elektron's support site | `8ad671087ec30433d5407c7380d2396e0915ab931c5d3dd18a78bf284d3d1e52` |
| `core-0.1.elemod` | elekloader's core 0.1 for the Rytm: the base every elekloader mod builds on | `33de51c098ab0ecd9cc57e9dfc3efa3d95f8133b1f4a4e6abd80d5fdba2dd825` |
| `rytm-sidecar-0.3.0.elemod` | the Sidecar mods, all in one module | `e93a0b2794a8316dad1d6cfe52151820e153d6f86427d12343a5f947cae0c28a` |

The two `.elemod` files are on the [Rytm firmware 0.3.0 release page](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.3.0) with `SHA256SUMS`, `LICENSE`, `NOTICE`, `TOOLCHAIN.txt` and the source of elekloader's parts (`elekloader-8972d70-core-ar2-src.tar.gz`, `elekloader-c150ac5-src.tar.gz`). Check both hashes before you use them. The mods are licensed **GPL-2.0-or-later**.

### Build the `.syx`

1. Open the elekloader page: <https://irpina.github.io/elekloader/>.
2. Choose your stock firmware, `Analog-Rytm_MKII_OS1.73.syx`. The page knows it by its hash.
3. Add `core-0.1.elemod` and `rytm-sidecar-0.3.0.elemod` as your own mods. (The page lists no Rytm core for OS 1.73, so you add the core file too.)
4. Tick `rytm-sidecar`. That ticks the core it needs. The check should say there are no conflicts.
5. **Set the version to `1.73`.** The page's default for the Rytm is `2.0a`. **Never flash a build whose version is not 1.73**: going back to stock from it is untested.
6. Build and download the `.syx`. Its SHA-256 must be:

   ```
   893ed9a5fc27ab18687c1ea95d7a07f4ff4b23fde235173ce332e54055a733ab
   ```

   If yours differs, do not flash it. The page may run a newer elekloader; build with the command line at the tested commit instead:

   ```sh
   git clone https://github.com/irpina/elekloader && cd elekloader
   git checkout c150ac583a4b7e6d64680d5592f4a40f409193f7
   python3 -m elekloader.patch --stock Analog-Rytm_MKII_OS1.73.syx --mod core-0.1.elemod \
       --mod rytm-sidecar-0.3.0.elemod --out sidecar.syx --version 1.73
   ```

Then send it to the Rytm ([below](#send-it-to-the-rytm)).

- **Never share the `.syx` you built:** it contains Elektron's firmware. Share the `.elemod` files instead.
- **Use core 0.1 only.** A newer core keeps its settings in the same spare bytes the Sidecar mods use; elekloader refuses that combination with a message that the sites "overlap". Untick the newer core.
- **No mixing with other mods** for now: other people's Rytm mods are for OS 1.74, and the Sidecar module is all or nothing.
- What is in the module: the external machines, the SysEx router, the SIDECAR folder, the send FX pages, the remote UI and FX in. Not in it: the **REMOTE KEYS** mod (development and testing only). It does hold a **freeze probe**: if the Rytm's screen ever stops for over 2 seconds, the Sidecar's log shows `FREEZE PROBE` with where it stopped (please report it).
- To go back, flash the stock 1.73 file: see [Recovery to stock](/sidecar-expander/getting-started/recovery/). Use a scratch project for your first session under the mods.

## The 0.2.0 builds: the patcher

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

:::note
The Sidecar mods are based on Analog Rytm MKII OS 1.73 (OS 1.74 support is planned). Your Rytm may run OS 1.74 or another version: the patched file is a whole OS (1.73 plus the mods), so sending it replaces what the Rytm runs - no separate downgrade first. You only need Elektron's stock OS 1.73 `.syx` as the input. Your projects carry over: 1.74 only added Outbox support and did not change the project format. The remote pages ran on a real Rytm with the Sidecar on 2026-10-18; see [What works now](/sidecar-expander/introduction/what-works-now/) for what is still in testing. Keep the stock file at hand to go back.
:::

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

Send the built (0.3.0) or patched (0.2.0) file as an OS update, exactly as you would send an official one:

- **Transfer (USB)**: drop the `.syx` on Transfer while the Rytm is connected and confirm on the unit.
- **STARTUP menu (DIN MIDI)**: hold FUNC while you power on, press TRIG 4 (OS UPGRADE), and send the file from Transfer's legacy OS upgrade mode, or any SysEx tool, through a DIN MIDI interface. This route works even if the OS does not boot. It is slow: about 16 minutes or more.

After the update the Rytm may stay on "Success! Rebooting". That is stock behaviour: power cycle it. After an OS upgrade the Rytm may also update its bootstrap at the first restart: do not turn the power off then.

**First start with 0.3.0:** the Sidecar moves your existing projects' files to their Rytm slots by itself ([Projects by slot](/sidecar-expander/using/projects-bundles/#projects-belong-to-the-rytms-slot)).

## How the patcher works

A patch file describes the modified OS image as records against your decoded stock image:

- bytes we wrote: the mods' code, their hooks and data, and elekloader's core and boot copier;
- copies: "take this many bytes from this place in your own stock image". Any run of 4 or more of our bytes that also occurs in the stock firmware is stored this way, so a patch file never carries firmware bytes.

The patcher checks the stock file's hash, decodes the SysEx transport and unpacks the MAIN OS section, applies the records and checks the image's hash, packs the image and rebuilds the `.syx` from your file's other sections (recomputing every checksum and counter), and compares the result with the tested build's hash.

The codec is elekloader's (GPL-2.0-or-later), which comes from digikit. The browser patcher is a line-for-line port, tested to give the same bytes as the Python on every build.
