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

import { createReducer } from '@reduxjs/toolkit';
import { PathNavigatorTreeStateProps } from '../../components/PathNavigatorTree';
import LookupTable from '../../models/LookupTable';
import { pathNavigatorTreeFetchItemComplete, pathNavigatorTreeInit } from '../actions/pathNavigatorTree';
import { changeSite } from './sites';

const reducer = createReducer<LookupTable<PathNavigatorTreeStateProps>>(
  {},
  {
    [pathNavigatorTreeInit.type]: (state, { payload: { id, path, collapsed = false, limit } }) => {
      return {
        ...state,
        [id]: {
          rootPath: path,
          hasClipboard: false,
          levelDescriptor: null,
          collapsed,
          limit,
          data: null,
          isFetching: null
        }
      };
    },
    [pathNavigatorTreeFetchItemComplete.type]: (state, { payload: { id, item } }) => {
      return {
        ...state,
        [id]: {
          isFetching: false,
          data: {
            id: item.id.toString(),
            name: item.label,
            children: [
              {
                id: 'loading'
              }
            ]
          }
        }
      };
    },
    [changeSite.type]: () => ({})
  }
);

export default reducer;
