# Known issues

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

Sidecar 0.4.0 (Raspberry Pi 4B and Pi 5; the Rytm firmware 0.4.0, built with elekloader on OS 1.74 or OS 1.73; the A4 mod 0.12 on an Analog Four MKII, OS 1.56; Sidecar Mini stays at 0.1.0). 0.4 is an early-tester line. Please report anything not listed here, using the Tester report form under Issues: the steps, a saved `http://sidecar.local/status` and `/log`, and after an unexpected restart `/.rytm/prevboot.txt` from the card.

## New in 0.4.0

- **An A4's screen froze once on a unit** and has not come back in ten tries to repeat it: the A4's sequencer and audio kept running, its UI stopped. If it happens, power-cycle the A4 and report it with the Sidecar's log.
- **Pi 5 computer audio over USB-C is in testing.** Please report whether your computer sees Sidecar | Expander and how it sounds.
- **The full-speed retry has not been needed on hardware yet:** every Rytm and A4 connection in our tests came up at high speed. If a box comes up at full speed and stays silent, replug it and send us the log.
- **Elektron offers only OS 1.74 now.** You can move between 1.73 and 1.74 in both directions with Elektron's stock files; recovery is the stock file of the OS you want to be on. To be able to go back to 1.73, keep your own copy of that file. Back up every project before any OS change.
- **Touch after a warm restart** may still not come back on some setups (0.3.2's issue below; a power cycle brings it back).
- **On the A4:** the limits on its page, among them the LFO destination lists keeping stock's names ([Limits](https://trigcondition.github.io/sidecar-expander/using/analog-four/#limits)).

## New in 0.3.2

- **Picking or clearing a sample on DSP SAMPLE can still give a dropout.** The stream's refill took up to 10 ms on the Pi 4 at our check. It is fixed in 0.4.0.
- **Pi 5 Touch Display 2:** touch after a warm restart may not come back on some setups (a power cycle brings it back; the web page still works). Untested on the 7". 5" support is added, untested here.
- **Going back from a later 0.4.0 card:** FM lists read clean, but an edit on 0.3.2 drops 0.4.0's voice data.
- **Pi 5 with a Rytm on 0.3.0 or 0.3.1:** likely affected by the stop at the first USB MIDI message, not verified. Use 0.3.2.
- **Digitakt support is experimental:** emulator only, never run on a real Digitakt. The mod is in the separate repository [trigcondition/sidecar-digitakt](https://github.com/trigcondition/sidecar-digitakt). The voices never pass through the Digitakt's filters, FX or track levels, a track's mute stops its trigs but not a tail, and the level may be low.

## New in 0.3.1

- **Uploading plugins or a rescan while playing can still cause short dropouts.** The scan of `/Plugins` still runs on the control core. Do it while the sequencer is stopped.

## New in 0.3.0

- **The Rytm shows DIGIDRUM's page for MD**, with 11 drum types on knob 1. MD's own page (ENGINE, TYPE, all 30 types) comes with a later Rytm firmware. Meanwhile the MD user machine in a U slot shows the full page.
- **Export to a USB stick is off.** The end of a stick export hung the Pi in a test. Export to the card, then copy the bundle to the stick yourself. Import from a stick works.
- **The Sidecar's audio to the Rytm stayed silent after a Pi restart**, once (the Rytm's audio still reached the Pi). Restart the Rytm. A fix that notices and restarts it is planned.
- **The Rytm's screen froze twice** on an earlier release candidate, after bursts of key and pad presses (REMOTE KEYS, now left out, is the main suspect). The release firmware has a freeze probe: if the screen stops for over 2 seconds, the Sidecar's log says `FREEZE PROBE` and where. Please report it with the log.
- **Pi 5 HDMI:** the picture is scaled to 1920x1080, so it is slightly soft.
- **The pads reach C2..B5** in CHRO mode (UP / DOWN move them 4 semitones a press). For other notes use the NOTE knob, NOTE EDIT, a MIDI keyboard or the touchscreen. PAD OCT is planned.
- **DSP SAMPLE picks its sample differently** from WAVETABLE and MULTISAMPLE: knob D of its SMPL page, not knob A of SRC. A later version may line them up.
- **The pairing code's popup on the Rytm** may stay up after a key press on the Rytm's own screen; it ends by itself after 30 seconds.
- The issues below, from 0.2.0 and 0.1.0, still apply unless fixed.

## Still in testing

Not yet reported from a real Rytm (emulator or simulator only):
- the DSP SAMPLE waveform page and the machine graphics (FM algorithm, JUNO envelope, GRAIN's cloud);
- voice pages only for tracks on a Sidecar machine (with `rui1027d` at once on a machine change);
- the PSRAM plugin code space and recording stems on a Sidecar Mini with PSRAM (see below);
- the Wi-Fi settings page on the Pi (scan, connect and save, the 90 s fallback) and the Wi-Fi rejoin watchdog;
- 0.2.0: the one card for the Pi 4B and the Pi 5, the Pi 5's DSI display, the web page's compression and request limits over Wi-Fi, the power warning;

If something looks wrong, flash the stock `Analog-Rytm_MKII_OS1.73.syx` to go back. Where things are stored: the send FX settings and the Sidecar machine choices are in the Rytm's kit; the Sidecar's per-project and per-kit files (slot lists, sample pool, JUNO / FM lists, LFOs) are on the Sidecar's card. Back on the stock OS your projects still load: the send FX values are ignored and tracks on Sidecar machines show them as missing.

## Rytm mods and remote pages

- **SRC view:** A turn shows on the view after about 50-100 ms; edits made while holding a trig (p-locks) are not shown on the view, which shows the sound's own value.
- **Wait for the Sidecar to connect before pressing PLAY** (the connect screen shows it). A freeze was seen once right after connecting and could not be reproduced.
- **GRAIN as its own machine** in the Rytm's SRC list is not available yet (the list is full): use DSP SAMPLE's MOD set to GRAIN.
- **REC page playback (Pi):** picking another take with C while one plays can glitch once. A fix is on the way.
- **The status pages catch every knob** (nothing happens underneath while you turn one). SCOPE and REC use their own encoders; voice pages catch their knobs. Keys that open stock screens (TRIG, SRC, SMPL, FLTR, AMP, LFO, FX, GLOBAL, YES, TRK and so on) do nothing on the Rytm while a page is open; PLAY, STOP, RECORD, the pads, mutes, FILL and tap tempo work.
- **An older Sidecar firmware** (before the key masks) makes the page catch every key and knob except PLAY, STOP and RECORD; an older Pi kernel opens the pages without text and shows no connect screen.
- **FX return on IN L/R:** never send those two channels back into the Rytm through your computer's audio: the effect would feed itself. The page warns while the switch is on.
- **OS 1.73 only.** There are no patch files for other OS versions. OS 1.74 will be supported after testing. On OS 1.74 (or any other version), first flash the stock OS 1.73 `.syx` with Transfer, as any OS update, then patch and flash it.
- The slot menu (FUNC + CHRO, YES on a U slot) can hold the screen for up to 2 seconds while it waits for the Sidecar; with no Sidecar it then shows **NO SIDECAR**.
- **User FX slots are not available yet.** The SEND FX TYPE list offers only the built-in effects.
- **P2..P5 show numbers instead of names** when the Sidecar's firmware is older than the Rytm build. Update the Sidecar.
- **The Rytm's sample browser can lag** while you scroll a large folder with the Sidecar connected. Report the folder size and whether the sequencer was running.

## Rytm (stock behaviour, not caused by the mods)

- After an OS upgrade the Rytm can hang on **"Success! Rebooting"**. Power cycle it: the update is complete.
- Once, right after plugging in, the Rytm sent no USB MIDI for about 50 seconds while its audio already streamed. If voices stay silent at first, wait a minute or replug the USB cable.

## USB ID

- The Pi's USB-C device port presents itself as `1209:0001`, a shared **test** ID from pid.codes, not a product ID of our own. Another test device may use the same ID, and a computer may remember a wrong name or driver for it. A proper ID comes before a final release.

## Sidecar Mini (Teensy 4.1)

- **The Rytm connects only after a reboot or many retries?** Solder the Teensy 4.1's USB host header (5 V, D-, D+, GND, shield). Press-fit or unsoldered pins make the host port flaky: the Rytm connects only after a reboot or after many retries (the link comes up at full speed and drops), and the Teensy's own USB to the computer can drop when the host port's power switches on. Use a short, good USB cable to the Rytm.
- **Multichannel USB audio** (20 in / 12 out) is not in this release; the Mini is a stereo interface. While the recorder is armed or records (without PSRAM), USB audio pauses (`USB OFF` on the REC page).
- **GRAIN** (DSP SAMPLE's MOD): GRAIN (and the other memory modes) needs PSRAM on the Mini; without PSRAM, DSP SAMPLE streams the sample from the card and plays it once, whatever MOD says.
- **Recording without PSRAM needs a fast SD card** (A1/A2, U3/V30). The release build's recorder buffer (32 KB, shared with USB audio) holds about 114 ms of 24-bit stereo (170 ms at 16-bit); a slow card falls behind and the console says so. Record 16-bit, or use a faster card.
- **User machine space:** the 32 KB plugin code space fits only one of the old large NoisePlethora packages (NP VOICES, NP CLUST1, NP CLUST2) at a time; a second shows `!ROOM`. The new, smaller NoisePlethora packages (prime, fibo, phase, fm, pw, ring, noise, walk, atari; the same sounds) fit two at a time, some three. The Pi has no such limit.
- The REC page on the Mini records (stereo without PSRAM, stems with PSRAM) but has no playback or channel picking yet (those are the Pi's); the SYSTEM page has no network line (no network on the Mini).
- The large send effects (RINGS, CLOUDSEED, STUTTER) run only on the Sidecar (Pi). HALO runs on both.
- Computer audio: the Mini sends stereo USB audio to the computer (tested on hardware); the Sidecar (Pi 4B) does multi-channel audio and MIDI.

### Sidecar Mini with PSRAM

In testing: nothing of the PSRAM path has run on PSRAM hardware yet. With one or two APS6404L PSRAM chips (8 or 16 MB) on the Teensy, the Mini gets a second plugin code space (1 MB) and can record stems. If you have such a board, please:
1. Check the boot log for `plugins: PSRAM code arena ...`, and the console's **User machines** tab for a "Code arena (PSRAM)" bar.
2. Run `:psram` and `:psram bench <id>` on the console with an installed NoisePlethora package as the id (stop the transport first: the bench pauses audio for about a second).
3. Load a project with three or more NoisePlethora packages so one lands in PSRAM, play 8 voices for a minute, and report any `over budget`, `timed out` or `CRASHED` mutes and the underrun counters, with the outputs of step 2.

## Raspberry Pi 4B and Pi 5

- **The Rytm does not connect after many replugs** of the USB cable (the log says `Cannot set device address`): restart the Pi. A fix is planned.
- **Wi-Fi is off** in the SD card package. Use a direct Ethernet cable for `sidecar.local`, or set up Wi-Fi yourself as in INSTALL-PI.md.
- Ethernet has no DHCP client: the address is fixed (169.254.61.60), or set with `ip=` in `cmdline.txt`.
- The web page needs a paired browser since 0.3.0 (the code on the Rytm: SIDECAR MENU > WEB UI). The connection is plain HTTP: use a direct cable or a network you trust.
- **Pi 5: USB audio and MIDI to the computer are in testing** (new in 0.4.0, on by default, `gadget=0` turns it off). The Pi 5's USB-C port is also its power input, and a computer cannot power a Pi 5: it needs a USB-C power and data splitter or a header-pin supply.
- **Pi 5: use the official 27 W supply, plugged in directly.** From a hub's port the Pi 5 ran in reduced-power mode, and Wi-Fi and the web page became slow (pages of 5 s, "503 busy"). The Sidecar warns: in the log, on the web page's Power tile and in red on the display (`POWER TOO WEAK: use 27 W adapter`). On a Pi 4 it names the Pi 4's own supply (`POWER TOO WEAK: use 15 W supply`).
- **Pi 5 HDMI picture is slightly soft:** the Pi 5's firmware always sends 1920x1080 and the 800x480 UI is scaled to it. Only `hdmi_force_hotplug=1` under `[pi5]` matters; the other `[pi5]` display lines do nothing on the Pi 5 and are harmless.
- **Pi 5 DSI display:** v1 displays in testing (built, not yet run on hardware); the Touch Display 2 7" is tested. With no DSI panel answering, the Sidecar uses HDMI.
- **Pi 5 updates:** by copying the new release over the card only (no network update on the Pi 5 yet). A Pi 5 that shows its boot diagnostics screen needs a bootloader update (Raspberry Pi Imager, "Misc utility images", "Bootloader").
- **One card for both boards** is in testing on the Pi 4B and the Pi 5 (the Pi 4 reads exactly the 0.1.0 settings; the Pi 5 build is tested on hardware).
- The Pi 3 and Pi 400 are untested.
