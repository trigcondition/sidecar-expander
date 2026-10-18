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

## Now

Being finished and tested on hardware.

- **Wi-Fi settings and first setup without a cable** (Pi): join a network from the web page and the display; set up a new Sidecar without an Ethernet cable.
- **Pairing code and access control** for the web page, so a Sidecar on a shared network is not open to everyone.

## Next

Designed, with parts built.

- **Project bundles and the machine catalogue.** One file per project (`<project>.sidecar.zip`) with the slot lists, the sample pool and its samples, the JUNO and FM lists, and the user machines and effects it uses, for both Sidecars. Import on another Sidecar puts everything back in the right slots. A catalogue of machines and effects finds what a shared project is missing.
- **The Sidecar Manager / remote UI M2.** A Rytm menu item that turns on what management needs (Wi-Fi, the web server, file access) and turns it off again for performing; richer remote pages for the send FX, user machines and the sample browser.
- **Borrow a voice for shared tracks.** The Rytm's paired tracks (RS/CP, MT/HT, CH/OH, CY/CB) share one analog voice and choke each other. A Sidecar voice could play one track of a pair, so both sound at once.
- **Sidecar Mini with PSRAM:** more and bigger user machines on a Teensy with PSRAM fitted (high priority; the processor has the headroom).
- **The Sidecar Mini recorder:** first with PSRAM, then a lean version without it.
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
- **Performance features:** an arpeggiator, Sidecar LFOs, beat repeat variations, more polyphony, master effects.
- **More sampler tools:** stereo recording to the card, resample in one click, sample chopping, larger sample banks.
- **Support for other Elektron boxes, such as Analog Four, Digitakt, Syntakt, etc.**, using the same engine and the same approach to mods.
