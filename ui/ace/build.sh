#
# Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

LIBS_BASE=../../static-assets/libs

rm -rf $LIBS_BASE/ace/
cp -r ../../node_modules/ace-builds/src-min-noconflict $LIBS_BASE/ace
cat src/ace-append.js >> $LIBS_BASE/ace/ace.js

cp src/mode-yaml/* $LIBS_BASE/ace/

rm -rf $LIBS_BASE/js-yaml
mkdir $LIBS_BASE/js-yaml
cp ../../node_modules/js-yaml/dist/js-yaml.min.js $LIBS_BASE/js-yaml/js-yaml-4.0.0.min.js
