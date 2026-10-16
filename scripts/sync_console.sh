#!/bin/sh
# Copy the Teensy web console (rytm-teensy web/) at a given commit into console/ for GitHub Pages.
#   scripts/sync_console.sh RYTM_TEENSY_REPO COMMIT
set -eu
repo=${1:?usage: sync_console.sh RYTM_TEENSY_REPO COMMIT}
commit=${2:?usage: sync_console.sh RYTM_TEENSY_REPO COMMIT}
here=$(cd "$(dirname "$0")/.." && pwd)
full=$(git -C "$repo" rev-parse "$commit^{commit}")
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
git -C "$repo" archive "$full" web | tar -x -C "$tmp"
rm -rf "$here/console"; mkdir -p "$here/console"
for f in index.html app.js stream.js mock.js; do cp "$tmp/web/$f" "$here/console/$f"; done
echo "$full" > "$here/console/SOURCE_COMMIT"
echo "console/ from rytm-teensy $full"
