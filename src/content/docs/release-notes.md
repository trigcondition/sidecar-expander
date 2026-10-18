---
title: Release notes
description: What is in the 1021 tester release, what changed since 1017, and what is tested on hardware.
---
Tester release of Sidecar | Expander. Sidecar Mini (Teensy 4.1) and the Rytm mods: Monday 2026-10-19. Sidecar (Raspberry Pi 4B) SD card package: Tuesday 2026-10-20.

| Part | Build |
|---|---|
| Rytm mods | `rui1022` (default: the mods plus the remote pages, for Sidecar Mini and Sidecar), `sfx1021` (the mods without the remote pages). Patch your own stock OS 1.73 file: see [Patch and flash the Rytm](/sidecar-expander/getting-started/patch-and-flash/) |
| Sidecar Mini (Teensy 4.1) | `sidecar-teensy41-<commit>.hex`, the USB-host build; `BUILD-INFO-teensy.txt` names the commit |
| Sidecar (Raspberry Pi 4B) | `sidecar-pi4-sd-<commit>.zip`, the SD card file set; `BUILD-INFO-pi.txt` names the commit and the kernel |
| Starter user machines | ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN: `.rmp` for the Teensy, `.a64.rmp` for the Pi (MIT) |

> The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. The remote pages were tested on a real Rytm with the Pi and the Teensy on 2026-10-18. On OS 1.74, first flash the stock OS 1.73 `.syx` with Transfer, then patch it. Keep the stock OS file at hand to go back; nothing new is stored in your projects.

## New in 1021

- **Two names:** the Teensy 4.1 build is **Sidecar Mini**, the cheap way to get started; the Raspberry Pi 4B build is the full **Sidecar**. Projects move from the Mini to the Sidecar (same per-project files; install the Pi version of each user machine). See [Sidecar Mini or Sidecar?](/sidecar-expander/introduction/pi-vs-teensy/)

- **SIDECAR everywhere on the Rytm.** The sample browser's folder is now **SIDECAR** (was TEENSY), and the slot menu's popup reads **NO SIDECAR** when no Sidecar answers.
- **Remote pages that leave the Rytm playable** (`rui1022`, new): a page catches only the keys and knobs it uses. PLAY, STOP and RECORD always reach the Rytm; the pads, mutes, FILL and tap tempo work as usual; keys that open stock screens stay with the Sidecar. On the status pages the knobs edit the stock parameter underneath. With a Sidecar firmware older than the key masks, every key except PLAY, STOP and RECORD goes to the Sidecar.
- **Remote pages in the Rytm's own font** (Pi and Teensy; tested on hardware). Every letter on the Sidecar's pages is drawn by the Rytm itself, with its own font, at the stock screens' sizes and places. The layout follows the stock pages: dials, labels, title and bottom bar in the same spots.
- **Two status pages:** SIDECAR (the 8 voices and their machines, FX1 / FX2 with TYPE and PRE / POST) and SYSTEM (U1..U5, the recorder, the Rytm's audio stream and underruns, the render cores' load, and the network address, never a network name or key). The Teensy has no recorder or network, so its SYSTEM page leaves them out.
- **A faster remote UI.** A knob turn shows at once (the Rytm echoes the value in the bottom bar itself), and the Sidecar's frame follows about 25 ms after a turn (was 75 ms). Fast turns never jump back.
- **Pi: large folder uploads** no longer fail with network errors; one summary line and a Retry failed button. (Tested on hardware.)
- **Pi display:** restyled with the web page; the home page's touch test can be hidden (**Touch works – hide**, a toggle on the About page, `touchtest=` in `/.rytm/display.txt`); brightness 5-100 %, with the darkest setting still readable.
- **Pi Wi-Fi:** joins on the first boot (tested on hardware), and a watchdog rejoins after a dropout.
- **Restyled web page and Teensy console:** black and white with one green accent.
- **Pi: computer audio and MIDI over USB-C.** Plug the Pi's USB-C into a computer: the Rytm's tracks arrive as a multi-channel audio device, with MIDI both ways. Switched on in the web page's Sound tab. (Tested on hardware.)
- **Pi: sample pool and presets.** The Pi now has the Teensy's per-project sample pool, the JUNO and FM lists, and user machine presets, with a **Pool & presets** page on `sidecar.local`. (Tested on hardware.)

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

Tested on a real Rytm MKII on 2026-10-18 (1021 builds): the remote pages with the Pi (1021 kernel) and the Teensy (1021 firmware), in the Rytm's font, very responsive, SIDECAR + SYSTEM; Pi folder upload of large sample folders; unplugging and replugging the USB cable between Pi and Rytm (the digital voices stop and resume); restarting the Rytm and the Pi; the restyled web page and display; Wi-Fi joining on the first boot.

Earlier (1017 to 1020 builds): the voices PLAITS, DAISYSP, JUNO, 6-OP FM, DIGIDRUM and DSP SAMPLE heard; send FX on the Pi (labels, PRE/POST, STUTTER) and on the Teensy, live (CHORUS, COMB); the Pi recorder (5-minute take); user machines loading; the web page's tabs; the touch display.

Also confirmed on hardware: stepped list knobs, slot fingerprints in a shared project, the slot menu fixes, CRUSH and RINGMOD, a cold power cycle of the Pi, and the Rytm keeps running when the Sidecar goes away. Also on hardware: the Pi's pool and presets, hiding the touch test, 5 % brightness, multi-channel computer audio and MIDI over the Pi's USB-C. Still in testing: the Wi-Fi rejoin watchdog.

## Known limits in this release

- Teensy: only one large NoisePlethora package (NP VOICES / CLUST1 / CLUST2) fits in the 32 KB plugin code space at a time.

## Upgrading from the 1017 release

1. Patch your stock OS 1.73 file again with `rui1022` (or `sfx1021`) and flash it.
2. Load the new Teensy `.hex`, or copy the new Pi card files over the old ones.
3. The 1021 Rytm builds need a 1021 Sidecar for the new names and the remote UI; an older Sidecar shows numbers instead of the effects' names.

See [Troubleshooting and known issues](/sidecar-expander/using/troubleshooting/) for what does not work yet.
