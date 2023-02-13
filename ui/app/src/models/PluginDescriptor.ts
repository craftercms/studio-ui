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

import WidgetRecord from './WidgetRecord';

export interface PluginDescriptor {
  id: string;
  // name: string;
  // version: string;
  // description: string;
  // author: string;
  // logo: string;
  locales?: Record<string, object>;
  // apps: Array<{ route: string; widget: { id: string; configuration: any } }>;
  widgets?: Record<string, WidgetRecord>;
  scripts?: Array<string | object>;
  stylesheets?: Array<string | object>;
  // themes: Array<{ id: string; name: string; themeOptions: ThemeOptions[] }>;
}

export default PluginDescriptor;
