---
title: Analog Four MKII
description: "DRAFT, unreleased. The Sidecar on an Analog Four MKII: a machine on a track's OSC1 page, through the A4's own filters and amp."
draft: true
sidebar:
  order: 30
---

<!-- UNRELEASED: this page is `draft: true`, so a production build leaves it out. Lift the draft and every mark below only with Sidecar 0.4.0, after SA09 or its successor has run on a real A4. -->

:::danger[Draft, not released]
A4 support reaches people with Sidecar 0.4.0. This page describes mod 0.9 (build SA09), which **has not run on a real A4 yet**: it has passed the emulator suites and flash rehearsals only. The earlier builds it grew from ran on one A4, with a Pi 5.
:::

The Sidecar can drive an **Analog Four MKII** on OS 1.56. A track's sound picks a Sidecar machine; that track's trigs and knobs go to the Sidecar over USB, and the machine comes back over Overbridge, through stock's own track inputs, into that voice's analog path. So PLAITS or JUNO go through the A4's filters, overdrive, amp and FX. No audio code is patched.

With no Sidecar, or with every sound OFF, the A4 sounds and plays as stock. What differs is the two knobs on the NOISE page, and a few short SysEx hellos on USB at each port-up.

## What has run where

| | <span class="sc-ok">on a real A4</span>, earlier builds | <span class="sc-test">emulator only</span>, SA09 |
|---|---|---|
| Overbridge stream, machine through filter, drive and FX | Yes, 0 underruns | Yes |
| The Sidecar's first start into `/.a4` | Yes | Yes |
| Clock and transport with CLOCK SEND and TRANSPORT SEND on | Yes | Not checked |
| Chords from the sequencer, on mono and poly tracks | Yes | Yes |
| Machine on OSC1 with its own names and plain dials | No: earlier builds had a separate SIDECAR page | Yes |
| MCH and OS2 on the NOISE page, the four extra parameters | No | Yes |
| Empty hatched knobs | Yes, on the earlier layout | Yes |
| The Sidecar's pages on the A4's screen | Yes, by another key | Yes, by UP + YES |
| UP + YES | No | Yes |
| Going back to stock | Not on record | Rehearsed, no machine set |
| Recovery over MIDI DIN from a torn image | No | No |

Not tried anywhere: a computer in Overbridge with a machine set, so keep every sound OFF for computer sessions.

## What you need

- An Analog Four **MKII** on **OS 1.56**. Above 1.56 this is a downgrade: stop.
- The stock `Analog-Four_MKII_OS1.56.syx`. We never distribute firmware, stock or modified.
- A Sidecar on 0.4.0. The Pi 5 is the one that has run this; a Pi 4 has not been tried.
- Your projects backed up with Transfer, and a MIDI DIN interface in hand.

## Install

1. **Build your firmware.** On the [patcher](/sidecar-expander/patcher/), pick the A4 build, drop your stock file on it, press **Patch**, then **Save**. It is done in your browser; nothing is uploaded, and the result is checked against the tested build. <!-- UNRELEASED: the entry is hidden and the deploy refuses it until release. -->

   The same bytes come from the two `.elemod` files on the A4 mod's release page (`a4-v0.9`: **this release does not exist yet**) with elekloader's command line. Use the lock file and version from the release, or the hash will differ:

   ```sh
   python3 -m elekloader.patch --stock Analog-Four_MKII_OS1.56.syx --mod core-0.3.elemod \
       --mod sidecar-a4-0.9.elemod --lockfile a4156.lock.json --version SA09 --out sidecar.syx
   ```

   **Never share the `.syx` you built:** it contains Elektron's firmware. Share the `.elemod` files instead.
2. **Flash it.** GLOBAL > SYSTEM > USB CONFIG: USB MIDI, connected to a computer. Send the `.syx` with Transfer as an OS update and press YES at UPGRADE OS NOW?. The A4 restarts.
3. **Connect the Sidecar.** Set USB CONFIG to OVERBRIDGE and connect the A4 to the Pi's USB-A port. The first hello restarts the Pi once, into its own state folder `/.a4`. Samples, plugins and patch libraries stay shared with a Rytm's `/.rytm`.
4. **Clock.** Turn on CLOCK SEND and TRANSPORT SEND on the A4 if you want the Sidecar's synced LFOs and its transport. Without them it hears neither.

**With a Rytm too:** a box already streaming keeps the Sidecar, and the other waits. At a start with both attached, the Rytm takes it and the A4 waits.

## Pages

The OSC1 key steps two pages, **OSC1** and **NOISE**. A sound with a machine turns both into the machine's; a sound on OFF shows stock.

### The NOISE page

| Knob | |
|---|---|
| A, B, C, E | Stock's NOISE knobs, on the A4's own noise |
| D, **MCH** | The machine: OFF PLTS JUNO DSY FM6 MD B2 U1 U2 U3 U4 U5. Stored in the sound, so kits, the sound pool and copy and paste carry it. Every sound starts OFF |
| F, **OS2** | ANALOG or MACHINE, below |
| G, H, I, J | Four more of the machine's parameters, under its names. Empty where a machine has none |

U1..U5 are what the Sidecar's User machines tab put in those slots.

**A pick from OFF** writes the machine's defaults on its knobs and sets OSC1 LEV to 0, so the analog oscillator is out of the way. Turning on through the list keeps writing defaults as long as no knob has moved. From one machine to another with a knob moved, nothing is written. Back to OFF, the hidden values return to stock's ranges; OSC1 LEV stays where it is.

### The machine on OSC1

OSC1's knobs are plain 0..127 dials with the machine's names. A turned knob's title says, for example, PLTS HRM. LEV stays the analog oscillator's. A knob the machine does not read is empty, stock's own hatched knob, and a turn does nothing.

| Machine | TUN | FIN | DET | TRK | WAV | SUB | PW | SPD | PWM | NOISE G H I J |
|---|---|---|---|---|---|---|---|---|---|---|
| PLAITS | ENG | TUN | HRM | LPG | LEV | FM | TIM | MOR | DEC | FIN AUX TMD MMD |
| JUNO | PAT | - | CUT | DEC | REL | LEN | RES | ENV | ATK | - |
| DAISYSP | ENG | TUN | STR | EXC | LEV | XTN | BRI | DMP | INP | XDC FB OUT XP4 |
| 6-OP FM | PAT | TUN | TIM | LEV | LEN | - | MOR | DEC | LPG | - |
| MD, B2 | CT1 | ENG | CT2 | CT6 | CT7 | CT8 | CT3 | CT4 | CT5 | TYP LEV |
| U1..U5 | P1 | P7 | P2 | P6 | P8 | P9 | P3 | P4 | P5 | P10..P13 |

Locks, LFOs and kit saves work on all of these, by stock's own path. **TUN and FIN are in no LFO or envelope list**, so an LFO cannot jump ENG, and ENG cannot be modulated. The other lists keep stock's names: DET in a list is HRM on PLAITS. NOISE G..J appear in the lists as PM1, FM1, ACC and AM1.

TUN and FIN are one word of the sound: a lock on either is one lock of that word. The word glides as stock's does, so FIN's value wobbles while TUN turns, and after a TUN lock the value glides back over the next steps.

A sound's own LFOs reach the machine: a factory kit's LFO on DET sweeps PLAITS HRM. Start from a cleared sound.

OSC2, NOISE A..C and E and the OSC 1&2 page stay stock's. One exception: while NOISE J holds AM1, knob A of OSC 1&2 shows the machine's name for it, as it is the same parameter.

### OS2

| Setting | |
|---|---|
| ANALOG (default) | OSC2 and the noise stay the A4's own |
| MACHINE | OSC2's page goes to the machine, with its names, and NOISE G..J go empty. OSC2 LEV stays analog |

MACHINE gives these on OSC2's page, in the order TUN DET PW SPD PWM TRK:

| Machine | OSC2 |
|---|---|
| PLAITS | FIN AUX TMD MMD VEL GLD |
| DAISYSP | XDC FB OUT XP4 XLV XP5 |
| MD, B2 | TYP LEV |
| U1..U5 | P10..P15 |

JUNO and 6-OP FM have nothing to give, so knob F is empty there and OSC2 stays stock's. A flip writes no values: OSC2's knobs bring what they hold. So PLAITS VEL reads OSC2 PWM, which is 0 on a cleared sound. On ANALOG, VEL, GLD, XLV, XP5, P14 and P15 stay at their defaults.

### Chords

A chord on a step reaches the track's machine whole, whatever KIT > POLY CONFIG says, so a mono track plays a Sidecar chord and takes no analog voice from another track. PLAITS, JUNO, DAISYSP, 6-OP FM and user machines that declare instances play it; MD, B2 and a mono user machine play one hit.

## The Sidecar's pages on the A4's screen: UP + YES

Hold **UP** for a moment and press **YES**: the A4's screen shows the Sidecar's pages. UP + YES again leaves.

| Key | |
|---|---|
| LEFT, RIGHT | SIDECAR, SYSTEM, a page for each track with a machine, SCOPE, REC |
| YES | On SIDECAR: the MENU |
| NO | Back; on SIDECAR, leaves |
| Any stock page key | Leaves, and does its stock job |

While a page is open only the arrows, YES, NO and the knobs that page uses are the Sidecar's. The keyboard, track keys and transport stay stock's. If the Sidecar goes away, the stock screen returns by itself within about a second.

UP still does its stock job as it goes down. On a parameter page that is the keyboard's octave up, so **each UP + YES there leaves the octave one higher**; DOWN brings it back. YES is the page's while it is open, so a held trig's note preview needs the page closed.

## Limits

- **4 voices, one channel each.** All of a chord's audio is on that track's channel, so it enters one analog voice and takes that voice's filters and amp. That amp must be open. On a poly track, if the A4 gives none of the chord's notes to that voice, the chord is silent while the notes play elsewhere.
- **The A4's amp envelope shapes the machine.** A voice only sounds while the amp is open.
- **Sample machines are not on the A4.** Nor are the Rytm's pages that need its pools, sequencer, send FX or project reports, machine names in the LFO lists, or the Sidecar following the A4's project name.
- **No FX channel in SCOPE.** The A4's stream has MAIN, the 4 voices and IN L/R.
- **Text on the Sidecar's pages** is in the Sidecar's font, not the A4's.
- **A restart of the A4 with the Pi running** failed once to come back on USB: "A4 not connected" on the web page. A Sidecar restart cleared it. Cause unknown.
- **Copy, paste and clear of a machine's page** take the shown knobs only.
- **OSC1 LEV 0 is what keeps the analog oscillator out.** With it at 0, SUB is silent, and AM2 and SYNC do not change OSC2's sound: heard on a unit on an earlier build.

Not yet heard on a real A4, on any build: ACC on an accent trig, which may lift the amp on the Sidecar's path; AM1 up with OSC1 LEV 0; the dial feel of the wide knobs.

## Back to stock

1. Set every sound's machine to OFF and save. That takes TRK, WAV, SUB and AM1 back into stock's ranges and PM1, FM1 to centre. A rollback with a machine still set is not rehearsed.
2. Send `Analog-Four_MKII_OS1.56.syx` with Transfer, as an OS update.

The other knobs keep what they hold, OSC1 LEV 0 among them.

**If it will not boot:** hold FUNC at power-on, press TRIG 4 for OS UPGRADE, and send the stock `.syx` over MIDI DIN (Transfer's legacy mode). This route is the A4's own and has not been rehearsed with this mod.
