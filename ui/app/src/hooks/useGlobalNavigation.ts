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

import GlobalState from '../models/GlobalState';
import { useDispatch } from 'react-redux';
import { useSelection } from './useSelection';
import { useEffect } from 'react';
import { nou } from '../utils/object';
import { fetchGlobalMenu } from '../state/actions/system';

export function useGlobalNavigation(): GlobalState['globalNavigation'] {
  const dispatch = useDispatch();
  const data = useSelection((state) => state.globalNavigation);
  useEffect(() => {
    if (nou(data.items) && nou(data.error) && !data.isFetching) {
      dispatch(fetchGlobalMenu());
    }
  }, [data.error, data.isFetching, data.items, dispatch]);
  return data;
}

export default useGlobalNavigation;
