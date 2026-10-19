# Release notes: Sidecar 0.1.0

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/release-notes/>

**Sidecar 0.1.0**, the first public tester release of Sidecar | Expander. It needs the Rytm build **rui1027** (or sfx1021 without the remote pages). Version numbers follow semantic versioning from now on: see [Versioning](#versioning).

Tester release of Sidecar | Expander. Sidecar Mini (Teensy 4.1) and the Rytm mods: Monday 2026-10-19. Sidecar (Raspberry Pi 4B) SD card package: Tuesday 2026-10-20.

| Part | Build |
|---|---|
| Rytm mods | `rui1027` (default: the mods plus the remote pages, the connect screen and the FX return on IN L/R, for Sidecar Mini and Sidecar), `sfx1021` (the mods without the remote pages). Patch your own stock OS 1.73 file: see PATCHER.md |
| Sidecar Mini (Teensy 4.1) | `sidecar-teensy41-<commit>.hex`, the USB-host build of the test line (sidecar-1023); `BUILD-INFO-teensy.txt` names the commit |
| Sidecar (Raspberry Pi 4B) | `sidecar-pi4-sd-<commit>.zip`, the SD card file set of the test line; `BUILD-INFO-pi.txt` names the commit and the kernel |
| Starter content | `sidecar-content-0.1.0.zip`: `/JUNO/Factory/` (128 Juno-106 factory patches) and `/DX7/` (three 32-voice banks) for the card's root, with README and NOTICE (MIT sources: AMY, Mutable Instruments Plaits); also inside the Pi's SD package |
| Starter user machines | ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN: `.rmp` for the Teensy, `.a64.rmp` for the Pi (MIT) |

> The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. The remote pages were tested on a real Rytm with the Pi and the Teensy on 2026-10-18. On OS 1.74, first flash the stock OS 1.73 `.syx` with Transfer, then patch it. Keep the stock OS file at hand to go back; where things are stored: the send FX settings and the Sidecar machine choices are in the Rytm's kit; the Sidecar's per-project and per-kit files (slot lists, sample pool, JUNO / FM lists, LFOs) are on the Sidecar's card. Back on the stock OS your projects still load: the send FX values are ignored and tracks on Sidecar machines show them as missing.

## New in 0.1.0

Tested on hardware: the connect screen, SCOPE, the REC page and playback, HALO, the FX return on IN L/R, the Sidecar Mini's stereo USB audio and the Mini recorder. The rest of this list is being tested now (in testing).

- **LFOs** (in testing): 8 on the Pi, 4 on the Mini, global and routable to a voice's parameters (V1..V8) or the send FX's P2..P5 (FX1 / FX2); saved per kit; waves SINE, TRI, SAW+, SAW-, SQR, S&H, RND and **DESIGN** (16 steps, each HOLD, RAMP or SMTH, with presets); free or synced rates; retrig FREE / TRIG / PLAY. The **LFO page** on the Rytm opens with **TRK + LFO**; both web UIs have an LFO tab. The LFOs never touch the Rytm's own parameters (no MIDI CC).
- **SRC view** (`rui1027`, in testing): on a track with a Sidecar machine (JUNO, 6-OP FM, PLAITS, DSP SAMPLE and GRAIN), the Rytm's own SRC page shows the Sidecar's machine page with its graphics, drawn from the Rytm's own values. Every key and knob stays the Rytm's (edits, p-locks, kits, saving); the bottom bar names the last knob turned. The machine list, popups, PERF and holding TRK or BANK show the stock screen.
- **Voice pages by track** (tested on hardware on the Pi): pages are named BD, SD, ... instead of V1..V8; meters and SCOPE sources in track order. Twelve tracks can choose a Sidecar machine and eight sound at once; RS/CP, MT/HT, CH/OH and CY/CB share a voice like the Rytm's own pairs.
- **JUNO / FM presets** (tested on hardware on the Pi): PAT steps through the project's list (up to 127, p-lockable), filled with LOAD TO PROJ or Save current; otherwise the factory list.
- **REC page channel picking** (Pi, in testing): the trig keys choose the recorded channels (T1..T8 tracks, T9 MAIN, T10 / T11 IN or FX L / R; blue recorded, orange not). Playback: B pushed plays, B turned picks the channel, C the take, D the level.
- **Remote pages** (in testing): NO on SIDECAR leaves; DSP SAMPLE's MOD is a stepped list again (ONE LOOP SLICE GRAIN STRCH PLUCK WAVE; GRAIN shows POS SIZ DNS); unused knobs of user machines as hatched boxes on the Rytm's own SRC page and SMPL page 2; JUNO / FM preset names appear at once; the machine pages follow the Rytm instantly; the Rytm reports its active kit (for the per-kit LFOs).
- **Sidecar Mini:** stereo USB audio to the computer (tested on hardware) with USB MIDI back (in testing); a slimmer memory layout; the recorder's 32 KB buffer is shared with USB audio, so USB audio pauses while the recorder is armed or records (without PSRAM). The 20 / 12 multichannel mode is not in this release (in development). Recording without PSRAM needs a fast SD card.
- **Sidecar (Pi):** DSI touchscreens (the official 7" display v1 and compatibles such as the OSOYOO 7" DSI V4.0: expected, being confirmed; Touch Display 2 is not supported), the Wi-Fi settings page, the IN L/R source switch, computer audio and MIDI.
- **Wi-Fi without a cable** (Pi, in testing): put `sidecar-wifi.txt` (`ssid=` and `psk=`, optional `band=2g|5g|any`, `open=1`) at the card root; the Pi imports it at the next boot, stores only the derived key, deletes the file, and falls back after 90 s if the network does not come up. Errors go to `sidecar-wifi-error.txt`. 2.4 GHz is the default band. The web page's Wi-Fi settings are the alternative. Never share the card while the file is on it.
- **Reconnect:** on every reconnect the voices are released and the FX tails cleared.
- **The version shows** on the SYSTEM page (`SYSTEM 0.1.0`), the Pi's display and web page, and the Mini's console.

## Versioning

From 0.1.0 on, Sidecar uses semantic versioning (`MAJOR.MINOR.PATCH`), one number for Sidecar and Sidecar Mini:
- **PATCH** (0.1.1): fixes only;
- **MINOR** (0.2.0): new features (and, before 1.0, anything that changes how a setup behaves);
- **1.0.0** comes after the testers' feedback.

The Rytm builds keep their own names (`rui1027`). Each version's release notes name the Rytm build it needs: flash that one, not just the newest.

## Earlier in the 0.1.0 line

Tested on hardware on 2026-10-18 unless marked "in testing".

- **FX return on IN L/R** (`rui1027`): the Rytm's delay + reverb return on the Overbridge IN L/R instead of its audio inputs (Sound tab: IN L/R source); the recorder names those files FX_L / FX_R and SCOPE shows the source FX. Never send those channels back into the Rytm through the computer.
- **Sidecar Mini computer audio:** stereo USB audio to the computer.
- **Voice pages follow a machine change at once** (`rui1027`; in testing).
- **Connect screen** (`rui1027`): when the Sidecar comes up, the Rytm shows CONNECTED, the voices and effects, and the Pi's address for 3 seconds. Transport and pads keep working under it.
- **SCOPE and meters:** the Rytm's output, a voice or the inputs as a live waveform, with twelve peak meters.
- **REC page** (Pi and Sidecar Mini): arm, record and stop from the Rytm; the take's time in large digits, the free space and the meters.
- **Playback** (Pi): one channel of a take into the Rytm's MAIN, from the REC page (B, C, D) or the web page's Record tab. Picking another take with C while one plays can glitch once; a fix is on the way.
- **Status pages catch every knob;** SCOPE and REC use their own encoders.
- **Sidecar Mini recorder:** the Rytm's Overbridge stream to the Teensy's card, stereo on a stock Teensy with a fast SD card (A1/A2, U3/V30): 24-bit for 70.8 s and 16-bit for 62.4 s with 0 dropped blocks. Stems with PSRAM are in testing.
- **HALO:** a lush modulated plate reverb with FREEZE (DCY at 127) and SHIMMER, on both Sidecars, 8 KB of RAM per slot. Knobs DCY, MOD, TONE, SHIM. On the Mini about 5.7 % CPU per slot.
- **Smaller NoisePlethora packages** and the slot reasons !ROOM, !CRSH, !TIME on the Rytm.
- **Web UIs:** choice buttons as segmented toggles that show the device's own state (pending, confirmed or put back).
- **"Sidecar Mini"** as the Teensy's USB name.
- In testing: the DSP SAMPLE waveform page and machine graphics (FM algorithm, JUNO envelope, GRAIN's cloud); voice pages only for tracks on a Sidecar machine; the PSRAM plugin code space on the Mini; the Pi's Wi-Fi settings page (scan, connect and save, 90 s fallback).

## New in 1021

- **Two names:** the Teensy 4.1 build is **Sidecar Mini**, the cheap way to get started; the Raspberry Pi 4B build is the full **Sidecar**. Projects move from the Mini to the Sidecar (same per-project files; install the Pi version of each user machine). See [Sidecar Mini or Sidecar?](https://trigcondition.github.io/sidecar-expander/introduction/pi-vs-teensy/)

- **SIDECAR everywhere on the Rytm.** The sample browser's folder is now **SIDECAR** (was TEENSY), and the slot menu's popup reads **NO SIDECAR** when no Sidecar answers.
- **Remote pages that leave the Rytm playable** (from `rui1022`; tested on hardware with the Pi): a page catches only the keys and knobs it uses. PLAY, STOP and RECORD always reach the Rytm; the pads, mutes, FILL and tap tempo work as usual; keys that open stock screens stay with the Sidecar. On the status pages the knobs edit the stock parameter underneath. With a Sidecar firmware older than the key masks, every key except PLAY, STOP and RECORD goes to the Sidecar.
- **Remote pages in the Rytm's own font** (Pi and Teensy; tested on hardware). Every letter on the Sidecar's pages is drawn by the Rytm itself, with its own font, at the stock screens' sizes and places. The layout follows the stock pages: dials, labels, title and bottom bar in the same spots.
- **Two status pages:** SIDECAR (the 8 voices and their machines, FX1 / FX2 with TYPE and PRE / POST) and SYSTEM (U1..U5, the recorder, the Rytm's audio stream and underruns, the render cores' load, and the network address, never a network name or key). The Mini has no network line.
- **A faster remote UI.** A knob turn shows at once (the Rytm echoes the value in the bottom bar itself), and the Sidecar's frame follows about 25 ms after a turn (was 75 ms). Fast turns never jump back.
- **Pi: large folder uploads** no longer fail with network errors; one summary line and a Retry failed button. (Tested on hardware.)
- **Pi display:** restyled with the web page; the home page's touch test can be hidden (**Touch works – hide**, a toggle on the About page, `touchtest=` in `/.rytm/display.txt`); brightness 5-100 %, with the darkest setting still readable.
- **Pi Wi-Fi:** joins on the first boot (tested on hardware), and a watchdog rejoins after a dropout.
- **Restyled web page and Teensy console:** black and white with one green accent.
- **Reasons instead of a bare "!".** A machine that cannot play now shows why: for example `!ROOM` when there's no code space left, `!CRSH` after a crash, `!TIME` after a timeout and `!MISS` for a missing package. The web console shows the full reason, such as "no room: needs N B, M B free".
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

Tested on a real Rytm MKII on 2026-10-18 (the test line): the connect screen, SCOPE and meters, the REC page and playback on the Pi, the status pages catching every knob, the key pass-through, the Mini recorder (stereo, fast card), HALO (heard; measured on the Teensy), the smaller NoisePlethora packages with their slot reasons, the web UIs' state buttons, the "Sidecar Mini" USB name, folder upload, the Pi's computer audio and MIDI, the FX return on IN L/R (SCOPE on the Mini), the Mini's stereo USB audio (heard in a DAW); the remote pages on the Pi and the Teensy.

Earlier (1017 to 1022 builds): all the voices heard; send FX on the Pi and the Teensy; the Pi recorder (5-minute take); user machines; the web page's tabs; the touch display; stepped list knobs, slot fingerprints in a shared project, the slot menu fixes, CRUSH and RINGMOD, a cold power cycle of the Pi, and the Rytm keeps running when the Sidecar goes away.

Still in testing: the SRC view, the LFOs, the waveform page and machine graphics, voice pages only for Sidecar machines, the PSRAM code space and stems on the Mini, the Pi's Wi-Fi settings page.

## Known limits in this release

- SRC view: a turn shows after about 50-100 ms; p-locks made while holding a trig are not shown (the view shows the sound's own value).
- GRAIN as a machine of its own in the Rytm's SRC list is not available yet (the list is full): use DSP SAMPLE's MOD. On a Mini without PSRAM, DSP SAMPLE streams from the card and plays once, so GRAIN needs PSRAM there.
- Sidecar Mini: multichannel USB audio comes later; USB audio pauses while the recorder runs (without PSRAM).
- Wait until the Sidecar has connected (the connect screen) before pressing PLAY: a freeze was seen once and not reproduced.
- Teensy: only one of the old large NoisePlethora packages fits in the 32 KB plugin code space at a time; the new smaller ones fit two or three.
- Recording on a Mini without PSRAM needs a fast SD card.
- REC page playback: picking another take with C while one plays can glitch once.

## Upgrading from the 1017 release

1. Patch your stock OS 1.73 file again with `rui1027` (or `sfx1021`) and flash it.
2. Load the new Teensy `.hex`, or copy the new Pi card files over the old ones.
3. The Rytm builds need the matching Sidecar firmware for the new names, the remote pages and the connect screen; an older Sidecar shows numbers instead of the effects' names.

See KNOWN-ISSUES.md for what does not work yet.
