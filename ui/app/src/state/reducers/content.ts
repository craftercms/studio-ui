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

type ContentState = GlobalState['content'];

const initialState: ContentState = {
  quickCreate: {
    error: null,
    isFetching: false,
    items: null
  },
  permissions: null,
  items: {
    byId: null
  },
  clipboard: null
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
    permissions: {
      ...state.permissions,
      [payload.path]: createPresenceTable(payload.permissions)
    }
  }),
  [fetchDetailedItemComplete.type]: (state, { payload }) => {
    return {
      ...state,
      items: {
        ...state.items,
        byId: { ...state.items.byId, [payload.id]: payload }
      }
    };
  },
  [setClipBoard.type]: (state, { payload }) => ({
    ...state,
    clipboard: payload.path
  }),
  [unSetClipBoard.type]: (state) => ({
    ...state,
    clipboard: null
  })
});

export default reducer;
