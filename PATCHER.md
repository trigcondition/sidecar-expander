# The Rytm mod patcher

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

The Rytm side of Sidecar | Expander is a set of mods to the Analog Rytm MKII's OS 1.74 or OS 1.73: one build for each. We do not distribute firmware, stock or modified. You patch **your own** stock file on your own computer, and the patcher checks that the result is bit-identical to the build we tested.

## What you need

- The stock update file for the Analog Rytm MKII. Only the unmodified file is accepted:

  | File | SHA-256 |
  |---|---|
  | `Analog-Rytm_MKII_OS1.74.syx`, in Elektron's `Analog-Rytm_MKII_OS1.74_dist.zip` (what Elektron offers now) | `cb0f99d620edde994fb860c0e79cc2464e427d06882828cfdfb00fc53700e123` |
  | `Analog-Rytm_MKII_OS1.73.syx` (Elektron no longer offers it: use the file you have) | `8ad671087ec30433d5407c7380d2396e0915ab931c5d3dd18a78bf284d3d1e52` |

- One of the two patchers below. Both give the same result, byte for byte.

## Option A: in the browser

Open the patcher page: <https://trigcondition.github.io/sidecar-expander/patcher/>.

1. Pick the mod build for your OS. For Sidecar 0.4.0: `rel0-4-0` (OS 1.73, the default) or `rel0-4-0-os1.74` (OS 1.74, in testing). Moving a Rytm from 1.73 to 1.74 is one way: back up every project first, and recover with the stock 1.74 file ([Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/#which-os-174-or-173)). Older builds, all OS 1.73: `rel0-3-1` for Sidecar 0.3.1 and 0.3.2, `rel0-3-0` for Sidecar 0.3.0; for Sidecar 0.2.0, `rui1027d` (the mods plus the remote pages) or `sfx1021` (the same mods without them).
2. Drop your stock `.syx` on the page, or click to choose it. The page names the file the build needs.
3. Press **Patch**, then **Save**.

The file is read and patched by JavaScript in the page itself. Nothing is uploaded: the page fetches only its own patch files, and you can check that in your browser's network panel.

## Option B: the Python script

Python 3.8 or newer, with no extra packages. From a copy of this repository:

    python3 public/patcher/sidecar_patch.py ~/Downloads/Analog-Rytm_MKII_OS1.74.syx public/patcher/patches/sidecar-rel0-4-0-os1.74.json

This writes `Analog-Rytm_MKII_OS1.74_rel0-4-0.syx` next to the stock file (use `-o` to choose another path). It takes a few seconds.

## Check the result

Both patchers check the result themselves and save nothing if it is wrong. To check it yourself:

    shasum -a 256 Analog-Rytm_MKII_OS1.74_rel0-4-0.syx

<!-- UNRELEASED: the two 0.4.0 rows' SHA-256 are the release candidate's; check them against the release build -->

| Build | Output file | SHA-256 |
|---|---|---|
| rel0-4-0 | `Analog-Rytm_MKII_OS1.73_rel0-4-0.syx` | `07780e9eb4bce7f71c83da3134ede4782f7ea7af211eb6787c670607707bff18` |
| rel0-4-0-os1.74 | `Analog-Rytm_MKII_OS1.74_rel0-4-0.syx` | `538ae6fa1a66dfb72141743036c40b4f3845ed73a4ea59f7e3b6aa9e51fab337` |
| rel0-3-1 | `Analog-Rytm_MKII_OS1.73_rel0-3-1.syx` | `a203db27201aabbdaa285ccb7c40a168075206c0ce91477671fcfae729c3df3c` |
| rel0-3-0 | `Analog-Rytm_MKII_OS1.73_rel0-3-0.syx` | `893ed9a5fc27ab18687c1ea95d7a07f4ff4b23fde235173ce332e54055a733ab` |
| sfx1021 | `Analog-Rytm_MKII_OS1.73_sfx1021.syx` | `e86805ff1e2c5a2e2784bf455fe5fdd6c2336463da04892442e451445fa82f4e` |
| rui1027d | `Analog-Rytm_MKII_OS1.73_rui1027d.syx` | `4843848805c0e08b3cf7c69bf5b68ca7e1453bb643d351709bdad9f59468dce8` |

(`public/patcher/patches/index.json` lists the same values.)

## Send it to the Rytm

Send the patched file as an OS update, exactly as you would send an official one:

- **Transfer** (USB): drop the `.syx` on Transfer while the Rytm is connected and confirm on the unit.
- **STARTUP menu** (DIN MIDI): hold FUNC while you power on, press TRIG 4 (OS UPGRADE), and send the file from Transfer's legacy OS upgrade mode, or any SysEx tool, through a DIN MIDI interface. This route works even if the OS does not boot. It is slow: about 16 minutes or more.

Read [README.md](README.md#risks-and-recovery) before you flash. The same section covers going back to stock.

## How it works

A patch file (`public/patcher/patches/sidecar-<tag>.json`) describes the modified MAIN OS image as records against the decoded stock image:

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

## The Analog Four

<!-- UNRELEASED: build a4-sa12 is hidden on the page, and the site will not deploy, while public/patcher/builds.json marks it "unreleased" (scripts/check_unreleased.py); check its SHA-256 below against the release build -->

The same patcher takes the A4 build: stock `Analog-Four_MKII_OS1.56.syx`, SHA-256 `5aea489db3e747547f71d5e08a2d20253149fe6258defad60306402d2fc23cb5`. The web patcher does not read `.elemod` files: `core-0.3.elemod` + `sidecar-a4-0.12.elemod` are built into a `.syx` with the lock file `a4156.lock.json` and version `SA12`, and its record file comes from that build. Read the [Analog Four MKII](https://trigcondition.github.io/sidecar-expander/using/analog-four/) page first.

| Build | Output file | SHA-256 |
|---|---|---|
| a4-sa12 | `Analog-Four_MKII_OS1.56_a4-sa12.syx` | `e9eab646102844518ff48e44864f42b2a555aadc2b8fd86b5eaabe2d772a1d71` |

## For maintainers

Make the patch files from a rytm-mods build:

    scripts/make_patches.py --mods <rytm-mods checkout> --dir <build folder> --commit <rytm-mods commit> [TAG ...]
    scripts/test_patcher.sh <build folder>

`--dir` holds the stock `.syx` and the built `Analog-Rytm_MKII_OS1.73_<tag>.syx` files; a build whose stock file or built file has another name says so in `builds.json` (`stock_name`, `built`: the OS 1.74 build reads `Analog-Rytm_MKII_OS1.74.syx` and `Analog-Rytm_MKII_OS1.74_rel0-4-0.syx`). The tags and their titles are listed in `public/patcher/builds.json`. rytm-mods' `tools/release_patch.py` refuses to write a patch unless the records rebuild the built `.syx` byte for byte and no literal holds 4 consecutive bytes found in any stock section. `test_patcher.sh` runs both patchers (the JavaScript one in Node) and compares their output with the builds.

A box other than the Rytm: its entry in `builds.json` names its `stock_name` and its `tool` under `--mods` (`a4/tools/a4_patch.py` in sidecar-mods), and `--dir` holds its stock file and build. A build marked `unreleased` stays hidden and stops the deploy: on release day fill in its `{{SHA256 ...}}` slots, delete the key and rerun `make_patches.py`. `check_unreleased.py` also stops the deploy while a `{{` slot is left in `builds.json` or the index.
