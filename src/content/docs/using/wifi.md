---
title: Wi-Fi (Pi)
description: The current state of Wi-Fi on the Pi Sidecar.
sidebar:
  order: 9
---

Joining: <span class="sc-ok">hardware</span> (the Pi joins on the first boot). The settings page: <span class="sc-test">in testing</span>.

The SD card package has **Wi-Fi off**: start with a direct Ethernet cable for `sidecar.local`, then turn Wi-Fi on from the page.

## How it works today

- The network is **either Ethernet or Wi-Fi**, chosen at boot. Both at once is not supported.
- Wi-Fi uses DHCP, with the hostname `sidecar`, so `sidecar.local` works on your home network once the Pi has an address.
- The Pi's Wi-Fi chip needs its firmware files on the card in `/firmware/`.
- **The settings page** (Status tab, Wi-Fi section; in testing): on / off, scan, pick a network or type one, the password, **Connect and save**, **Forget network**. Connect and save restarts the Pi and tries the network; if it is not up within 90 seconds, the previous setting comes back and the Pi restarts on it, so a typo cannot lock you out. See [Web UI](/sidecar-expander/using/web-ui/#wi-fi-settings).
- From the console (the web page's command line, or serial): `wifi=join:<network>:<passphrase>`, then reboot. `wifi=scan` lists the networks, `wifi=off` returns to Ethernet at the next boot.
- A watchdog rejoins after a dropout (in testing).
- The passphrase is never written to the card in plain text and never logged: the Pi stores a derived key.
- WPA2-Personal only; no WPA3.
- The web page has no password. On a shared network anyone can open it. Access control comes first on the [roadmap](/sidecar-expander/roadmap/).

## Coming

Wi-Fi settings on the display, first setup without a cable, and a pairing code. See the [roadmap](/sidecar-expander/roadmap/).
