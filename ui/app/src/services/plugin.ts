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

import * as React from 'react';
import LookupTable from '../models/LookupTable';
import { augmentTranslations } from '../utils/i18n';
import { CrafterCMSGlobal } from '../utils/craftercms';

export interface PluginFileBuilder {
  site: string;
  type: string;
  name: string;
  file?: string;
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
// export type ComponentRecord = { type: 'react', component: TheComponent };

export const plugins = new Map<string, PluginDescriptor>();

export const components = new Map<string, ComponentRecord>();

function isPluginFileBuilder(target: any): target is PluginFileBuilder {
  return typeof target === 'object';
}

export function buildFileUrl(fileBuilder: PluginFileBuilder): string;
export function buildFileUrl(site: string, type: string, name: string): string;
export function buildFileUrl(site: string, type: string, name: string, file: string): string;
export function buildFileUrl(
  siteOrBuilder: PluginFileBuilder | string,
  type?: string,
  name?: string,
  file?: string
): string {
  let site = siteOrBuilder;
  if (isPluginFileBuilder(siteOrBuilder)) {
    const builder = siteOrBuilder;
    site = builder.site;
    type = builder.type;
    name = builder.name;
    file = builder.file;
  }
  return `/studio/api/2/plugin/file?siteId=${site}&type=${type}&name=${name}&filename=${file ?? 'index.js'}`;
}

export function importFile(fileBuilder: PluginFileBuilder): Promise<any>;
export function importFile(site: string, type: string, name: string): Promise<any>;
export function importFile(site: string, type: string, name: string, file: string): Promise<any>;
export function importFile(
  siteOrBuilder: PluginFileBuilder | string,
  type?: string,
  name?: string,
  file?: string
): Promise<any> {
  // @ts-ignore — methods share same signature
  const url = buildFileUrl(...arguments);
  return import(/* webpackIgnore: true */ url);
}

export function importPlugin(fileBuilder: PluginFileBuilder): Promise<any>;
export function importPlugin(site: string, type: string, name: string): Promise<any>;
export function importPlugin(site: string, type: string, name: string, file: string): Promise<any>;
export function importPlugin(
  siteOrBuilder: PluginFileBuilder | string,
  type?: string,
  name?: string,
  file?: string
): Promise<any> {
  // @ts-ignore — methods share the same signature(s)
  return importFile(...arguments).then((module) => {
    const plugin = module.plugin || module.default;
    if (plugin) {
      // The file may have been previously loaded and hence the plugin registered previously.
      // This may however cause silent skips of legitimate duplicate plugin id registrations.
      // Perhaps we should consider keeping an internal registry of the plugin file URLs that
      // have been loaded if this is an issue.
      !isPluginRegistered(plugin) && registerPlugin(plugin);
    }
    return plugin;
  });
}

export function isPluginRegistered(plugin: PluginDescriptor): boolean {
  return plugins.has(plugin?.id);
}

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

export function registerComponents(widgets: LookupTable<ComponentRecord>) {
  Object.entries(widgets).forEach(([id, widget]) => {
    // Skip registration if component with same id already exists
    if (!components.has(id)) {
      components.set(id, widget);
    } else {
      console.error(`Attempt to register a duplicate component id "${id}" skipped.`);
    }
  });
}

const plugin = {
  buildFileUrl,
  importFile,
  importPlugin
};

export default plugin;
