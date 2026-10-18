#!/bin/sh
# Build the Teensy 4.1 release .hex from a rytm-teensy commit (compile only, never uploads) into dist/teensy/, and the
# starter user-machine packages (RMP1, Teensy) into dist/teensy/plugins/ with their SHA256SUMS and MIT notice.
#   scripts/package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT
# The checkout must have COMMIT checked out with no modified tracked files, and tools/release/teensy_hex.sh
# (rytm-teensy branch release-packaging; copy it in, untracked, if the commit predates it).
set -eu
co=${1:?usage: package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT}
commit=${2:?usage: package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT}
here=$(cd "$(dirname "$0")/.." && pwd)
PLUGINS="sc_acid sc_wavepad sc_metal sc_snare sc_pluck sc_grain"
rm -rf "$here/dist/teensy"                          # no hex of an earlier commit left next to the new one
"$co/tools/release/teensy_hex.sh" "$here/dist/teensy" "$commit"
out="$here/dist/teensy/plugins"
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
echo "wrote $out: $(ls "$out" | tr '\n' ' ')"
