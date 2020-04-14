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

export interface Image {
  url: string;
  title: string;
  description: string;
}

export interface Video {
  title: string;
  description: string;
  url: string
}

interface Media {
  screenshots: [Image];
  videos?: [Video] | []
}

interface Version {
  major: number;
  minor: number;
  patch: number;
}

interface License {
  name: string;
  url: string;
}

export interface Parameter {
  label: string;
  name: string;
  required: boolean;
  type: string;
  description: string;
  defaultValue: string;
}

export interface Blueprint {
  id: string;
  name: string;
  version?: Version;
  license?: License;
  crafterCmsVersions?: [Version];
  description: string;
  media: Media;
  developer?: any;
  website?: any;
  searchEngine?: string;
  source?: string;
  url?: string;
  ref?: string;
  parameters?: [Parameter];
}
