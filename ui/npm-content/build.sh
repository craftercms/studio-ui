#!/usr/bin/env bash

#
# Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 3 as published by
# the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

libsDirectory=../../static-assets/libs

# ace build
aceVersion=$(cat package.json | grep -o '"ace-builds":\s*"[^"]*"' | grep -o "[0-9]*\.[0-9]*\.[0-9]*")

rm -rf "$libsDirectory/ace"
cp -r ../../node_modules/ace-builds/src-min-noconflict "$libsDirectory/ace"
cat src/ace-append.js >> "$libsDirectory/ace/ace.js"

cp src/mode-yaml/* "$libsDirectory/ace"

echo "Ace v${aceVersion} build complete"

# js-yaml build
jsYamlVersion=$(cat package.json | grep -o '"js-yaml":\s*"[^"]*"' | grep -o "[0-9]*\.[0-9]*\.[0-9]*")

rm -rf "$libsDirectory/js-yaml"
mkdir "$libsDirectory/js-yaml"
cp ../../node_modules/js-yaml/dist/js-yaml.min.js "$libsDirectory/js-yaml/js-yaml-4.0.0.min.js"

echo "js-yaml v${jsYamlVersion} build complete"

# bootstrap build
bootstrapVersion=$(cat package.json | grep -o '"bootstrap":\s*"[^"]*"' | grep -o "[0-9]*\.[0-9]*\.[0-9]*")

rm -rf "$libsDirectory/bootstrap"
mkdir "$libsDirectory/bootstrap"
cp -r ../../node_modules/bootstrap/scss "$libsDirectory/bootstrap/scss"
cp ../../node_modules/bootstrap/dist/js/bootstrap.min.js "$libsDirectory/bootstrap/bootstrap.min.js"
cp ../../node_modules/@popperjs/core/dist/umd/popper.min.js "$libsDirectory/bootstrap/popper.min.js"

echo "Bootstrap v${bootstrapVersion} build complete"
