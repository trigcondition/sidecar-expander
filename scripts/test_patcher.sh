#!/bin/sh
# Patch the stock .syx with both front ends (Python, and the browser patcher's JS core in
# Node) for every patch in public/patcher/patches, and compare each result with our build.
#   scripts/test_patcher.sh BUILD_DIR      (holds the stock .syx and *_<tag>.syx)
set -eu
here=$(cd "$(dirname "$0")/.." && pwd)
patcher="$here/public/patcher"
dir=${1:?usage: test_patcher.sh BUILD_DIR}
stock="$dir/Analog-Rytm_MKII_OS1.73.syx"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
fail=0
for p in "$patcher"/patches/sidecar-*.json; do
  tag=$(basename "$p" .json); tag=${tag#sidecar-}
  want="$dir/Analog-Rytm_MKII_OS1.73_$tag.syx"
  python3 "$patcher/sidecar_patch.py" "$stock" "$p" -o "$tmp/py.syx" >/dev/null
  node "$here/tests/node_patch.js" "$stock" "$p" "$tmp/js.syx" >/dev/null
  for fe in py js; do
    if cmp -s "$tmp/$fe.syx" "$want"; then echo "OK   $tag $fe: identical to $(basename "$want")"
    else echo "FAIL $tag $fe differs from $(basename "$want")"; fail=1; fi
  done
done
# a file that is not stock 1.73 must be refused, and nothing written
head -c 100000 "$stock" > "$tmp/bad.syx"
if python3 "$patcher/sidecar_patch.py" "$tmp/bad.syx" "$p" -o "$tmp/no.syx" 2>/dev/null || [ -e "$tmp/no.syx" ]; then
  echo "FAIL a wrong stock file was accepted"; fail=1
else echo "OK   a wrong stock file is refused"; fi
exit $fail
