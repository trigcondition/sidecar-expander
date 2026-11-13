---
title: The Pi 5's fan
description: "The Sidecar drives the Pi 5's fan header: AUTO follows Linux's curve, ON and OFF, set with fan= in display.txt or the console, and what /status shows."
sidebar:
  order: 9.5
---

<span class="sc-test">in testing</span> New in 0.5.0 (Sidecar on the Pi 5). The Pi 4 has no fan control in the Sidecar.

The Pi 5 has a 4-pin fan header for the official **Active Cooler** and the case fan. Under Linux the operating system drives it. Under the Sidecar nothing did, and a Pi 5 with an Active Cooler under load could reach the temperature limit and slow down (see [Keeping it cool](/sidecar-expander/using/troubleshooting/#keeping-it-cool)). **From 0.5.0 the Sidecar drives the fan itself.**

## The modes

| Mode | What the fan does |
|---|---|
| **AUTO** (default) | follows Linux's curve for the Pi 5: it starts at about **50 °C** and steps up at 60, 67.5 and 75 °C, through five speeds |
| **ON** | runs at high speed all the time |
| **OFF** | stops, except from 80 °C (the temperature warning) until the chip is below 75 °C: then it runs at high speed |

In AUTO a speed goes up when the chip reaches its step and comes back down only 5 °C below it, so a Pi sitting on a step does not hunt. The Sidecar checks once a second.

## Set it

- **On the card:** `fan=auto`, `fan=on` or `fan=off` in `display.txt` (in `/.rytm/`). It is not written while the mode is AUTO.
- **In `cmdline.txt`:** the same `fan=` wins at boot. The Sidecar does not write it to the card.
- **On the console:** `fan` alone prints the state. `fan=MODE` sets the mode and saves it on the card.

## Check it

- **`/status`** (`http://sidecar.local/status`) has a `fan` entry: the `mode`, where it came from (`from`: default, card, cmdline or console), the `level` and `duty`, `override` (true while OFF runs the fan for the heat), `pin` (false if the fan output did not start), `rpm` and `changes`.
- **The log** has one line when the Sidecar starts and one for each change of speed.

## Good to know

- **A fan is still the real fix** for a Pi 5 in a closed case or with a display attached.
- **`rpm` may read 0** with the fan turning: the Sidecar reads the fan's speed the way Linux does, and this was not seen on a real Pi 5 yet.
