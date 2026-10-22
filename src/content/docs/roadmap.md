---
title: Roadmap
description: What comes now, next and later. No dates.
tableOfContents: true
---

This roadmap has no dates on purpose. Items move up when they are ready and tested on real hardware, and the order within a group can change with tester feedback. For what works today, see [What works now](/sidecar-expander/introduction/what-works-now/).

## Done

Finished and confirmed on real hardware.

- **Hardware confirmation of the current line:** stepped knobs, slot fingerprints, the slot menu fixes, CRUSH and RINGMOD, and the cold power cycle of the Pi.
- **Remote UI, first pages:** the SIDECAR status page and machine pages (PLAITS first) drawn on the Rytm's screen, with the encoders editing the voice.
- **Robustness when the Sidecar goes away:** the Rytm keeps running and nothing waits on a missing host.
- **Status pages SIDECAR + SYSTEM** (they catch every knob) and **key pass-through**: on a remote page PLAY / STOP / RECORD, the pads, mutes and FILL reach the Rytm.
- **Connect screen:** the Rytm shows CONNECTED, the voices and FX and the address when a Sidecar comes up.
- **SCOPE and meters:** the Rytm's input as a live waveform and twelve peak meters on its own screen.
- **REC page and playback:** record, arm and stop from the Rytm (Pi and Mini); play a take's channel back into the MAIN (Pi).
- **The Sidecar Mini recorder:** stereo on a stock Teensy with a fast card; stereo recording to the card on both Sidecars.
- **The SRC view** (`rui1027d`): the Sidecar's machine page on the Rytm's own SRC page.
- **Voice pages by track**, meters and SCOPE in track order, JUNO / FM presets on PAT.
- **HALO:** a lush plate reverb with FREEZE and SHIMMER on both Sidecars.
- **The FX return on IN L/R:** the Rytm's delay and reverb return recorded and scoped as its own channels.
- **Computer audio on the Sidecar Mini:** stereo USB audio to the computer.
- **Smaller NoisePlethora packages and slot reasons** (!ROOM, !CRSH, !TIME) on the Rytm.

## Now: the road to 0.3.0

Built and tested in the emulator and on the Mac; the hardware runs come next (see [What works now](/sidecar-expander/introduction/what-works-now/#next-the-03-test-line-sidecar-on-the-pi)). What is in the 0.3 test line:

- **Poly tracks on every Sidecar machine:** the Sidecar's own sequencer on a Rytm track, with chords, 8 pages, trig conditions, p-locks and a piano roll on the touchscreen; a per-track **POLY CONFIG** (VOICES, ALLOCATION, UNISON, DETUNE, SPREAD) in the Rytm's own track menu; seeded randomness.
- **Poly machines:** MULTISAMPLE, WAVETABLE and GRANULAR.
- **Pools and the sample library, project bundles, storage** (USB drives, NVMe on the Pi 5).
- **Insert FX, FX buses and the OUT route** (stereo to the Rytm's main mix, before or after its master effects; UP + AMP).
- **Sampler, auto-sampler and the song recorder.**
- **The touchscreen** in two themes and two sizes (optional: everything also works from the Rytm's screen).
- **UP as the Sidecar key**, the SIDECAR MENU, the KEYS page and the combo map.

The agreed order from here to 0.3.0:

1. **Hardware pass:** the current Rytm and Sidecar builds on a real Rytm, with a fixed test list (the UP combinations, pools, bundle export and import, poly tracks, the OUT view, storage speed, the trig LEDs) and the first stereo measurements.
2. **Bug fixes before features:** whatever the hardware pass finds, plus the known ones (the Rytm freezing after a Pi brownout, red trig LEDs, files safe across a power cut).
3. **Finish what is in flight:** the rest of the sequencer's top 8 with its Rytm keys and a RANDOM page, and **FREEZE** (an analog track auto-sampled into a multisample poly track, 2 round robins per note). See [Coming in 0.3](/sidecar-expander/using/sequencer/#coming-in-03). <span class="sc-plan">in progress</span>
4. **Release 0.3.0** to testers.

## After 0.3.0

In order of value:

1. **Stereo and the OUT route, the next phases** (after the measurements on a real Rytm).
2. **A master FX chain.**
3. **A slice editor** and a SAMPLE page.
4. **The user-machine SDK** with declarative pages.
5. **Analog Four MKII** with the Rytm on one Sidecar: the A4's channels through the Sidecar's effects into the Rytm's analog compressor and distortion. Other Elektron boxes are not planned.

## Also now

Being finished and tested on hardware.

- **Wi-Fi settings** (Pi, in testing): scan, connect and save from the web page, with a 90 s fallback; first setup without a cable with `sidecar-wifi.txt` at the card root; next, from the display.
- **LFOs** (in testing): 8 per kit, with the DESIGN wave and the LFO page; in the 0.3 test line also on the inserts and the OUT route.
- **Machine graphics and the sample waveform page** (in testing): the FM algorithm, the JUNO envelope, GRAIN's cloud, DSP SAMPLE's waveform with its markers.
- **Pairing code and access control** for the web page, so a Sidecar on a shared network is not open to everyone.

## Next

Designed, with parts built.

- **The machine catalogue.** Project bundles are in the 0.3 test line; next, a catalogue of machines and effects that finds what a shared project is missing.
- **The Sidecar Manager / remote UI M2.** A Rytm menu item that turns on what management needs (Wi-Fi, the web server, file access) and turns it off again for performing; richer remote pages for the send FX, user machines and the sample browser.
- **Borrow a voice for shared tracks.** The Rytm's paired tracks (RS/CP, MT/HT, CH/OH, CY/CB) share one analog voice and choke each other. A Sidecar voice could play one track of a pair, so both sound at once.
- **User effects (UFX1..UFX4):** loadable send effects, per project, like user machines.
- **New send effects:** Clouds-style granular texture, a BBD delay, and amp modelling with NAM captures.
- **Real Overbridge through the Sidecar (opt-in).** The Sidecar forwards the instrument's own Overbridge traffic to your computer and presents itself as the connected instrument, so the official Overbridge software works through it while the Sidecar keeps adding its voices and effects. Nothing is stored in the Sidecar: it mirrors the identity of whatever is plugged into its host port at runtime. Off by default, enabled in the settings behind a clear warning (unofficial; Overbridge updates may break it; firmware updates are blocked through it). The class-compliant multichannel mode stays the default.

## Later

Ideas we intend to build; not designed in detail yet.

- **Signal flow:** configure the order of the Rytm's effects and the Sidecar's (inserts on the Sidecar's voices and the OUT route are in the 0.3 test line).
- **Touch slicing** on the Pi's display: waveform, slice markers, auditioning, auto-slice, for the Sidecar's sample machines; a SAMPLE and AUTO page on the touchscreen.
- **A page designer** in the browser: lay out remote UI pages with widgets, bind parameters, preview at 128x64, export the page for a machine or plugin.
- **One-click bundles over SysEx:** fetch and restore the Rytm project itself as part of a bundle.
- **Remote pages in the browser:** the same pages the Rytm shows, on the web page.
- **Performance features:** an arpeggiator, more LFO targets, beat repeat variations, more polyphony, master effects.
- **More sampler tools:** resample in one click, sample chopping, larger sample banks.

## Coming

Ideas only, nothing built:

- **Machinedrum-style user machines:** research, paused.
