#!/bin/bash
# Build and assemble the Pi 4B SD card file set (dist/pi/sd/, a zip and BUILD-INFO-pi.txt) from a rytm-teensy commit,
# reproducibly: a detached worktree at COMMIT, the kernel and sdboot built there in Docker, then the card.
#   scripts/package_pi.sh RYTM_TEENSY_REPO COMMIT
# Rerun with a new COMMIT after a fix (e.g. fixes-1021): the worktree is moved to it and everything is rebuilt.
# Environment (all optional):
#   WORKTREE      the build worktree (default: <repo>/../rytm-teensy-pi-release); created or reset to COMMIT,
#                 never one with modified tracked files
#   CIRCLE_BUILD  the Circle build tree (default: the repo's main checkout pi/circle/build), as pi/engine/build.sh
#   KERNEL        use this kernel8-rpi4.img instead of building one (then COMMIT only labels it)
#   SDBOOT        use this sdboot.img instead of building one
# The release kernel's built-in network: 169.254.61.60/16 (link-local, a direct cable), emuhost 169.254.61.59:7301.
# cmdline.txt is "sdport=0" (no boot-file writes over the network). No wifi.txt is shipped: Wi-Fi stays off until the
# tester adds one. Never uploads or flashes anything.
set -euo pipefail
repo=${1:?usage: package_pi.sh RYTM_TEENSY_REPO COMMIT}
commit=${2:?usage: package_pi.sh RYTM_TEENSY_REPO COMMIT}
here=$(cd "$(dirname "$0")/.." && pwd)
full=$(git -C "$repo" rev-parse "$commit^{commit}")
main=$(git -C "$repo" worktree list --porcelain | sed -n '1s/^worktree //p')
wt=${WORKTREE:-$(cd "$main/.." && pwd)/rytm-teensy-pi-release}
export CIRCLE_BUILD=${CIRCLE_BUILD:-$main/pi/circle/build}
[ -d "$CIRCLE_BUILD/circle-engine" ] || { echo "no Circle tree in $CIRCLE_BUILD (pi/circle/build.sh, pi/engine/build.sh)"; exit 1; }

if [ -d "$wt" ]; then
  git -C "$wt" diff --quiet HEAD -- || { echo "$wt has modified tracked files: not touching it"; exit 1; }
  git -C "$wt" checkout -q --detach "$full"
else
  git -C "$repo" worktree add -q --detach "$wt" "$full"
fi
# pi_card.py lives on rytm-teensy's release-packaging branch; a commit that predates it gets that branch's copy
if [ ! -f "$wt/tools/release/pi_card.py" ]; then
  mkdir -p "$wt/tools/release"
  git -C "$repo" show release-packaging:tools/release/pi_card.py > "$wt/tools/release/pi_card.py"
fi

if [ -z "${KERNEL:-}" ]; then
  PI_IP=169.254.61.60 PI_NETMASK=255.255.0.0 EMUHOST=169.254.61.59:7301 "$wt/pi/engine/build.sh" kernel
  KERNEL=$wt/pi/engine/kernel8-rpi4.img
fi
if [ -z "${SDBOOT:-}" ]; then
  "$wt/pi/circle/build-sdboot.sh"
  SDBOOT=$wt/pi/circle/out/sdboot.img
fi
strings -a "$KERNEL" | grep -x '169.254.61.60' >/dev/null || { echo "$KERNEL is not built with the release address 169.254.61.60"; exit 1; }

rm -rf "$here/dist/pi"; mkdir -p "$here/dist/pi"
python3 "$wt/tools/release/pi_card.py" "$here/dist/pi" --commit "$full" --kernel "$KERNEL" --sdboot "$SDBOOT" \
  --fw "$CIRCLE_BUILD/fw" --cmdline "sdport=0"
[ ! -e "$here/dist/pi/sd/wifi.txt" ] && [ ! -e "$here/dist/pi/sd/.rytm" ] || { echo "a Wi-Fi file is in the card set"; exit 1; }
grep -qx 'sdport=0' "$here/dist/pi/sd/cmdline.txt" || { echo "cmdline.txt is not sdport=0"; exit 1; }

# the starter user machines as Pi packages (RMPA, built in the rytm-circle image), next to the card set
out="$here/dist/pi/plugins"
mkdir -p "$out"
for p in sc_acid sc_wavepad sc_metal sc_snare sc_pluck sc_grain; do
  rm -f "$wt/plugins/$p/$p.a64.rmp" "$wt/plugins/$p/$p.a64.elf"
  make -C "$wt/plugins/$p" a64 PY=python3 >/dev/null
  [ "$(head -c 4 "$wt/plugins/$p/$p.a64.rmp")" = RMPA ] || { echo "$p.a64.rmp is not an RMPA package"; exit 1; }
  cp "$wt/plugins/$p/$p.a64.rmp" "$out/"
done
cp "$here/scripts/plugins-LICENSE.txt" "$out/LICENSE.txt"
( cd "$out" && shasum -a 256 *.rmp > SHA256SUMS )
echo "source commit: $full" > "$out/BUILD-INFO-plugins.txt"
echo "dist/pi from rytm-teensy $full (worktree $wt)"
