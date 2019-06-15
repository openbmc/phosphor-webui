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

echo "Testing code under $DIR/"

# Only validate certain areas of the code base for
# formatting due to some imported code in webui

if [ -f ".eslintrc" ]; then
    ./node_modules/.bin/prettier --list-different './app/**/*.{js,scss}'
fi
