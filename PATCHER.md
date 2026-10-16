# The Rytm mod patcher

The Rytm side of Sidecar | Expander is a set of mods to the Analog Rytm MKII's OS 1.73. We do not distribute firmware, stock or modified. You patch **your own** stock OS 1.73 file on your own computer, and the patcher checks that the result is bit-identical to the build we tested.

## What you need

- The stock OS 1.73 update file for the Analog Rytm MKII, `Analog-Rytm_MKII_OS1.73.syx`, from the official download page. Only the unmodified file is accepted. Its SHA-256 is:

      8ad671087ec30433d5407c7380d2396e0915ab931c5d3dd18a78bf284d3d1e52

- One of the two patchers below. Both give the same result, byte for byte.

## Option A: in the browser

Open the patcher page: <https://trigcondition.github.io/sidecar-expander/patcher/>.

1. Pick the mod build. `sfx1017` is the recommended one.
2. Drop your stock `.syx` on the page, or click to choose it.
3. Press **Patch**, then **Save**.

The file is read and patched by JavaScript in the page itself. Nothing is uploaded: the page fetches only its own patch files, and you can check that in your browser's network panel.

## Option B: the Python script

Python 3.8 or newer, with no extra packages. From a copy of this repository:

    python3 patcher/sidecar_patch.py ~/Downloads/Analog-Rytm_MKII_OS1.73.syx patcher/patches/sidecar-sfx1017.json

This writes `Analog-Rytm_MKII_OS1.73_sfx1017.syx` next to the stock file (use `-o` to choose another path). It takes a few seconds.

## Check the result

Both patchers check the result themselves and save nothing if it is wrong. To check it yourself:

    shasum -a 256 Analog-Rytm_MKII_OS1.73_sfx1017.syx

| Build | Output file | SHA-256 |
|---|---|---|
| sfx1017 | `Analog-Rytm_MKII_OS1.73_sfx1017.syx` | `118671e8daa5989061d00934e4b6e9d02f9293f14a7e60164c40a4cc2ed5f415` |
| rui1017 | `Analog-Rytm_MKII_OS1.73_rui1017.syx` | `c795ed5f472c4eae1563e63e1b6414eb907de1c96991d831196d15ef58f2ae67` |

(`patcher/patches/index.json` lists the same values.)

## Send it to the Rytm

Send the patched file as an OS update, exactly as you would send an official one:

- **Elektron Transfer** (USB): drop the `.syx` on Transfer while the Rytm is connected and confirm on the unit.
- **STARTUP menu** (DIN MIDI): hold FUNC while you power on, press TRIG 4 (OS UPGRADE), and send the file from Transfer's legacy OS upgrade mode, or any SysEx tool, through a DIN MIDI interface. This route works even if the OS does not boot. It is slow: about 16 minutes or more.

Read [README.md](README.md#risks-and-recovery) before you flash. The same section covers going back to stock.

## How it works

A patch file (`patcher/patches/sidecar-<tag>.json`) describes the modified MAIN OS image as records against the decoded stock image:

- `[offset, "hex"]`: bytes we wrote. These are the mods' code, their hooks and data, and elekloader's core and boot copier.
- `[offset, src, len]` or `[offset, src, len, section]`: copy `len` bytes from offset `src` of your own decoded stock image (the MAIN OS, unless a section is named). Any run of 4 or more of our bytes that also occurs in the stock firmware is stored this way. The patch file therefore never carries firmware bytes, not even a displaced instruction.

The patcher:
1. checks the stock file's SHA-256;
2. decodes the SysEx transport and unpacks the MAIN OS section;
3. applies the records and checks the image's SHA-256;
4. packs the image again and rebuilds the `.syx` from your file's other sections, recomputing every checksum and message counter;
5. compares the result's SHA-256 with the tested build's.

The patch files contain no checksums, headers or framing from the stock file. Everything is recomputed from your copy.

The packer, the SysEx transport and the depacker are elekloader's codec (GPL-2.0-or-later), which comes from digikit. Both patchers carry a copy of it. The browser patcher is a line-for-line port, tested to give the same bytes as the Python on every build.

## For maintainers

Make the patch files from a rytm-mods build:

    scripts/make_patches.py --mods <rytm-mods checkout> --dir <build folder> --commit <rytm-mods commit> [TAG ...]
    scripts/test_patcher.sh <build folder>

`--dir` holds the stock `.syx` and the built `Analog-Rytm_MKII_OS1.73_<tag>.syx` files. The tags and their titles are listed in `patcher/builds.json`. rytm-mods' `tools/release_patch.py` refuses to write a patch unless the records rebuild the built `.syx` byte for byte and no literal holds 4 consecutive bytes found in any stock section. `test_patcher.sh` runs both patchers (the JavaScript one in Node) and compares their output with the builds.
