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
    npm install prettier@1.17.1 eslint@5.16.0 babel-eslint@10.0.1 eslint-config-prettier@4.3.0 eslint-plugin-prettier@3.1.0 eslint-config-google@0.13.0
    npm run ci-check
fi