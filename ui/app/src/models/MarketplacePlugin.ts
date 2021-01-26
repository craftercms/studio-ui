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
  url: string;
}

interface Media {
  screenshots: [Image];
  videos?: [Video] | [];
}

interface Version {
  major: number;
  minor: number;
  patch: number;
}

export interface Parameter {
  label: string;
  name: string;
  required: boolean;
  type: string;
  description: string;
  defaultValue: string;
}

export interface MarketplacePlugin {
  id: string;
  type?: string;
  name: string;
  tags?: string[];
  version?: Version;
  description: string;
  website?: {
    name: string;
    url: string;
  };
  media: Media;
  developer?: {
    people: any;
    company?: {
      name: string;
      url: string;
    };
  };
  build?: {
    id: string;
    url: string;
  };
  license?: {
    name: string;
    url: string;
  };
  crafterCmsVersions?: [Version];
  crafterCmsEditions?: string[];
  parameters?: [Parameter];
  status?: string;
  source?: string;
  compatible?: boolean;
  searchEngine?: string;
  url?: string;
  ref?: string;
}
