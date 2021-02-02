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

ACE=../../static-assets/libs/ace

rm -rf $ACE/
cp -r ../../node_modules/ace-builds/src-min-noconflict $ACE
cat src/ace-append.js >> $ACE/ace.js

cp src/mode-yaml/mode-yaml.js $ACE/
cp src/mode-yaml/worker-yaml.js $ACE/
cp src/mode-yaml/yaml_parse.js $ACE/
cp src/mode-yaml/js-yaml.min.js $ACE/
