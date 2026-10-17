#!/bin/sh
# Copy the Teensy web console (rytm-teensy web/) at a given commit into public/console/ (served at /console/ on the
# Pages site). Takes index.html and every .js module the page loads; leaves out tests (*.test.mjs) and the README.
#   scripts/sync_console.sh RYTM_TEENSY_REPO COMMIT
set -eu
repo=${1:?usage: sync_console.sh RYTM_TEENSY_REPO COMMIT}
commit=${2:?usage: sync_console.sh RYTM_TEENSY_REPO COMMIT}
here=$(cd "$(dirname "$0")/.." && pwd)
dest="$here/public/console"
full=$(git -C "$repo" rev-parse "$commit^{commit}")
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
git -C "$repo" archive "$full" web | tar -x -C "$tmp"
rm -rf "$dest"; mkdir -p "$dest"
cp "$tmp/web/index.html" "$dest/"
for f in "$tmp"/web/*.js; do cp "$f" "$dest/"; done
echo "$full" > "$dest/SOURCE_COMMIT"
echo "public/console/ from rytm-teensy $full: $(ls "$dest" | tr '\n' ' ')"
