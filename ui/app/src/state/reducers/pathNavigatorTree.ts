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
  pathNavigatorTreeFetchPathPage,
  pathNavigatorTreeFetchPathPageComplete,
  pathNavigatorTreeFetchPathsChildren,
  pathNavigatorTreeFetchPathsChildrenComplete,
  pathNavigatorTreeInit,
  pathNavigatorTreeRefresh,
  pathNavigatorTreeRestoreComplete,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleExpanded
} from '../actions/pathNavigatorTree';
import { changeSite } from './sites';
import { createPresenceTable } from '../../utils/array';
import { fetchSiteUiConfig } from '../actions/configuration';

const reducer = createReducer<LookupTable<PathNavigatorTreeStateProps>>(
  {},
  {
    [pathNavigatorTreeInit.type]: (
      state,
      { payload: { id, path, collapsed = false, limit, expanded = [], keywordByPath = {}, excludes } }
    ) => {
      return {
        ...state,
        [id]: {
          rootPath: path,
          collapsed,
          limit,
          expanded,
          childrenByParentPath: {},
          offsetByPath: {},
          keywordByPath,
          totalByPath: {},
          fetchingByPath: { ...createPresenceTable(expanded) },
          excludes
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
          },
          fetchingByPath: { ...state[id].fetchingByPath, [path]: true }
        }
      };
    },
    [pathNavigatorTreeFetchPathsChildren.type]: (state, { payload: { id, paths } }) => {
      return {
        ...state,
        fetchingByPath: { ...state[id].fetchingByPath, ...createPresenceTable(Object.keys(paths)) }
      };
    },
    [pathNavigatorTreeFetchPathChildren.type]: (state, { payload: { id, path } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          ...(!state[id].expanded.includes(path) && { expanded: [...state[id].expanded, path] }),
          fetchingByPath: { ...state[id].fetchingByPath, [path]: true }
        }
      };
    },
    [pathNavigatorTreeFetchPathChildrenComplete.type]: (state, { payload: { id, parentPath, children, options } }) => {
      const totalByPath = { ...state[id].totalByPath };
      totalByPath[parentPath] = children.levelDescriptor ? children.total + 1 : children.total;
      const nextChildren = [];
      if (children.levelDescriptor) {
        nextChildren.push(children.levelDescriptor.path);
        totalByPath[children.levelDescriptor.path] = 0;
      }

      children.forEach((item) => {
        nextChildren.push(item.path);
        totalByPath[item.path] = item.childrenCount;
      });

      return {
        ...state,
        [id]: {
          ...state[id],
          // If the expanded node has no children and is not filtered, it's a leaf node and there's no point keeping it in `expanded`
          expanded:
            children.length === 0 && !options?.keyword
              ? state[id].expanded.filter((path) => path !== parentPath)
              : state[id].expanded,
          childrenByParentPath: {
            ...state[id].childrenByParentPath,
            [parentPath]: nextChildren
          },
          totalByPath,
          offsetByPath: {
            ...state[id].offsetByPath,
            [parentPath]: 0
          },
          fetchingByPath: { ...state[id].fetchingByPath, [parentPath]: false }
        }
      };
    },
    [pathNavigatorTreeFetchPathPage.type]: (state, { payload: { id, path } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          offsetByPath: {
            ...state[id].offsetByPath,
            [path]: state[id].offsetByPath[path] ? state[id].offsetByPath[path] + state[id].limit : state[id].limit
          }
        }
      };
    },
    [pathNavigatorTreeFetchPathPageComplete.type]: (state, { payload: { id, parentPath, children, options } }) => {
      const totalByPath = { ...state[id].totalByPath };
      const nextChildren = [...state[id].childrenByParentPath[parentPath]];
      totalByPath[parentPath] = children.levelDescriptor ? children.total + 1 : children.total;

      if (children.levelDescriptor) {
        totalByPath[children.levelDescriptor.path] = 0;
      }

      children.forEach((item) => {
        nextChildren.push(item.path);
        totalByPath[item.path] = item.childrenCount;
      });

      return {
        ...state,
        [id]: {
          ...state[id],
          childrenByParentPath: {
            ...state[id].childrenByParentPath,
            [parentPath]: nextChildren
          },
          totalByPath
        }
      };
    },
    [pathNavigatorTreeFetchPathsChildrenComplete.type]: (state, { payload: { id, data } }) => {
      const childrenByParentPath = { ...state[id].childrenByParentPath };
      const totalByPath = { ...state[id].totalByPath };
      const offsetByPath = { ...state[id].offsetByPath };

      Object.keys(data).forEach((path) => {
        childrenByParentPath[path] = [];
        if (data[path].levelDescriptor) {
          childrenByParentPath[path].push(data[path].levelDescriptor.path);
          totalByPath[data[path].levelDescriptor.path] = 0;
        }
        data[path].forEach((item) => {
          childrenByParentPath[path].push(item.path);
          totalByPath[item.path] = item.childrenCount;
        });
        totalByPath[path] = data[path].levelDescriptor ? data[path].total + 1 : data[path].total;
        offsetByPath[path] = 0;
      });

      return {
        ...state,
        [id]: {
          ...state[id],
          childrenByParentPath,
          totalByPath,
          offsetByPath
        }
      };
    },
    [pathNavigatorTreeRefresh.type]: (state, { payload: { id } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          fetchingByPath: { ...state[id].fetchingByPath, [state[id].rootPath]: true }
        }
      };
    },
    [pathNavigatorTreeRestoreComplete.type]: (state, { payload: { id, data, items } }) => {
      const children = {};
      const total = {};
      const offsetByPath = {};
      const keywordByPath = state[id].keywordByPath;
      const expanded = [];
      Object.keys(data).forEach((path) => {
        children[path] = [];
        if (data[path].levelDescriptor) {
          children[path].push(data[path].levelDescriptor.path);
          total[data[path].levelDescriptor.path] = 0;
        }
        data[path].forEach((item) => {
          children[path].push(item.path);
          total[item.path] = item.childrenCount;
        });
        total[path] = data[path].levelDescriptor ? data[path].total + 1 : data[path].total;
        offsetByPath[path] = 0;

        if (keywordByPath[path] || children[path].length) {
          // If the expanded node is filtered or has children it means, it's not a leaf and and we should keep it in 'expanded'
          expanded.push(path);
        }
      });

      return {
        ...state,
        [id]: {
          ...state[id],
          expanded,
          childrenByParentPath: {
            ...state[id].childrenByParentPath,
            ...children
          },
          offsetByPath: {
            ...state[id].offsetByPath,
            ...offsetByPath
          },
          totalByPath: {
            ...state[id].totalByPath,
            ...total
          },
          fetchingByPath: {
            ...state[id].fetchingByPath,
            ...createPresenceTable(
              items.map((item) => item.path),
              false
            )
          }
        }
      };
    },
    [changeSite.type]: () => ({}),
    [fetchSiteUiConfig.type]: () => ({})
  }
);

export default reducer;
