---
title: The display (Pi)
description: "The 5-inch touch display: status, settings, screensaver, brightness and touch."
sidebar:
  order: 7
---

The Pi can drive an **800x480 HDMI display with USB touch** (tested with a 5" HDMI LCD). Connect it before power-on: HDMI to the Pi's **micro-HDMI 0** (next to the power socket), touch to a free **USB-A** port.

## Boot screen

The Sidecar wordmark with a progress bar, drawn within a third of a second of the engine starting. The home screen follows a few seconds later.

![The boot screen: the Sidecar | Expander wordmark over a green progress bar](../../../assets/ui/display-boot.png)

## Home

![The display's home screen: tracks 1-8 with their machines, status with REC and the core loads, the project's U1..U5](../../../assets/ui/display-home.png)

<small>Screenshot: the 1021 display rendered off-device with mock data.</small>


- The title bar, with **Rytm connected** (green) or **Rytm not connected** (red).
- **Tracks:** voices 1-8 with their current machine.
- **Project:** the Rytm's project and its U1..U5 machines as the Rytm shows them (`!NAME` missing, `NAME...` loading, `---` empty).
- **Status:** Overbridge blocks, underruns (red once nonzero), load bars for the render cores, and `REC` while recording.

## Settings

![Settings, Sound page: MIDI notes, output, computer audio, FIFO target; per voice the machine and a test drone](../../../assets/ui/display-sound.png)
![Settings, Send FX page: FX 1 in green, FX 2 in white, the 12 tracks' send levels, Kill tails](../../../assets/ui/display-sendfx.png)
![Settings, About page: web address, IP, link, build, screensaver and brightness](../../../assets/ui/display-about.png)

<small>Screenshots: the 1021 display rendered off-device with mock data.</small>


The **Settings** button (top right) opens the settings pages and becomes **Home**. Every control is at least 48 px high.

| Page | |
|---|---|
| **Sound** | MIDI notes, output (Main/Tracks), computer audio, the buffer target; per voice: machine and test drone |
| **Send FX** | both effects' TYPE and the 12 send levels (read only: the Rytm's kit owns them; **FX 1 green, FX 2 white**), and **Kill tails** |
| **About** | the web address, IP, network, the build, the screensaver and brightness |

The display, the web page and the console share one state: a change on one shows on all.

## Screensaver and brightness

- **Screensaver:** after 1 hour without a touch (default) the screen goes black. Choose Off, 15 min, 1 h or 4 h. Any touch wakes it; that touch only wakes the screen. Rytm activity does not keep it awake.
- **Brightness:** 10 to 100 %. It dims the picture (the panel has no software backlight control).
- Both are stored on the card (`/.rytm/display.txt`) and can be set from the web page too.

## Touch

If touch is offset or mirrored, read the raw values from the touch readout and set `touchscreen=minx,maxx,miny,maxy` in `cmdline.txt`. Touch errors on the panel's USB link are recovered automatically.

## Cost

The display runs on the core that also handles USB, but the audio is interrupt-driven and does not wait for it. At rest an update takes about 0.3 ms. `display=0` in `cmdline.txt` turns it off.
