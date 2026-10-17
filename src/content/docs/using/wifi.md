---
title: Wi-Fi (Pi)
description: The current state of Wi-Fi on the Pi Sidecar.
sidebar:
  order: 9
---

<span class="sc-test">in testing</span>

The tester release has **Wi-Fi off**: use a direct Ethernet cable for `sidecar.local`. Builds in testing can join a WPA2 network, and a join has worked on hardware.

## How it works today

- The network is **either Ethernet or Wi-Fi**, chosen at boot. Both at once is not supported.
- Wi-Fi uses DHCP, with the hostname `sidecar`, so `sidecar.local` works on your home network once the Pi has an address.
- The Pi's Wi-Fi chip needs its firmware files on the card in `/firmware/`.
- There is **no setup page yet**. You join from the console (the web page's command line, or serial) with `wifi=join:<network>:<passphrase>`, then reboot. `wifi=scan` lists the networks, `wifi=off` returns to Ethernet at the next boot.
- The passphrase is never written to the card in plain text and never logged: the Pi stores a derived key.
- WPA2-Personal only; no WPA3.
- The web page has no password. On a shared network anyone can open it. Access control comes first on the [roadmap](/sidecar-expander/roadmap/).

## Coming

Wi-Fi settings on the web page and the display, first setup without a cable, and a pairing code. See the [roadmap](/sidecar-expander/roadmap/).
