# Known issues

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

Sidecar 0.1.0 (Rytm builds `rui1027`, the default, and `sfx1021`). The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. Please report anything not listed here, using the Tester report form under Issues.

## Still in testing

Not yet reported from a real Rytm (emulator or simulator only):
- the DSP SAMPLE waveform page and the machine graphics (FM algorithm, JUNO envelope, GRAIN's cloud);
- voice pages only for tracks on a Sidecar machine (with `rui1027` at once on a machine change);
- the PSRAM plugin code space and recording stems on a Sidecar Mini with PSRAM (see below);
- the Wi-Fi settings page on the Pi (scan, connect and save, the 90 s fallback) and the Wi-Fi rejoin watchdog;

If something looks wrong, flash the stock `Analog-Rytm_MKII_OS1.73.syx` to go back; nothing new is stored in your projects.

## Rytm mods and remote pages

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
- **GRAIN** (DSP SAMPLE's MOD) needs PSRAM on the Mini; without it the voice is silent and shows `!RAM`.
- **Recording without PSRAM needs a fast SD card** (A1/A2, U3/V30). The Teensy's own buffer holds 57 ms of 24-bit stereo (85 ms at 16-bit); a slow card falls behind and the console says so. Record 16-bit, or use a faster card.
- **User machine space:** the 32 KB plugin code space fits only one of the old large NoisePlethora packages (NP VOICES, NP CLUST1, NP CLUST2) at a time; a second shows `!ROOM`. The new, smaller NoisePlethora packages (prime, fibo, phase, fm, pw, ring, noise, walk, atari; the same sounds) fit two at a time, some three. The Pi has no such limit.
- The REC page on the Mini records (stereo without PSRAM, stems with PSRAM) but has no playback or channel picking yet (those are the Pi's); the SYSTEM page has no network line (no network on the Mini).
- The large send effects (RINGS, CLOUDSEED, STUTTER) run only on the Sidecar (Pi). HALO runs on both.
- Computer audio: the Mini sends stereo USB audio to the computer (tested on hardware); the Sidecar (Pi 4B) does multi-channel audio and MIDI.

### Sidecar Mini with PSRAM

In testing: nothing of the PSRAM path has run on PSRAM hardware yet. With one or two APS6404L PSRAM chips (8 or 16 MB) on the Teensy, the Mini gets a second plugin code space (1 MB) and can record stems. If you have such a board, please:
1. Check the boot log for `plugins: PSRAM code arena ...`, and the console's **User machines** tab for a "Code arena (PSRAM)" bar.
2. Run `:psram` and `:psram bench <id>` on the console with an installed NoisePlethora package as the id (stop the transport first: the bench pauses audio for about a second).
3. Load a project with three or more NoisePlethora packages so one lands in PSRAM, play 8 voices for a minute, and report any `over budget`, `timed out` or `CRASHED` mutes and the underrun counters, with the outputs of step 2.

## Raspberry Pi 4B

- **The Rytm does not connect after many replugs** of the USB cable (the log says `Cannot set device address`): restart the Pi. A fix is planned.
- **Wi-Fi is off** in the SD card package. Use a direct Ethernet cable for `sidecar.local`, or set up Wi-Fi yourself as in INSTALL-PI.md.
- Ethernet has no DHCP client: the address is fixed (169.254.61.60), or set with `ip=` in `cmdline.txt`.
- The web page has no password.
- Only the Pi 4B is supported. The Pi 5, Pi 3 and Pi 400 are untested.
