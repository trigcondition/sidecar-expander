#!/bin/bash
# Build and assemble the Sidecar SD card file sets for the Raspberry Pi 4B AND the Raspberry Pi 5 (each one card for
# both boards), one per HDMI display size (0.3.0): dist/pi/sd-800x480/ and dist/pi/sd-1024x600/, the zips
# dist/pi/sidecar-pi-sd-<commit>-800x480.zip and -1024x600.zip (each with its .sha256) and BUILD-INFO-pi.txt (the
# 800x480 card: also DSI or no display; the two differ only in config.txt's HDMI mode) from a rytm-teensy commit, reproducibly: a
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
# cmdline.txt is "sdport=0 socmaxtemp=78" (no boot-file writes over the network; the clock drops at 78 C, not 60 C;
# make-sd-dual.sh's default). No wifi.txt is shipped: Wi-Fi stays off until the
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
CMDLINE="sdport=0 socmaxtemp=78"
info="$here/dist/pi/BUILD-INFO-pi.txt"
for res in 800x480 1024x600; do
  tmp="$here/dist/pi/.card-$res"; mkdir -p "$tmp"
  OUT="$tmp" CONTENT="${csrc%/}" CMDLINE="$CMDLINE" HDMI_RES=$res "$wt/pi/circle/make-sd-dual.sh" "$KERNEL" "$SDBOOT" "$KERNEL5"
  sd="$here/dist/pi/sd-$res"
  mv "$tmp/sidecar-sd" "$sd"
  grep -qx "$CMDLINE" "$sd/cmdline.txt" || { echo "$res: cmdline.txt is not '$CMDLINE'"; exit 1; }
  grep -qx "hdmi_cvt=${res%x*} ${res#*x} 60 6 0 0 0" "$sd/config.txt" || { echo "$res: config.txt has not the $res HDMI mode"; exit 1; }
  ! find "$sd" \( -name 'wifi.txt' -o -name 'sidecar-wifi*' -o -name 'wpa*.conf' -o -name '.rytm' \) | grep -q . \
    || { echo "a Wi-Fi settings file is in the card set"; exit 1; }
  z=$(ls "$tmp"/sidecar-pi-sd-*.zip); zn=$(basename "${z%.zip}")-$res.zip
  mv "$z" "$here/dist/pi/$zn"
  ( cd "$here/dist/pi" && shasum -a 256 "$zn" > "$zn.sha256" )
  if [ $res = 800x480 ]; then
    sed 's/^Sidecar | Expander, Raspberry Pi 4B and Raspberry Pi 5 SD card (one card for both)$/&: two card sets, 800x480 and 1024x600/' \
      "$tmp/BUILD-INFO-pi.txt" > "$info"
  fi
  echo "card $zn: config.txt sha256 $(shasum -a 256 "$sd/config.txt" | cut -d' ' -f1) (HDMI ${res})" >> "$info"
  rm -rf "$tmp"
done
echo "source commit: $full" >> "$info"
echo "starter content: $(basename "$csrc") added to both card sets" >> "$info"

# the starter user machines as Pi packages (RMPA, AArch64, built in the rytm-circle image; the same files load on the
# Pi 4 and the Pi 5), next to the card set
out="$here/dist/pi/plugins"
mkdir -p "$out"
for p in sc_acid sc_wavepad sc_metal sc_snare sc_pluck sc_grain nusaw vox hush1 raffo; do
  rm -f "$wt/plugins/$p/$p.a64.rmp" "$wt/plugins/$p/$p.a64.elf"
  make -C "$wt/plugins/$p" a64 PY=python3 >/dev/null
  [ "$(head -c 4 "$wt/plugins/$p/$p.a64.rmp")" = RMPA ] || { echo "$p.a64.rmp is not an RMPA package"; exit 1; }
  cp "$wt/plugins/$p/$p.a64.rmp" "$out/"
done
# MD (mdkit's 30 drum voices in one machine, CC0 1.0; Pi only): plugins/mdkit, FAM=md -> mdk_md.a64.rmp
rm -f "$wt/plugins/mdkit/mdk_md.a64.rmp" "$wt/plugins/mdkit/mdk_md.a64.elf"
make -C "$wt/plugins/mdkit" FAM=md a64 PY=python3 >/dev/null
[ "$(head -c 4 "$wt/plugins/mdkit/mdk_md.a64.rmp")" = RMPA ] || { echo "mdk_md.a64.rmp is not an RMPA package"; exit 1; }
cp "$wt/plugins/mdkit/mdk_md.a64.rmp" "$out/"
# the internal test plugins (rytm.sine_test, rytm.fault_test: crashes on purpose) must never ship
! grep -l -a -E 'rytm\.(sine|fault|state|v2)_test|fault_test|sine_test' "$out"/*.rmp || { echo "a test plugin is in the package"; exit 1; }
cp "$here/scripts/plugins-LICENSE.txt" "$out/LICENSE.txt"
( cd "$out" && shasum -a 256 *.rmp > SHA256SUMS )
echo "source commit: $full" > "$out/BUILD-INFO-plugins.txt"
# the release zip: sidecar-pi-plugins-<VERSION>.zip (the packages, LICENSE.txt, SHA256SUMS, BUILD-INFO; fixed dates)
ver=$(cat "$wt/VERSION")
python3 - "$out" "$here/dist/pi/sidecar-pi-plugins-$ver.zip" <<'PY'
import os, sys, zipfile
src, z = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
    for fn in sorted(os.listdir(src)):
        zi = zipfile.ZipInfo(fn, date_time=(2026, 1, 1, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED
        zf.writestr(zi, open(os.path.join(src, fn), "rb").read())
PY
echo "dist/pi from rytm-teensy $full (worktree $wt)"
