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

export function buildFileUrl(pluginFileBuilder: PluginFileBuilder): string;
export function buildFileUrl(site: string, type: string, name: string): string;
export function buildFileUrl(site: string, type: string, name: string, file: string): string;
export function buildFileUrl(site: PluginFileBuilder | string, type?: string, name?: string, file?: string): string {
  if (isPluginFileBuilder(site)) {
    const desc = site;
    site = desc.site;
    type = desc.type;
    name = desc.name;
    file = desc.file;
  }
  return `/studio/api/2/plugin/file?siteId=${site}&type=${type}&name=${name}&filename=${file ?? 'index.js'}`;
}

const plugin = {
  buildFileUrl
};

export default plugin;
