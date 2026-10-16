#!/bin/sh
# Assemble the Pi 4B SD card file set (dist/pi/sd/ and a zip) from a rytm-teensy build.
#   scripts/package_pi.sh RYTM_TEENSY_CHECKOUT COMMIT [KERNEL] [SDBOOT] [FWDIR]
# KERNEL defaults to <checkout>/pi/engine/kernel8-rpi4.img, SDBOOT to <checkout>/pi/circle/out/sdboot.img, FWDIR to
# <checkout>/pi/circle/build/fw (start4.elf etc. and armstub8-rpi4.bin; missing firmware files are downloaded from
# the pinned raspberrypi/firmware commit). cmdline.txt is "sdport=0".
set -eu
co=${1:?usage: package_pi.sh RYTM_TEENSY_CHECKOUT COMMIT [KERNEL] [SDBOOT] [FWDIR]}
commit=${2:?}
here=$(cd "$(dirname "$0")/.." && pwd)
python3 "$co/tools/release/pi_card.py" "$here/dist/pi" --commit "$(git -C "$co" rev-parse "$commit^{commit}")" \
  --kernel "${3:-$co/pi/engine/kernel8-rpi4.img}" --sdboot "${4:-$co/pi/circle/out/sdboot.img}" \
  --fw "${5:-$co/pi/circle/build/fw}"
