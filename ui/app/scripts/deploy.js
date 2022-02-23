/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

const htmlparser = require('htmlparser2');

const //
  fs = require('fs'),
  ncp = require('ncp').ncp,
  rimraf = require('rimraf'),
  APP_DIR = __dirname.replace('/scripts', ''),
  PATH_BUILD = `${APP_DIR}/build`,
  TEMPLATES = `../../templates`,
  DEST = `../../static-assets/next`,
  indexContents = fs.readFileSync(`${PATH_BUILD}/index.html`).toString();

let jsNextScriptsFileContent = '<#include "/templates/web/common/js-global-context.ftl" />\n';

const parser = new htmlparser.Parser({
  onopentag(name, attributes) {
    if (name === 'script') {
      jsNextScriptsFileContent += `<script src="${attributes.src}"></script>\n`;
    } else if (name === 'link' && attributes.rel.includes('stylesheet')) {
      jsNextScriptsFileContent += `<link href="${attributes.href}" rel="stylesheet"/>\n`;
    }
  }
});

parser.write(indexContents);
parser.end();

console.log(`Updating script imports`);
fs.writeFileSync(`${TEMPLATES}/web/common/js-next-scripts.ftl`, `${jsNextScriptsFileContent}`);

console.log(`Deleting previous build (rm -rf ${DEST}/static)`);
rimraf.sync(`${DEST}/static`);

console.log(`Copying worker into to ${DEST}`);
ncp(`${PATH_BUILD}/shared-worker.js`, `${DEST}/shared-worker.js`, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Worker script copied.');
  }
});

console.log(`Copying build files to ${DEST}/static`);
ncp(`${PATH_BUILD}/static`, `${DEST}/static`, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('App code copied.');
  }
});
