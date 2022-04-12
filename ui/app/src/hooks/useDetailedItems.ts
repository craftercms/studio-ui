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
import { DetailedItem } from '../models/Item';
import { useDispatch } from 'react-redux';
import { useSelection } from './useSelection';
import { useEffect, useMemo } from 'react';
import { completeDetailedItem } from '../state/actions/content';
import { batchActions } from '../state/actions/misc';

export function useDetailedItems(paths: string[]): { itemsByPath: LookupTable<DetailedItem>; isFetching: boolean } {
  const dispatch = useDispatch();
  const fetchingLookup = useSelection((state) => state.content.itemsBeingFetchedByPath);
  const itemsByPath = useSelection((state) => state.content.itemsByPath);
  const items = useMemo(() => {
    let _items = {};
    paths.forEach((path) => {
      if (itemsByPath[path]) {
        _items[path] = itemsByPath[path];
      }
    });
    return _items;
  }, [itemsByPath, paths]);
  useEffect(() => {
    let actions = [];
    paths.forEach((path) => {
      if (!itemsByPath[path] && fetchingLookup[path] === undefined) {
        actions.push(completeDetailedItem({ path }));
      }
    });
    if (actions.length) {
      dispatch(actions.length > 1 ? batchActions(actions) : actions[0]);
    }
  }, [fetchingLookup, dispatch, paths, itemsByPath]);
  return { itemsByPath: items, isFetching: paths.some((path) => fetchingLookup[path]) };
}

export default useDetailedItems;
