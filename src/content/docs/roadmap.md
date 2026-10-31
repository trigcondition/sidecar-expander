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

## Released: 0.3.0

The early-tester release, with many new base features ([What works now](/sidecar-expander/introduction/what-works-now/#new-in-030), [Release notes](/sidecar-expander/release-notes/)):

- **Poly tracks on every Sidecar machine:** the Sidecar's own sequencer on a Rytm track, per pattern, with chords, 8 pages, trig conditions, p-locks, NOTE EDIT, POLY CONFIG, seeded randomness and the sequencer's top 8 (direction, speed, scale and key, random notes, ratchets and arps, slides, the FX column).
- **Poly machines:** MULTISAMPLE, WAVETABLE and GRANULAR. **MD** built in, in DIGIDRUM's place.
- **Projects by the Rytm's slot** with a project trash; kits that follow SAVE and RELOAD; NO + KIT / PATTERN reload on the Sidecar pages.
- **Pools and the sample library, project bundles, storage** (USB drives, NVMe on the Pi 5), the **RAM store** (instant saves, safe in a power cut).
- **Insert FX, FX buses and the OUT route**; the sampler, the auto-sampler and the song recorder with UNDO REPLAY; the recorder with dated takes, a speed warning and recording to USB.
- **The touchscreen** in two themes and two sizes (optional), **UP as the Sidecar key**, the SIDECAR MENU, the KEYS page and the combo map.
- **The pairing code** for the web page, on by default; the crash note after an unexpected restart.
- **Install with elekloader** on OS 1.73.

## Released: 0.3.1

A fix release: no more dropouts when loading user machines, presets and multisamples, the black box, and send FX that follow a kit switch ([Release notes](/sidecar-expander/release-notes/)).

## Next: the MD page

A dedicated Rytm firmware update: the built-in MD gets its own page on the Rytm (ENGINE, TYPE and all 30 drum types, with the controls named per drum). Until then the Rytm shows DIGIDRUM's old page for it, with 11 types ([MD](/sidecar-expander/using/machines/#md)).

## Then: USB audio and MIDI on the Pi 5

A Pi 5 will work like a Pi 4: 12 audio channels each way and MIDI to your computer over its USB-C port, in any DAW, with nothing to install. Under Raspberry Pi OS this already ran on our Pi 5 in Ableton Live. It needs power from a separate supply, because a computer's USB port can't power a Pi 5 under load, so it comes with a simple wiring guide.

## Then: 0.4.0

Planned, in no fixed order:

- **The "Octa release":** morph scenes and the Rytm's PERF macros on Sidecar, sequencer and master FX parameters, a crossfader between scenes (the Rytm's knob, the touchscreen, a USB MIDI controller), live sampling, and a master looper for the Octatrack-style transition trick.
- **FREEZE:** an analog track auto-sampled into a multisample poly track (2 round robins per note).
- **PAD OCT:** a per-track octave for the CHRO pads, so a poly track's pads reach beyond C2..B5.
- **A channel strip for the Rytm's analog tracks:** a track's own audio through the Sidecar's EQ and inserts, back before or after the Rytm's compressor and distortion.
- **An arpeggiator** on the Sidecar's sequencer, for poly tracks and any machine.
- **A MIDI machine:** a user machine that sends its track's notes and knobs out as MIDI (to a computer, a USB MIDI device or the Rytm's MIDI out), like Tonverk's.
- **.elmulti instruments:** MULTISAMPLE loads Elektron's multisample format next to `.sfz`.
- **LV2 plugins built from source:** open-source LV2 effects and instruments compiled into Sidecar packages, with a page generated from their controls.
- **A NEON pass:** the Pi's vector unit on the heaviest engines and the mixer, for more voices and effects.
- **Export to a USB stick** again, once the hang at its end is fixed.
- **A touchscreen keyboard** for names (takes, samples, folders, pools, Rytm names).
- **The pairing code, next steps:** a physical "allow pairing now" key, and a list of paired devices on the page.
- **Clean-ups after the 0.3.0 fixes:** one way to pick a sample on every sample machine (DSP SAMPLE's SMP lined up with the others), no stalls while samples load into the pool, previewing a sample in the file browser (FUNC + PLAY) and a check that restarts the Sidecar's audio to the Rytm when it stays silent after a Pi restart.

Research alongside: **DSP coprocessors** (a Daisy Seed first) as extra plugin targets.

## After 0.4.0

In order of value:

1. **Stereo and the OUT route, the next phases** (after the measurements on a real Rytm).
2. **A master FX chain.**
3. **A slice editor** and a SAMPLE page.
4. **The user-machine SDK** with declarative pages.
5. **Analog Four MKII** with the Rytm on one Sidecar: the A4's channels through the Sidecar's effects into the Rytm's analog compressor and distortion. Other Elektron boxes are not planned.

## Also now

Being finished and tested on hardware.

- **Wi-Fi settings** (Pi, in testing): scan, connect and save from the web page, with a 90 s fallback; first setup without a cable with `sidecar-wifi.txt` at the card root; next, from the display.
- **LFOs** (in testing): 8 per kit, with the DESIGN wave and the LFO page; in 0.3.0 also on the inserts and the OUT route.
- **Machine graphics and the sample waveform page** (in testing): the FM algorithm, the JUNO envelope, GRAIN's cloud, DSP SAMPLE's waveform with its markers.

## Designed

Designed, with parts built.

- **The machine catalogue.** Project bundles are in 0.3.0; next, a catalogue of machines and effects that finds what a shared project is missing.
- **The Sidecar Manager / remote UI M2.** A Rytm menu item that turns on what management needs (Wi-Fi, the web server, file access) and turns it off again for performing; richer remote pages for the send FX, user machines and the sample browser.
- **Borrow a voice for shared tracks.** The Rytm's paired tracks (RS/CP, MT/HT, CH/OH, CY/CB) share one analog voice and choke each other. A Sidecar voice could play one track of a pair, so both sound at once.
- **User effects (UFX1..UFX4):** loadable send effects, per project, like user machines.
- **New send effects:** Clouds-style granular texture, a BBD delay, and amp modelling with NAM captures.
- **Real Overbridge through the Sidecar (opt-in).** The Sidecar forwards the instrument's own Overbridge traffic to your computer and presents itself as the connected instrument, so the official Overbridge software works through it while the Sidecar keeps adding its voices and effects. Nothing is stored in the Sidecar: it mirrors the identity of whatever is plugged into its host port at runtime. Off by default, enabled in the settings behind a clear warning (unofficial; Overbridge updates may break it; firmware updates are blocked through it). The class-compliant multichannel mode stays the default.

## Later

Ideas we intend to build; not designed in detail yet.

- **Signal flow:** configure the order of the Rytm's effects and the Sidecar's (inserts on the Sidecar's voices and the OUT route are in 0.3.0).
- **Touch slicing** on the Pi's display: waveform, slice markers, auditioning, auto-slice, for the Sidecar's sample machines; a SAMPLE and AUTO page on the touchscreen.
- **A page designer** in the browser: lay out remote UI pages with widgets, bind parameters, preview at 128x64, export the page for a machine or plugin.
- **One-click bundles over SysEx:** fetch and restore the Rytm project itself as part of a bundle.
- **Remote pages in the browser:** the same pages the Rytm shows, on the web page.
- **Performance features:** an arpeggiator, more LFO targets, beat repeat variations, more polyphony, master effects.
- **More sampler tools:** resample in one click, sample chopping, larger sample banks.
