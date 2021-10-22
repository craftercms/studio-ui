/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { ElasticParams } from '../../models/Search';
import { AllItemActions, DetailedItem } from '../../models/Item';
import { History, Location } from 'history';

export const drawerWidth = 300;

export const initialSearchParameters: ElasticParams = {
  query: '',
  keywords: '',
  offset: 0,
  limit: 21,
  sortBy: '_score',
  sortOrder: 'desc',
  filters: {}
};

export const actionsToBeShown: AllItemActions[] = [
  'edit',
  'delete',
  'publish',
  'rejectPublish',
  'duplicate',
  'duplicateAsset',
  'dependencies',
  'history'
];

export interface SearchProps {
  history: History;
  location: Location;
  mode?: 'default' | 'select';
  embedded?: boolean;
  onClose?(): void;
  onSelect?(path: string, selected: boolean): any;
  onAcceptSelection?(items: DetailedItem[]): any;
}

export const setCheckedParameterFromURL = (queryParams: Partial<ElasticParams>) => {
  if (queryParams['filters']) {
    let checked: any = {};
    let parseQP = JSON.parse(queryParams['filters']);
    Object.keys(parseQP).forEach((facet) => {
      if (Array.isArray(parseQP[facet])) {
        checked[facet] = {};
        parseQP[facet].forEach((name: string) => {
          checked[facet][name] = true;
        });
      } else {
        checked[facet] = parseQP[facet];
      }
    });
    return checked;
  } else {
    return {};
  }
};
