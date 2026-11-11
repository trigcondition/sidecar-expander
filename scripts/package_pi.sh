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
#   TEST_SKIP_NET_CHECK=1  TEST ONLY, never for a release: accept kernels built without the release address (only
#                 that one check is skipped; BUILD-INFO-pi.txt then says so). Default off.
# The release kernels' built-in network: 169.254.61.60/16 (link-local, a direct cable), emuhost 169.254.61.59:7301.
# cmdline.txt is "sdport=0 socmaxtemp=78" (no boot-file writes over the network; the clock drops at 78 C, not 60 C;
# make-sd-dual.sh's default). No wifi.txt is shipped: Wi-Fi stays off until the
# tester adds one (the chip firmware for both boards is in firmware/). Also the web update file
# dist/pi/sidecar-<VERSION>.scu (+ .sha256) when the commit has tools/make_update.py. Never uploads or flashes anything.
# The web app (0.5.0): web-next's build of the same commit goes onto both card sets as /.rytm/www-next/, as
# `sdboot.py web` and the web update put it there (every file, plus a .gz beside each text file).
# The starter zip (0.5.0): dist/pi/sidecar-<VERSION>-starter.zip (+ .sha256), everything for one card in one zip: the
# 800x480 card set (with the starter content and the web app), every user machine and user effect of the release in
# /Plugins, the commit's free demo material (/MULTISAMPLE/SidecarTest, /NAM, renders of the sc_* starters in
# /Samples/Starter) and README-STARTER.txt / NOTICE-STARTER.txt; licences in /Licenses.
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
netcheck=1
if [ "${TEST_SKIP_NET_CHECK:-0}" = 1 ]; then
  netcheck=0; echo "TEST_SKIP_NET_CHECK=1: the release address check is SKIPPED (a test build, never a release)"
fi
for k in "$KERNEL" "$KERNEL5"; do
  [ $netcheck = 0 ] && break
  strings -a "$k" | grep -x '169.254.61.60' >/dev/null || { echo "$k is not built with the release address 169.254.61.60"; exit 1; }
done

# a zip of a folder, its files sorted, fixed dates (as make-sd-dual.sh makes the card zip)
mkzip() {
  python3 - "$1" "$2" <<'PY'
import os, sys, zipfile
src, z = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
    for dp, dns, fns in os.walk(src):
        dns.sort()
        for fn in sorted(fns):
            p = os.path.join(dp, fn)
            zi = zipfile.ZipInfo(os.path.relpath(p, src), date_time=(2026, 1, 1, 0, 0, 0))
            zi.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(zi, open(p, "rb").read())
PY
}
# nothing private in a tree that ships: no Finder / AppleDouble files, no pairing or Wi-Fi settings
shipcheck() {
  ! find "$1" \( -name '.DS_Store' -o -name '._*' -o -name 'pair.txt' -o -name 'pair.json' -o -name 'wifi.txt' \
    -o -name 'sidecar-wifi*' -o -name 'wpa*.conf' -o -name '*.client' -o -name '*.secret' \) | grep . \
    || { echo "$1: a private or Finder file is in it (above)"; exit 1; }
  ! grep -rIl 'paircode=' "$1" | grep . || { echo "$1: a pairing code setting is in it (above)"; exit 1; }
}

# the starter content (scripts/package_content.sh, from the same commit) on the card: /JUNO/Factory, /DX7 and its
# README / NOTICE as STARTER-CONTENT-README.txt / -NOTICE.txt
"$here/scripts/package_content.sh" "$wt" >/dev/null
csrc=$(ls -d "$here"/dist/content/sidecar-content-*/ | tail -1)

# the web app (web-next, 0.5.0) of the same commit: on both card sets as /.rytm/www-next/ (as `sdboot.py web` writes
# it: every file and a .gz beside each text file; pi/circle/sdboot.py web_files()) and in the web update file
web=""
if [ -f "$wt/web-next/package.json" ]; then
  ( cd "$wt/web-next" && npm ci --no-audit --no-fund >/dev/null && npm run build >/dev/null )
  web=$wt/web-next/dist
  python3 -c "import sys; sys.path.insert(0, sys.argv[1]); import sdboot; sdboot.web_files" "$wt/pi/circle" \
    || { echo "$full: web-next but no sdboot.py web_files(): cannot lay out /.rytm/www-next"; exit 1; }
else
  echo "$full has no web-next: no web app on the card"
fi

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
  if [ -n "$web" ]; then
    # /.rytm holds the web app only (no settings, no pairing): the zip is made again with it
    python3 - "$wt/pi/circle" "$web" "$sd/.rytm/www-next" <<'PY'
import os, sys
sys.path.insert(0, sys.argv[1])
import sdboot
for rel, b in sdboot.web_files(sys.argv[2]):
    p = os.path.join(sys.argv[3], rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "wb").write(b)
PY
    [ "$(ls -A "$sd/.rytm")" = www-next ] || { echo "$res: /.rytm holds more than www-next"; exit 1; }
    shipcheck "$sd"
    rm -f "$z"; mkzip "$sd" "$z"
  fi
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
if [ -n "$web" ]; then
  echo "web app: web-next of this commit in /.rytm/www-next on both card sets ($(find "$here/dist/pi/sd-800x480/.rytm/www-next" -type f | wc -l | tr -d ' ') files)" >> "$info"
fi
[ $netcheck = 1 ] || echo "TEST BUILD: the release address check was skipped (TEST_SKIP_NET_CHECK=1): not for release" >> "$info"

# the starter user machines as Pi packages (RMPA, AArch64, built in the rytm-circle image; the same files load on the
# Pi 4 and the Pi 5), next to the card set
out="$here/dist/pi/plugins"
mkdir -p "$out"
plugs=(sc_acid sc_wavepad sc_metal sc_snare sc_pluck sc_grain nusaw vox hush1 raffo sophie modele)   # sophie: 0.4.0; modele: 0.4.1
# 0.5.0 (Plugin API 3), when the commit has them: the user effects PINGPONG, PHASER and BBD, the user machine MIST
for p in ufx_pingpong ufx_phaser ufx_bbd mist; do [ -f "$wt/plugins/$p/Makefile" ] && plugs+=("$p"); done
for p in "${plugs[@]}"; do
  rm -f "$wt/plugins/$p/$p.a64.rmp" "$wt/plugins/$p/$p.a64.elf"
  make -C "$wt/plugins/$p" a64 PY=python3 >/dev/null
  [ "$(head -c 4 "$wt/plugins/$p/$p.a64.rmp")" = RMPA ] || { echo "$p.a64.rmp is not an RMPA package"; exit 1; }
  cp "$wt/plugins/$p/$p.a64.rmp" "$out/"
done
# MD is a built-in machine since 0.4.0 (core/md): the mdkit user machines (mdk_md, mdk_pi, mdk_efm, mdk_trx) are not
# shipped since 0.4.1; plugins/mdkit stays in the source for the built-in's tables
# MODEL E is GPL-2.0-or-later (ModelDigi's oscillators): its licence, notices and complete source beside the package,
# outside the zip's MIT LICENSE.txt (plugins/modele/README.md, make package)
make -C "$wt/plugins/modele" package PY=python3 >/dev/null
cmp -s "$wt/plugins/modele/out/modele.a64.rmp" "$out/modele.a64.rmp" || { echo "modele: make package built another package"; exit 1; }
cp "$wt/plugins/modele/out/LICENSE.txt" "$out/modele-LICENSE.txt"
cp "$wt/plugins/modele/out/NOTICE.txt" "$out/modele-NOTICE.txt"
cp "$wt/plugins/modele/out/modele-source.tar.gz" "$out/"
# MIST is built from Beads (MIT, Emilie Gillet): its licences (ours, Beads', stmlib's) and notice beside the package
if [ -f "$out/mist.a64.rmp" ]; then
  make -C "$wt/plugins/mist" package PY=python3 >/dev/null
  cmp -s "$wt/plugins/mist/out/mist.a64.rmp" "$out/mist.a64.rmp" || { echo "mist: make package built another package"; exit 1; }
  cp "$wt/plugins/mist/out/LICENSE.txt" "$out/mist-LICENSE.txt"
  cp "$wt/plugins/mist/out/NOTICE.txt" "$out/mist-NOTICE.txt"
fi
! ls "$out"/mdk*.rmp >/dev/null 2>&1 || { echo "an mdkit user machine is in the package (MD is built in)"; exit 1; }
# the internal test plugins (rytm.sine_test, rytm.fault_test: crashes on purpose) must never ship
! grep -l -a -E 'rytm\.(sine|fault|state|v2)_test|fault_test|sine_test' "$out"/*.rmp || { echo "a test plugin is in the package"; exit 1; }
cp "$here/scripts/plugins-LICENSE.txt" "$out/LICENSE.txt"
( cd "$out" && shasum -a 256 *.rmp *.tar.gz > SHA256SUMS )
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

# the web update file (0.5.0, rytm-teensy docs/web-update.md): both kernels and the web app (web-next's build) in one
# sidecar-<VERSION>.scu for Settings > Update on the web page; tools/make_update.py --release refuses -dirty kernels,
# kernels without the release address or the update stamp, and kernels of two commits. Older commits have no
# make_update.py: no file then.
if [ -f "$wt/tools/make_update.py" ]; then
  [ -n "$web" ] || { echo "$full: make_update.py but no web-next"; exit 1; }
  scu="sidecar-$ver.scu"
  python3 "$wt/tools/make_update.py" --pi4 "$KERNEL" --pi5 "$KERNEL5" --web "$web" --release --version "$ver" \
    --out "$here/dist/pi/$scu"
  python3 "$wt/tools/make_update.py" --check "$here/dist/pi/$scu"
  ( cd "$here/dist/pi" && shasum -a 256 "$scu" > "$scu.sha256" )
  echo "web update file: $scu sha256 $(cut -d' ' -f1 "$here/dist/pi/$scu.sha256")" >> "$info"
else
  echo "$full has no tools/make_update.py: no web update file"
fi

# the starter zip (0.5.0): one zip with everything for a new card, unzipped onto a FAT32 card as it is. The 800x480
# card set (also DSI or no display; a 1024x600 HDMI display: the hdmi_cvt lines in config.txt, or the 1024x600 card
# zip), every user machine and user effect in /Plugins (licences in /Licenses/plugins), and the commit's free demo
# material: /MULTISAMPLE/SidecarTest (CC0, tools/make_multisample_test.py), /NAM (NeuralAmpModelerCore's A2-Lite test
# capture, MIT), /Samples/Starter (one-shots of the six sc_* starters rendered by plugins/sc_render.py, MIT: ours).
# Nothing from outside the commit.
st="$here/dist/pi/.starter"; rm -rf "$st"; mkdir -p "$st/Plugins" "$st/Licenses/plugins" "$st/Samples/Starter"
cp -R "$here/dist/pi/sd-800x480/." "$st/"
cp "$out"/*.rmp "$st/Plugins/"
cp "$out/LICENSE.txt" "$st/Licenses/plugins/"
for f in "$out"/*-LICENSE.txt "$out"/*-NOTICE.txt "$out"/*-source.tar.gz; do [ -f "$f" ] && cp "$f" "$st/Licenses/plugins/"; done
notice=()   # the demo material's lines for NOTICE-STARTER.txt
if [ -d "$wt/content/MULTISAMPLE/SidecarTest" ]; then
  mkdir -p "$st/MULTISAMPLE"; cp -R "$wt/content/MULTISAMPLE/SidecarTest" "$st/MULTISAMPLE/"
  head -2 "$wt/content/MULTISAMPLE/SidecarTest/SidecarTest.sfz" | grep -q 'CC0' || { echo "SidecarTest.sfz does not say CC0"; exit 1; }
  notice+=("/MULTISAMPLE/SidecarTest/: the MULTISAMPLE machine's test instrument (5 keys x 2 layers and a release
  sample), synthesised by the firmware's tools/make_multisample_test.py. Public domain: CC0 1.0
  (https://creativecommons.org/publicdomain/zero/1.0/).")
fi
namb="$wt/third_party/nam/embedded/weights/a2lite.namb"
if [ -f "$namb" ]; then
  mkdir -p "$st/NAM" "$st/Licenses/NAM"
  cp "$namb" "$st/NAM/NAMCore-A2Lite-test.namb"
  cp "$wt/third_party/nam/embedded/NOTICE" "$st/Licenses/NAM/NOTICE.txt"
  notice+=("/NAM/NAMCore-A2Lite-test.namb: an A2-Lite capture for INSERT AMP: NeuralAmpModelerCore's A2-Lite test
  model as TONE3000's embedded repository ships it (weights/a2lite.namb). It shows that AMP loads a capture; it is
  a test model, not a recording of a particular amplifier. MIT, Copyright (c) 2023 Steven Atkinson
  (/Licenses/NAM/NOTICE.txt).")
fi
if [ -f "$wt/plugins/sc_render.py" ]; then
  # the Mac builds of the six starters, rendered at their test note (1.5 s, 48 kHz mono, note off at 0.5 s)
  scs=(sc_acid sc_wavepad sc_metal sc_snare sc_pluck sc_grain)
  for p in "${scs[@]}"; do make -C "$wt/plugins/$p" "lib$p.dylib" PY=python3 >/dev/null; done
  py=(python3); python3 -c 'import numpy' 2>/dev/null || py=(uv run -q --no-project --with numpy python3)
  "${py[@]}" "$wt/plugins/sc_render.py" "${scs[@]}" >/dev/null || { echo "plugins/sc_render.py: a render check failed"; exit 1; }
  for p in "${scs[@]}"; do cp "$wt/plugins/build-wav/$p.wav" "$st/Samples/Starter/$(echo "${p#sc_}" | tr a-z A-Z) one-shot.wav"; done
  notice+=("/Samples/Starter/*.wav: one-shots of the six starter user machines (ACID, WAVEPAD, METAL, SNARE, PLUCK,
  GRAIN), rendered from their source by the firmware's plugins/sc_render.py. MIT, Copyright 2026 trigcondition and
  contributors (/Licenses/plugins/LICENSE.txt; GRAIN's built-in texture is CC0, see there).")
fi
cat > "$st/Samples/Starter/README.txt" <<EOF
Sidecar $ver starter: demo samples

The one-shots here (if any) are rendered by the Sidecar's own starter user machines; NOTICE-STARTER.txt at the card's
root says where every file comes from. More free demo samples go into this folder in later releases. Your own
samples can go anywhere under /Samples.
EOF
{
cat <<EOF
Sidecar $ver starter zip: where every file comes from

Everything in this zip is free to share. The Sidecar's own files: MIT, Copyright 2026 trigcondition and contributors.

The card set (as in sidecar-pi-sd-*-800x480.zip): the Raspberry Pi boot firmware (LICENCE.broadcom, COPYING.linux),
the Wi-Fi chip firmware (firmware/NOTICE), the engine, sdboot and the web app (/.rytm/www-next: the Sidecar's web
page, built from the firmware's web-next), the starter content /JUNO/Factory and /DX7 (STARTER-CONTENT-NOTICE.txt).

/Plugins/*.rmp: the release's user machines and user effects, the same files as sidecar-pi-plugins-$ver.zip. Their
licences are in /Licenses/plugins/: LICENSE.txt (MIT, with the notices of the code they build on); MODEL E is
GPL-2.0-or-later (modele-LICENSE.txt, modele-NOTICE.txt, its complete source modele-source.tar.gz); MIST, if present,
has mist-LICENSE.txt and mist-NOTICE.txt (Beads by Emilie Gillet, MIT).

EOF
for n in "${notice[@]}"; do echo "$n"; echo; done
echo "source commit: $full"
} > "$st/NOTICE-STARTER.txt"
cat > "$st/README-STARTER.txt" <<EOF
Sidecar $ver starter: everything for a new SD card in one zip

1. Format a microSD card as FAT32 with one partition (MBR).
2. Unzip this zip and copy everything in it to the card's top level, including the folder .rytm (the web app):
   it is hidden on a Mac (Finder: Cmd+Shift+. shows it) and on Linux. Without it the Sidecar serves its classic
   web page instead.
3. Put the card in the Raspberry Pi 4B or Pi 5 and switch it on.

The card set is the 800x480 one (an 800x480 HDMI display, a DSI display or none). A 1024x600 HDMI display: change
both hdmi_cvt lines in config.txt to "hdmi_cvt=1024 600 60 6 0 0 0", or use sidecar-pi-sd-*-1024x600.zip.
What is where: /Plugins (user machines and effects: load them in a U1..U5 slot or a send FX slot), /JUNO, /DX7,
/MULTISAMPLE (an instrument), /NAM (a capture for INSERT AMP), /Samples/Starter (demo one-shots), /Licenses.
NOTICE-STARTER.txt lists where every file comes from. The install guide: INSTALL-PI.md in the sidecar-expander
repository.
EOF
shipcheck "$st"
[ "$(ls -A "$st/.rytm" 2>/dev/null)" = www-next ] || [ -z "$web" ] || { echo "starter: /.rytm holds more than www-next"; exit 1; }
sz="sidecar-$ver-starter.zip"
mkzip "$st" "$here/dist/pi/$sz"
( cd "$here/dist/pi" && shasum -a 256 "$sz" > "$sz.sha256" )
echo "starter zip: $sz sha256 $(cut -d' ' -f1 "$here/dist/pi/$sz.sha256") ($(find "$st" -type f | wc -l | tr -d ' ') files)" >> "$info"
rm -rf "$st"
echo "dist/pi from rytm-teensy $full (worktree $wt)"
