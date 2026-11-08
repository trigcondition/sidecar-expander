# Release notes

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/release-notes/>

## Sidecar 0.4.2

**Overbridge through the Sidecar on the Pi 5 too.** Apart from that it is Sidecar 0.4.1. It goes with the **Rytm firmware 0.4.0** you already have: **no new Rytm flash**, only new card files. The A4 mod (0.12) and Sidecar Mini (0.1.0) are unchanged.

| Part | File |
|---|---|
| Rytm firmware | unchanged: the Rytm firmware 0.4.0 for OS 1.74 or OS 1.73 ([Sidecar 0.4.0](https://trigcondition.github.io/sidecar-expander/release-notes/#sidecar-040), [Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)) |
| Sidecar (Raspberry Pi 4B and Pi 5, one card) | `sidecar-pi-sd-b74af29-800x480.zip` for **800x480** displays (and DSI or no display), `sidecar-pi-sd-b74af29-1024x600.zip` for **1024x600** HDMI displays, each with its `.sha256`; `BUILD-INFO-pi.txt` names the commit and both kernels ([Install](https://trigcondition.github.io/sidecar-expander/getting-started/install-pi/)) |
| User machines (Pi) | `sidecar-pi-plugins-0.4.2.zip`: the same machines as 0.4.1 |
| Starter content | `sidecar-content-0.4.2.zip`: the same patches as 0.4.1 (also on the card) |
| User manual | `Sidecar-0.4.2-User-Manual.pdf` ([download](https://github.com/trigcondition/sidecar-firmware/releases/download/v0.4.2/Sidecar-0.4.2-User-Manual.pdf)) |
| Checksums | `SHA256SUMS` on the release page |

Downloads: the [sidecar-firmware 0.4.2 release](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.4.2) (the Pi). The Rytm firmware stays on the [sidecar-mods 0.4.0 release](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.4.0).

### Upgrading from 0.4.1

1. **The Rytm:** nothing to do if it runs the Rytm firmware 0.4.0 (OS 1.74 or 1.73).
2. **Copy the new card files** over the old ones (your samples, recordings, `/Plugins/` and `/.rytm/` stay).
3. **For Overbridge:** set the USB-C mode to OVERBRIDGE ([Overbridge through the Sidecar](https://trigcondition.github.io/sidecar-expander/using/usb-audio-midi/#overbridge-through-the-sidecar)).

From 0.4.0, also see [Upgrading from 0.4.0](https://trigcondition.github.io/sidecar-expander/release-notes/#upgrading-from-040) (MODEL E). From 0.3.2 or older: follow [Upgrading from 0.3.2](https://trigcondition.github.io/sidecar-expander/release-notes/#upgrading-from-032) (flash the Rytm firmware 0.4.0) with the 0.4.2 card.

### New in 0.4.2

- **Overbridge through the Sidecar on the Pi 5** (opt-in), hardware (Pi 5, macOS): as on the Pi 4 since 0.4.1, the computer on the Pi's USB-C sees the Rytm itself, so Overbridge Engine and the Analog Rytm plugin work while the Sidecar plays alongside. The USB-C mode switch (web page, the Rytm's SIDECAR MENU > USB-C, the touchscreen's Settings > Sound) now offers OVERBRIDGE on the Pi 5 too. On a real Pi 5: live switches between CLASS COMPLIANT and OVERBRIDGE with the Overbridge Analog Rytm app open, 12 channels and the plugin streaming, no reset, no underruns. Based on pull requests 19 and 20 by [Iced-Cream](https://github.com/Iced-Cream).
- **Power on the Pi 5:** a Pi 5 that uses its USB-C for data gets only about 1.5 A from a computer or hub port. In our test it worked on a powered hub port with no under-voltage; a **USB-C power and data splitter** with the 27 W supply gives it full power and is the recommended setup ([The Pi 5 and Overbridge](https://trigcondition.github.io/sidecar-expander/using/usb-audio-midi/#the-pi-5-and-overbridge)).

### Known issues in 0.4.2

- **A Pi 5 on a weak computer or hub port** can be short of power (under-voltage, resets): use a USB-C power and data splitter with the 27 W supply.
- **Switching the USB-C mode is a replug** for the computer: stop the DAW first, and never switch during a transfer or an OS update.
- Everything else in [Known issues in 0.4.0](https://trigcondition.github.io/sidecar-expander/release-notes/#known-issues-in-040) still applies.

## Sidecar 0.4.1

**A fix release for the Pi, with Overbridge passthrough on the Pi 4.** It goes with the **Rytm firmware 0.4.0** you already have: **no new Rytm flash**, only new card files. The A4 mod (0.12) and Sidecar Mini (0.1.0) are unchanged.

| Part | File |
|---|---|
| Rytm firmware | unchanged: the Rytm firmware 0.4.0 for OS 1.74 or OS 1.73 ([Sidecar 0.4.0](https://trigcondition.github.io/sidecar-expander/release-notes/#sidecar-040), [Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)) |
| Sidecar (Raspberry Pi 4B and Pi 5, one card) | `sidecar-pi-sd-8bfc7e1-800x480.zip` for **800x480** displays (and DSI or no display), `sidecar-pi-sd-8bfc7e1-1024x600.zip` for **1024x600** HDMI displays, each with its `.sha256`; `BUILD-INFO-pi.txt` names the commit and both kernels ([Install](https://trigcondition.github.io/sidecar-expander/getting-started/install-pi/)) |
| User machines (Pi) | `sidecar-pi-plugins-0.4.1.zip`: 0.4.0's machines and **MODEL E** (`modele.a64.rmp`, GPL-2.0-or-later, with its licence, notices and source); the MD user machine is out, MD is built in |
| Starter content | `sidecar-content-0.4.1.zip`: the same patches as 0.4.0 (also on the card) |
| User manual | `Sidecar-0.4.1-User-Manual.pdf` ([download](https://github.com/trigcondition/sidecar-firmware/releases/download/v0.4.1/Sidecar-0.4.1-User-Manual.pdf)) |
| Checksums | `SHA256SUMS` on the release page |

Downloads: the [sidecar-firmware 0.4.1 release](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.4.1) (the Pi). The Rytm firmware stays on the [sidecar-mods 0.4.0 release](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.4.0).

### Upgrading from 0.4.0

1. **The Rytm:** nothing to do if it runs the Rytm firmware 0.4.0 (OS 1.74 or 1.73).
2. **Copy the new card files** over the old ones (your samples, recordings, `/Plugins/` and `/.rytm/` stay).
3. **For MODEL E:** upload `modele.a64.rmp` from the user machines zip on the web page's User machines tab. You can delete the MD user machine (`mdk_md.a64.rmp`) from `/Plugins/`: MD is built in.
4. **For Overbridge on a Pi 4:** set the USB-C mode to OVERBRIDGE ([Overbridge through the Sidecar](https://trigcondition.github.io/sidecar-expander/using/usb-audio-midi/#overbridge-through-the-sidecar)).

From 0.3.2 or older: follow [Upgrading from 0.3.2](https://trigcondition.github.io/sidecar-expander/release-notes/#upgrading-from-032) (flash the Rytm firmware 0.4.0) with the 0.4.1 card.

### New in 0.4.1

- **Overbridge passthrough on the Pi 4** (opt-in), hardware (Pi 4, macOS, 2026-11-06). The computer on the Pi's USB-C sees the Rytm itself, so Overbridge Engine and the Analog Rytm plugin work through the Sidecar while the Sidecar plays alongside. From pull requests 19 and 20 by [Iced-Cream](https://github.com/Iced-Cream), with our fixes ([Overbridge through the Sidecar](https://trigcondition.github.io/sidecar-expander/using/usb-audio-midi/#overbridge-through-the-sidecar)).
- **The USB-C mode switch:** CLASS COMPLIANT (the default, the Sidecar's own audio and MIDI interface) or OVERBRIDGE, on the web page (Sound tab), the Rytm (SIDECAR MENU > USB-C) and the touchscreen (Settings > Sound). It switches live, with no restart, and is kept on the card. The USB-C side copes with the computer's idle suspend and resume, and with the Overbridge app starting while a request is still pending (in the test builds that reset the Pi).
- **Pi 5: Overbridge comes in 0.4.2.** OVERBRIDGE is greyed out on a Pi 5. A Pi 5 that uses its USB-C for data gets only about 1.5 A from a computer or hub port, so it needs a USB-C power and data splitter; Overbridge on the Pi 5 will be released once it has run that way ([The Pi 5 and Overbridge](https://trigcondition.github.io/sidecar-expander/using/usb-audio-midi/#the-pi-5-and-overbridge)).
- **MODEL E** in the user machines zip: a three-oscillator voice with a ladder filter, for basses and leads ([MODEL E](https://trigcondition.github.io/sidecar-expander/using/user-machines/#new-in-041-model-e)). The MD user machine is no longer in the zip: MD is built in since 0.4.0.
- **The user manual** as a PDF, on the release page.

### Fixed in 0.4.1

- **USB dropouts that stopped the voices,** hardware (Pi 4). A single USB transaction error on the Rytm's cable could stop the Sidecar's voices for good, with the CPU at 0 and no underrun. The Sidecar now clears the stalled endpoint (Overbridge IN and OUT, the A4 follower, MIDI OUT) and plays on.
- **The Rytm comes back after its cable is pulled,** hardware (Pi 4, cable pulls while playing). When several endpoints fail together (a pulled cable) the Sidecar waits for the replug instead of resetting each one, and retries the Rytm's USB address.
- **The USB hub re-arm** (pull request 15 by [Iced-Cream](https://github.com/Iced-Cream)), in testing: a USB hub on the Pi keeps reporting devices plugged in or out after a USB error.
- **DSP SAMPLE (and other machines) silent after choosing it in the Rytm's machine list,** hardware (Pi 4). The Rytm resets only the machine's first page, so the second page kept the old machine's values (after LIVE IN, END 0 and LEV 0). The Sidecar now writes the second page's defaults when the list closes (OS 1.74 and 1.73); NO keeps the old sound.
- **The web page's buttons work again in Chrome with a paired browser,** hardware. Chrome sent a header in lower case and every paired change was refused without a word. A lost pairing now brings the pairing dialog back, and a refused change says why.
- **The plugin list keeps updating after long uptime,** in testing (host tests). After about 24.8 days of uptime the list stopped updating after an upload until a restart.
- **After a restart** the Sidecar comes back to the same project and settings (seen on hardware through many restarts).

### Known issues in 0.4.1

- **Overbridge passthrough is Pi 4 only;** the Pi 5 gets it in 0.4.2.
- **A Pi 5 on a computer's USB-C without a splitter** can be short of power (under-voltage, resets): use a USB-C power and data splitter with the 27 W supply.
- **Switching the USB-C mode is a replug** for the computer: stop the DAW first, and never switch during a transfer or an OS update.
- Everything else in [Known issues in 0.4.0](https://trigcondition.github.io/sidecar-expander/release-notes/#known-issues-in-040) still applies.

## Sidecar 0.4.0

**Master FX, a saturator, arp locks, a new user machine, and the Analog Four MKII as a box of its own.** It goes with the **Rytm firmware 0.4.0**: flash it for master FX and the Rytm fixes. Sidecar Mini stays at 0.1.0.

| Part | File |
|---|---|
| Rytm firmware, OS 1.74 | `core-0.1-os1.74.elemod` + `rytm-sidecar-0.4.0-os1.74.elemod` (elekloader, GPL-2.0-or-later), or build `rel0-4-0-os1.74` in the browser patcher, from Elektron's stock `Analog-Rytm_MKII_OS1.74.syx`. One `.syx` with SHA-256 `538ae6fa1a66dfb72141743036c40b4f3845ed73a4ea59f7e3b6aa9e51fab337`. Has run on a real Rytm (Sidecar machines, pages, send FX with ROUTE PRE, the MASTER page, kit save and reload). You can move between 1.73 and 1.74 in both directions with Elektron's stock files ([Which OS](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/#which-os-174-or-173)) |
| Rytm firmware, OS 1.73 | `core-0.1.elemod` + `rytm-sidecar-0.4.0.elemod` (elekloader, GPL-2.0-or-later), or build `rel0-4-0` in the browser patcher, from your stock `Analog-Rytm_MKII_OS1.73.syx`. One `.syx` with SHA-256 `07780e9eb4bce7f71c83da3134ede4782f7ea7af211eb6787c670607707bff18` ([Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)). Never share a built `.syx`: it holds Elektron's firmware |
| Analog Four MKII firmware | the A4 mod 0.12, build SA12: `core-0.3.elemod` + `sidecar-a4-0.12.elemod` with the lock file `a4156.lock.json` (elekloader's command line), or build `a4-sa12` in the browser patcher, from your stock `Analog-Four_MKII_OS1.56.syx` ([Analog Four MKII](https://trigcondition.github.io/sidecar-expander/using/analog-four/)). One `.syx` with SHA-256 `e9eab646102844518ff48e44864f42b2a555aadc2b8fd86b5eaabe2d772a1d71`. Never share the built `.syx` |
| Sidecar (Raspberry Pi 4B and Pi 5, one card) | `sidecar-pi-sd-e2de6c5-800x480.zip` for **800x480** displays (and DSI or no display), `sidecar-pi-sd-e2de6c5-1024x600.zip` for **1024x600** HDMI displays, each with its `.sha256`; `BUILD-INFO-pi.txt` names the commit and both kernels ([Install](https://trigcondition.github.io/sidecar-expander/getting-started/install-pi/)) |
| User machines (Pi) | `sidecar-pi-plugins-0.4.0.zip`: 0.3.2's machines and **SOPHIE** (`sophie.a64.rmp`) |
| Starter content | `sidecar-content-0.4.0.zip`: the same patches as 0.3.2 (also on the card) |
| Checksums | `SHA256SUMS` on each release page |

Downloads: the [sidecar-firmware 0.4.0 release](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.4.0) (the Pi), the [sidecar-mods 0.4.0 release](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.4.0) (the Rytm firmware) and the [A4 mod's release a4-v0.12](https://github.com/trigcondition/sidecar-mods/releases/tag/a4-v0.12) (the A4 firmware).

### Upgrading from 0.3.2

1. **Flash the Rytm firmware 0.4.0**, the build for your Rytm's OS ([Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)). On 1.73 you can stay on 1.73. To move to 1.74: flash Elektron's stock 1.74 first, which proves recovery, then the Sidecar's 1.74 build; a 1.73 Rytm can also take the 1.74 build directly. You can go back with the stock file of the OS you want (both directions work with Elektron's files; Elektron offers only 1.74 now, so keep your own copy of 1.73). Back up every project before any OS change. Master FX needs it for the Rytm's pans and routing in through mode, and the Rytm fixes below are in it.
2. **Copy the new card files** over the old ones (your samples, recordings, `/Plugins/` and `/.rytm/` stay).
3. **With an NVMe SSD on a Pi 5:** add `nvme=1` to the one line in `cmdline.txt`. From 0.4.0 the Pi only looks for an SSD when asked ([Fixed in 0.4.0](#fixed-in-040)).
4. **For SOPHIE:** upload `sophie.a64.rmp` from the user machines zip on the web page's User machines tab.

From 0.3.1 do the same. From 0.3.0, the Rytm firmware 0.4.0 replaces 0.3.1, so flash it and copy the card. From 0.2.0, follow [Upgrading from 0.2.0](#upgrading-from-020) with the 0.4.0 card and the Rytm firmware 0.4.0.

**With an Analog Four MKII:** flash the A4 firmware and connect it as on [Analog Four MKII](https://trigcondition.github.io/sidecar-expander/using/analog-four/#install). The same 0.4.0 card serves the Rytm and the A4.

### New in 0.4.0

On the Rytm:

- **OS 1.74 support.** The Rytm firmware comes in two builds, for OS 1.74 (what Elektron offers now) and for OS 1.73. Projects should carry over to 1.74 (checked in the code and the emulator, and a kit saved and reloaded on a real Rytm). The 1.74 build has run on a real Rytm ([Which OS](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/#which-os-174-or-173)).
- **Master FX.** A stereo chain after the Rytm's own effects: four slots (any insert type, SAT among them, and CHORUS, COMB, SPACE, RINGS, CLOUD and HALO, two of those at a time), a POST EQ (HPF, LPF, LOW, HIGH) and a level, with a stereo-linked lookahead limiter last, so a loud mix comes out whole. Saved per kit. **SRC RET** (the default) takes the Sidecar's voices and returns. **SRC MIX**, the through mode, also takes every Rytm track you take off ROUTE TO MAIN, after its filter, amp and drive, panned as on the Rytm, with a STEM TRIM (0 to -24 dB, default -6) before the sum. The Rytm's delay and reverb stay outside the chain. Set it on the Rytm's **MASTER** page (on the ring and in the SIDECAR MENU), on the touchscreen (Settings > Send FX > Master) or on the web page's Send FX tab. No p-locks or LFOs on it yet ([Master FX](https://trigcondition.github.io/sidecar-expander/using/master-fx/)).
- **The MIDI machine.** Machine 50 on every track sends the track's notes and locks as MIDI, to the Rytm's DIN out, the computer (USB-C) or USB MIDI devices on the Pi (USB-A). SRC: DST CHAN BANK SBNK PROG PB AT MW; SMPL: VAL1..4 and SEL1..4, four CCs of your choice ([MIDI machine](https://trigcondition.github.io/sidecar-expander/using/midi-machine/)).
- **The arpeggiator.** UP + FLTR opens the ARP page: MODE, SPD, RNG, GATE and SWNG, per sound, in time with the Rytm, on any Sidecar machine and the MIDI machine ([Arpeggiator](https://trigcondition.github.io/sidecar-expander/using/arpeggiator/)).
- **MD's own page.** The built-in MD shows ENGINE, TYPE and all 30 drum types, with each drum's controls named, instead of DIGIDRUM's old page ([MD](https://trigcondition.github.io/sidecar-expander/using/machines/#md)).
- **A preset browser for JUNO and 6-OP FM.** PAT (knob A of SRC) opens the bank list of the project's presets; FUNC + YES on it browses the card's `/JUNO` and `/DX7`, with FACTORY and ROM as folders. The first add fills the list with the built-ins at their PAT numbers, so a saved PAT keeps its preset ([JUNO](https://trigcondition.github.io/sidecar-expander/using/machines/#juno)).
- **DSP SAMPLE's SMP on knob A of SRC,** as on GRANULAR, WAVETABLE and MULTISAMPLE: it opens the same bank list. ENG moves to the SMPL page; saved sounds and locks are unchanged. MIX starts at 0 on a new sound, and the page shows the playhead ([DSP SAMPLE](https://trigcondition.github.io/sidecar-expander/using/machines/#dsp-sample)).
- **PAD OCT** in POLY CONFIG (knob G, -3..3): the CHRO pads reach C2..B5 only; PAD OCT moves them by octaves on that track ([POLY CONFIG](https://trigcondition.github.io/sidecar-expander/using/sequencer/#poly-config)).
- **Longer list knobs:** a list knob holds up to 36 names, 16 before.
- **SAT,** a new insert type: a saturator with three characters, TAPE, CONS and SOFT, with DRV, TONE and MIX, for a voice, a bus or the master chain ([SAT](https://trigcondition.github.io/sidecar-expander/using/insert-fx/#sat-tape-console-soft)).
- **Arp locks.** On a Sidecar seq track, hold a step and press FLTR: **LOCK ARP** locks the arpeggiator's MODE, SPD, RNG, GATE and SWNG (knobs A..E) for that step only. The touchscreen's ARP tool sets them too. They copy, paste and clear with the step ([Arp locks](https://trigcondition.github.io/sidecar-expander/using/arpeggiator/#arp-locks)).
- **List knobs step one entry a detent.** The recorder's source, insert A / B, FX TYPE and the other list knobs were far too quick; now the first turn after a rest steps at once, then one entry a detent. Thanks to the testers who reported it.
- **A JUNO preset picked in the bank list sounds at once.** It used to show at once but could sound only after a track switch.
- **The USER SLOTS page.** U1..U5's machines picked on the box's own screen: UP + YES, then the ring or the SIDECAR MENU ([The USER SLOTS page](https://trigcondition.github.io/sidecar-expander/using/user-machines/#the-user-slots-page)). On the Rytm and the A4.
- **SOPHIE,** a new user machine: metallic FM percussion with four operator models and a kick body, ring delay and a multimode filter. A port of [Sophie](https://github.com/mestela/schwung-sophie) v0.5.1 by Matt Estela (MIT) ([User machines](https://trigcondition.github.io/sidecar-expander/using/user-machines/#new-in-040-sophie)).

On the Pi:

- **OS updates for the Rytm through the Pi's USB-C MIDI port,** *in testing*. A setting, off by default (`usbmidi=os:on` in `cmdline.txt` or on the serial console; the web page's `/cmd` refuses it on purpose), lets Elektron Transfer or elkflash on a computer at the Pi's USB-C port send the Rytm an OS update through the Sidecar, so the Rytm does not need to be unplugged from the Pi. With it off, OS update messages are blocked as before. An interrupted upgrade is aborted rather than finished with a hole ([OS updates through the Sidecar](https://trigcondition.github.io/sidecar-expander/using/usb-audio-midi/#os-updates-through-the-sidecar)). From work by [Iced-Cream](https://github.com/Iced-Cream).
- **Tonverk `.elmulti` instruments in MULTISAMPLE,** beside `.sfz`. The format is not publicly documented, so the conventions we read it by are unverified ([MULTISAMPLE](https://trigcondition.github.io/sidecar-expander/using/poly-machines/#multisample)).
- **Samples load on first play.** Nothing is loaded whole when a project opens, so projects open faster; a sample comes in when a voice selects it or, for MULTISAMPLE, after its first note ([The pool RAM](https://trigcondition.github.io/sidecar-expander/using/pools/#the-pool-ram)).
- **A 1280x720 touchscreen layout,** the default on the Pi 5's Touch Display 2; `res=` in `/.rytm/display.txt` picks another ([Screen sizes](https://trigcondition.github.io/sidecar-expander/using/display/#screen-sizes)).
- **The NEON pass:** the render loops' heaviest parts (the voices, WAVETABLE, CLOUDSEED and the send effects) now use the Pi's vector unit: less CPU per voice, so more headroom for heavy kits. On a Pi 4 at boot, against 0.3.1: DAISYSP 35 % less, WAVETABLE 10 %, JUNO 8 %, PLAITS 6 %, 6-OP FM and GRANULAR 5 %; over a minute's play the render cores 3 to 6 % less, with no underruns.
- **Idle sleep on all four cores:** a cooler Pi; `/status` shows it as "idle" ([Keeping it cool](https://trigcondition.github.io/sidecar-expander/using/troubleshooting/#keeping-it-cool)).
- **Computer audio and MIDI over the Pi 5's USB-C,** in testing: on by default, `gadget=0` turns it off. A Pi 5 needs a USB-C power and data splitter or a header-pin supply for it ([USB audio and MIDI](https://trigcondition.github.io/sidecar-expander/using/usb-audio-midi/#powering-a-pi-5-with-a-computer-attached)).

On a new box:

- **Analog Four MKII support.** The Sidecar's machines on the A4's tracks, through each voice's own analog filters, overdrive, amp and FX, with chords on any track, locks and LFOs on the machine's knobs, and the Sidecar's pages on the A4's screen with UP + YES. A4 mod build SA12 or later on OS 1.56, on a Pi 5 or a Pi 4. Everything, including what has run where and the limits: [Analog Four MKII](https://trigcondition.github.io/sidecar-expander/using/analog-four/). What may come next: [Analog Four roadmap](https://trigcondition.github.io/sidecar-expander/using/analog-four-roadmap/).
- **The box's name on the touchscreen.** With an A4 it says A4 CONNECTED or NO A4 and names its voices T1..T4 (splash, HOME, STATUS, REC, SCOPE, INSERT FX, VOICE, Sound), and the web page's Record tab lists T1..T4.

### Fixed in 0.4.0

The Rytm firmware:

- **The Sidecar's view on the SRC page no longer gets stuck after a BANK tap.** Tapping a BANK key while the Sidecar's view was on the SRC page left the view away until a Rytm restart. It now comes back after the bank menu, and after CLEAR / UNDO CLEAR.
- **A drawing race that could make the animated SRC pages flicker is fixed.** With a DSP SAMPLE or WAVETABLE track playing, the Rytm could draw stock's screen and the Sidecar's page at the same time, so stock's screen could show through between frames of the Sidecar's page. That race is closed. The flicker was rare and has not been reproduced on demand, so this fix is still being watched on a real Rytm.

The Pi:

- **NVMe probe opt-in: `nvme=1`.** On a Pi 5 the search for an NVMe SSD at boot could drop a Rytm that was already attached ([issue 11](https://github.com/trigcondition/sidecar-firmware/issues/11)). The Pi now looks for an SSD only with `nvme=1` in `cmdline.txt`.
- **A box that comes up at full speed is re-enumerated.** Overbridge audio needs USB high speed. A Rytm or A4 found at full speed used to fail ("cannot submit the first URBs") until a replug; now the Pi resets its port and tries again, up to three times. Behind an external hub there is no retry, and the log says to replug.
- **Pi 5 in 3 A mode: a note, not a warning.** With some 27 W adapters the Pi 5 reports 3 A mode. That only limits bus-powered USB devices to 600 mA; the Rytm and the A4 have their own supply. The warning is now for under-voltage only; 3 A mode alone is a note on the Power tile, in `/status` and in the log.
- **The box's name and voice names on the touchscreen,** not always the Rytm's (above).
- **Picking or clearing a sample on DSP SAMPLE no longer gives a dropout** (0.3.2's known issue). DSP SAMPLE's card reads, like the user-machine scan and the JUNO / FM lists, now run on the core that owns the card, not on the control core.
- **The host link is found by the USB product, not the vendor name,** so another Elektron box is never taken for the Rytm.

### Known issues in 0.4.0

- **An A4's screen froze once on a unit** and has not come back in ten tries to repeat it: the A4's sequencer and audio kept running, its UI stopped. If it happens, power-cycle the A4 and [report it](https://trigcondition.github.io/sidecar-expander/using/troubleshooting/#reporting) with the Sidecar's log.
- **Pi 5 computer audio over USB-C is in testing.** Please report whether your computer sees Sidecar | Expander and how it sounds.
- **The full-speed retry has not been needed on hardware yet:** every Rytm and A4 connection in our tests came up at high speed. If a box comes up at full speed and stays silent, replug it and send us the log.
- **Touch after a warm restart** may still not come back on some setups (0.3.2's known issue; a power cycle brings it back).
- **On the A4:** the limits on its page, among them the LFO destination lists keeping stock's names ([Limits](https://trigcondition.github.io/sidecar-expander/using/analog-four/#limits)).

## Sidecar 0.3.2

**It adds super basic native support for Digitakt and a starting point for other devices.** A Pi-only release: it goes with the **Rytm firmware 0.3.1**, so no Rytm flash is needed and nothing changes for Rytm users. Sidecar Mini stays at 0.1.0.

| Part | File |
|---|---|
| Rytm firmware | no change: the [Rytm firmware 0.3.1](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.3.1), build `rel0-3-1` in the browser patcher ([Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)) |
| Sidecar (Raspberry Pi 4B and Pi 5, one card) | `sidecar-pi-sd-77fd0ad-800x480.zip` for **800x480** displays (and DSI or no display), `sidecar-pi-sd-77fd0ad-1024x600.zip` for **1024x600** HDMI displays, each with its `.sha256`; `BUILD-INFO-pi.txt` names the commit and both kernels ([Install](https://trigcondition.github.io/sidecar-expander/getting-started/install-pi/)) |
| User machines (Pi) | `sidecar-pi-plugins-0.3.2.zip`: the same machines as 0.3.1 |
| Starter content | `sidecar-content-0.3.2.zip`: the same patches as 0.3.1 (also on the card) |
| Checksums | `SHA256SUMS` on the release page |

Downloads: the [sidecar-firmware 0.3.2 release](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.3.2) (the Pi).

### Upgrading from 0.3.1

Copy the new card files over the old ones (your samples, recordings, `/Plugins/` and `/.rytm/` stay). The Rytm keeps its firmware 0.3.1.

From 0.3.0, flash the Rytm firmware 0.3.1 first ([Upgrading from 0.3.0](#upgrading-from-030)). From 0.2.0, follow [Upgrading from 0.2.0](#upgrading-from-020) below with the 0.3.2 card and the Rytm firmware 0.3.1.

### New in 0.3.2

- **Digitakt support, experimental.** A Digitakt mk1 with a mod plays Sidecar machines on its 8 tracks, one stereo mix comes back on its main output, and its FILTER and AMP pages control the Sidecar's. **This has run in an emulator only, never on a real Digitakt.** The steps are in [Digitakt (experimental)](https://trigcondition.github.io/sidecar-expander/developers/digitakt/). The mod is in the separate repository [trigcondition/sidecar-digitakt](https://github.com/trigcondition/sidecar-digitakt), with its own steps and risks, and the emulator is public: [analog-emu](https://github.com/trigcondition/analog-emu). Its state stays in `/.digitakt` on the card, apart from a Rytm's `/.rytm`.
- **Pi 5: Touch Display 2.** The 7" is tested; 5" support is added but untested here. It is rotated 270 by default (`dsi_rotate=90` for the other way up), with the 1024x600 UI centred. Thanks to [bandersong](https://github.com/bandersong) for the Touch Display 2 work ([sidecar-firmware PR #4](https://github.com/trigcondition/sidecar-firmware/pull/4)).
- **Device profiles.** A starting point for other devices: what the Sidecar assumes about the box it serves is now in one profile. For developers: [docs/device-profiles.md](https://github.com/trigcondition/sidecar-firmware/blob/v0.3.2/docs/device-profiles.md). This is a place to plug a port into, not official support for other boxes.

### Fixed in 0.3.2

- **Pi 5 with a Rytm: the Pi could stop at the first USB MIDI message to the Rytm.** A stack overflow: the engine's main object took up nearly all of the 128 KB stack, and a USB send ran out of room. That object now lives on the heap. A Pi 5 with a Rytm on 0.3.0 or 0.3.1 was likely affected: the released 0.3.1 Pi 5 image has that object on the stack at the same size, but it was not run with a Rytm to see it stop.
- **What was tested:** on 2026-11-01 this 0.3.2 Pi 5 kernel ran with a real Rytm and a Touch Display 2 7": voices, touch, 0 underruns. The Pi 4 ran the previous 0.3.2 commit for 45 minutes with the Rytm.
- **Card reads off the control core for the sample overview.** These reads held up the control core; they now run on the core that owns the card.

### Known issues in 0.3.2

- **Picking or clearing a sample on DSP SAMPLE can still give a dropout.** The stream's refill took up to 10 ms on the Pi 4 at our check. It is fixed in 0.4.0.
- **Touch after a warm restart** may not come back on some setups (a power cycle brings it back; the web page still works). Untested on the 7".
- **Going back from a later 0.4.0 card:** FM lists read clean, but an edit on 0.3.2 drops 0.4.0's voice data.
- **Digitakt:** the voices never pass through the Digitakt's filters, FX or track levels, a track's mute stops its trigs but not a tail, and the level may be low. See [What works now](https://trigcondition.github.io/sidecar-expander/introduction/what-works-now/#new-in-032).
- Everything in [Known issues in 0.3.1](#known-issues-in-031) still applies.

## Sidecar 0.3.1

**A fix release for 0.3.0.** It goes with the **Rytm firmware 0.3.1**. Sidecar (Pi) only: Sidecar Mini stays at 0.1.0.

| Part | File |
|---|---|
| Rytm firmware | `core-0.1.elemod` + `rytm-sidecar-0.3.1.elemod` (elekloader, OS 1.73, GPL-2.0-or-later), or build `rel0-3-1` in the browser patcher. Both give one `.syx` with SHA-256 `a203db27201aabbdaa285ccb7c40a168075206c0ce91477671fcfae729c3df3c` ([Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)). Never share the built `.syx`: it holds Elektron's firmware |
| Sidecar (Raspberry Pi 4B and Pi 5, one card) | `sidecar-pi-sd-82566ee-800x480.zip` for **800x480** displays (and DSI or no display), `sidecar-pi-sd-82566ee-1024x600.zip` for **1024x600** HDMI displays, each with its `.sha256`; `BUILD-INFO-pi.txt` names the commit and both kernels ([Install](https://trigcondition.github.io/sidecar-expander/getting-started/install-pi/)) |
| User machines (Pi) | `sidecar-pi-plugins-0.3.1.zip`: the same machines as 0.3.0 |
| Starter content | `sidecar-content-0.3.1.zip`: the same patches as 0.3.0 (also on the card) |
| Checksums | `SHA256SUMS` on each release page |

Downloads: the [sidecar-firmware 0.3.1 release](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.3.1) (the Pi) and the [sidecar-mods 0.3.1 release](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.3.1) (the Rytm firmware).

### Upgrading from 0.3.0

1. Back up your Rytm projects with Transfer.
2. Build and flash the Rytm firmware 0.3.1 ([Patch and flash](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)).
3. Copy the new card files over the old ones (your samples, recordings, `/Plugins/` and `/.rytm/` stay).

From 0.2.0, follow [Upgrading from 0.2.0](#upgrading-from-020) below with the 0.3.1 files.

### Fixed in 0.3.1

- **Dropouts when loading user machines, presets and multisamples.** This card work ran on the control core, which then missed its deadlines. It now runs on the core that owns the card. Switching kits, machines and multisamples no longer drops out.
- **Send FX after a kit switch.** After a pattern on another kit, a track kept the old kit's send FX values until its next trig, and a track with no trigs kept them for good. Each track now follows the new kit at once. This fix is in the Rytm firmware.
- **The black box.** The Pi now writes its whole log to the card, `/.rytm/blackbox.log`, so the last seconds before a crash or a dropped Rytm link are still there afterwards. Please send it when you report a crash ([The black box](https://trigcondition.github.io/sidecar-expander/using/troubleshooting/#the-black-box)). Paired clients can read it with `GET /blackbox`.

### Known issues in 0.3.1

- **Uploading plugins or a rescan while playing can still cause short dropouts.** The scan of `/Plugins` still runs on the control core. Do it while the sequencer is stopped.
- Everything in [Known issues in 0.3.0](#known-issues-in-030) still applies.

## Sidecar 0.3.0

**Sidecar 0.3.0 is an early-tester release.** It brings many new base features at once: poly tracks with the Sidecar's own sequencer, new machines, projects kept by the Rytm's slot, pools, bundles, inserts, a sampler, a song recorder, a pairing code for the web page and more. Most of it is tested in the emulator and on the Mac; a part of it has run on a real Rytm with a Pi 4 (see [What works now](https://trigcondition.github.io/sidecar-expander/introduction/what-works-now/#new-in-030)). **Your feedback is what we need most**: what works, what does not, what feels clumsy ([how to report](#how-to-report)).

It needs the **Rytm firmware 0.3.0**, made in the browser patcher (or with elekloader) from your own stock OS 1.73 file. **Your Rytm may run OS 1.74:** the patched file is a whole OS (1.73 plus the Sidecar mods), so sending it replaces 1.74 - no separate downgrade. You only need Elektron's stock OS 1.73 file as the input (from Elektron's download page). Your projects carry over: 1.74 only added Outbox support and did not change the project format. Sidecar (Pi) only: **Sidecar Mini (Teensy 4.1) stays at 0.1.0** with its own Rytm build.

| Part | File |
|---|---|
| Rytm firmware | `core-0.1.elemod` + `rytm-sidecar-0.3.0.elemod` (elekloader, OS 1.73, GPL-2.0-or-later). Build the `.syx` from your stock OS 1.73 file on the elekloader page with the version set to 1.73; the result's SHA-256 is `893ed9a5fc27ab18687c1ea95d7a07f4ff4b23fde235173ce332e54055a733ab` ([Patch and flash the Rytm](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)). Never share the built `.syx`: it holds Elektron's firmware |
| Sidecar (Raspberry Pi 4B and Pi 5, one card) | two SD card zips: `sidecar-pi-sd-a5733aa-800x480.zip` for **800x480** displays (and DSI or no display), `sidecar-pi-sd-a5733aa-1024x600.zip` for **1024x600** HDMI displays such as the GeeekPi 7" (EP-0194), each with its `.sha256`; `BUILD-INFO-pi.txt` names the commit and both kernels. Copy one zip's contents to a FAT32 card; it boots the Pi 4B and the Pi 5 ([Install](https://trigcondition.github.io/sidecar-expander/getting-started/install-pi/)) |
| User machines (Pi) | `sidecar-pi-plugins-0.3.0.zip`: the six starters (ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN) and, new, NUSAW, VOX, HUSH1, RAFFO and MD as `.a64.rmp` |
| Starter content | `sidecar-content-0.3.0.zip`: the same patches as 0.2.0 (also on the card) |
| Checksums | `SHA256SUMS` on each release page |

Downloads: the Sidecar (Pi) files on the [sidecar-firmware 0.3.0 release](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.3.0), the Rytm firmware (the two `.elemod` files with `SHA256SUMS`, `LICENSE`, `NOTICE`, `TOOLCHAIN.txt` and elekloader's source) on the [sidecar-mods 0.3.0 release](https://github.com/trigcondition/sidecar-mods/releases/tag/v0.3.0). 0.1.0 and 0.2.0 stay on the [sidecar-expander releases](https://github.com/trigcondition/sidecar-expander/releases).

### Upgrading from 0.2.0

1. Back up your Rytm projects with Transfer.
2. Build and flash the Rytm firmware 0.3.0 ([Patch and flash](https://trigcondition.github.io/sidecar-expander/getting-started/patch-and-flash/)).
3. Copy the new card files over the old ones (your samples, recordings, `/Plugins/` and `/.rytm/` stay).
4. Start both. At the first start the Sidecar moves your projects' files to their Rytm slots by itself; where two projects share a name it asks once, when you open one.
5. Open `http://sidecar.local` and pair your browser with the 8-digit code on the Rytm (SIDECAR MENU > WEB UI) or the touchscreen ([Pairing a browser](https://trigcondition.github.io/sidecar-expander/using/web-ui/#pairing-a-browser)).

### New in 0.3.0

**Sequencer and machines**
- **Poly tracks on every Sidecar machine** ([Poly mode](https://trigcondition.github.io/sidecar-expander/using/sequencer/)): chords, up to 8 pages, trig conditions, p-locks, step preview, copy / paste, per pattern; **POLY CONFIG** in the Rytm's track menu; seeded randomness; the top 8 sequencer pages (direction, speed, scale and key, random notes, ratchets and arps, slides, the FX column).
- **NOTE EDIT:** turn DATA to walk the notes, A..E edit the one in focus, which always stays in view; select, delete, undo. TURN OFF closes the poly page at once; making the track poly again asks **RESTORE n NOTES?**
- **The poly SEQ page's keys:** UP / DOWN are the Rytm's (the CHRO pads' range: 4 semitones a press, C2..B5), **FUNC + DOWN** opens the track menu, **FUNC then YES** is UNDO, YES + PLAY / YES + SCENE quick saves reach the Rytm. The poly SEQ, UP + FX, UP + AMP and UP + LFO pages replace the Rytm's page. The Rytm-screen keyboards name each octave's C.
- **Poly machines** MULTISAMPLE, WAVETABLE, GRANULAR ([Poly machines](https://trigcondition.github.io/sidecar-expander/using/poly-machines/)); very short MULTISAMPLE trigs always sound.
- **MD built in**, in DIGIDRUM's place: DIGIDRUM is gone, and its tracks play MD. From the Rytm, 11 drum types on knob 1 until a later Rytm firmware brings MD's own page with all 30; the MD user machine in a U slot already shows the full page ([MD](https://trigcondition.github.io/sidecar-expander/using/machines/#md)).
- **CHOP**, a new machine: one sample cut into up to 64 slices (GRID, TRANSIENT, LAZY tapping, by hand), played from the trigs, the CHRO pads and poly tracks, with a slice editor on the Rytm and the touchscreen ([CHOP](https://trigcondition.github.io/sidecar-expander/using/chop/)).
- **Four new user machines:** NUSAW (supersaw), VOX (a singing vocal tract), HUSH1 (SH-101-style mono) and RAFFO (four oscillators into a ladder filter), in the plugins zip ([User machines](/sidecar-expander/using/user-machines/)).
- **DSP SAMPLE** picks its sample with SMP (knob D of its SMPL page); FUNC + YES on its SRC page opens the browser.

**Projects, kits and files**
- **Projects belong to the Rytm's slot**, not its name: a one-time move; SAVE AS, SAVE TO and copy / paste take the Sidecar files along; CLEAR and DELETE put them in the **project trash** (restore on the web page and the touchscreen; 64 entries, the oldest dropped) ([Projects and bundles](https://trigcondition.github.io/sidecar-expander/using/projects-bundles/)).
- **Bundles:** export to the card (`/Bundles`), import into a chosen slot ("to slot" on the web page; replace moves the old files to the trash), import from a USB stick, Delete for a bundle or an unfinished `.part`. A bundle holds only the Sidecar's side: put the Rytm project into the slot yourself.
- **Kits follow the Rytm's SAVE KIT / RELOAD KIT** (YES + KIT / NO + KIT, the KIT menu): the Sidecar's LFO and INSERT settings per kit. GRANULAR's picks are kept per project.
- **NO + KIT / PATTERN reload** works on the Sidecar pages too; NO alone still goes back (it acts when you let go).
- **Pools and the sample library**, **storage** (USB drives FAT32 / MBR in a blue port, NVMe on the Pi 5), the **RAM store** (no card access on kit and pattern changes, safe in a power cut).

**Sound, recording, screens**
- **SPACE**, a new send effect: a Space Echo-style tape echo with three heads, REPEAT into tape saturation (dub throws), wow and flutter, a spring reverb and tempo sync ([SPACE](https://trigcondition.github.io/sidecar-expander/using/send-effects/#space-pi)).
- **AMP**, a new insert effect: Neural Amp Modeler amp and pedal captures on a voice. Put your own A2-Lite `.nam` / `.namb` files (for example TONE3000's A2 downloads) in the card's `/NAM/` folder; up to 6 play at once ([AMP](https://trigcondition.github.io/sidecar-expander/using/insert-fx/#amp-amp-captures-nam)).
- **Insert FX, FX buses and the OUT route** (stereo to the Rytm's main mix); the **sampler** and **auto-sampler**; the **song recorder** with UNDO REPLAY.
- **The recorder:** take names with the date, a big buffer, a speed warning before a take that may be too much for the drive, recording to a USB stick ([Recorder](https://trigcondition.github.io/sidecar-expander/using/recorder/)). Samples stay on the SD card for now.
- **The touchscreen** in two themes and two sizes (optional), **UP as the Sidecar key**, the SIDECAR MENU, the KEYS page, the combo map; the touchscreen's SEQ grid behind every page.

**Security and reliability**
- **The pairing code, on by default** ([Pairing a browser](https://trigcondition.github.io/sidecar-expander/using/web-ui/#pairing-a-browser)): pair a browser once with the 8-digit code shown on the Rytm (SIDECAR MENU > WEB UI, the SIDECAR page with UP + T10, a popup when the Rytm connects while nothing is paired) or the touchscreen; **Show it on the Rytm** on the page; the WEB UI menu (WEB UI ON / OFF, CODE, PAIRED DEVICES, NEW CODE, FORGET DEVICES). `/status`, `/health` and the log stay open. Tools such as `sdboot.py` pair once with `SIDECAR_PAIR_CODE`.
- **Temperature:** the Pi lowers its clock to 600 MHz at 78 °C (`socmaxtemp=78`) and raises it again at 75 °C; between 78 and 80 °C a quiet `CLOCK LOWERED` on STATUS, from 80 °C a warning that says "clock lowered". A case fan helps a lot (measured: 72 °C to 56 °C) ([Keeping it cool](https://trigcondition.github.io/sidecar-expander/using/troubleshooting/#keeping-it-cool)).
- **Fewer underruns:** no card reads on the control core while samples load or on MD's per-step locks.
- **The crash note:** after an unexpected restart the Pi writes why to `/.rytm/prevboot.txt` on the card, for bug reports ([After an unexpected restart](https://trigcondition.github.io/sidecar-expander/using/troubleshooting/#after-an-unexpected-restart)). The Rytm firmware reports a stuck screen (the freeze probe) in the Sidecar's log.
- **Pi 5:** the same card boots the Pi 4B and the Pi 5; the Pi 5's HDMI picture is scaled.

**Not in 0.3.0:** REMOTE KEYS (a development build only); FREEZE (planned). The Rytm MIDI bridge is in, off by default, for development.

### Known issues in 0.3.0

- **The Rytm shows DIGIDRUM's page for MD**, with 11 drum types on knob 1. MD's own page (ENGINE, TYPE, all 30 types) comes with a later Rytm firmware. Meanwhile the MD user machine in a U slot shows the full page.
- **Export to a USB stick is off.** The end of a stick export hung the Pi in a test. Export to the card, then copy the bundle to the stick yourself. Import from a stick works.
- **The Sidecar's audio to the Rytm stayed silent after a Pi restart**, once (the Rytm's audio still reached the Pi). Restart the Rytm. A fix that notices and restarts it is planned.
- **The Rytm's screen froze twice** on an earlier release candidate, after bursts of key and pad presses (REMOTE KEYS, now left out, is the main suspect). The release firmware has a freeze probe: if the screen stops for over 2 seconds, the Sidecar's log says `FREEZE PROBE` and where. Please report it with the log.
- **Pi 5 HDMI:** the picture is scaled to 1920x1080, so it is slightly soft.
- **The pads reach C2..B5** in CHRO mode (UP / DOWN move them 4 semitones a press). For other notes use the NOTE knob, NOTE EDIT, a MIDI keyboard or the touchscreen. PAD OCT is planned.
- **DSP SAMPLE picks its sample differently** from WAVETABLE and MULTISAMPLE: knob D of its SMPL page, not knob A of SRC. A later version may line them up.
- **The pairing code's popup on the Rytm** may stay up after a key press on the Rytm's own screen; it ends by itself after 30 seconds.
- Everything from the 0.2.0 and 0.1.0 known issues that is not fixed still applies: see [Troubleshooting and known issues](https://trigcondition.github.io/sidecar-expander/using/troubleshooting/).

### How to report

Use the **Tester report** form under [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose). Name the Rytm firmware (0.3.1) and the Sidecar build (`BUILD-INFO-pi.txt`), and add:

- **the steps:** what you pressed, in order, what you expected and what happened; whether it happens again;
- **`/status`:** save `http://sidecar.local/status` right after the problem (open without pairing);
- **the log:** `http://sidecar.local/log`, saved soon after (it holds the last half minute or so);
- **after a restart by itself:** `/.rytm/prevboot.txt` from the card.
- **after a crash or a dropped Rytm link:** `/.rytm/blackbox.log` from the card ([The black box](https://trigcondition.github.io/sidecar-expander/using/troubleshooting/#the-black-box)).

See [Troubleshooting](https://trigcondition.github.io/sidecar-expander/using/troubleshooting/#reporting).

## Sidecar 0.2.0

**Sidecar 0.2.0**: one SD card for the **Raspberry Pi 4B and the Raspberry Pi 5**, the Pi 5's HDMI display, DSI auto-detect, a faster web page over Wi-Fi and a power warning. It needs the same Rytm build as 0.1.0: **rui1027d** (or sfx1021 without the remote pages). A MINOR step (semantic versioning): new boards and features, nothing removed.

**Sidecar Mini (Teensy 4.1) stays at 0.1.0.** 0.2.0 has no Teensy build: Sidecar Mini users keep (or download) `sidecar-teensy41-454d38b2.hex` and `sidecar-mini-plugins-0.1.0.zip` from the [0.1.0 release](https://github.com/trigcondition/sidecar-expander/releases/tag/v0.1.0). The Mini works with the same Rytm build.

| Part | File |
|---|---|
| Sidecar (Raspberry Pi 4B and Pi 5, one card) | `sidecar-pi-sd-f4b85f8.zip`: copy its contents to a FAT32 card; the same card boots both boards. `BUILD-INFO-pi.txt` names the commit and both kernels |
| Starter user machines (Pi) | `sidecar-pi-plugins-0.2.0.zip`: ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN as `.a64.rmp` (MIT), the same files as 0.1.0; they load on the Pi 4B and the Pi 5 |
| Starter content | `sidecar-content-0.2.0.zip`: `/JUNO/Factory/` and `/DX7/`, the same patches as 0.1.0 (also on the card) |
| Checksums | `SHA256SUMS` |
| Sidecar Mini (Teensy 4.1) | unchanged: the 0.1.0 release's `sidecar-teensy41-454d38b2.hex` |
| Rytm mods | unchanged: `rui1027d` / `sfx1021`, patched from your own stock OS 1.73 file (PATCHER.md) |

### New in 0.2.0

- **One card for the Pi 4B and the Pi 5** (in testing): `config.txt` has a `[pi4]` and a `[pi5]` section and each board reads only its own boot files (Pi 4: `sdboot.img` and `engine.img` as in 0.1.0; Pi 5: `kernel_2712.img`). The Pi 4 boots with exactly the 0.1.0 settings. The Pi 5 build itself is tested on hardware; the shared card is being tested on both boards now.
- **Raspberry Pi 5** (tested on hardware) (2026-10-19): the Rytm over USB (replug included), the voices and send effects, the remote pages, `sidecar.local` over Ethernet and Wi-Fi. The Pi 5 is a **standalone** Sidecar for now: its USB-C port is power only (no USB audio or MIDI to the computer).
- **Pi 5 HDMI display** (tested on hardware): the 800x480 UI scaled to the Pi 5 firmware's 1920x1080 picture, with USB touch. `hdmi_force_hotplug=1` (on the card) is needed; connect the display to micro-HDMI 0 before power-on. The picture is slightly soft (scaled).
- **DSI displays found by themselves** (in testing): the official 7" display v1 and compatibles, on the Pi 4 through the firmware (as in 0.1.0) and on the Pi 5 driven by the engine (CAM/DISP 0 or 1, no `config.txt` line). With no DSI panel answering, the Sidecar uses HDMI. Not yet run on hardware.
- **The web page over Wi-Fi** (in testing): the page is sent compressed (121 KB to 39 KB), a stalled connection is dropped after 3 s (was 5 s), the page sends at most 2 requests at once and retries a "503 busy". `/status` and the log count the connections.
- **Power warning** (in testing): the Pi reads its supply's state (under-voltage, throttling; on the Pi 5 also the USB-PD current) at boot, on a change and once a minute: in the log, on the web page's **Power** tile with a warning, and in red on the display's bottom line. The warning names the board's official supply: on a Pi 4 "use the official 15 W (5.1 V 3 A) supply" (display `POWER TOO WEAK: use 15 W supply`), on a Pi 5 "use the 27 W (5 V 5 A) adapter directly" (`POWER TOO WEAK: use 27 W adapter`).
- **Wi-Fi firmware for both boards** on the card (`/firmware/`, the same Raspberry Pi files under each board's names, with the Cypress licence). Still no Wi-Fi settings on the card: Wi-Fi is off until you set it up.

### Hardware: Pi 4B or Pi 5

| | Raspberry Pi 4B | Raspberry Pi 5 |
|---|---|---|
| Use | **with a computer**: also the Sidecar's USB-C audio and MIDI interface | **standalone**: no USB audio or MIDI to the computer yet |
| Supply | official 5.1 V 3 A USB-C | official **27 W** USB-C, plugged in directly (not through a hub) |
| HDMI display | 800x480, sharp | the UI scaled to 1920x1080: works, slightly soft |
| DSI display | expected (firmware), being confirmed | in testing |
| Wi-Fi | works | works (tested) |
| Kernel update | card swap (or `sdboot.py` with `sdport` on) | card swap only |

### Known issues in 0.2.0

- **Pi 5: no USB audio or MIDI to the computer.** Its USB-C gadget is left out of this build: even Raspberry Pi OS's own USB gadget did not connect on our Pi 5 powered from a computer. Use a Pi 4B for computer audio.
- **Pi 5: use the official 27 W supply directly.** Fed from a hub port the Pi 5 ran in reduced-power mode, and Wi-Fi and the web page became slow (pages of 5 s, "503 busy"). The power warning says so when it sees it.
- **Pi 5 HDMI**: the firmware always sets 1920x1080, so the 800x480 UI is scaled (slightly soft). The `framebuffer_width`, `framebuffer_height` and `hdmi_*` mode lines under `[pi5]` do nothing on the Pi 5 and are harmless; only `hdmi_force_hotplug=1` matters.
- **Pi 5 DSI** has not been run on hardware yet; Touch Display 2 is not supported on either board.
- **Pi 5 updates** are by card swap only (no network update on the Pi 5 yet). If a Pi 5 shows its boot diagnostics screen, update its bootloader with Raspberry Pi Imager.

Everything from the 0.1.0 known issues still applies: see KNOWN-ISSUES.md.

## Sidecar 0.1.0

**Sidecar 0.1.0**, the first public tester release of Sidecar | Expander. It needs the Rytm build **rui1027d** (or sfx1021 without the remote pages). Version numbers follow semantic versioning from now on: see [Versioning](#versioning).

Tester release of Sidecar | Expander. Sidecar Mini (Teensy 4.1) and the Rytm mods: Monday 2026-10-19. Sidecar (Raspberry Pi 4B) SD card package: Tuesday 2026-10-20.

| Part | Build |
|---|---|
| Rytm mods | `rui1027d` (default: the mods plus the remote pages, the connect screen and the FX return on IN L/R, for Sidecar Mini and Sidecar), `sfx1021` (the mods without the remote pages). Patch your own stock OS 1.73 file: see PATCHER.md |
| Sidecar Mini (Teensy 4.1) | `sidecar-teensy41-<commit>.hex`, the USB-host build of the test line (sidecar-1023); `BUILD-INFO-teensy.txt` names the commit |
| Sidecar (Raspberry Pi 4B) | `sidecar-pi4-sd-<commit>.zip`, the SD card file set of the test line; `BUILD-INFO-pi.txt` names the commit and the kernel |
| Starter content | `sidecar-content-0.1.0.zip`: `/JUNO/Factory/` (128 Juno-106 factory patches) and `/DX7/` (three 32-voice banks) for the card's root, with README and NOTICE (MIT sources: AMY, Mutable Instruments Plaits); also inside the Pi's SD package |
| Starter user machines | ACID, WAVEPAD, METAL, SNARE, PLUCK, GRAIN: `.rmp` for the Teensy, `.a64.rmp` for the Pi (MIT) |

> The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. The remote pages were tested on a real Rytm with the Pi and the Teensy on 2026-10-18. On OS 1.74, first flash the stock OS 1.73 `.syx` with Transfer, then patch it. Keep the stock OS file at hand to go back; where things are stored: the send FX settings and the Sidecar machine choices are in the Rytm's kit; the Sidecar's per-project and per-kit files (slot lists, sample pool, JUNO / FM lists, LFOs) are on the Sidecar's card. Back on the stock OS your projects still load: the send FX values are ignored and tracks on Sidecar machines show them as missing.

### New in 0.1.0

Tested on hardware on 2026-10-19: the SRC view (`rui1027d`, also after a USB replug), machine pages only on the SRC page, the Pi's USB audio (no clicks at the stream's start, 5 minutes clean), JUNO presets and PAT.

Tested on hardware: the connect screen, SCOPE, the REC page and playback, HALO, the FX return on IN L/R, the Sidecar Mini's stereo USB audio and the Mini recorder. The rest of this list is being tested now (in testing).

- **LFOs** (in testing): 8 on the Pi, 4 on the Mini, global and routable to a voice's parameters (V1..V8) or the send FX's P2..P5 (FX1 / FX2); saved per kit; waves SINE, TRI, SAW+, SAW-, SQR, S&H, RND and **DESIGN** (16 steps, each HOLD, RAMP or SMTH, with presets); free or synced rates; retrig FREE / TRIG / PLAY. The **LFO page** on the Rytm opens with **TRK + LFO**; both web UIs have an LFO tab. The LFOs never touch the Rytm's own parameters (no MIDI CC).
- **SRC view** (`rui1027d`, tested on hardware, also after a USB replug): with it the machine pages leave the TRK + YES list (SIDECAR, SYSTEM, LFO, REC, SCOPE) and show here; on a track with a Sidecar machine (JUNO, 6-OP FM, PLAITS, DSP SAMPLE and GRAIN), the Rytm's own SRC page shows the Sidecar's machine page with its graphics, drawn from the Rytm's own values. Every key and knob stays the Rytm's (edits, p-locks, kits, saving); the bottom bar names the last knob turned. The machine list, popups, PERF and holding TRK or BANK show the stock screen.
- **Voice pages by track** (tested on hardware on the Pi): pages are named BD, SD, ... instead of V1..V8; meters and SCOPE sources in track order. Twelve tracks can choose a Sidecar machine and eight sound at once; RS/CP, MT/HT, CH/OH and CY/CB share a voice like the Rytm's own pairs.
- **JUNO / FM presets** (tested on hardware on the Pi): PAT steps through the project's list (up to 127, p-lockable), filled with LOAD TO PROJ or Save current; otherwise the factory list.
- **REC page channel picking** (Pi, in testing): the trig keys choose the recorded channels (T1..T8 tracks, T9 MAIN, T10 / T11 IN or FX L / R; blue recorded, orange not). Playback: B pushed plays, B turned picks the channel, C the take, D the level.
- **Remote pages** (in testing): NO on SIDECAR leaves; DSP SAMPLE's MOD is a stepped list again (ONE LOOP SLICE GRAIN STRCH PLUCK WAVE; GRAIN shows POS SIZ DNS); unused knobs of user machines as hatched boxes on the Rytm's own SRC page and SMPL page 2; JUNO / FM preset names appear at once; the machine pages follow the Rytm instantly; the Rytm reports its active kit (for the per-kit LFOs).
- **Sidecar Mini:** stereo USB audio to the computer (tested on hardware) with USB MIDI back (in testing); a slimmer memory layout; the recorder's 32 KB buffer is shared with USB audio, so USB audio pauses while the recorder is armed or records (without PSRAM). The 20 / 12 multichannel mode is not in this release (in development). Recording without PSRAM needs a fast SD card.
- **Sidecar (Pi):** DSI touchscreens (the official 7" display v1 and compatibles such as the OSOYOO 7" DSI V4.0: expected, being confirmed; Touch Display 2 is not supported), the Wi-Fi settings page, the IN L/R source switch, computer audio and MIDI.
- **Wi-Fi without a cable** (Pi, in testing): put `sidecar-wifi.txt` (`ssid=` and `psk=`, optional `band=2g|5g|any`, `open=1`) at the card root; the Pi imports it at the next boot, stores only the derived key, deletes the file, and falls back after 90 s if the network does not come up. Errors go to `sidecar-wifi-error.txt`. 2.4 GHz is the default band. The web page's Wi-Fi settings are the alternative. Never share the card while the file is on it.
- **Reconnect:** on every reconnect the voices are released and the FX tails cleared.
- **The version shows** on the SYSTEM page (`SYSTEM 0.1.0`), the Pi's display and web page, and the Mini's console.

### Versioning

From 0.1.0 on, Sidecar uses semantic versioning (`MAJOR.MINOR.PATCH`), one number for Sidecar and Sidecar Mini:
- **PATCH** (0.1.1): fixes only;
- **MINOR** (0.2.0): new features (and, before 1.0, anything that changes how a setup behaves);
- **1.0.0** comes after the testers' feedback.

The Rytm builds keep their own names (`rui1027d`). Each version's release notes name the Rytm build it needs: flash that one, not just the newest.

### Earlier in the 0.1.0 line

Tested on hardware on 2026-10-18 unless marked "in testing".

- **FX return on IN L/R** (`rui1027d`): the Rytm's delay + reverb return on the Overbridge IN L/R instead of its audio inputs (Sound tab: IN L/R source); the recorder names those files FX_L / FX_R and SCOPE shows the source FX. Never send those channels back into the Rytm through the computer.
- **Sidecar Mini computer audio:** stereo USB audio to the computer.
- **Voice pages follow a machine change at once** (`rui1027d`; in testing).
- **Connect screen** (`rui1027d`): when the Sidecar comes up, the Rytm shows CONNECTED, the voices and effects, and the Pi's address for 3 seconds. Transport and pads keep working under it.
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

### New in 1021

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

### From 1020 (fixes from the 1019 hardware test)

- **The machine list's arrows no longer assign.** Moving through the list could fill every user slot with the same machine (METAL in every slot). The Rytm no longer reports a slot while a preview is open, and a choice clears the old tag.
- The **6-OP FM** patch name no longer shows twice while scrolling.
- A Sidecar with no `/Samples` folder on its card no longer crashes when the Rytm loads a project.
- The Pi's send FX load figure on the console is right again (it read tens of percent for 1-2 %).

### From 1019

- **Stepped list knobs.** Knobs that pick from a list step one item a detent, like the Rytm's FILTER TYPE, with the item's name where the dial was: ENG of PLAITS, DIGIDRUM, DAISYSP and DSP SAMPLE, DAISYSP's INP and OUT, DSP SAMPLE's MOD, the PAT knobs of JUNO and 6-OP FM, user machine lists, and on the SEND FX pages TYPE, ROUTE (PRE / POST) and selectors such as STUTTER's ENG and LEN.
- **Slot fingerprints from the project.** A user slot finds its machine from the project's own sounds, also in a project made on another Sidecar.
- **Send effects CRUSH and RINGMOD**, on the Teensy and the Pi; the Teensy's CHORUS and COMB run block by block (about 4-5 % CPU).
- **Pi recorder:** multitrack recording to the SD card, a Record tab on `sidecar.local`, REC on the display, and per-effect FX1 / FX2 tracks.
- **Pi Wi-Fi** (in testing): joins a WPA2 network from the console. Off in the SD card package.
- The web page limits its connections so the engine never starves; the Teensy web console gained user machine tabs.

### Tested on hardware or in the emulator

Tested on a real Rytm MKII on 2026-10-18 (the test line): the connect screen, SCOPE and meters, the REC page and playback on the Pi, the status pages catching every knob, the key pass-through, the Mini recorder (stereo, fast card), HALO (heard; measured on the Teensy), the smaller NoisePlethora packages with their slot reasons, the web UIs' state buttons, the "Sidecar Mini" USB name, folder upload, the Pi's computer audio and MIDI, the FX return on IN L/R (SCOPE on the Mini), the Mini's stereo USB audio (heard in a DAW); the remote pages on the Pi and the Teensy.

Earlier (1017 to 1022 builds): all the voices heard; send FX on the Pi and the Teensy; the Pi recorder (5-minute take); user machines; the web page's tabs; the touch display; stepped list knobs, slot fingerprints in a shared project, the slot menu fixes, CRUSH and RINGMOD, a cold power cycle of the Pi, and the Rytm keeps running when the Sidecar goes away.

Still in testing: the LFOs (per kit), the PSRAM code space, the Wi-Fi settings page and `sidecar-wifi.txt` (implemented, not yet run on hardware), the waveform page and machine graphics, voice pages only for Sidecar machines, the PSRAM code space and stems on the Mini, the Pi's Wi-Fi settings page.

### Known limits in this release

- SRC view: a turn shows after about 50-100 ms; p-locks made while holding a trig are not shown (the view shows the sound's own value).
- GRAIN as a machine of its own in the Rytm's SRC list is not available yet (the list is full): use DSP SAMPLE's MOD. On a Mini without PSRAM, DSP SAMPLE streams from the card and plays once, so GRAIN needs PSRAM there.
- Sidecar Mini: multichannel USB audio comes later; USB audio pauses while the recorder runs (without PSRAM).
- Wait until the Sidecar has connected (the connect screen) before pressing PLAY: a freeze was seen once and not reproduced.
- Teensy: only one of the old large NoisePlethora packages fits in the 32 KB plugin code space at a time; the new smaller ones fit two or three.
- Recording on a Mini without PSRAM needs a fast SD card.
- REC page playback: picking another take with C while one plays can glitch once.

### Upgrading from the 1017 release

1. Patch your stock OS 1.73 file again with `rui1027d` (or `sfx1021`) and flash it.
2. Load the new Teensy `.hex`, or copy the new Pi card files over the old ones.
3. The Rytm builds need the matching Sidecar firmware for the new names, the remote pages and the connect screen; an older Sidecar shows numbers instead of the effects' names.

See KNOWN-ISSUES.md for what does not work yet.
