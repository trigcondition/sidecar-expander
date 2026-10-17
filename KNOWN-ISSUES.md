# Known issues

> Also on the documentation site: <https://trigcondition.github.io/sidecar-expander/>

First tester release (builds `sfx1017` / `rui1017`). Please report anything not listed here, using the Tester report form under Issues.

## Rytm mods

- **User FX slots are not available yet.** The SEND FX TYPE list offers only the built-in effects.
- **The remote UI (`rui1017` only) is early.** TRK + YES opens the page, but the Sidecar does not serve remote UI pages yet. The page stays blank and returns to the normal screen within about a second. Keys, pads and PLAY/STOP keep working. Use `sfx1017` unless you want to test this.
- **P2..P5 show numbers instead of names** when the Sidecar's firmware is older than this release. Update the Sidecar.
- **OS 1.73 only.** Patch files for other OS versions do not exist, and the Rytm cannot be downgraded.
- **The Rytm's sample browser can lag** while you scroll a large folder with the Sidecar connected. This is being investigated. Report the folder size and whether the sequencer was running.

## Rytm (stock behaviour, not caused by the mods)

- After an OS upgrade the Rytm can hang on **"Success! Rebooting"**. Power cycle it: the update is complete.
- Once, right after plugging in, the Rytm sent no USB MIDI for about 50 seconds while its audio already streamed. If voices stay silent at first, wait a minute or replug the USB cable.

## Teensy 4.1

- The large send effects (RINGS, CLOUDSEED) run only on the Raspberry Pi version.
- The web console's SD card browsing is a placeholder.
- The computer-audio modes (USB audio to and from your computer) are not part of this release.

## Raspberry Pi 4B

- There is no Wi-Fi. Use a direct Ethernet cable for `sidecar.local`.
- There is no DHCP client: the address is fixed (169.254.61.60), or set with `ip=` in `cmdline.txt`.
- The status page has no password.
- Only the Pi 4B is supported. The Pi 5, Pi 3 and Pi 400 are untested.

## Not yet confirmed on hardware

These items were not yet measured for this release. Results from testers are very welcome:
- a cold power cycle of the Pi straight into the SD card's engine, with no computer attached;
- unplugging and replugging the Sidecar (or its power) while the Rytm plays: the Rytm should keep running, and the names and labels should come back.
