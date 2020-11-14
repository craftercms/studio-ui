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

export interface PluginFileBuilder {
  site: string;
  type: string;
  name: string;
  file?: string;
}

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

const plugin = {
  buildFileUrl,
  importFile
};

export default plugin;
