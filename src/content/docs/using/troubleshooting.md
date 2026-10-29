---
title: Troubleshooting and known issues
description: What to check when something does not work, and the issues we know about.
sidebar:
  order: 10
---

## First checks

| Symptom | Check |
|---|---|
| No Sidecar voices | USB CONFIG is the Overbridge mode; the Rytm is plugged straight in, no hub; the Sidecar's log shows `ob: streaming` and `MIDI attached` (`sidecar.local` Log & console tab) |
| Voices silent right after plugging in | once the Rytm sent no USB MIDI for about 50 seconds while its audio already streamed. Wait a minute, or replug the USB cable |
| A track shows `!NAME` | the Sidecar cannot play that machine or effect: see [!NAME on the Rytm](/sidecar-expander/using/user-machines/#name-on-the-rytm) |
| P2..P5 show numbers, not names | the Sidecar's firmware is older than the mods: update it |
| `sidecar.local` does not open | a direct Ethernet cable; your computer's port on automatic (link-local) or 169.254.61.59/16; try <http://169.254.61.60> |
| `sidecar.local` asks for a code | pair the browser once with the 8-digit code on the Rytm (SIDECAR MENU > WEB UI) or the touchscreen ([Pairing a browser](/sidecar-expander/using/web-ui/#pairing-a-browser)). Paired at the IP address but opening `sidecar.local` (or the other way round)? A browser treats them as two sites: pair at the one you use |
| "the web UI is off on the Rytm" | turn it on again: SIDECAR MENU > WEB UI > WEB UI ON |
| No Sidecar voices after the Pi restarted, while the Rytm stayed on | seen once: the Sidecar's audio to the Rytm stayed silent. Restart the Rytm |
| STUTTER is silent or always on | see [Set up STUTTER](/sidecar-expander/using/send-effects/#set-up-stutter-route-to-main): ROUTE TO MAIN off, P2 at 0 first |
| The Rytm froze | power cycle it, and report what the Sidecar was doing |
| The Pi does not start | the `# sidecar sdboot begin` block must stay in `config.txt`; use the official supply: 5.1 V 3 A for the Pi 4, 27 W for the Pi 5 (a weak supply browns out with a display attached). A Pi 5 showing its boot diagnostics screen needs a bootloader update |
| `POWER TOO WEAK` on the display, a Power warning on the web page | the supply is too weak: the official one, plugged in directly (Pi 5: the 27 W (5 V 5 A) adapter; Pi 4: the official 15 W (5.1 V 3 A) supply; the message names the board's own) |
| Pi 5: the web page is slow over Wi-Fi, "503 busy" | power the Pi 5 from the 27 W adapter directly, not from a hub's port |
| Clicks or muted voices when the Pi is hot, `CLOCK LOWERED` on STATUS | the temperature on the Status tab: see [Keeping it cool](#keeping-it-cool) |
| The Pi restarted by itself | see [After an unexpected restart](#after-an-unexpected-restart) |
| Pi 5: no picture on HDMI | micro-HDMI 0 (next to USB-C), connected before power-on; `hdmi_force_hotplug=1` under `[pi5]` in `config.txt` |

## Keeping it cool

The Pi 4B runs the Sidecar at 1500 MHz. When the chip gets too hot the Pi protects itself: at **78 °C** it drops its clock to **600 MHz**, and the Sidecar has far less room to render: expect dropouts. The clock goes back to 1500 MHz when the chip is at 75 °C again. The limit is set by `socmaxtemp=78` in `cmdline.txt` (78 is the highest the Pi software allows; the Pi's own firmware still protects itself at 80 and 85 °C). New SD cards already have `socmaxtemp=78`. On a card you made earlier, open `cmdline.txt` on the card (it is one line) and add ` socmaxtemp=78` at the end, with a space before it, then put the card back and restart. Without it the Pi slows down at 60 °C.

| Temperature | What you see |
|---|---|
| below 78 °C | nothing: the full clock |
| 78 to 79 °C | the clock is lowered to 600 MHz. Quietly: the STATUS page's CPU line says `CLOCK LOWERED`, and the web page's Temperature tile says so too. No popup |
| 80 °C and up | the warning: a banner on the touchscreen (`SOC 80C - CLOCK LOWERED TO 600 MHZ`), a popup on the Rytm (`SOC 80C CLOCK LOWERED / TO 600 MHZ (UP+T10)`, or `SIDECAR RUNNING HOT / SEE STATUS` when the clock is not lowered), HOT on the STATUS page. It goes away below 75 °C |

- **Use a fan or a heatsink**, especially in a closed case or with a display attached. This is the real fix. A case fan helps a lot: on a Pi 4 in a display case, 72 °C while playing without the fan, 56 °C within a minute with it.
- **Watch the temperature:** the web page's Status tab and the touchscreen's STATUS page (UP + T10). Under 75 °C the Pi always runs at its full clock.
- The Rytm's popup does not cover a page you are working on: it waits until you close the page.
- **Lower the clock** while you find a fix: on the touchscreen **Settings > System > CPU clock** (it is not on the web page; the console's `cpumhz=1200` / `cpumhz=1000` or the same word in `cmdline.txt` do the same) runs the Pi at 1200 or 1000 MHz instead of 1500. It runs cooler, and the Sidecar's voice budget follows the clock.
- The fan of a case with its own display (such as the GeeekPi case) is controlled by the case, not by the Sidecar: turn it on in the case's own display menu.

## After an unexpected restart

<span class="sc-test">in testing</span> New in 0.3.0. If the Pi restarts by itself (it hung and its watchdog restarted it, or it hit an error), it notes what each part was doing just before. At the next start it writes that note, with the last 32 KB of the log, to **`/.rytm/prevboot.txt`** on the SD card, about a minute after it starts. The log (`sidecar.local`, Log & console) shows lines starting with `crumb:` right after the start.

- To read it: take the card out and open `/.rytm/prevboot.txt` on a computer (the `.rytm` folder is hidden: show hidden files). The web page cannot read `/.rytm/`.
- Attach the file to your report. It holds the log's lines (project and sample names can be in it), never a password or a pairing code.
- After a power cut there is no note: the Pi's memory is lost with the power. A planned restart (an install, a setting) keeps the last crash's note.

## Known issues

The 0.3.0 release's own list is in the [release notes](/sidecar-expander/release-notes/#known-issues-in-030).

### Rytm mods

- **User FX slots are not available yet.** The TYPE list offers the built-in effects only.
- **OS 1.73 only.** There are no patch files for other OS versions. OS 1.74 will be supported after testing. On OS 1.74 (or any other version), first flash the stock OS 1.73 `.syx` with Transfer, as any OS update, then patch and flash it.
- **The sample browser can lag** while you scroll a large folder with the Sidecar connected. Report the folder size and whether the sequencer was running.
- The slot menu can hold the screen for up to 2 seconds while the Sidecar answers.

### Stock Rytm behaviour

- After an OS upgrade the Rytm can hang on **"Success! Rebooting"**. Power cycle it: the update is complete.

### Raspberry Pi 4B and Pi 5

- **The Rytm does not connect after many replugs** (the log says `Cannot set device address`): restart the Pi. A fix is planned.

- Wi-Fi is off in the SD card package (see the install page to turn it on); Ethernet has no DHCP client (fixed 169.254.61.60, or `ip=`).
- The web page needs a [paired browser](/sidecar-expander/using/web-ui/#pairing-a-browser) since 0.3.0. The connection is plain HTTP: use a direct cable or a network you trust.
- **Pi 5: no USB audio or MIDI to the computer.** Its USB-C port is power only (0.2.0 and 0.3.0; even Raspberry Pi OS's own USB gadget did not connect on our Pi 5 powered from a computer). Use a Pi 4B for computer audio and MIDI.
- **Pi 5: use the official 27 W supply, plugged in directly.** From a hub's port the Pi 5 ran in reduced-power mode, and Wi-Fi and the web page became slow (pages of 5 s, "503 busy"). The Sidecar warns: in the log, on the web page's Power tile and in red on the display (`POWER TOO WEAK: use 27 W adapter`). On a Pi 4 it names the Pi 4's own supply (`POWER TOO WEAK: use 15 W supply`).
- **Pi 5 HDMI picture is slightly soft:** the Pi 5's firmware always sends 1920x1080 and the 800x480 UI is scaled to it. Only `hdmi_force_hotplug=1` under `[pi5]` matters; the other `[pi5]` display lines do nothing on the Pi 5 and are harmless.
- **Pi 5 DSI display:** in testing (built, not yet run on hardware). With no DSI panel answering, the Sidecar uses HDMI.
- **Pi 5 updates:** by copying the new release over the card only (no network update on the Pi 5 yet). A Pi 5 that shows its boot diagnostics screen needs a bootloader update (Raspberry Pi Imager, "Misc utility images", "Bootloader").
- **One card for both boards** is in testing on the Pi 4B and the Pi 5 (the Pi 4 reads exactly the 0.1.0 settings; the Pi 5 build is tested on hardware).
- The Pi 3 and Pi 400 are untested.

### Remote pages

- A remote page catches only the keys and knobs it uses; PLAY, STOP and RECORD always reach the Rytm. The status pages catch every knob. With a Sidecar firmware older than the key masks, every key except PLAY, STOP and RECORD goes to the Sidecar.

### Still in testing

Results from testers are welcome:
- a cold power cycle of the Pi straight into the engine, with no computer attached;
- the Pi's sample pool and presets by ear, CRUSH and RINGMOD, slot fingerprints in a project shared with another Sidecar.

## Reporting

Use the **Tester report** form under [Issues](https://github.com/trigcondition/sidecar-expander/issues/new/choose). It asks for the Rytm firmware (0.3.0, or `rui1027d` / `sfx1021`), the Sidecar build (from `BUILD-INFO`), what you did and what happened. What helps most:

- **The steps:** what you pressed, in order, and what you expected. Whether it happens again.
- **`/status`:** open `http://sidecar.local/status` and save the page right after the problem (no pairing needed). It has the counters (underruns, temperature, the storage, the recorder).
- **The log:** `http://sidecar.local/log`, also open without pairing. It holds about the last 25 seconds: save it soon after the problem.
- **After a restart by itself:** `/.rytm/prevboot.txt` from the card ([above](#after-an-unexpected-restart)).
- **If the Rytm's screen froze:** the Rytm firmware 0.3.0 reports where its screen got stuck. The Sidecar's log then has a line with `FREEZE PROBE`: save the log at once.
