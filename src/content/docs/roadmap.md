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

## Now

Being finished and tested on hardware.

- **Wi-Fi settings** (Pi, in testing): scan, connect and save from the web page, with a 90 s fallback; first setup without a cable with `sidecar-wifi.txt` at the card root; next, from the display.
- **LFOs** (in testing): 8 on the Pi, 4 on the Mini, per kit, with the DESIGN wave and the LFO page.
- **PSRAM code space on the Mini** (in testing with PSRAM testers): more and bigger user machines on a Teensy with PSRAM fitted.
- **Machine graphics and the sample waveform page** (in testing): the FM algorithm, the JUNO envelope, GRAIN's cloud, DSP SAMPLE's waveform with its markers.
- **Pairing code and access control** for the web page, so a Sidecar on a shared network is not open to everyone.

## Next

Designed, with parts built.

- **Project bundles and the machine catalogue.** One file per project (`<project>.sidecar.zip`) with the slot lists, the sample pool and its samples, the JUNO and FM lists, and the user machines and effects it uses, for both Sidecars. Import on another Sidecar puts everything back in the right slots. A catalogue of machines and effects finds what a shared project is missing.
- **The Sidecar Manager / remote UI M2.** A Rytm menu item that turns on what management needs (Wi-Fi, the web server, file access) and turns it off again for performing; richer remote pages for the send FX, user machines and the sample browser.
- **Borrow a voice for shared tracks.** The Rytm's paired tracks (RS/CP, MT/HT, CH/OH, CY/CB) share one analog voice and choke each other. A Sidecar voice could play one track of a pair, so both sound at once.
- **Sidecar Mini with PSRAM:** stems recording confirmed on hardware (high priority).
- **User effects (UFX1..UFX4):** loadable send effects, per project, like user machines.
- **New send effects:** Clouds-style granular texture, a BBD delay, and amp modelling with NAM captures.
- **Real Overbridge through the Sidecar (opt-in).** The Sidecar forwards the instrument's own Overbridge traffic to your computer and presents itself as the connected instrument, so the official Overbridge software works through it while the Sidecar keeps adding its voices and effects. Nothing is stored in the Sidecar: it mirrors the identity of whatever is plugged into its host port at runtime. Off by default, enabled in the settings behind a clear warning (unofficial; Overbridge updates may break it; firmware updates are blocked through it). The class-compliant multichannel mode stays the default.

## Later

Ideas we intend to build; not designed in detail yet.

- **Signal flow and inserts:** configure the order of the Rytm's effects and the Sidecar's, and use a Sidecar effect as an insert on one voice instead of a send.
- **Touch slicing** on the Pi's display: waveform, slice markers, auditioning, auto-slice, for the Sidecar's sample machines.
- **A page designer** in the browser: lay out remote UI pages with widgets, bind parameters, preview at 128x64, export the page for a machine or plugin.
- **One-click bundles over SysEx:** fetch and restore the Rytm project itself as part of a bundle.
- **Remote pages in the browser:** the same pages the Rytm shows, on the web page.
- **Performance features:** an arpeggiator, more LFO targets, beat repeat variations, more polyphony, master effects.
- **More sampler tools:** resample in one click, sample chopping, larger sample banks.
- **Support for other Elektron boxes, such as Analog Four, Digitakt, Syntakt, etc.**, using the same engine and the same approach to mods.
