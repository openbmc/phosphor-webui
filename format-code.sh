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

# Only validate certain areas of the code base for
# formatting due to some imported code in webui

if [ -f ".clang-format" ]; then
    clang-format-5.0 -i `git ls-files '*.js'`
    git --no-pager diff --exit-code
fi
