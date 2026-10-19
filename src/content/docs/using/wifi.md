---
title: Wi-Fi (Pi)
description: The current state of Wi-Fi on the Pi Sidecar.
sidebar:
  order: 9
---

Joining: <span class="sc-ok">hardware</span> (the Pi joins on the first boot). The settings page: <span class="sc-test">in testing</span>.

The SD card package has **Wi-Fi off**: start with a direct Ethernet cable for `sidecar.local`, then turn Wi-Fi on from the page.

## Wi-Fi without a cable: sidecar-wifi.txt

<span class="sc-test">in testing</span> To set up Wi-Fi with no Ethernet cable and no web page, put a text file called `sidecar-wifi.txt` at the **root of the Pi's SD card** (the top folder, next to `Plugins`; it shows in the Mac Finder and Windows Explorer). Three lines are enough:

```
ssid=MyNetwork
psk=MyPassword
```

1. Make sure the Wi-Fi chip firmware is on the card in `/firmware/` (see [Install the Pi](/sidecar-expander/getting-started/install-pi/#wi-fi-off-by-default)).
2. Save `sidecar-wifi.txt` at the card root, put the card in the Pi and power it on. The Pi reads the file at the **next boot**, before Wi-Fi starts.
3. The Pi joins the network (DHCP, `sidecar.local`). It stores only the **derived key**, never your password, in `/.rytm/wifi.txt`, and then **deletes `sidecar-wifi.txt`** from the card (if it cannot delete it, it overwrites the contents and renames it `sidecar-wifi.used`).
4. If the network does not come up within **90 seconds** (wrong password, not found, no address), the Pi falls back to its previous setting (Ethernet when Wi-Fi was off) and restarts, so a typo cannot lock you out.

Options (one per line): `band=2g`, `band=5g` or `band=any` (2.4 GHz is the default), and `open=1` for an open network without a password (leave `psk=` out). `password=` works as another name for `psk=`. Lines starting with `#` are comments; spaces around `=` and quotes around the values are fine. The password is 8 to 63 characters, or a 64-digit hex key; the network name is 1 to 32 characters.

If the file cannot be used, the Pi deletes it anyway and writes **`sidecar-wifi-error.txt`** at the card root with a short reason (for example "password must be 8-63 characters"); it never contains your network name or password. Fix the file and try again; a successful import removes the error file.

The alternative is the web page's **Wi-Fi settings** (Status tab, over Ethernet). **Never share the card, or a photo of it, while `sidecar-wifi.txt` is on it**: the password is in it in plain text until the next boot.

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

Wi-Fi settings on the display and a pairing code. See the [roadmap](/sidecar-expander/roadmap/).
