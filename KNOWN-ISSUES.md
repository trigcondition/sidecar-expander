# Known issues

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

Tester release, the 1021 line (Rytm builds `sfx1021` / `rui1021`). Please report anything not listed here, using the Tester report form under Issues.

## Not yet confirmed on hardware

- **The 1021 Rytm builds have not run on a real Rytm yet.** They pass our emulator tests, and the 1017 to 1020 builds they grow from were tested on hardware. If something looks wrong, flash the stock `Analog-Rytm_MKII_OS1.73.syx` to go back; nothing new is stored in your projects.
- Emulator or simulator only so far: the SIDECAR folder name and the NO SIDECAR popup, the remote UI in the Rytm's own font (`rui1021`), stepped list knobs, the CRUSH and RINGMOD effects, the Pi's sample pool and presets (not yet checked by ear), slot fingerprints in a project shared with another Sidecar, and a cold power cycle of the Pi straight into the engine on its SD card.
- Unplugging and replugging the Sidecar (or its power) while the Rytm plays: the Rytm should keep running, and the names and labels should come back.

## Rytm mods

- **OS 1.73 only.** There are no patch files for other OS versions. **OS 1.74 is not supported yet**; a port is planned. We have not tested going back from 1.74 to 1.73 and cannot promise that it works.
- **The remote UI (`rui1021`) needs the Raspberry Pi with the 1021 kernel.** An older Pi kernel opens the pages without any text. With the Teensy the remote UI is untested: use `sfx1021`.
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

- The large send effects (RINGS, CLOUDSEED, STUTTER) run only on the Raspberry Pi version.
- The Teensy firmware is built from the 1021 line, but its new parts were not retested on hardware (the remote UI was tested with the Pi only).
- The web console's user machine and SD card tabs are in testing.
- The computer-audio modes (USB audio to and from your computer) are not part of this release.

## Raspberry Pi 4B

- **Wi-Fi is off** in the SD card package. Use a direct Ethernet cable for `sidecar.local`, or set up Wi-Fi yourself as in INSTALL-PI.md.
- Ethernet has no DHCP client: the address is fixed (169.254.61.60), or set with `ip=` in `cmdline.txt`.
- The web page has no password.
- Only the Pi 4B is supported. The Pi 5, Pi 3 and Pi 400 are untested.
