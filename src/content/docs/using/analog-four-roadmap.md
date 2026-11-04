---
title: Analog Four roadmap
description: "What could come next for the Sidecar on an Analog Four MKII after 0.4.0: quick wins, medium work, and what needs design first. A plan, not a promise."
sidebar:
  order: 31
---

This is a plan, not a promise. It has no dates, the order can change with what testers ask for and what we find on a real A4, and some items may turn out bigger or smaller than they look, or not be built at all. For what works today, see [Analog Four MKII](/sidecar-expander/using/analog-four/).

## Where the A4 is at 0.4.0

- **Machines** on any track: OFF PLTS JUNO DSY FM6 MD B2 U1..U5, picked with MCH on the NOISE page, their knobs on OSC1 and NOISE, or on OSC2 with OS2 on MACHINE. Stored in the sound, so locks, LFOs, kits and the sound pool carry them.
- **Through the A4's analog path:** each of the 4 voices goes back into its own filters, overdrive, amp and FX. Chords on any track.
- **The Sidecar's pages** with UP + YES: SIDECAR, SYSTEM, a page for each track with a machine, SCOPE, REC and USER SLOTS. UP and DOWN leave the octave alone.
- **U1..U5 picked on the A4 itself** with the [USER SLOTS page](/sidecar-expander/using/user-machines/#the-user-slots-page), one of the Sidecar's pages, so no A4 flash was needed for it.
- **The box's name everywhere:** the touchscreen and the web page name the A4 and its tracks T1..T4.
- **Housekeeping:** its own state on the card, a swap with a Rytm with one Pi restart, recovery after a USB replug or an A4 restart.

Not on the A4 yet: per-project state, kit reports, the Sidecar sequencer and arp locks, send FX, inserts and master FX pages, and the sample machines with their pools and browsers. Most of the list below is about those.

## Quick wins

Small, engine only: no A4 flash.

1. **List knobs paced for the A4.** List knobs step one entry a detent at the Rytm's pace. The A4's encoders may want another.
2. **Knob names on the Sidecar's pages.** The track pages show values without names on the A4.
3. **The Sidecar's LFOs on the A4.** Check that the LFO page and the web tab work with the A4's 4 voices and its clock, and show the page on the A4.
4. **Master FX on the A4's main output.** The chain should work on what the Sidecar sends back as it is; processing the A4's own voices would take their 4 channels as stems. Then the MASTER page on the A4's ring, and a long listening test.

## Medium

More engine work, or a small change to the A4 mod (a flash).

5. **Inserts and send FX for the Sidecar's voices.** The inserts run on the Pi before a voice goes back to the A4, so they can work there too. The A4 has no send knob for a Sidecar voice, so the sends would live on the Sidecar's pages or in a free sound parameter: to be decided before building.
6. **The JUNO / FM preset browser on the A4,** as a page the Sidecar draws.
7. **Following the A4's project:** per-project user slots, LFOs and pools, as on the Rytm. The mod has to tell the Sidecar when a project loads.
8. **Kit reports:** per-kit Sidecar settings (inserts, LFOs) following the A4's kits.
9. **An LFO on TUN and FIN.**
10. **Machine names in the LFO and envelope destination lists,** instead of stock's.
11. **Recorder sources by the A4's names:** MAIN, each of the 4 voices, and the A4's inputs.
12. **A Sidecar entry in the A4's own menus.** Today the Sidecar's pages, USER SLOTS among them, open with UP + YES, drawn by the Sidecar. A native item in the A4's track or sound menu that opens them, as the Rytm's track menu has U1..U5, is a small mod change and a flash.

## Needs design first

A design conversation first, or a larger change.

13. **Sample machines on the A4.** They need the pools and a way to pick and slice a sample on the A4: which knobs, how a sample is picked per step, memory per project. Best designed together with live sampling.
14. **Live sampling and the looper** (0.5.0's main feature). The A4's inputs and voices are in its stream, so the Pi can record them. The design should cover both boxes from the start. With 4 voices, a looper's playback takes a voice's channel or the main output.
15. **Scenes** (0.5.0). Morphing the Sidecar's parameters: follow the A4's own performance macros, or live on the Sidecar's pages only.
16. **The Sidecar sequencer and arp locks on the A4.** The A4 stores its patterns differently from the Rytm, so this is a large job, and only worth it with a clear use.
17. **The A4's own font on the Sidecar's pages.** Today the pages use the Sidecar's font.
18. **More than 4 voices, or a stereo machine,** on the main output without the analog path: is it wanted, and how would a track choose it?
19. **The A4 and the Rytm in use at once.** Today one box has the Sidecar and the other waits. Both at once is a change of architecture: after 0.5.0.
20. **Recovery and release work** needed before A4 support is called finished: a rehearsed recovery over MIDI DIN, a fix for the hang at "Rebooting" when flashing over a running Sidecar build, and the version stamp.

## The order we have in mind

- **0.4.x:** 1, 2, 3, 4 and 11: small, and they make the A4 feel finished.
- **0.5.0:** 14 and 15 designed for both boxes, then 13 on top of 14; 5, 6 and 7 as their pages need them.
- **Later:** 8, 9, 10 and 12 together (one flash for all of them), then 16 to 19 after design conversations.
