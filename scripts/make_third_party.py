#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Assemble THIRD_PARTY_LICENSES from the licence texts as they ship in each component.

    scripts/make_third_party.py --teensy-core DIR --rytm-teensy DIR --circle DIR --lvgl DIR

--teensy-core: Teensyduino's hardware/avr/<version>; --rytm-teensy: a checkout with its vendored DSP code
(sim/*/vendor, made by teensy/setup_*_lib.sh); --circle: the Circle tree the Pi kernel was built from;
--lvgl: the LVGL tree (pi/ui/fetch-lvgl.sh). Full GPL/LGPL texts are in licenses/.
"""
import argparse
import os
import re

ap = argparse.ArgumentParser()
for k in ("teensy-core", "rytm-teensy", "circle", "lvgl"):
    ap.add_argument("--" + k, required=True)
a = ap.parse_args()
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def text(*parts):
    with open(os.path.join(*parts), encoding="utf-8", errors="replace") as fh:
        return fh.read().strip()


def header(*parts):
    """The first comment block of a source file, without comment markers."""
    src = text(*parts)
    m = re.match(r"\s*/\*(.*?)\*/", src, re.S)
    if m:
        lines = [re.sub(r"^\s*\* ?", "", l) for l in m.group(1).splitlines()]
    else:
        lines = []
        for l in src.splitlines():
            if not l.startswith("//"):
                break
            lines.append(l[2:].lstrip(" ") if l.startswith("// ") else l[2:])
    return "\n".join(lines).strip()


TC, RT, CI, LV = a.teensy_core, a.rytm_teensy, a.circle, a.lvgl
sections = [
    ("ALL BUILDS", None, None),
    ("Mutable Instruments Plaits, Rings and stmlib (eurorack, commit 08460a6)",
     "MIT. Teensy and Pi: Plaits machines; Pi: the RINGS send effect.",
     header(RT, "sim", "plaits", "vendor", "eurorack", "plaits", "dsp", "voice.cc")),
    ("DaisySP (Electrosmith, commit 2c72eaf)", "MIT, including its Plaits- and Soundpipe-derived parts.",
     text(RT, "sim", "daisysp", "vendor", "DaisySP", "LICENSE")),
    ("digidrum (soejrd, commit 2f893f9)", "MIT (SPDX-License-Identifier: MIT in each source file; no "
     "separate licence file or copyright line is given upstream).", "SPDX-License-Identifier: MIT"),
    ("AMY Juno-106 model (shorepine/amy, amy/juno.py)", "MIT, (c) Brian Whitman, Dan Ellis. The JUNO "
     "machine's signal path, curves and patch table are derived from it (sim/juno/juno_patches.h).", ""),
    ("Send FX ports: Rings, CloudSeed and others (core/fx)", "MIT. The large FX run on the Pi build only.",
     text(RT, "core", "fx", "THIRD_PARTY_LICENSES.txt")),
    ("TEENSY 4.1 BUILD", None, None),
    ("Teensyduino core library (PJRC), Teensyduino 1.62.0", "MIT with a device clause.",
     header(TC, "cores", "teensy4", "startup.c")),
    ("Teensyduino core: Time.cpp, Stream/Printable/WCharacter headers; SPI library",
     "GNU LGPL version 2.1 (SPI: GPL-2.0 or LGPL-2.1, used under LGPL-2.1). Full text: licenses/LGPL-2.1.txt. "
     "These parts are statically linked: the written offer in README.md covers the materials needed to "
     "relink the firmware with a modified version of them.",
     header(TC, "cores", "teensy4", "Time.cpp")),
    ("USBHost_t36 (Paul Stoffregen)", "MIT.", header(TC, "libraries", "USBHost_t36", "USBHost_t36.h")),
    ("SdFat (Bill Greiman)", "MIT.", text(TC, "libraries", "SdFat", "LICENSE.md")),
    ("littlefs (Arm Limited) and the LittleFS wrapper (PJRC)", "BSD-3-Clause; the wrapper is MIT.",
     text(TC, "libraries", "LittleFS", "src", "littlefs", "LICENSE.md")),
    ("newlib, libgcc, libstdc++ (GNU Arm toolchain)",
     "newlib: BSD-style licences (see the newlib COPYING.NEWLIB); libgcc and libstdc++: GPL-3.0 with the GCC "
     "Runtime Library Exception, which allows distributing the compiled program under any terms.", ""),
    ("RASPBERRY PI 4B BUILD", None, None),
    ("Circle (Rene Stange), tag Step51.1.1, with our patches",
     "GNU GPL version 3. The Pi kernel as a whole is distributed under GPLv3: licenses/GPL-3.0.txt. "
     "Source: see the written offer in README.md.", ""),
    ("FatFs (ChaN), Circle addon", "BSD-style 1-clause.", text(CI, "addon", "fatfs", "LICENSE.txt")),
    ("Circle SDCard driver emmc.cpp (John Cronin)", "MIT.", header(CI, "addon", "SDCard", "emmc.cpp")),
    ("LVGL 9.4.0", "MIT.", text(LV, "LICENCE.txt")),
    ("Montserrat font (built into LVGL)", "SIL Open Font License 1.1, Copyright 2011 The Montserrat Project "
     "Authors (https://github.com/JulietaUla/Montserrat).", ""),
    ("Font Awesome 5 Free symbols (built into LVGL)", "Icons: CC BY 4.0; font: SIL OFL 1.1 "
     "(https://fontawesome.com/license/free).", ""),
    ("Raspberry Pi boot firmware (start4.elf, fixup4.dat)", "Redistributable in binary form for Raspberry Pi "
     "devices; ships with LICENCE.broadcom on the SD card.", text(CI, "boot", "LICENCE.broadcom")),
    ("bcm2711-rpi-4-b.dtb", "GNU GPL version 2, built from https://github.com/raspberrypi/linux; ships with "
     "COPYING.linux on the SD card.", ""),
    ("armstub8-rpi4.bin (Circle boot/armstub)", "BSD-3-Clause, Raspberry Pi (Trading) Ltd.",
     header(CI, "boot", "armstub", "armstub8.S")),
    ("RYTM MODS (patch files)", None, None),
    ("elekloader core (irpina and contributors)", "GNU GPL version 2 or later: licenses/GPL-2.0.txt. "
     "https://github.com/irpina/elekloader. The patchers' firmware codec is elekloader's, vendored there from "
     "digikit (Em D, GPL-2.0-or-later).", ""),
]

out = ["Third-party components in Sidecar | Expander binaries",
       "======================================================", "",
       "Our own code: GPL-2.0-or-later (LICENSE). Full licence texts: licenses/GPL-2.0.txt,",
       "licenses/GPL-3.0.txt, licenses/LGPL-2.1.txt. Each entry below names where the component is used,",
       "its licence, and its notice as it ships upstream.", ""]
for title, lic, body in sections:
    if lic is None:
        out += ["", "#" * 78, "# " + title, "#" * 78, ""]
        continue
    out += ["-" * 78, title, "Licence: " + lic, "-" * 78]
    if body:
        out += [body]
    out += [""]
with open(os.path.join(HERE, "THIRD_PARTY_LICENSES"), "w") as fh:
    fh.write("\n".join(out).rstrip() + "\n")
print("wrote THIRD_PARTY_LICENSES")
