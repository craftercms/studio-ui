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
rm -rf "$libsDirectory/ace"
cp -r ../../node_modules/ace-builds/src-min-noconflict "$libsDirectory/ace"
cat src/ace-append.js >> "$libsDirectory/ace/ace.js"

cp src/mode-yaml/* "$libsDirectory/ace"

echo "Ace build complete"

# js-yaml build
rm -rf "$libsDirectory/js-yaml"
mkdir "$libsDirectory/js-yaml"
cp ../../node_modules/js-yaml/dist/js-yaml.min.js "$libsDirectory/js-yaml/js-yaml-4.0.0.min.js"

echo "js-yaml build complete"

# bootstrap build
rm -rf "$libsDirectory/bootstrap"
mkdir "$libsDirectory/bootstrap"
cp -r ../../node_modules/bootstrap/scss "$libsDirectory/bootstrap/scss"
cp ../../node_modules/bootstrap/dist/js/bootstrap.min.js "$libsDirectory/bootstrap/bootstrap.min.js"
cp ../../node_modules/@popperjs/core/dist/umd/popper.min.js "$libsDirectory/bootstrap/popper.min.js"

echo "Bootstrap build complete"

# jquery-ui build
rm -rf "$libsDirectory/jquery-ui"
cp -r ../../node_modules/jquery-ui/dist "$libsDirectory/jquery-ui"
cp -r ../../node_modules/jquery-ui-css/jquery-ui.min.css "$libsDirectory/jquery-ui/jquery-ui.min.css"
sed -i 's/typeof define\&\&define.amd?define/typeof crafterDefine\&\&crafterDefine.amd?crafterDefine/' ../../static-assets/libs/jquery-ui/jquery-ui.min.js

echo "jQuery UI build complete"
