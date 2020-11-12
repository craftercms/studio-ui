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

import React from 'react';
import jss from 'jss';
import * as ReactDOM from 'react-dom';
import * as MaterialUI from '@material-ui/core';
import * as ReactRedux from 'react-redux';
import { IntlShape } from 'react-intl';
import { CrafterCMSStore, getStore } from '../state/store';
import { Store } from 'redux';
import GlobalState from '../models/GlobalState';
import StandardAction from '../models/StandardAction';
import { getCurrentIntl } from './i18n';
import LookupTable from '../models/LookupTable';

interface CrafterCMSGlobal {
  libs: {
    jss: typeof jss;
    react: typeof React;
    'react-dom': typeof ReactDOM;
    '@material-ui/core': typeof MaterialUI;
    'react-redux': typeof ReactRedux;
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

declare global {
  interface Window {
    // add you custom properties and methods
    craftercms: CrafterCMSGlobal;
  }
}

export interface PluginDescriptor {
  id: string;
  widgets: LookupTable<ComponentRecord>;
}

export type NonReactComponentRecord = {
  main(context: { store: CrafterCMSStore; element: HTMLElement; configuration: object }): void | (() => void);
};

export type ComponentRecord = NonReactComponentRecord | React.ComponentType<any>;

export const plugins = new Map<string, PluginDescriptor>();

export const components = new Map<string, ComponentRecord>();

const libs = {
  jss,
  react: React,
  'react-dom': ReactDOM,
  '@material-ui/core': MaterialUI,
  'react-redux': ReactRedux
};

const craftercms: CrafterCMSGlobal = {
  libs,
  plugins,
  components,
  define: (function() {
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
        deps = [];
      }
      const resolved = deps.map((dep) => libs[dep]);
      const plugin: PluginDescriptor = factory.apply(null, resolved);
      // Skip registration if plugin with same id already exists
      if (!plugins.has(plugin.id)) {
        plugins.set(plugin.id, plugin);
        Object.entries(plugin.widgets).forEach(([id, widget]) => {
          // Skip registration if component with same id already exists
          if (!components.has(id)) {
            components.set(id, widget);
          } else {
            console.error(`Attempt to register a duplicate component id "${id}" skipped.`);
          }
        });
      } else {
        console.error(`Attempt to register a duplicate plugin "${plugin.id}" skipped.`);
      }
    }
    define.amd = true;
    return define as CrafterCMSGlobal['define'];
  })(),
  getStore(): Store<GlobalState, StandardAction> {
    return getStore();
  },
  getIntl(): IntlShape {
    return getCurrentIntl();
  }
};

window.craftercms = craftercms;

export default craftercms;
