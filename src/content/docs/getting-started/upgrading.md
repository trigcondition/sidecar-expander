---
title: Upgrade an existing Sidecar
description: "How to upgrade a Sidecar that already runs: from 0.5.0 to 0.5.1 with the web update (the easy way), from 0.4.x by SD card (the Rytm firmware 0.5.0, the card files and the new web page), how the web page itself is upgraded, and how to go back."
sidebar:
  order: 3.5
---

This page is for a Sidecar that already runs. For a new one, use [Set up Sidecar](/sidecar-expander/getting-started/setup/).

**Sidecar 0.5.1 is a Pi-only update. The Rytm stays on the Rytm firmware 0.5.0 (OS 1.74): there is nothing to flash.**

## From 0.5.0 to 0.5.1 (the easy way)

1. Download `sidecar-0.5.1.scu` from the [Sidecar 0.5.1 release](https://github.com/trigcondition/sidecar-firmware/releases/tag/v0.5.1) (one file for the Pi 4 and the Pi 5; check it against its `.sha256`).
2. Open the Sidecar's web page, **Settings > Update**, and pick the file. It updates the firmware and the web page together ([Updating from the web page](/sidecar-expander/using/web-ui/#updating-from-the-web-page-050)).
3. Press **Install** and wait for the **trial boot**. Audio stops for about a minute; keep the Sidecar switched on. The page follows the trial ("Trying 0.5.1 ... permanent in 20 s"), then says "Updated to 0.5.1". Reload the page: the update brings its own web app.

**If the Sidecar does not come back,** switch it off and on. It runs 0.5.0 again, by itself. Your projects, samples, `/Plugins` and settings stay. The **Back to 0.5.0** button on the Update card returns to 0.5.0 later, if you want to.

The new touchscreen themes are not switched on by the update: the display stays as it was. Choose one in **Settings > Display > UI style** ([The display](/sidecar-expander/using/display/#themes-and-looks)).

## From 0.4.x to 0.5.1 (by SD card)

0.4.x cannot update itself from its web page, so the first step to 0.5.1 is by SD card.

1. **Back up the Rytm's projects** with Transfer. The Rytm must run **OS 1.74**. If it runs an older OS, install Elektron's stock OS 1.74 first ([Recovery to stock](/sidecar-expander/getting-started/recovery/) has the stock files).
2. **Flash the Rytm firmware 0.5.0** (it stays the Rytm firmware of 0.5.1) with the patcher ([Patch and flash the Rytm](/sidecar-expander/getting-started/patch-and-flash/)).
3. **Download the card files for your screen size** (800x480 or 1024x600) from the Sidecar 0.5.1 release, and check them against their `.sha256`. The card files are `sidecar-pi-sd-0.5.1-{{COMMIT}}-800x480.zip` and `sidecar-pi-sd-0.5.1-{{COMMIT}}-1024x600.zip`; the release zip `sidecar-0.5.1.zip` holds them too, under "Card files".
4. **Switch the Pi off, put its SD card in your computer, unzip the card files and copy everything over the card's top level, replacing files.**
   - This includes the **hidden folder `.rytm`**. The Mac's Finder hides it: press Cmd+Shift+. to show it. On Windows turn on "Hidden items" in the Explorer's View menu.
   - Your samples, recordings, `/Plugins/` and the settings in `/.rytm` stay. The new `/.rytm/www-next` folder (the new web page) is added.
   - **The card files include `config.txt` and `cmdline.txt`.** They replace yours, together with any option you added (the Ethernet address, Wi-Fi, the display, the USB-C mode). **Keep a copy of your `cmdline.txt` and `config.txt` first** and put your lines back, or make new files with the [card config editor](/sidecar-expander/getting-started/config-editor/): paste your old files into it first and it keeps the options it does not manage.
5. **Put the card back in the Pi and switch it on.** Open `sidecar.local`: the new web page opens. If the browser shows the old page, force a reload (Cmd+Shift+R, or Ctrl+F5 on Windows and Linux). The old page is still there at `sidecar.local/classic`.
6. **If the classic page still comes up,** the `www-next` folder did not get copied. Repeat step 4 with hidden files shown.
7. **If a touch lands in the wrong place** on the touchscreen after the upgrade, calibrate it: on the touchscreen open **Settings > Display > Touch: Calibrate** and touch the four crosses as they appear, one at each corner. The calibration is kept on the card ([Touch](/sidecar-expander/using/display/#touch)). If you cannot reach the button, set `touchcal=off` from the web page's console and try again.

An alternative: write the 0.5.1 **SD card image** to a **new** card with Raspberry Pi Imager ([Set up Sidecar](/sidecar-expander/getting-started/setup/), step 5). It erases that card, so copy your samples and `/Plugins/` over from the old card first.

A Rytm that stays on the Rytm firmware 0.4.4 works with the 0.5.1 card, without what needs the new Rytm firmware: see [Upgrading from 0.4.4](/sidecar-expander/release-notes/#upgrading-from-044) in the release notes.

## From 0.5.1 onward

The same steps as from 0.5.0: download the release's `.scu` update file, **Settings > Update**, pick the file, wait for the trial boot. The Rytm firmware needs a new flash only when the release notes say so.

## The web page

The new web page is **not part of the kernel**. It is a set of files on the SD card, in `/.rytm/www-next/`. Opening `sidecar.local` shows it when `/.rytm/www-next/index.html` (or `index.html.gz`) is on the card, and the classic page otherwise. The classic page stays at `/classic`.

- Each release brings its own web page: in the card files, and in the `.scu` update file. There is nothing to install separately.
- Your browser holds nothing that needs an update, only a cache: reload the page after an update.

## Going back

To go back to 0.4.4, flash the Rytm firmware 0.4.4 and copy the 0.4.4 card files back ([Recovery to stock](/sidecar-expander/getting-started/recovery/)). A 0.4.4 Sidecar does not read the new LFO files: see the known issues in the [release notes](/sidecar-expander/release-notes/). After a web update, the **Back to** button on the Update card returns to the version before it.
