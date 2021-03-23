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
  pathNavigatorTreeFetchPathPageComplete,
  pathNavigatorTreeInit,
  pathNavigatorTreeRestoreComplete,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleExpanded
} from '../actions/pathNavigatorTree';
import { changeSite } from './sites';

const reducer = createReducer<LookupTable<PathNavigatorTreeStateProps>>(
  {},
  {
    [pathNavigatorTreeInit.type]: (
      state,
      { payload: { id, path, collapsed = false, limit, expanded = [], keywordByPath = {} } }
    ) => {
      return {
        ...state,
        [id]: {
          rootPath: path,
          levelDescriptor: null,
          collapsed,
          limit,
          expanded,
          childrenByParentPath: {},
          keywordByPath,
          totalByPath: {}
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
          ...(!state[id].expanded.includes(path) && { expanded: [...state[id].expanded, path] })
        }
      };
    },
    [pathNavigatorTreeFetchPathChildrenComplete.type]: (state, { payload: { id, parentPath, children, options } }) => {
      const nextChildren = [];
      if (children.levelDescriptor) {
        nextChildren.push(children.levelDescriptor.path);
      }

      children.forEach((item) => nextChildren.push(item.path));

      return {
        ...state,
        [id]: {
          ...state[id],
          // If the expanded node has no children and is not filtered, it's a leaf node and there's no point keeping it in `expanded`
          ...(children.length === 0 &&
            !options?.keyword && { expanded: state[id].expanded.filter((path) => path !== parentPath) }),
          childrenByParentPath: {
            ...state[id].childrenByParentPath,
            [parentPath]: nextChildren
          },
          totalByPath: {
            ...state[id].totalByPath,
            [parentPath]: children.total
          }
        }
      };
    },
    [pathNavigatorTreeFetchPathPageComplete.type]: (state, { payload: { id, parentPath, children, options } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          childrenByParentPath: {
            ...state[id].childrenByParentPath,
            [parentPath]: [...state[id].childrenByParentPath[parentPath], ...children.map((item) => item.path)]
          },
          totalByPath: {
            ...state[id].totalByPath,
            [parentPath]: children.total
          }
        }
      };
    },
    [pathNavigatorTreeRestoreComplete.type]: (state, { payload: { id, data } }) => {
      const children = {};
      const total = {};
      Object.keys(data).forEach((path) => {
        children[path] = [];
        if (data[path].levelDescriptor) {
          children[path].push(data[path].levelDescriptor.path);
        }
        data[path].forEach((item) => children[path].push(item.path));
        total[path] = data[path].total;
      });

      return {
        ...state,
        [id]: {
          ...state[id],
          childrenByParentPath: {
            ...state[id].childrenByParentPath,
            ...children
          },
          totalByPath: {
            ...state[id].totalByPath,
            ...total
          }
        }
      };
    },
    [changeSite.type]: () => ({})
  }
);

export default reducer;
