#!/bin/bash
# Build and assemble the Sidecar SD card file set for the Raspberry Pi 4B AND the Raspberry Pi 5 (one card for both:
# dist/pi/sd/, dist/pi/sidecar-pi-sd-<commit>.zip and BUILD-INFO-pi.txt) from a rytm-teensy commit, reproducibly: a
# detached worktree at COMMIT, the Pi 4 kernel, sdboot and the Pi 5 kernel built there in Docker, then the card
# (rytm-teensy's pi/circle/make-sd-dual.sh, docs/pi5.md "One card for both"; the pi5 branch or later).
#   scripts/package_pi.sh RYTM_TEENSY_REPO COMMIT
# Rerun with a new COMMIT after a fix: the worktree is moved to it and everything is rebuilt.
# Environment (all optional):
#   WORKTREE      the build worktree (default: <repo>/../worktrees/rytm-teensy-pi-dual, or <repo>/../ without a
#                 worktrees/ folder there); created or reset to COMMIT, never one
#                 with modified tracked files (0.1.0's Pi 4-only worktree, rytm-teensy-pi-release, is left alone)
#   CIRCLE_BUILD  the Circle build tree (default: the repo's main checkout pi/circle/build), as pi/engine/build.sh;
#                 needs circle-engine (Pi 4) and circle-engine-pi5 (made by the first RASPPI=5 build)
#   KERNEL        use this Pi 4 kernel8-rpi4.img instead of building one
#   KERNEL5       use this Pi 5 kernel_2712.img instead of building one
#   SDBOOT        use this sdboot.img instead of building one
#   (make-sd-dual.sh refuses kernels whose version stamps differ or are -dirty, so both come from one clean commit)
# The release kernels' built-in network: 169.254.61.60/16 (link-local, a direct cable), emuhost 169.254.61.59:7301.
# cmdline.txt is "sdport=0" (no boot-file writes over the network). No wifi.txt is shipped: Wi-Fi stays off until the
# tester adds one (the chip firmware for both boards is in firmware/). Never uploads or flashes anything.
set -euo pipefail
repo=${1:?usage: package_pi.sh RYTM_TEENSY_REPO COMMIT}
commit=${2:?usage: package_pi.sh RYTM_TEENSY_REPO COMMIT}
here=$(cd "$(dirname "$0")/.." && pwd)
full=$(git -C "$repo" rev-parse "$commit^{commit}")
main=$(git -C "$repo" worktree list --porcelain | sed -n '1s/^worktree //p')
wtdir=$(cd "$main/.." && pwd); [ -d "$wtdir/worktrees" ] && wtdir=$wtdir/worktrees   # where the worktrees live
wt=${WORKTREE:-$wtdir/rytm-teensy-pi-dual}
export CIRCLE_BUILD=${CIRCLE_BUILD:-$main/pi/circle/build}
[ -d "$CIRCLE_BUILD/circle-engine" ] || { echo "no Circle tree in $CIRCLE_BUILD (pi/circle/build.sh, pi/engine/build.sh)"; exit 1; }

if [ -d "$wt" ]; then
  git -C "$wt" diff --quiet HEAD -- || { echo "$wt has modified tracked files: not touching it"; exit 1; }
  git -C "$wt" checkout -q --detach "$full"
else
  git -C "$repo" worktree add -q --detach "$wt" "$full"
fi
[ -x "$wt/pi/circle/make-sd-dual.sh" ] || { echo "$full has no pi/circle/make-sd-dual.sh (the pi5 branch or later)"; exit 1; }

NET=(PI_IP=169.254.61.60 PI_NETMASK=255.255.0.0 EMUHOST=169.254.61.59:7301)
if [ -z "${KERNEL:-}" ]; then
  env "${NET[@]}" RASPPI=4 "$wt/pi/engine/build.sh" kernel
  KERNEL=$wt/pi/engine/kernel8-rpi4.img
fi
if [ -z "${SDBOOT:-}" ]; then
  "$wt/pi/circle/build-sdboot.sh"
  SDBOOT=$wt/pi/circle/out/sdboot.img
fi
if [ -z "${KERNEL5:-}" ]; then
  env "${NET[@]}" RASPPI=5 "$wt/pi/engine/build.sh" kernel   # the Pi 4 objects go (hosted/.board); its .img stays
  KERNEL5=$wt/pi/engine/kernel_2712.img
fi
for k in "$KERNEL" "$KERNEL5"; do
  strings -a "$k" | grep -x '169.254.61.60' >/dev/null || { echo "$k is not built with the release address 169.254.61.60"; exit 1; }
done

# the starter content (scripts/package_content.sh, from the same commit) on the card: /JUNO/Factory, /DX7 and its
# README / NOTICE as STARTER-CONTENT-README.txt / -NOTICE.txt
"$here/scripts/package_content.sh" "$wt" >/dev/null
csrc=$(ls -d "$here"/dist/content/sidecar-content-*/ | tail -1)

rm -rf "$here/dist/pi"; mkdir -p "$here/dist/pi"
OUT="$here/dist/pi" CONTENT="${csrc%/}" CMDLINE="sdport=0" "$wt/pi/circle/make-sd-dual.sh" "$KERNEL" "$SDBOOT" "$KERNEL5"
mv "$here/dist/pi/sidecar-sd" "$here/dist/pi/sd"
echo "source commit: $full" >> "$here/dist/pi/BUILD-INFO-pi.txt"
echo "starter content: $(basename "$csrc") added to the card set" >> "$here/dist/pi/BUILD-INFO-pi.txt"
grep -qx 'sdport=0' "$here/dist/pi/sd/cmdline.txt" || { echo "cmdline.txt is not sdport=0"; exit 1; }
! find "$here/dist/pi/sd" \( -name 'wifi.txt' -o -name 'sidecar-wifi*' -o -name 'wpa*.conf' -o -name '.rytm' \) | grep -q . \
  || { echo "a Wi-Fi settings file is in the card set"; exit 1; }

# the starter user machines as Pi packages (RMPA, AArch64, built in the rytm-circle image; the same files load on the
# Pi 4 and the Pi 5), next to the card set
out="$here/dist/pi/plugins"
mkdir -p "$out"
for p in sc_acid sc_wavepad sc_metal sc_snare sc_pluck sc_grain nusaw; do
  rm -f "$wt/plugins/$p/$p.a64.rmp" "$wt/plugins/$p/$p.a64.elf"
  make -C "$wt/plugins/$p" a64 PY=python3 >/dev/null
  [ "$(head -c 4 "$wt/plugins/$p/$p.a64.rmp")" = RMPA ] || { echo "$p.a64.rmp is not an RMPA package"; exit 1; }
  cp "$wt/plugins/$p/$p.a64.rmp" "$out/"
done
# the internal test plugins (rytm.sine_test, rytm.fault_test: crashes on purpose) must never ship
! grep -l -a -E 'rytm\.(sine|fault|state|v2)_test|fault_test|sine_test' "$out"/*.rmp || { echo "a test plugin is in the package"; exit 1; }
cp "$here/scripts/plugins-LICENSE.txt" "$out/LICENSE.txt"
( cd "$out" && shasum -a 256 *.rmp > SHA256SUMS )
echo "source commit: $full" > "$out/BUILD-INFO-plugins.txt"
echo "dist/pi from rytm-teensy $full (worktree $wt)"
