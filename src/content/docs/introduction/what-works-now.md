---
title: What works now
description: The features of the current line, and which are confirmed on real hardware.
sidebar:
  order: 2
---

Sidecar is in public testing. Each feature below is marked:

- <span class="sc-ok">hardware</span>: checked on a real Rytm MKII with the Sidecar attached;
- <span class="sc-test">in testing</span>: built and tested in the emulator or the simulator, or on the Sidecar alone, not yet confirmed with a real Rytm;
- <span class="sc-plan">planned</span>: on the [roadmap](/sidecar-expander/roadmap/).

This is **Sidecar 0.2.0** (Sidecar on the Raspberry Pi 4B and Pi 5, one SD card), followed by the 0.3 test line below. The Rytm builds are `rui1027d` (the default: the mods plus the remote pages, the connect screen and the FX return on IN L/R) and `sfx1021` (the mods without the remote pages). 

:::note
The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. Marks dated 2026-10-18 come from the test line on a real Rytm; other "hardware" marks from the 1017 to 1022 builds of the same line. Keep the stock OS file at hand: flashing it takes you back. Where things are stored: the send FX settings and the Sidecar machine choices are in the Rytm's kit; the Sidecar's per-project and per-kit files (slot lists, sample pool, JUNO / FM lists, LFOs) are on the Sidecar's card. Back on the stock OS your projects still load: the send FX values are ignored and tracks on Sidecar machines show them as missing.
:::

## Voices, effects, modulation

| Feature | Status |
|---|---|
| EXT machines PLAITS, DAISYSP, DSP SAMPLE, DIGIDRUM, JUNO, 6-OP FM on every track | <span class="sc-ok">hardware</span> |
| Each voice returns on its own track and plays through the track's analog filter and amp | <span class="sc-ok">hardware</span> |
| SEND FX 1/2 pages: AMPLITUDE 2 sends, TYPE, P1 ROUTE (PRE/POST), P2..P5 with the effect's labels, stepped lists | <span class="sc-ok">hardware</span> |
| CHORUS, COMB, CRUSH, RINGMOD send effects | <span class="sc-ok">hardware</span> |
| HALO plate reverb (DCY with FREEZE, MOD, TONE, SHIM) | <span class="sc-ok">hardware</span> (2026-10-18: heard) |
| The SIDECAR folder in the sample browser, LOAD TO PROJ into the Sidecar's sample pool | <span class="sc-ok">hardware</span> |
| User machines in slots U1..U5, slot fingerprints, slot reasons on the Rytm (!ROOM, !CRSH, !TIME) | <span class="sc-ok">hardware</span> |
| LFOs: 8, on voice parameters and FX P2..P5, saved per kit | <span class="sc-test">in testing</span> |
| DSP SAMPLE's MOD as a stepped list (ONE LOOP SLICE GRAIN STRCH PLUCK WAVE) | <span class="sc-test">in testing</span> |
| Voices released and FX tails cleared on every reconnect | <span class="sc-test">in testing</span> |
| Double stop fades the Sidecar's effect tails | <span class="sc-ok">hardware</span> |

## The remote pages (`rui1027d`)

| Feature | Status |
|---|---|
| Remote pages on the Rytm's screen (TRK + YES) in the Rytm's own font | <span class="sc-ok">hardware</span> |
| Status pages SIDECAR + SYSTEM (they catch every knob) | <span class="sc-ok">hardware</span> (2026-10-18) |
| Key pass-through: PLAY / STOP / RECORD, pads, mutes, FILL and tap tempo reach the Rytm on a page | <span class="sc-ok">hardware</span> (2026-10-18) |
| Connect screen when the Sidecar comes up | <span class="sc-ok">hardware</span> (2026-10-18) |
| SCOPE and meters | <span class="sc-ok">hardware</span> (2026-10-18) |
| REC page: arm, record, stop | <span class="sc-ok">hardware</span> (2026-10-18) |
| Playback on the REC page (Pi) | <span class="sc-ok">hardware</span> (2026-10-18; one glitch when picking takes with C, being fixed) |
| Machine pages only for tracks on a Sidecar machine, shown on the SRC page (not in the TRK + YES list) with `rui1027d`; they follow a machine change at once | <span class="sc-ok">hardware</span> (2026-10-19) |
| DSP SAMPLE waveform page, machine graphics (FM algorithm, JUNO envelope, GRAIN's cloud) | <span class="sc-test">in testing</span> |
| SRC view (`rui1027d`): the Sidecar's machine page on the Rytm's own SRC page, every key and knob the Rytm's, also after a USB replug | <span class="sc-ok">hardware</span> (2026-10-19) |
| Voice pages named by track (BD, SD, ...), meters and SCOPE in track order, JUNO pages per track, PAT presets | <span class="sc-ok">hardware</span> (Pi) |
| LFO page (TRK + LFO) with the DESIGN view | <span class="sc-test">in testing</span> |
| REC page: the trig keys pick the recorded channels (Pi) | <span class="sc-test">in testing</span> |
| NO on SIDECAR leaves; unused user-machine knobs as hatched boxes on the Rytm's SRC / SMPL pages; preset names at once | <span class="sc-test">in testing</span> |
| FX return on IN L/R: recorder files FX_L / FX_R, SCOPE source FX | <span class="sc-ok">hardware</span> (2026-10-18) |

## Sidecar (Raspberry Pi 4B and Pi 5) only

On the Pi 4B unless the row says Pi 5.

| Feature | Status |
|---|---|
| RINGS, CLOUDSEED and STUTTER send effects | <span class="sc-ok">hardware</span> |
| Multitrack recorder to the SD card (up to 23 sources) | <span class="sc-ok">hardware</span> |
| Web page at `http://sidecar.local`, with choice buttons that show the device's state | <span class="sc-ok">hardware</span> |
| Sample pool and presets per project, the Pool & presets page | <span class="sc-ok">hardware</span> |
| File browser with folder upload, also large sample folders | <span class="sc-ok">hardware</span> |
| Unplugging and replugging the USB cable to the Rytm; restarting the Rytm or the Pi | <span class="sc-ok">hardware</span> (after many replugs the Pi may need a restart: known issue, fix planned) |
| 5" HDMI touch display; hide the touch test; brightness down to 5 % | <span class="sc-ok">hardware</span> |
| DSI touchscreens: the official 7" display (v1) and compatibles such as the OSOYOO 7" DSI V4.0 | expected, being confirmed (Touch Display 2: not supported) |
| Boots from its own SD card, also from a cold power cycle | <span class="sc-ok">hardware</span> |
| Computer audio and MIDI over USB-C: no clicks at the stream's start, 5 minutes clean | <span class="sc-ok">hardware</span> (2026-10-19) |
| Wi-Fi: join a network | <span class="sc-ok">hardware</span> (joins on the first boot; off in the package) |
| Wi-Fi settings on the web page (scan, connect and save, 90 s fallback; the Pi restarts on a join) and first setup from `sidecar-wifi.txt` on the card | <span class="sc-test">in testing</span> (implemented, not yet run on hardware) |
| The web page over Wi-Fi: sent compressed, stalled connections dropped after 3 s, at most 2 requests at once (0.2.0) | <span class="sc-test">in testing</span> |
| Power warning: a weak supply in the log, on the web page's Power tile and in red on the display (0.2.0) | <span class="sc-test">in testing</span> |
| One SD card for the Pi 4B and the Pi 5 (0.2.0) | <span class="sc-test">in testing</span> (the Pi 5 build is tested; the shared card is being tested on both boards) |
| **Pi 5:** the Rytm over USB (replug included), voices, send effects, remote pages, `sidecar.local` over Ethernet | <span class="sc-ok">hardware</span> (2026-10-19) |
| **Pi 5:** Wi-Fi (saved from the web page, connected) | <span class="sc-ok">hardware</span> (2026-10-19) |
| **Pi 5:** HDMI display with USB touch, the 800x480 UI scaled to 1920x1080 (slightly soft) | <span class="sc-ok">hardware</span> (2026-10-19; needs `hdmi_force_hotplug=1`, on the card) |
| **Pi 5:** DSI display (official 7" v1 and compatibles, CAM/DISP 0 or 1), HDMI when none answers | <span class="sc-test">in testing</span> (built, not yet run) |
| **Pi 5:** USB audio and MIDI to the computer | not in 0.2.0 (USB-C is power only on the Pi 5) |

## Next: the 0.3 test line (Sidecar on the Pi)

Not in the 0.2.0 release. Rytm build `rui1048` with the Sidecar's 0.3 test build. A touchscreen is optional for all of it: the pages open on the Rytm's screen too. Built and tested in the emulator and on the Mac; the sequencer and the touchscreen's OLED theme have had a first round of use on a real Rytm with a Pi 4 (build `rui1039`). Everything else in this table waits for its hardware run.

| Feature | Status |
|---|---|
| [Poly mode](/sidecar-expander/using/sequencer/): the Sidecar sequencer on poly tracks (UP + TRIG), chords, 8 pages, p-locks, step preview | <span class="sc-test">in testing</span> (first used on hardware with `rui1039`) |
| Poly tracks on **every Sidecar machine** (PLAITS, JUNO, DAISYSP, DIGIDRUM, DSP SAMPLE, user machines, besides 6-OP FM and the poly machines) with the instance pool; per-track [POLY CONFIG](/sidecar-expander/using/sequencer/#poly-config) (VOICES, ALLOCATION, UNISON + DETUNE + SPREAD, GROUP stored) in the Rytm's track menu (FUNC + CHRO), on the touchscreen's SEQ page (POLY) and the web page (Sound > Poly tracks) | <span class="sc-test">in testing</span> (Mac, emulator, `rui1048`) |
| Poly mode: [seeded randomness](/sidecar-expander/using/sequencer/#seeded-randomness) (FREE or a fixed seed per pattern, a seed per track); pattern files version 4 (patterns using the new features need 0.3 or later) | <span class="sc-test">in testing</span> (Mac) |
| Poly mode: the TRIG view, trig conditions and probability, step copy / paste / clear, SAVE / RELOAD of patterns and tracks, DIRECT / TEMP JUMP, the poly track's menu | <span class="sc-test">in testing</span> (emulator) |
| [MULTISAMPLE, WAVETABLE, GRANULAR](/sidecar-expander/using/poly-machines/), chords on CHD / INV / SPR / VOI | <span class="sc-test">in testing</span> |
| [Pools](/sidecar-expander/using/pools/): SAMPLES, WAVETABLES, INSTRUMENTS in banks A..H, FUNC + YES into any row, the Rytm's POOL page, DSP SAMPLE on all eight banks | <span class="sc-test">in testing</span> (emulator) |
| [The sample library](/sidecar-expander/using/pools/#the-sample-library): every sample known by its fingerprint, moved / missing / changed files | <span class="sc-test">in testing</span> (Mac) |
| [Projects and bundles](/sidecar-expander/using/projects-bundles/): export and import from the touchscreen, the Rytm and the web page, the rename prompt | <span class="sc-test">in testing</span> (Mac, emulator) |
| [Storage](/sidecar-expander/using/storage/): USB drives, NVMe on the Pi 5, `stor=bench` | <span class="sc-test">in testing</span> (Mac) |
| [Stereo and the OUT route](/sidecar-expander/using/stereo-out/): TRK / PRE / POST, stereo samples, the streaming budget | <span class="sc-test">in testing</span> (Mac; the measurements on a Rytm are pending) |
| [Insert FX and FX buses](/sidecar-expander/using/insert-fx/), UP + FX, UP + AMP for the OUT view, LFOs on the inserts and the OUT route | <span class="sc-test">in testing</span> |
| [Sampler and auto-sampler](/sidecar-expander/using/sampling/), takes into the pool | <span class="sc-test">in testing</span> |
| [Song recorder](/sidecar-expander/using/song-recorder/) | <span class="sc-test">in testing</span> |
| [The touchscreen](/sidecar-expander/using/touchscreen/): OLED and CLASSIC themes, the STAGE look, navigation keys with their UP + T shortcuts, SEQ, PAT, VOICE, INSERT FX, SONG, REC with playback, SCOPE, STATUS, PROJECT, POOL; 800x480 and 1024x600 | <span class="sc-test">in testing</span> (OLED and SEQ used on a Pi 4 with a 7" DSI panel) |
| On the Rytm: **UP as the Sidecar key** (UP + T1..T13, UP + YES / TRIG / SRC / LFO / FX / AMP, one-handed step copy with trig + UP + RECORD / STOP / PLAY; the TRK and FUNC forms kept), the SIDECAR MENU, the KEYS page and UP held for the combo map, TRK's LED blinking while a Sidecar page has the keys ([Key combinations](/sidecar-expander/using/key-combinations/)) | <span class="sc-test">in testing</span> (emulator, `rui1046` .. `rui1048`) |
| [The recorder](/sidecar-expander/using/recorder/): stereo voice files and the PRE / POST sources for voices on the OUT route; the touchscreen's REC page with playback | <span class="sc-test">in testing</span> (Mac) |
| 7" HDMI 1024x600 display (GeeekPi EP-0194) | expected, to be confirmed |
| The rest of the sequencer's top 8 (speed ratios, play direction, scale and key, seeded random notes with a modulatable SEED, per-lock conditions, chord-aware ratchets and arp, parameter slides, the FX column) and FREEZE ([Coming in 0.3](/sidecar-expander/using/sequencer/#coming-in-03)) | <span class="sc-plan">in progress</span> |

For what does not work yet, see [Troubleshooting and known issues](/sidecar-expander/using/troubleshooting/).
