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
- **The touchscreen and the web page** name the A4 and its tracks T1..T4.
- **Housekeeping:** its own state on the card, a swap with a Rytm with one Pi restart, recovery after a USB replug or an A4 restart.

Not on the A4 yet: per-project state, kit reports, the Sidecar sequencer and arp locks, send FX, inserts and master FX pages, and the sample machines with their pools and browsers. Most of the list below is about those.

## Quick wins

Small, engine only: no A4 flash.

1. **The box's name everywhere.** In 0.4.0: the touchscreen and the web page say A4 and T1..T4.
2. **The USER SLOTS page.** In 0.4.0: U1..U5's machines picked on the A4 itself ([USER SLOTS](/sidecar-expander/using/user-machines/#the-user-slots-page)).
3. **List knobs paced for the A4.** List knobs step one entry a detent at the Rytm's pace. The A4's encoders may want another.
4. **Knob names on the Sidecar's pages.** The track pages show values without names on the A4.
5. **The Sidecar's LFOs on the A4.** Check that the LFO page and the web tab work with the A4's 4 voices and its clock, and show the page on the A4.
6. **Master FX on the A4's main output.** The chain should work on what the Sidecar sends back as it is; processing the A4's own voices would take their 4 channels as stems. Then the MASTER page on the A4's ring, and a long listening test.

## Medium

More engine work, or a small change to the A4 mod (a flash).

7. **Inserts and send FX for the Sidecar's voices.** The inserts run on the Pi before a voice goes back to the A4, so they can work there too. The A4 has no send knob for a Sidecar voice, so the sends would live on the Sidecar's pages or in a free sound parameter: to be decided before building.
8. **The JUNO / FM preset browser on the A4,** as a page the Sidecar draws.
9. **Following the A4's project:** per-project user slots, LFOs and pools, as on the Rytm. The mod has to tell the Sidecar when a project loads.
10. **Kit reports:** per-kit Sidecar settings (inserts, LFOs) following the A4's kits.
11. **An LFO on TUN and FIN.**
12. **Machine names in the LFO and envelope destination lists,** instead of stock's.
13. **Recorder sources by the A4's names:** MAIN, each of the 4 voices, and the A4's inputs.

## Needs design first

A design conversation first, or a larger change.

14. **Sample machines on the A4.** They need the pools and a way to pick and slice a sample on the A4: which knobs, how a sample is picked per step, memory per project. Best designed together with live sampling.
15. **Live sampling and the looper** (0.5.0's main feature). The A4's inputs and voices are in its stream, so the Pi can record them. The design should cover both boxes from the start. With 4 voices, a looper's playback takes a voice's channel or the main output.
16. **Scenes** (0.5.0). Morphing the Sidecar's parameters: follow the A4's own performance macros, or live on the Sidecar's pages only.
17. **The Sidecar sequencer and arp locks on the A4.** The A4 stores its patterns differently from the Rytm, so this is a large job, and only worth it with a clear use.
18. **The A4's own font on the Sidecar's pages.** Today the pages use the Sidecar's font.
19. **More than 4 voices, or a stereo machine,** on the main output without the analog path: is it wanted, and how would a track choose it?
20. **The A4 and the Rytm in use at once.** Today one box has the Sidecar and the other waits. Both at once is a change of architecture: after 0.5.0.
21. **Recovery and release work** needed before A4 support is called finished: a rehearsed recovery over MIDI DIN, a fix for the hang at "Rebooting" when flashing over a running Sidecar build, and the version stamp.

## The order we have in mind

- **0.4.x:** 3, 4, 5, 6 and 13: small, and they make the A4 feel finished.
- **0.5.0:** 15 and 16 designed for both boxes, then 14 on top of 15; 7, 8 and 9 as their pages need them.
- **Later:** 10, 11 and 12 together (one flash for all three), then 17 to 20 after design conversations.
