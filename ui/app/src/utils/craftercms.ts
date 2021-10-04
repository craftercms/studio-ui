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

import jss from 'jss';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as MaterialUI from '@mui/material';
import * as ReactRedux from 'react-redux';
import * as ReactIntl from 'react-intl';
import { IntlShape } from 'react-intl';
import { CrafterCMSStore, getStoreSync } from '../state/store';
import { getCurrentIntl } from './i18n';
import { ComponentRecord, components, PluginDescriptor, plugins, registerPlugin } from '../services/plugin';

declare global {
  interface Window {
    craftercms: CrafterCMSGlobal;
  }
}

export interface CrafterCMSGlobal {
  libs: {
    jss: typeof jss;
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    MaterialUI: typeof MaterialUI;
    ReactRedux: typeof ReactRedux;
    ReactIntl: typeof ReactIntl;
    // Include also package name aliases for builds that might use those
    // when invoking require('...') or define([...], factory).
    react: typeof React;
    'react-dom': typeof ReactDOM;
    'react-redux': typeof ReactRedux;
    'react-intl': typeof ReactIntl;
    '@mui/material': typeof MaterialUI;
  };
  plugins: Map<string, PluginDescriptor>;
  components: Map<string, ComponentRecord>;
  // utils: {};
  // services: {};
  getIntl(): IntlShape;
  getStore(): CrafterCMSStore;
  define: {
    (): void;
    amd: true;
  };
}

let UND;

export const libs: CrafterCMSGlobal['libs'] = {
  jss,
  React,
  ReactDOM,
  ReactIntl,
  MaterialUI,
  ReactRedux,
  react: React,
  'react-dom': ReactDOM,
  'react-redux': ReactRedux,
  'react-intl': ReactIntl,
  '@mui/material': MaterialUI
};

// UMD builds wouldn't give the chance to track the file builder the plugin loads from
// unless the plugin descriptor provided the site, type, name & file args.
// An option would be including a query argument on the URL of the plugin with the expected ID e.g.
// `.../plugin/file?site=mySite&type=myType&name=myName&fileName=myFile&expectedPluginId=org.craftercms.samplePlugin`
// Upon receiving a call to `craftercms.define` and invoking the factory to get the plugin descriptor, get the id and
// try to find a script which matches `expectedPluginId=${pluginDescriptor.id}`. This might mean having to drop the
// use of dynamic import and use regular scripts as dynamic imports don't add a script to the DOM we could go find.
// Perhaps UMD shouldn't be supported; only support es module-style plugin bundle builds.
export const define = function (id, deps, factory) {
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
    deps = [];
  }
  const resolved = deps.map((dep) => {
    libs[dep] === UND &&
      console.error(
        `${
          id ? `The "${id}" plugin` : 'A plugin'
        } requires "${dep}" which is not provided by Crafter CMS. You should bundle this dependency with your plugin.`
      );
    return libs[dep];
  });
  const plugin: PluginDescriptor = factory.apply(null, resolved);
  registerPlugin(plugin);
} as CrafterCMSGlobal['define'];

define.amd = true;

export { getCurrentIntl as getIntl, plugins, components, getStoreSync as getStore };

const craftercms: CrafterCMSGlobal = {
  libs,
  plugins,
  components,
  define,
  getStore: getStoreSync,
  getIntl: getCurrentIntl
};

window.craftercms = craftercms;
