---
slug: 0.2/getting-started/recovery
title: Recovery to stock
description: Going back to the stock OS, the STARTUP menu route over DIN MIDI, and the "Success! Rebooting" hang.
sidebar:
  order: 4
---

You can always go back to the stock OS. Nothing in the mods changes the Rytm's bootloader, and the stock OS file restores everything.

## Before you flash anything

- **Back up** every project, kit, sound and sample with Transfer.
- Make a scratch project for testing.
- If you can, try the DIN route below once with the stock file, so you know it works on your setup.

## Back to stock, the normal way

Send the stock `Analog-Rytm_MKII_OS1.73.syx` with **Transfer**, the same way you sent the patched one.

## If the Rytm does not boot: the STARTUP menu

The STARTUP menu is served by the Rytm's bootloader, so it works without a booting OS.

1. Hold **FUNC** while you power the Rytm on. The STARTUP menu appears.
2. Press **TRIG 4 (OS UPGRADE)**.
3. Send the stock 1.73 file over **DIN MIDI**: Transfer's legacy OS upgrade mode through a MIDI interface, or any SysEx tool.
4. Wait. It takes about **16 minutes or more**. Do not switch off while it writes.

## "Success! Rebooting" and nothing happens

After an OS upgrade the Rytm can stay on "Success! Rebooting" and never restart by itself. This is stock behaviour. The update is complete: switch the Rytm off and on.

Do not switch the Rytm off while it writes an update, except in this case.

## What stays in your kits

The kit stores the SEND FX settings and the Sidecar machine choices. A stock OS ignores the send FX values. Tracks that use an EXT machine or a user slot do not play as intended on a stock OS; change those tracks to a stock machine before you save the kit under stock.

## If the Rytm froze with a Sidecar attached

Power cycle the Rytm. Then please send a tester report with what the Sidecar was doing (for example, it lost power or restarted while streaming).
