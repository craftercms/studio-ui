/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const //
  fs = require('fs'),
  ncp = require('ncp').ncp,
  rimraf = require('rimraf'),
  APP_DIR = __dirname.replace('/scripts', ''),
  PATH_BUILD = `${APP_DIR}/build`,
  TEMPLATES = `../../templates`,
  DEST = `../../static-assets/next`,
  PLACEHOLDER = '<script id="_placeholderscript_"></script>',
  indexContents = fs.readFileSync(`${PATH_BUILD}/index.html`).toString(),
  position = indexContents.indexOf(PLACEHOLDER),
  templateScripts = indexContents
    .substr(position + PLACEHOLDER.length)
    .replace(/\<\/(body|html)>/gi, '')
    .replace(/<\/script>/gi, '</script>\n');
console.log(`Updating script imports`);
fs.writeFileSync(`${TEMPLATES}/web/common/js-next-scripts.ftl`, `${templateScripts}`);

console.log(`Deleting previous build (rm -rf ${DEST}/*)`);
rimraf.sync(`${DEST}/*`);

console.log(`Copying build files to ${DEST}/static`);
ncp(`${PATH_BUILD}/static`, `${DEST}/static`, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Done!');
  }
});
