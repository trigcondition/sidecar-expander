---
title: Upgrade an existing Sidecar
description: "How to upgrade a Sidecar that already runs: from 0.4.4 to 0.5.0 by SD card (the Rytm firmware, the card files and the new web page), from 0.5.0 on with the web update, how the web page itself is upgraded, and how to go back."
sidebar:
  order: 3.5
---

This page is for a Sidecar that already runs. For a new one, use [Set up Sidecar](/sidecar-expander/getting-started/setup/).

## From 0.4.4 to 0.5.0

0.4.4 cannot update itself from its web page, so the first step to 0.5.0 is by SD card.

1. **Back up the Rytm's projects** with Transfer. The Rytm must run **OS 1.74**. If it runs an older OS, install Elektron's stock OS 1.74 first ([Recovery to stock](/sidecar-expander/getting-started/recovery/) has the stock files).
2. **Flash the Rytm firmware 0.5.0** with the patcher ([Patch and flash the Rytm](/sidecar-expander/getting-started/patch-and-flash/)).
3. **Download the card files for your screen size** (800x480 or 1024x600) from the Sidecar 0.5.0 release, and check them against their `.sha256`. The card files are `sidecar-pi-sd-0.5.0-06801ee-800x480.zip` and `sidecar-pi-sd-0.5.0-06801ee-1024x600.zip`; the release zip `sidecar-0.5.0.zip` holds them too, under "Card files".
4. **Switch the Pi off, put its SD card in your computer, unzip the card files and copy everything over the card's top level, replacing files.**
   - This includes the **hidden folder `.rytm`**. The Mac's Finder hides it: press Cmd+Shift+. to show it. On Windows turn on "Hidden items" in the Explorer's View menu.
   - Your samples, recordings, `/Plugins/` and the settings in `/.rytm` stay. The new `/.rytm/www-next` folder (the new web page) is added.
   - **The card files include `config.txt` and `cmdline.txt`.** They replace yours, together with any option you added (the Ethernet address, Wi-Fi, the display, the USB-C mode). **Keep a copy of your `cmdline.txt` and `config.txt` first** and put your lines back, or make new files with the [card config editor](/sidecar-expander/getting-started/config-editor/): paste your old files into it first and it keeps the options it does not manage.
5. **Put the card back in the Pi and switch it on.** Open `sidecar.local`: the new web page opens. If the browser shows the old page, force a reload (Cmd+Shift+R, or Ctrl+F5 on Windows and Linux). The old page is still there at `sidecar.local/classic`.
6. **If the classic page still comes up,** the `www-next` folder did not get copied. Repeat step 4 with hidden files shown.
7. **If a touch lands in the wrong place** on the touchscreen after the upgrade, calibrate it: on the touchscreen open **Settings > Display > Touch: Calibrate** and touch the four crosses as they appear, one at each corner. The calibration is kept on the card ([Touch](/sidecar-expander/using/display/#touch)). If you cannot reach the button, set `touchcal=off` from the web page's console and try again.

An alternative: write the 0.5.0 **SD card image** to a **new** card with Raspberry Pi Imager ([Set up Sidecar](/sidecar-expander/getting-started/setup/), step 5). It erases that card, so copy your samples and `/Plugins/` over from the old card first.

A Rytm that stays on the Rytm firmware 0.4.4 works with the 0.5.0 card, without what needs the new Rytm firmware: see [Upgrading from 0.4.4](/sidecar-expander/release-notes/#upgrading-from-044) in the release notes.

## From 0.5.0 onward

1. Download the release's `sidecar-0.5.0.scu` update file.
2. Open the web page, **Settings > Update**, and pick the file. It updates the firmware and the web page together ([Updating from the web page](/sidecar-expander/using/web-ui/#updating-from-the-web-page-050)).
3. When the page says "Updated", reload it.

The Rytm firmware needs a new flash only when the release notes say so.

## The web page

The new web page is **not part of the kernel**. It is a set of files on the SD card, in `/.rytm/www-next/`. Opening `sidecar.local` shows it when `/.rytm/www-next/index.html` (or `index.html.gz`) is on the card, and the classic page otherwise. The classic page stays at `/classic`.

- Each release brings its own web page: in the card files, and in the `.scu` update file. There is nothing to install separately.
- Your browser holds nothing that needs an update, only a cache: reload the page after an update.

## Going back

To go back to 0.4.4, flash the Rytm firmware 0.4.4 and copy the 0.4.4 card files back ([Recovery to stock](/sidecar-expander/getting-started/recovery/)). A 0.4.4 Sidecar does not read the new LFO files: see the known issues in the [release notes](/sidecar-expander/release-notes/). After a web update from 0.5.0, the **Back to** button on the Update card returns to the version before it.
