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
import * as MaterialUI from '@material-ui/core';
import * as ReactRedux from 'react-redux';
import * as ReactIntl from 'react-intl';
import { IntlShape } from 'react-intl';
import { CrafterCMSStore, getStore } from '../state/store';
import { augmentTranslations, getCurrentIntl } from './i18n';
import LookupTable from '../models/LookupTable';

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
    '@material-ui/core': typeof MaterialUI;
  };
  plugins: Map<string, PluginDescriptor>;
  components: Map<string, ComponentRecord>;
  // utils: {};
  // services: {};
  getIntl(): IntlShape;
  getStore(): CrafterCMSStore;
  registerPlugin(plugin: PluginDescriptor): boolean;
  define: {
    (): void;
    amd: true;
  };
}

export interface PluginDescriptor {
  id: string;
  locales: LookupTable<object>;
  widgets: LookupTable<ComponentRecord>;
}

export type NonReactComponentRecord = {
  main(context: { craftercms: CrafterCMSGlobal; element: HTMLElement; configuration: object }): void | (() => void);
};

export type ComponentRecord = NonReactComponentRecord | React.ComponentType<any>;

let UND;

export const plugins = new Map<string, PluginDescriptor>();

export const components = new Map<string, ComponentRecord>();

const libs: CrafterCMSGlobal['libs'] = {
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
  '@material-ui/core': MaterialUI
};

const define = function(id, deps, factory) {
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

export function registerPlugin(plugin: PluginDescriptor): boolean {
  // Skip registration if plugin with same id already exists
  if (!plugins.has(plugin.id)) {
    plugins.set(plugin.id, plugin);
    registerComponents(plugin.widgets);
    augmentTranslations(plugin.locales);
    return true;
  } else {
    console.error(`Attempt to register a duplicate plugin "${plugin.id}" skipped.`);
    return false;
  }
}

function registerComponents(widgets: LookupTable<ComponentRecord>) {
  Object.entries(widgets).forEach(([id, widget]) => {
    // Skip registration if component with same id already exists
    if (!components.has(id)) {
      components.set(id, widget);
    } else {
      console.error(`Attempt to register a duplicate component id "${id}" skipped.`);
    }
  });
}

const craftercms: CrafterCMSGlobal = {
  libs,
  plugins,
  components,
  define,
  registerPlugin,
  getStore,
  getIntl(): IntlShape {
    return getCurrentIntl();
  }
};

window.craftercms = craftercms;

export default craftercms;
