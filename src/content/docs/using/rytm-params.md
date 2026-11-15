---
title: The Rytm's own parameters
description: "In 0.5.0 the Sidecar's XY pad, MIDI learn and poly-track p-locks can move the Rytm's own sound parameters: which ones, how each source acts, what happens to the kit, scenes and the link."
sidebar:
  order: 3.02
---

<span class="sc-test">in testing</span> New in 0.5.0. It needs the **Rytm firmware 0.5.0** and the Sidecar 0.5.0. On an older Rytm the targets stay in your files, but nothing is sent.

From 0.5.0 the Sidecar can move the Rytm's **own** sound parameters: a track's filter, amp, LFO, synth and sample pages, its trig velocity and velocity-mod amounts, and the FX track's delay, reverb, distortion and compressor. The XY pad, MIDI learn and the p-locks of [poly tracks](/sidecar-expander/using/sequencer/) can be the source. The Sidecar's [LFOs](/sidecar-expander/using/lfo/) cannot yet: in 0.5.0 they move Sidecar targets only, and LFOs on the Rytm's own parameters are coming in a later version.

## The kit is never written

The Sidecar does not set the Rytm's stored value. It sends an **offset** or an **override**, and the Rytm adds it in its audio interrupt, after its own modulation (its LFO, velocity, PERF and scenes).

- **Saving the kit keeps the stored values.** A kit you save while the XY pad holds a parameter keeps the knob's value, not the moving one.
- **The Rytm's scenes win.** If a Rytm scene locks the same parameter, the scene's value beats a Sidecar override (a p-lock), as on the Rytm itself. Offsets still add on top.
- **If the Sidecar goes away** (USB unplugged, the Pi switched off), every parameter goes back to the Rytm's own value after a moment.
- A kit change, a project change or a reset of the modulation clears every track on the Rytm.

## Where to find the targets

The XY pad and MIDI learn have their own pickers (the LFO page's target list has no Rytm targets in 0.5.0). On the touchscreen, the XY picker lists the Rytm's tracks (BD .. CB) and **RFX**, the FX track, last.

## The parameters

| Group | Parameters |
|---|---|
| Track LFO | SPD FAD SPH DEP |
| Synth page | P1..P8, named by the track's machine (for example TUN, DEC) |
| Sample page | TUN FIN BR STA END LEV |
| Filter page | FENV FATK FDEC FSUS FREL FRQ RES |
| Amp page | ATK HLD DEC OVR VOL PAN ACC DEL REV |
| Velocity | VEL: the trig's velocity |
| Velocity mod and aftertouch amounts | VM1..VM4, AT1..AT4 |
| RFX delay | TIM X WID FDB DHPF DLPF DREV DVOL DOV |
| RFX reverb | PRE RDEC RFRQ GAI RHPF RLPF RVOL |
| RFX distortion | AMT SYM |
| RFX compressor | THR MUP MIX CVOL |
| RFX LFO | SPD FAD DEP |

- **Whole values only:** the list words (the track LFO's multiplier, wave and mode; the sample slot and loop; the filter type; the compressor's attack, release, ratio and sidechain EQ) cannot follow the XY pad or MIDI learn. A p-lock can set them.
- **VEL** acts on trigs the Rytm's sequencer plays. Pads and live play keep their own velocity.
- On a track that plays a Sidecar machine, the synth and sample words are the machine's own parameters. They are not Rytm targets: use that voice's parameters in the PAR list.
- The Rytm track LFO's own destination is not offered.

## How each source acts

- **The XY pad and MIDI learn** add an **offset** to the Rytm's value. Two sources on one parameter add up, and the Rytm limits the sum to the parameter's range.
- **A p-lock on a poly track** (the FLTR, AMP and LFO pages) overrides the value at the step. It holds until the track's next trig without that lock, a failed lock condition, or STOP. On a pinned track the envelope words stay with the Sidecar's own envelope and are refused as locks.

## The link

The updates go out at most every 5 ms, and only the parameters that changed. The whole feature stays under about 16 KB/s on the USB link. Releases and p-locks keep their priority. The Rytm holds up to **128** live parameters at a time. More are refused.

## Files

The targets are saved by name (`RT3:FRQ`, `RFX:TIM`) in the Sidecar's own files only (XY and sequencer files). An older Sidecar build cannot read a file with such a target, so it leaves the file alone and does not write over it.
