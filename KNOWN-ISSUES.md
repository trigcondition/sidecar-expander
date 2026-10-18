# Known issues

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

Tester release, the 1021 line (Rytm builds `rui1022`, the default, and `sfx1021`). The first version is based on Analog Rytm MKII OS 1.73. OS 1.74 will be supported after testing. Please report anything not listed here, using the Tester report form under Issues.

## Still in testing

Tested on hardware on 2026-10-18: the remote pages with the Pi and the Teensy, `rui1022`'s key handling with the Pi, Pi folder upload of large folders, unplugging and replugging the USB cable between Pi and Rytm, restarting the Rytm and the Pi, the restyled web page and display, Wi-Fi joining on the first boot; also stepped list knobs, slot fingerprints, the slot menu fixes, CRUSH and RINGMOD, a cold power cycle of the Pi, and the Rytm keeps running when the Sidecar goes away. Not yet reported from a real Rytm:
- new since the last test: the Wi-Fi rejoin watchdog.

If something looks wrong, flash the stock `Analog-Rytm_MKII_OS1.73.syx` to go back; nothing new is stored in your projects.

## Rytm mods

- **Remote pages and knobs:** on the SIDECAR and SYSTEM status pages no knob is caught, so turning one edits the stock parameter of the stock page underneath (you see it after leaving). Voice pages catch their knobs. Keys that open stock screens (TRIG, SRC, SMPL, FLTR, AMP, LFO, FX, GLOBAL, YES, TRK and so on) do nothing on the Rytm while a page is open.
- **rui1022 with an older Sidecar firmware** (before the key masks) catches every key and knob except PLAY, STOP and RECORD.
- **OS 1.73 only.** There are no patch files for other OS versions. OS 1.74 will be supported after testing. On OS 1.74 (or any other version), first flash the stock OS 1.73 `.syx` with Transfer, as any OS update, then patch and flash it.
- **The remote pages need a 1021 Sidecar:** the Pi with the 1021 kernel or the Teensy with the 1021 firmware. An older Pi kernel opens the pages without any text.
- The slot menu (FUNC + CHRO, YES on a U slot) can hold the screen for up to 2 seconds while it waits for the Sidecar; with no Sidecar it then shows **NO SIDECAR**.
- **User FX slots are not available yet.** The SEND FX TYPE list offers only the built-in effects.
- **P2..P5 show numbers instead of names** when the Sidecar's firmware is older than the Rytm build. Update the Sidecar.
- **The Rytm's sample browser can lag** while you scroll a large folder with the Sidecar connected. Report the folder size and whether the sequencer was running.

## Rytm (stock behaviour, not caused by the mods)

- After an OS upgrade the Rytm can hang on **"Success! Rebooting"**. Power cycle it: the update is complete.
- Once, right after plugging in, the Rytm sent no USB MIDI for about 50 seconds while its audio already streamed. If voices stay silent at first, wait a minute or replug the USB cable.

## USB ID

- The Pi's USB-C device port presents itself as `1209:0001`, a shared **test** ID from pid.codes, not a product ID of our own. Another test device may use the same ID, and a computer may remember a wrong name or driver for it. A proper ID comes before a final release.

## Teensy 4.1

- **User machine space:** the Teensy's 32 KB plugin code space fits only one of the large NoisePlethora packages (NP VOICES, NP CLUST1, NP CLUST2) at a time; a second shows `!` (no room). Use one per project (ATARI fits next to NP CLUST1). Smaller packages and a clearer reason on the Rytm are in progress. The Pi has no such limit.
- The Teensy's SYSTEM remote page has no recorder and no network line: the Teensy has neither.
- The large send effects (RINGS, CLOUDSEED, STUTTER) run only on the Raspberry Pi version.
- The web console's user machine and SD card tabs are in testing.
- Computer audio (USB audio to and from your computer, with MIDI) is in this release on the **Sidecar (Pi 4B)**, tested on hardware with multi-channel audio and MIDI. On the **Sidecar Mini (Teensy)** it is not part of this release yet.

## Raspberry Pi 4B

- **Wi-Fi is off** in the SD card package. Use a direct Ethernet cable for `sidecar.local`, or set up Wi-Fi yourself as in INSTALL-PI.md.
- Ethernet has no DHCP client: the address is fixed (169.254.61.60), or set with `ip=` in `cmdline.txt`.
- The web page has no password.
- Only the Pi 4B is supported. The Pi 5, Pi 3 and Pi 400 are untested.
