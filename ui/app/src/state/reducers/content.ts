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
import GlobalState from '../../models/GlobalState';
import {
  fetchDetailedItemComplete,
  fetchQuickCreateList,
  fetchQuickCreateListComplete,
  fetchQuickCreateListFailed,
  fetchUserPermissionsComplete,
  setClipBoard,
  unSetClipBoard
} from '../actions/content';
import QuickCreateItem from '../../models/content/QuickCreateItem';
import StandardAction from '../../models/StandardAction';
import { AjaxError } from 'rxjs/ajax';
import { createPresenceTable } from '../../utils/array';
import {
  pathNavigatorConditionallySetPathComplete,
  pathNavigatorFetchParentItemsComplete,
  pathNavigatorFetchPathComplete
} from '../actions/pathNavigator';
import { parseSandBoxItemToDetailedItem } from '../../utils/content';
import { createLookupTable, nnou } from '../../utils/object';
import { SandboxItem } from '../../models/Item';
import { changeSite } from './sites';
import { fetchGlobalPreferencesComplete } from '../actions/system';
import moment from 'moment-timezone';

type ContentState = GlobalState['content'];

const initialState: ContentState = {
  quickCreate: {
    error: null,
    isFetching: false,
    items: null
  },
  items: {
    byPath: null,
    permissionsByPath: null
  },
  clipboard: null
};

const updateItemByPath = (state, { payload: { response } }) => {
  return {
    ...state,
    items: {
      ...state.items,
      byPath: {
        [response.parent.path]: parseSandBoxItemToDetailedItem(response.parent),
        ...createLookupTable(parseSandBoxItemToDetailedItem(response as SandboxItem[])),
        ...(response.levelDescriptor && {
          [response.levelDescriptor.path]: parseSandBoxItemToDetailedItem(response.levelDescriptor)
        }),
        ...state.items.byPath
      }
    }
  };
};

const reducer = createReducer<ContentState>(initialState, {
  [fetchQuickCreateList.type]: (state) => ({
    ...state,
    quickCreate: {
      ...state.quickCreate,
      isFetching: true
    }
  }),
  [fetchQuickCreateListComplete.type]: (state, { payload }: StandardAction<QuickCreateItem[]>) => ({
    ...state,
    quickCreate: {
      ...state.quickCreate,
      items: payload,
      isFetching: false
    }
  }),
  [fetchQuickCreateListFailed.type]: (state, error: StandardAction<AjaxError>) => ({
    ...state,
    quickCreate: {
      ...state.quickCreate,
      isFetching: false,
      error: error.payload.response
    }
  }),
  [fetchUserPermissionsComplete.type]: (state, { payload }) => ({
    ...state,
    items: {
      ...state.items,
      permissionsByPath: {
        ...state.items.permissionsByPath,
        [payload.path]: createPresenceTable(payload.permissions.map((value) => value.replace(/[\s-]/g, '_')))
      }
    }
  }),
  [fetchDetailedItemComplete.type]: (state, { payload }) => {
    return {
      ...state,
      items: {
        ...state.items,
        byPath: { ...state.items.byPath, [payload.id]: payload }
      }
    };
  },
  [setClipBoard.type]: (state, { payload }) => ({
    ...state,
    clipboard: payload
  }),
  [unSetClipBoard.type]: (state) => ({
    ...state,
    clipboard: null
  }),
  [pathNavigatorConditionallySetPathComplete.type]: updateItemByPath,
  [pathNavigatorFetchPathComplete.type]: updateItemByPath,
  [pathNavigatorFetchParentItemsComplete.type]: (state, { payload: { response } }) => {
    let items = [];
    response.forEach((childResponse) => {
      items.push(parseSandBoxItemToDetailedItem(childResponse.parent));
      items = [...items, ...parseSandBoxItemToDetailedItem(childResponse as SandboxItem[])];
      if (childResponse.levelDescriptor) {
        items.push(parseSandBoxItemToDetailedItem(childResponse.levelDescriptor));
      }
    });
    return {
      ...state,
      items: {
        ...state.items,
        byPath: {
          ...createLookupTable(items),
          ...state.items.byPath
        }
      }
    };
  },
  [fetchGlobalPreferencesComplete.type]: (state, { payload }) => {
    if (nnou(payload.clipboard)) {
      const clipboard = JSON.parse(payload.clipboard);
      let hours = moment().diff(moment(clipboard.timestamp), 'hours');
      if (hours >= 24) {
        return state;
      } else {
        return {
          ...state,
          clipboard
        };
      }
    } else {
      return state;
    }
  },
  [changeSite.type]: () => initialState
});

export default reducer;
