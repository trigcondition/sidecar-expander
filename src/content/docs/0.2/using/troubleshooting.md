---
slug: 0.2/using/troubleshooting
title: Troubleshooting and known issues
description: What to check when something does not work, and the issues we know about.
sidebar:
  order: 10
---

## First checks

| Symptom | Check |
|---|---|
| No Sidecar voices | USB CONFIG is the Overbridge mode; the Rytm is plugged straight in, no hub; the Sidecar's log shows `ob: streaming` and `MIDI attached` (Teensy console, `sidecar.local` Log & console tab) |
| Voices silent right after plugging in | once the Rytm sent no USB MIDI for about 50 seconds while its audio already streamed. Wait a minute, or replug the USB cable |
| A track shows `!NAME` | the Sidecar cannot play that machine or effect: see [!NAME on the Rytm](/sidecar-expander/0.2/using/user-machines/#name-on-the-rytm) |
| P2..P5 show numbers, not names | the Sidecar's firmware is older than the mods: update it |
| `sidecar.local` does not open | a direct Ethernet cable; your computer's port on automatic (link-local) or 169.254.61.59/16; try <http://169.254.61.60> |
| STUTTER is silent or always on | see [Set up STUTTER](/sidecar-expander/0.2/using/send-effects/#set-up-stutter-route-to-main): ROUTE TO MAIN off, P2 at 0 first |
| The Rytm froze | power cycle it, and report what the Sidecar was doing |
| The Pi does not start | the `# sidecar sdboot begin` block must stay in `config.txt`; use the official supply: 5.1 V 3 A for the Pi 4, 27 W for the Pi 5 (a weak supply browns out with a display attached). A Pi 5 showing its boot diagnostics screen needs a bootloader update |
| `POWER TOO WEAK` on the display, a Power warning on the web page | the supply is too weak: the official one, plugged in directly (Pi 5: the 27 W (5 V 5 A) adapter; Pi 4: the official 15 W (5.1 V 3 A) supply; the message names the board's own) |
| Pi 5: the web page is slow over Wi-Fi, "503 busy" | power the Pi 5 from the 27 W adapter directly, not from a hub's port |
| Pi 5: no picture on HDMI | micro-HDMI 0 (next to USB-C), connected before power-on; `hdmi_force_hotplug=1` under `[pi5]` in `config.txt` |

## Known issues

### Rytm mods

- **User FX slots are not available yet.** The TYPE list offers the built-in effects only.
- **OS 1.73 only.** There are no patch files for other OS versions. OS 1.74 will be supported after testing. On OS 1.74 (or any other version), first flash the stock OS 1.73 `.syx` with Transfer, as any OS update, then patch and flash it.
- **The sample browser can lag** while you scroll a large folder with the Sidecar connected. Report the folder size and whether the sequencer was running.
- The slot menu can hold the screen for up to 2 seconds while the Sidecar answers.

### Stock Rytm behaviour

- After an OS upgrade the Rytm can hang on **"Success! Rebooting"**. Power cycle it: the update is complete.

### Teensy 4.1

- **The Rytm connects only after a reboot or many retries, or the Teensy drops off the computer:** solder the Teensy 4.1's USB host header (5 V, D-, D+, GND, shield). Press-fit or unsoldered pins make the host port flaky: the Rytm connects only after a reboot or after many retries (the link comes up at full speed and drops), and the Teensy's own USB to the computer can drop when the host port's power switches on. Use a short, good USB cable to the Rytm.

- RINGS, CLOUDSEED and STUTTER run only on the Pi.
- The console's User machines and Files tabs are in testing.
- USB audio to a computer: stereo in this release (2 in / 2 out); the multichannel mode comes later.

### Raspberry Pi 4B and Pi 5

- **The Rytm does not connect after many replugs** (the log says `Cannot set device address`): restart the Pi. A fix is planned.

- Wi-Fi is off in the SD card package (see the install page to turn it on); Ethernet has no DHCP client (fixed 169.254.61.60, or `ip=`).
- The web page has no password.
- **Pi 5: no USB audio or MIDI to the computer.** Its USB-C port is power only in 0.2.0 (even Raspberry Pi OS's own USB gadget did not connect on our Pi 5 powered from a computer). Use a Pi 4B for computer audio and MIDI.
- **Pi 5: use the official 27 W supply, plugged in directly.** From a hub's port the Pi 5 ran in reduced-power mode, and Wi-Fi and the web page became slow (pages of 5 s, "503 busy"). The Sidecar warns: in the log, on the web page's Power tile and in red on the display (`POWER TOO WEAK: use 27 W adapter`). On a Pi 4 it names the Pi 4's own supply (`POWER TOO WEAK: use 15 W supply`).
- **Pi 5 HDMI picture is slightly soft:** the Pi 5's firmware always sends 1920x1080 and the 800x480 UI is scaled to it. Only `hdmi_force_hotplug=1` under `[pi5]` matters; the other `[pi5]` display lines do nothing on the Pi 5 and are harmless.
- **Pi 5 DSI display:** in testing (built, not yet run on hardware). With no DSI panel answering, the Sidecar uses HDMI.
- **Pi 5 updates:** by copying the new release over the card only (no network update on the Pi 5 yet). A Pi 5 that shows its boot diagnostics screen needs a bootloader update (Raspberry Pi Imager, "Misc utility images", "Bootloader").
- **One card for both boards** is in testing on the Pi 4B and the Pi 5 (the Pi 4 reads exactly the 0.1.0 settings; the Pi 5 build is tested on hardware).
- The Pi 3 and Pi 400 are untested.

### Remote pages

- A remote page catches only the keys and knobs it uses; PLAY, STOP and RECORD always reach the Rytm. The status pages catch every knob. With a Sidecar firmware older than the key masks, every key except PLAY, STOP and RECORD goes to the Sidecar.

### Teensy: user machine space

- The 32 KB plugin code space fits only one of the large NoisePlethora packages (NP VOICES, NP CLUST1, NP CLUST2) at a time; a second shows `!ROOM`. Use the new, smaller NoisePlethora packages instead (prime, fibo, phase, fm, pw, ring, noise, walk, atari): any two fit together, some three. The Pi has no such limit.

### Still in testing

Results from testers are welcome:
- a cold power cycle of the Pi straight into the engine, with no computer attached;
- the Pi's sample pool and presets by ear, CRUSH and RINGMOD, slot fingerprints in a project shared with another Sidecar.

## Reporting

Use the **Tester report** form under [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose). It asks for the Rytm build (`rui1027d` / `sfx1021`), the Sidecar build (from `BUILD-INFO`), what you did and what happened. A log from the Teensy console or `sidecar.local` helps a lot.
