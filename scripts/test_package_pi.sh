#!/bin/bash
# Checks of package_pi.sh's bash 3.2 / set -u / shipcheck behaviour without a build:  scripts/test_package_pi.sh
# (run it with /bin/bash on a Mac: that is the bash the script runs under)
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
t=$(mktemp -d); trap 'rm -rf "$t"' EXIT
fail=0; ok() { echo "ok: $1"; }; bad() { echo "FAIL: $1"; fail=1; }

# 1. the notice loop with an empty array (bash 3.2 + set -u)
grep -q 'for n in ${notice\[@\]+"${notice\[@\]}"}; do' "$here/package_pi.sh" || bad "notice loop is not empty-array safe"
/bin/bash -c 'set -u; notice=(); for n in ${notice[@]+"${notice[@]}"}; do echo x; done; notice=("a b" "c"); for n in ${notice[@]+"${notice[@]}"}; do echo "$n"; done' \
  | tr '\n' '|' | grep -qx 'a b|c|' && ok "empty and non-empty notice array" || bad "notice array loop"

# 2. shipcheck: load just the function
eval "$(sed -n '/^shipcheck() {/,/^}/p' "$here/package_pi.sh")"
check() { ( shipcheck "$1" ) >/dev/null 2>&1; }
mkdir "$t/clean"; echo hi > "$t/clean/a.txt"
check "$t/clean" && ok "clean tree passes" || bad "clean tree refused"
for f in sidecar-paircode.txt pair.txt pair-x.txt; do
  mkdir "$t/$f.d"; echo x > "$t/$f.d/$f"
  check "$t/$f.d" && bad "$f not refused" || ok "$f refused by name"
done
mkdir "$t/gz"; echo 'cmdline.txt paircode=12345678' | gzip -n > "$t/gz/w.js.gz"
check "$t/gz" && bad "paircode inside .gz not refused" || ok "paircode inside .gz refused"
mkdir "$t/gz2"; echo 'c=00ff 0000000000000000000000000000000000000000000000000000000000000000' | gzip -n > "$t/gz2/p.gz"
check "$t/gz2" && bad "pair line inside .gz not refused" || ok "pair line inside .gz refused"
exit $fail
