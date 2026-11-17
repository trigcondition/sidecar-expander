---
title: The machine catalog
description: "The catalog of community machines and effects in the Sidecar's web page (Voices > User machines > Catalog): what it lists, how an install works (your browser downloads, the Sidecar stays offline), the trust text, and how to submit your own."
sidebar:
  order: 4.5
---

New in 0.5.1. The catalog lists the user machines and user effects of the **community registry** and installs one onto the Sidecar from the web page: <https://trigcondition.github.io/sidecar-machines/>.

## What it is

- A card in the web page, in **Voices > User machines > Catalog**, next to the machines you have installed. It shows the machines and effects for your board (Pi 4 or Pi 5): name, kind, author, version, licence, size, a source link (or "no source"), a demo link when there is one, and the description. Filter by kind, or search.
- Each entry says **Install**, **Update to x.y.z** (compared by id and version) or **Installed**. It never offers a downgrade. A copy on the card that does not load shows **Reinstall**.
- An update replaces the file already on the card for that machine, also one you copied there by hand or took from the plugins zip. The confirmation names the file it replaces.
- Every entry is marked **community**. Entries by trigcondition also say **by Sidecar**; they are installed the same way.

## Your browser needs internet, the Sidecar does not

The page reads the registry's index in **your browser**, and your browser downloads the package. The Pi itself never goes to the internet, so a Sidecar on a USB-C cable to a computer with no internet sharing works as before.

1. The browser checks the package's size and SHA-256 against the index. A mismatch is refused with a message.
2. The package is sent to the Sidecar through the ordinary upload into `/Plugins`.
3. The Sidecar's plugin loader checks it again, exactly as for any file you upload yourself.

With no internet in the browser the card says "Catalog not reachable"; nothing else on the page is affected. There is one registry address and no setting for it.

## The trust text

Installing asks once. The text says it is **a community machine: native code, no sandbox, not tested by Sidecar** (and that no source is published for it, when it has none). A user machine is native code that runs inside the Sidecar's engine, like a firmware module: install only what you trust.

## Install by hand instead

Copy the `.rmp` file into `/Plugins` on the card, or upload it on the page ([User machines](/sidecar-expander/using/user-machines/)). The catalog does the same, with the download and the hash check added.

## Submit your own machine

The registry is a public repository, [sidecar-machines](https://github.com/trigcondition/sidecar-machines). To list a machine or an effect, follow its [CONTRIBUTING](https://github.com/trigcondition/sidecar-machines/blob/main/CONTRIBUTING.md). How to write one: [Writing user machines](/sidecar-expander/developers/writing-user-machines/) and [Writing send effects](/sidecar-expander/developers/writing-send-effects/).
