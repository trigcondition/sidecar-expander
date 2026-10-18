# Release notes: the 1021 line

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/release-notes/>

Tester release of Sidecar | Expander. Teensy 4.1 and the Rytm mods: Monday 2026-10-19. Raspberry Pi 4B SD card package: Tuesday 2026-10-20.

| Part | Build |
|---|---|
| Rytm mods | `sfx1021` (default, for the Teensy and the Pi), `rui1021` (adds the remote UI; Pi with the 1021 kernel only). Patch your own stock OS 1.73 file: see PATCHER.md |
| Teensy 4.1 | `sidecar-teensy41-<commit>.hex`, the USB-host build; `BUILD-INFO-teensy.txt` names the commit |
| Raspberry Pi 4B | `sidecar-pi4-sd-<commit>.zip`, the SD card file set; `BUILD-INFO-pi.txt` names the commit and the kernel |
| Starter user machines | ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN: `.rmp` for the Teensy, `.a64.rmp` for the Pi (MIT) |

> **Not yet confirmed on a real Rytm:** the 1021 Rytm builds pass our emulator tests, but nobody has run them on a real Rytm yet. The 1017 to 1020 builds they grow from were tested on hardware. Keep the stock OS file at hand to go back; nothing new is stored in your projects.

## New in 1021

- **SIDECAR everywhere on the Rytm.** The sample browser's folder is now **SIDECAR** (was TEENSY), and the slot menu's popup reads **NO SIDECAR** when no Sidecar answers.
- **Remote UI in the Rytm's own font** (`rui1021`, Pi). Every letter on the Sidecar's pages is drawn by the Rytm itself, with its own font, at the stock screens' sizes and places. The layout follows the stock pages: dials, labels, title and bottom bar in the same spots.
- **The full SIDECAR status page:** the 8 voices and their machines, FX1 / FX2 with TYPE and PRE / POST, U1..U5, the recorder, the Rytm's audio stream and underruns, the three render cores' load, and the network address (never a network name or key).
- **A faster remote UI.** A knob turn shows at once (the Rytm echoes the value in the bottom bar itself), and the Sidecar's frame follows about 25 ms after a turn (was 75 ms). Fast turns never jump back.
- **Pi: sample pool and presets.** The Pi now has the Teensy's per-project sample pool, the JUNO and FM lists, and user machine presets, with a **Pool & presets** page on `sidecar.local`. (Simulator-tested; not yet checked by ear.)

## From 1020 (fixes from the 1019 hardware test)

- **The machine list's arrows no longer assign.** Moving through the list could fill every user slot with the same machine (METAL in every slot). The Rytm no longer reports a slot while a preview is open, and a choice clears the old tag.
- The **6-OP FM** patch name no longer shows twice while scrolling.
- A Sidecar with no `/Samples` folder on its card no longer crashes when the Rytm loads a project.
- The Pi's send FX load figure on the console is right again (it read tens of percent for 1-2 %).

## From 1019

- **Stepped list knobs.** Knobs that pick from a list step one item a detent, like the Rytm's FILTER TYPE, with the item's name where the dial was: ENG of PLAITS, DIGIDRUM, DAISYSP and DSP SAMPLE, DAISYSP's INP and OUT, DSP SAMPLE's MOD, the PAT knobs of JUNO and 6-OP FM, user machine lists, and on the SEND FX pages TYPE, ROUTE (PRE / POST) and selectors such as STUTTER's ENG and LEN.
- **Slot fingerprints from the project.** A user slot finds its machine from the project's own sounds, also in a project made on another Sidecar.
- **Send effects CRUSH and RINGMOD**, on the Teensy and the Pi; the Teensy's CHORUS and COMB run block by block (about 4-5 % CPU).
- **Pi recorder:** multitrack recording to the SD card, a Record tab on `sidecar.local`, REC on the display, and per-effect FX1 / FX2 tracks.
- **Pi Wi-Fi** (in testing): joins a WPA2 network from the console. Off in the SD card package.
- The web page limits its connections so the engine never starves; the Teensy web console gained user machine tabs.

## Tested on hardware or in the emulator

Checked on a real Rytm MKII with a Sidecar (1017 to 1020 builds): the voices PLAITS, DAISYSP, JUNO, 6-OP FM, DIGIDRUM and DSP SAMPLE heard; send FX on the Pi (labels, PRE/POST, STUTTER) and on the Teensy, live (CHORUS, COMB); the Pi recorder (5-minute take); user machines loading; the web page's tabs and folder upload; the touch display; joining Wi-Fi; the remote UI with `rui1019`.

Emulator or simulator only: the 1021 Rytm builds as a whole, the Pi's pool and presets, CRUSH and RINGMOD, stepped list knobs, slot fingerprints in a shared project, and a cold power cycle of the Pi straight into the engine on its SD card.

## Upgrading from the 1017 release

1. Patch your stock OS 1.73 file again with `sfx1021` (or `rui1021`) and flash it.
2. Load the new Teensy `.hex`, or copy the new Pi card files over the old ones.
3. The 1021 Rytm builds need a 1021 Sidecar for the new names and the remote UI; an older Sidecar shows numbers instead of the effects' names.

See KNOWN-ISSUES.md for what does not work yet.
