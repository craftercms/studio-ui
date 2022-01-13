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

import GlobalState from '../../models/GlobalState';
import { createEntityState, createLookupTable } from '../../utils/object';
import { createReducer } from '@reduxjs/toolkit';
import {
  associateTemplateComplete,
  dissociateTemplateComplete,
  FETCH_CONTENT_TYPES,
  FETCH_CONTENT_TYPES_COMPLETE,
  FETCH_CONTENT_TYPES_FAILED
} from '../actions/preview';
import ContentType from '../../models/ContentType';
import { changeSite } from './sites';

const reducer = createReducer<GlobalState['contentTypes']>(createEntityState(), {
  [changeSite.type]: () => createEntityState(),
  [FETCH_CONTENT_TYPES]: (state) => ({
    ...state,
    isFetching: true
  }),
  [FETCH_CONTENT_TYPES_COMPLETE]: (state, { payload: contentTypes }) => ({
    ...state,
    byId: createLookupTable<ContentType>(contentTypes),
    isFetching: false,
    error: null
  }),
  [FETCH_CONTENT_TYPES_FAILED]: (state, { payload }) => ({
    ...state,
    error: payload.response,
    isFetching: false
  }),
  [associateTemplateComplete.type]: (state, { payload }) => ({
    ...state,
    byId: {
      ...state.byId,
      [payload.contentTypeId]: {
        ...state.byId[payload.contentTypeId],
        displayTemplate: payload.displayTemplate
      }
    }
  }),
  [dissociateTemplateComplete.type]: (state, { payload }) => ({
    ...state,
    byId: {
      ...state.byId,
      [payload.contentTypeId]: {
        ...state.byId[payload.contentTypeId],
        displayTemplate: ''
      }
    }
  })
});

export default reducer;
