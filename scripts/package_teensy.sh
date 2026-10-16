#!/bin/sh
# Build the Teensy 4.1 release .hex from a rytm-teensy commit (compile only, never uploads) into dist/teensy/.
#   scripts/package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT
# The checkout must have COMMIT checked out with no modified tracked files, and tools/release/teensy_hex.sh
# (rytm-teensy branch release-packaging; copy it in if the commit predates it).
set -eu
co=${1:?usage: package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT}
commit=${2:?usage: package_teensy.sh RYTM_TEENSY_CHECKOUT COMMIT}
here=$(cd "$(dirname "$0")/.." && pwd)
"$co/tools/release/teensy_hex.sh" "$here/dist/teensy" "$commit"
