---
title: Licence
description: GPL-2.0-or-later, the Pi binary under GPLv3 terms, the written source offer, third-party licences.
sidebar:
  order: 1
---

## Our code

Our code is free software under the **GNU General Public License, version 2 or (at your option) any later version** (GPL-2.0-or-later). The text is in [LICENSE](https://github.com/trigcondition/sidecar-expander/blob/main/LICENSE).

## The Pi binary: GPLv3 terms

The Raspberry Pi engine links the **Circle** bare-metal library, which is GPLv3. The Pi binary as a whole (`engine.img` and `sdboot.img`) is therefore distributed under the terms of the **GPL version 3** ([GPL-3.0](https://github.com/trigcondition/sidecar-expander/blob/main/licenses/GPL-3.0.txt)). Our own source stays GPL-2.0-or-later, which allows this.

## The Rytm mods

The patch files include the core of **elekloader** (GPL-2.0-or-later). The patcher's firmware codec is elekloader's, which comes from digikit.

## The Teensy firmware

The Teensy build links parts of the Teensyduino core and the SPI library under the LGPL-2.1. The materials to relink them are part of the source offer below.

## Written offer for source code

The source is public: [sidecar-firmware](https://github.com/trigcondition/sidecar-firmware) (the engine for Sidecar Mini and Sidecar) and [sidecar-mods](https://github.com/trigcondition/sidecar-mods) (the Rytm mods; it rebuilds the released build byte for byte from your own stock OS file).

Until then, and for at least three years from the date you received a binary from this project, we will give anyone who asks a complete machine-readable copy of the **corresponding source code** for:

- the Raspberry Pi engine (`engine.img` and `sdboot.img`), including Circle and our changes to it, under the GPL version 3;
- the Rytm mods in the patch files, including the elekloader core, under the GPL version 2 or later;
- the Teensy firmware, including the materials needed to relink the LGPL-2.1 parts of the Teensyduino core and SPI library.

We provide it at no charge beyond the cost of physically performing the distribution, or as a download. To ask for it, open an issue titled "Source request" in the repository.

## Third-party licences

Every third-party component and its licence is listed in [THIRD_PARTY_LICENSES](https://github.com/trigcondition/sidecar-expander/blob/main/THIRD_PARTY_LICENSES). See also [Credits](/sidecar-expander/about/credits/).

## This site

The site is built with Astro Starlight (MIT). The wordmark uses Archivo Black (SIL Open Font License 1.1). The diagrams were drawn for this site.
