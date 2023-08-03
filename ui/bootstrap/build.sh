#!/usr/bin/env bash

#
# Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

rm -rf "$libsDirectory/bootstrap"
mkdir "$libsDirectory/bootstrap"
cp -r ../../node_modules/bootstrap/scss "$libsDirectory/bootstrap/scss"
cp ../../node_modules/bootstrap/dist/js/bootstrap.min.js "$libsDirectory/bootstrap/bootstrap.min.js"
cp ../../node_modules/@popperjs/core/dist/umd/popper.min.js "$libsDirectory/bootstrap/popper.min.js"

echo "Bootstrap build complete"
