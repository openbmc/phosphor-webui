#!/bin/bash

# This script reformats source files using the clang-format utility.
#
# Files are changed in-place, so make sure you don't have anything open in an
# editor, and you may want to commit before formatting in case of awryness.
#
# This must be run on a clean repository to succeed

DIR=$(pwd)
cd ${DIR}

set -e

echo "Formatting code under $DIR/"
eslint --fix `git -C $DIR ls-files '*.js'`
clang-format-6.0 -i `git -C $DIR ls-files '*.js'`
git --no-pager diff --exit-code
