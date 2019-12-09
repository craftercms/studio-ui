
/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// TODO: This is a R&D WIP.

const materialUI = require('@material-ui/core');

const Libs: any = {
  'jss': require('jss'),
  'jssPreset': materialUI.jssPreset,
  'react': require('react'),
  'react-dom': require('react-dom'),
  '@material-ui/core': materialUI,
  '@material-ui/icons': require('@material-ui/icons')
};

const Registry: any = {
  'org.craftercms.plugin.vanilla': {
    src: 'http://localhost:3000/vanilla.umd.js',
    main: null
  },
  'org.craftercms.plugin.reactApp': {
    src: 'http://localhost:3000/react-app.umd.js',
    main: null
  }
};

declare global {
  interface Window {
    // add you custom properties and methods
    define: any;
  }
}

function define(id, deps, factory) {

  // Anonymous modules
  if (typeof id !== 'string') {
    // Adjust args appropriately
    factory = deps;
    deps = id;
    id = null;
  }

  // This module may not have dependencies
  if (!Array.isArray(deps)) {
    factory = deps;
    deps = null;
  }

  const required = deps.map((r) => Libs[r]);
  Registry[id].main = (factory as Function).apply(null, required);

}

function req(moduleId) {
  return import(/* webpackIgnore: true */Registry[moduleId].src).then(() => Registry[moduleId].main);
}

window.define = define;
window.define.amd = true;

export { req, define };
