#!/bin/bash
# Build the Sidecar Mini (Teensy 4.1) release .hex from a rytm-teensy commit (compile only, never uploads) into
# dist/teensy/, and the starter user-machine packages (RMP1) into dist/teensy/plugins/ with SHA256SUMS and the MIT notice.
#   scripts/package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT
# Environment (optional):
#   BUILD  stereo (default): the release build, teensy/host_stereo.sh's flags (USB host + stereo USB audio + USB MIDI,
#          RMP_CORE=uac2), read from the checkout's host_stereo.sh; host: the plain USB-host build (RYTM_USB_HOST=1).
#   OUT    the output folder (default dist/teensy).
# The checkout must have COMMIT checked out with no modified tracked files. tools/release/teensy_hex.sh comes from
# rytm-teensy's release-packaging branch when the commit predates it (an untracked copy, removed again afterwards).
set -euo pipefail
co=${1:?usage: package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT}
commit=${2:?usage: package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT}
here=$(cd "$(dirname "$0")/.." && pwd)
out_hex=${OUT:-$here/dist/teensy}
build=${BUILD:-stereo}
PLUGINS="sc_acid sc_wavepad sc_metal sc_snare sc_pluck sc_grain"

hexsh="$co/tools/release/teensy_hex.sh"
made=()
cleanup() { [ ${#made[@]} -eq 0 ] || rm -f "${made[@]}"; }
if [ ! -f "$hexsh" ]; then
  mkdir -p "$co/tools/release"
  git -C "$co" show release-packaging:tools/release/teensy_hex.sh > "$hexsh"; chmod +x "$hexsh"; made+=("$hexsh")
fi
# a copy of teensy_hex.sh that also takes run_sketch.sh's newer port line ("[ "$RMP_NO_UPLOAD" = 1 ] || PORT=$(...)")
run="$co/tools/release/.teensy_hex_release.sh"; made+=("$run")
trap cleanup EXIT
python3 - "$hexsh" "$run" <<'PY'
import sys
s = open(sys.argv[1]).read()
a = r"s#^PORT=\$(.*board list.*$#PORT=none#"
assert a in s, "teensy_hex.sh changed shape (its PORT line): update scripts/package_teensy.sh"
open(sys.argv[2], "w").write(s.replace(a, r"s#^.*PORT=\$(.*board list.*$#PORT=none#"))
PY
chmod +x "$run"
if [ "$build" = stereo ]; then
  # host_stereo.sh's RMP_EXTRA_FLAGS (one quoted string over several lines) and RMP_CORE, put into a copy of teensy_hex.sh
  flags=$(python3 - "$co/teensy/host_stereo.sh" <<'PY'
import re, sys
s = open(sys.argv[1]).read()
m = re.search(r'RMP_EXTRA_FLAGS="(.*?)\$\{HOST_STEREO_FLAGS', s, re.S)
assert m and "RMP_CORE=uac2" in s, "host_stereo.sh changed shape: update scripts/package_teensy.sh"
print(" ".join(m.group(1).replace("\\\n", " ").split()))
PY
)
  src="$run"; run="$co/tools/release/.teensy_hex_stereo.sh"; made+=("$run")
  sed -e "s#^FLAGS=.*#FLAGS=\"$flags\"#" -e 's#^\(RMP_EXTRA_FLAGS="\$FLAGS" bash\)#RMP_CORE=uac2 \1#' \
      -e 's#USB-host build of teensy/voiceloop#Sidecar Mini release build (host_stereo.sh) of teensy/voiceloop#' \
      -e 's#^  echo "Sidecar | Expander, Teensy 4.1 USB-host build"#  echo "Sidecar Mini (Teensy 4.1), release build (host_stereo.sh: USB host + stereo USB audio + USB MIDI)"#' \
      "$src" > "$run"
  chmod +x "$run"
  grep -q '^RMP_CORE=uac2 RMP_EXTRA_FLAGS="\$FLAGS" bash' "$run" || { echo "teensy_hex.sh changed shape: update scripts/package_teensy.sh"; exit 1; }
fi

rm -rf "$out_hex"                                    # no hex of an earlier commit left next to the new one
"$run" "$out_hex" "$commit"
out="$out_hex/plugins"
rm -rf "$out"; mkdir -p "$out"
for p in $PLUGINS; do
  rm -f "$co/plugins/$p/$p.rmp"                     # always rebuilt from this commit's sources
  make -C "$co/plugins/$p" "$p.rmp" >/dev/null
  [ "$(head -c 4 "$co/plugins/$p/$p.rmp")" = RMP1 ] || { echo "$p.rmp is not an RMP1 package"; exit 1; }
  cp "$co/plugins/$p/$p.rmp" "$out/"
done
# the internal test plugins (rytm.sine_test, rytm.fault_test: crashes on purpose) must never ship
! grep -l -a -E 'rytm\.(sine|fault|state|v2)_test|fault_test|sine_test' "$out"/*.rmp || { echo "a test plugin is in the package"; exit 1; }
cp "$here/scripts/plugins-LICENSE.txt" "$out/LICENSE.txt"
( cd "$out" && shasum -a 256 *.rmp > SHA256SUMS )
echo "source commit: $(git -C "$co" rev-parse HEAD)" > "$out/BUILD-INFO-plugins.txt"
echo "wrote $out_hex ($build build): $(ls "$out_hex" | tr '\n' ' ')"
