#!/bin/sh
# Patch the stock .syx with both front ends (Python, and the browser patcher's JS core in
# Node) for every patch in public/patcher/patches, and compare each result with our build.
#   scripts/test_patcher.sh BUILD_DIR      (holds the stock .syx files and <stock name>_<tag>.syx)
set -eu
# no __pycache__ in public/patcher: a .pyc holds its source's absolute path, and public/ is the site
export PYTHONDONTWRITEBYTECODE=1
here=$(cd "$(dirname "$0")/.." && pwd)
patcher="$here/public/patcher"
dir=${1:?usage: test_patcher.sh BUILD_DIR}
first="$dir/Analog-Rytm_MKII_OS1.73.syx"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
fail=0
for p in "$patcher"/patches/sidecar-*.json; do
  tag=$(basename "$p" .json); tag=${tag#sidecar-}
  name=$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(d["stock"].get("name", "Analog-Rytm_MKII_OS1.73.syx"), d["output"]["name"])' "$p")
  stock="$dir/${name%% *}"; want="$dir/${name##* }"
  [ -e "$stock" ] || { echo "SKIP $tag: no $(basename "$stock") in $dir"; continue; }
  if [ ! -e "$want" ]; then
    # no build to compare with: still check the records rebuild the patch's image
    if python3 -c 'import sys; sys.path.insert(0, sys.argv[1]); import sidecar_patch as s
d = s.load_patch(sys.argv[3])
st, out = d["stock"], d["output"]; x = s.Syx(open(sys.argv[2], "rb").read())
secs = {k: x.section(k) for k in x.stored}; img = bytearray(secs[st["main_section"]]) + bytearray(out["main_len"] - st["main_len"])
for op in d["ops"]:
    if len(op) == 2: b = bytes.fromhex(op[1]); img[op[0]:op[0] + len(b)] = b
    else: img[op[0]:op[0] + op[2]] = secs[op[3] if len(op) > 3 else st["main_section"]][op[1]:op[1] + op[2]]
assert s.sha(bytes(img)) == out["main_sha256"] and out.get("packer", "lz1") in s.PACKERS' "$patcher" "$stock" "$p"; then
      echo "SKIP $tag: no $(basename "$want") in $dir to compare with (its records apply, packer $(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["output"].get("packer", "lz1"))' "$p"))"
    else echo "FAIL $tag: its records do not rebuild its image"; fail=1; fi
    continue
  fi
  rm -f "$tmp/py.syx" "$tmp/js.syx"
  python3 "$patcher/sidecar_patch.py" "$stock" "$p" -o "$tmp/py.syx" >/dev/null || true
  node "$here/tests/node_patch.js" "$stock" "$p" "$tmp/js.syx" >/dev/null || true
  for fe in py js; do
    if cmp -s "$tmp/$fe.syx" "$want"; then echo "OK   $tag $fe: identical to $(basename "$want")"
    else echo "FAIL $tag $fe differs from $(basename "$want")"; fail=1; fi
  done
done
# a file that is not the stock file must be refused, and nothing written
p="$patcher/patches/sidecar-rel0-3-1.json"
head -c 100000 "$first" > "$tmp/bad.syx"
if python3 "$patcher/sidecar_patch.py" "$tmp/bad.syx" "$p" -o "$tmp/no.syx" 2>/dev/null || [ -e "$tmp/no.syx" ]; then
  echo "FAIL a wrong stock file was accepted"; fail=1
else echo "OK   a wrong stock file is refused"; fi
exit $fail
