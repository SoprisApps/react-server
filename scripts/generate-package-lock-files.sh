#!/bin/bash

# This script is used to loop through each sub-package that is an npm module
# and generate a "fake" package-lock.json file in order to conduct an audit.
# Lerna handles installing and hoisting all of the modules in the monorepo,
# so we don't actually want to install anything (hence the --dry-run option).
# This script should be used instead of running the same command with lerna
# exec because the package-lock.json files generated when running lerna
# exec don't work!  :shrug:

#NODE_PKG_DIRS=`find packages -name 'package.json' -depth 2 | cut -d '/' -f '1,2'`
NODE_PKGS=`lerna ls --toposort`
ROOT_DIR=`pwd`

for PKG in $NODE_PKGS
do
    cd packages/$PKG
    npm install --ignore-scripts --package-lock-only --dry-run
    cd $ROOT_DIR
done
