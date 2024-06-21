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

import LookupTable from '../models/LookupTable';
import { augmentTranslations } from '../utils/i18n';
import { components, plugins } from '../utils/constants';
import PluginDescriptor from '../models/PluginDescriptor';
import PluginFileBuilder from '../models/PluginFileBuilder';
import { WidgetRecord } from '../models/WidgetRecord';

const DEFAULT_FILE_NAME = 'index.js';

function isPluginFileBuilder(target: any): target is PluginFileBuilder {
  return typeof target === 'object';
}

export function buildFileUrl(fileBuilder: PluginFileBuilder): string;
export function buildFileUrl(site: string, type: string, name: string): string;
export function buildFileUrl(site: string, type: string, name: string, file: string): string;
export function buildFileUrl(site: string, type: string, name: string, file: string, id: string): string;
export function buildFileUrl(
  siteOrBuilder: PluginFileBuilder | string,
  type?: string,
  name?: string,
  file?: string,
  id?: string
): string {
  let site = siteOrBuilder;
  if (isPluginFileBuilder(siteOrBuilder)) {
    const builder = siteOrBuilder;
    site = builder.site;
    type = builder.type;
    name = builder.name;
    file = builder.file;
    id = builder.id;
  }
  let url = `/studio/1/plugin/file?siteId=${site}&type=${type}&name=${name}&filename=${file ?? DEFAULT_FILE_NAME}`;

  if (id) {
    url += `&pluginId=${id}`;
  }

  return url;
}

export function createFileBuilder(site: string, type: string, name: string): PluginFileBuilder;
export function createFileBuilder(site: string, type: string, name: string, file: string): PluginFileBuilder;
export function createFileBuilder(
  site: string,
  type: string,
  name: string,
  file: string,
  id: string
): PluginFileBuilder;
export function createFileBuilder(
  site: string,
  type: string,
  name: string,
  file: string = DEFAULT_FILE_NAME,
  id?: string
): PluginFileBuilder {
  return {
    site,
    type,
    name,
    file,
    ...(id ? { id } : {})
  };
}

export function importFile(fileBuilder: PluginFileBuilder): Promise<any>;
export function importFile(site: string, type: string, name: string): Promise<any>;
export function importFile(site: string, type: string, name: string, file: string): Promise<any>;
export function importFile(site: string, type: string, name: string, file: string, id: string): Promise<any>;
export function importFile(
  siteOrBuilder: PluginFileBuilder | string,
  type?: string,
  name?: string,
  file?: string,
  id?: string
): Promise<any> {
  // @ts-ignore — methods share same signature
  const url = buildFileUrl(...arguments);
  return import(/* @vite-ignore */ url);
}

export function importPlugin(fileBuilder: PluginFileBuilder): Promise<any>;
export function importPlugin(site: string, type: string, name: string): Promise<any>;
export function importPlugin(site: string, type: string, name: string, file: string): Promise<any>;
export function importPlugin(site: string, type: string, name: string, file: string, id: string): Promise<any>;
export function importPlugin(
  siteOrBuilder: PluginFileBuilder | string,
  type?: string,
  name?: string,
  file?: string,
  id?: string
): Promise<any> {
  // @ts-ignore — methods share the same signature(s)
  const args: [string, string, string, string, string] = arguments;
  return importFile(...args).then((module) => {
    const plugin = module.plugin ?? module.default;
    if (plugin) {
      // The file may have been previously loaded and hence the plugin registered previously.
      // This may however cause silent skips of legitimate duplicate plugin id registrations.
      // Perhaps we should consider keeping an internal registry of the plugin file URLs that
      // have been loaded if this is an issue.
      !isPluginRegistered(plugin) &&
        registerPlugin(plugin, isPluginFileBuilder(siteOrBuilder) ? siteOrBuilder : createFileBuilder(...args));
    }
    return plugin;
  });
}

export function isPluginRegistered(plugin: PluginDescriptor): boolean {
  return plugins.has(plugin?.id);
}

export function registerPlugin(plugin: PluginDescriptor, source?: PluginFileBuilder): boolean {
  // Skip registration if plugin with same id already exists
  if (!plugins.has(plugin.id)) {
    const extendedDescriptor = { ...plugin, source };
    plugins.set(plugin.id, extendedDescriptor);
    registerComponents(plugin.widgets);
    augmentTranslations(plugin.locales);
    // TODO: Allow externals?
    if (source) {
      plugin.stylesheets?.forEach((href) =>
        appendStylesheet(
          typeof href === 'string' ? (hasProtocol(href) ? href : buildFileUrl({ ...source, file: href })) : href
        )
      );
      plugin.scripts?.forEach((src) =>
        appendScript(typeof src === 'string' ? (hasProtocol(src) ? src : buildFileUrl({ ...source, file: src })) : src)
      );
    } else {
      console.error('Scripts & stylesheets not allowed for umd bundles');
    }
    return true;
  } else {
    console.error(`Attempt to register a duplicate plugin "${plugin.id}" skipped.`);
    return false;
  }
}

export function registerComponents(widgets: LookupTable<WidgetRecord>): void {
  Object.entries(widgets).forEach(([id, widget]) => {
    // Skip registration if component with same id already exists
    if (!components.has(id)) {
      components.set(id, widget);
    } else {
      console.error(`Attempt to register a duplicate component id "${id}" skipped.`);
    }
  });
}

export function appendStylesheet(href: string): Promise<Event>;
export function appendStylesheet(attributes: object): Promise<Event>;
export function appendStylesheet(href: string | object): Promise<Event>;
export function appendStylesheet(href: string | object): Promise<Event> {
  return appendLoadable('link', { rel: 'stylesheet', ...(typeof href === 'string' ? { href } : href) });
}

export function appendScript(src: string): Promise<Event>;
export function appendScript(attributes: object): Promise<Event>;
export function appendScript(src: string | object): Promise<Event>;
export function appendScript(src: string | object): Promise<Event> {
  return appendLoadable('script', typeof src === 'string' ? { src } : src);
}

function appendLoadable(type: 'link' | 'script', attributes: object): Promise<Event> {
  return new Promise((resolve, reject) => {
    const element = document.createElement(type);
    for (let attr in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, attr)) {
        element.setAttribute(attr, attributes[attr]);
      }
    }
    element.onload = resolve;
    element.onerror = reject;
    document.head.appendChild(element);
  });
}

function hasProtocol(url: string): boolean {
  return /^(http)(s?):\/\//.test(url);
}
