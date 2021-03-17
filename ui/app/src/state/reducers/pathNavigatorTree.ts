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
import {
  pathNavigatorTreeCollapsePath,
  pathNavigatorTreeExpandPath,
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeFetchPathChildrenComplete,
  pathNavigatorTreeInit,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleExpanded
} from '../actions/pathNavigatorTree';
import { changeSite } from './sites';

const reducer = createReducer<LookupTable<PathNavigatorTreeStateProps>>(
  {},
  {
    [pathNavigatorTreeInit.type]: (state, { payload: { id, path, collapsed = false, limit } }) => {
      return {
        ...state,
        [id]: {
          rootPath: path,
          levelDescriptor: null,
          collapsed,
          limit,
          expanded: [],
          childrenByParentPath: {},
          keywordByPath: {}
        }
      };
    },
    [pathNavigatorTreeExpandPath.type]: (state, { payload: { id, path } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          expanded: [...state[id].expanded, path]
        }
      };
    },
    [pathNavigatorTreeCollapsePath.type]: (state, { payload: { id, path } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          expanded: state[id].expanded.filter((expanded) => expanded !== path)
        }
      };
    },
    [pathNavigatorTreeToggleExpanded.type]: (state, { payload: { id, collapsed } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          collapsed
        }
      };
    },
    [pathNavigatorTreeSetKeyword.type]: (state, { payload: { id, path, keyword } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          keywordByPath: {
            ...state[id].keywordByPath,
            [path]: keyword
          }
        }
      };
    },
    [pathNavigatorTreeFetchPathChildren.type]: (state, { payload: { id, path } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          expanded: state[id].expanded.includes(path) ? [...state[id].expanded] : [...state[id].expanded, path]
        }
      };
    },
    [pathNavigatorTreeFetchPathChildrenComplete.type]: (state, { payload: { id, parentPath, children, options } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          expanded: children.length
            ? [...state[id].expanded]
            : options?.keyword
            ? [...state[id].expanded]
            : [...state[id].expanded.filter((path) => path !== parentPath)],
          childrenByParentPath: {
            ...state[id].childrenByParentPath,
            [parentPath]: children.map((item) => item.path)
          }
        }
      };
    },
    [changeSite.type]: () => ({})
  }
);

export default reducer;
