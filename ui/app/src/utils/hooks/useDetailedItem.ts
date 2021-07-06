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

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelection } from './useSelection';
import { DetailedItem } from '../../models/Item';
import { nou } from '../object';
import { completeDetailedItem } from '../../state/actions/content';

export function useDetailedItem(path: string): DetailedItem {
  const dispatch = useDispatch();
  const item = useSelection((state) => state.content.itemsByPath[path]);
  const beingFetching = useSelection((state) => state.content.itemsBeingFetchedByPath[path]);
  useEffect(() => {
    if (nou(item) && path && beingFetching === undefined) {
      dispatch(completeDetailedItem({ path }));
    }
  }, [beingFetching, dispatch, item, path]);
  return item;
}
