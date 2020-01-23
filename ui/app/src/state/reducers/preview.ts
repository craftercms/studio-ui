/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import GlobalState, { PagedEntityState } from '../../models/GlobalState';
import {
  CHANGE_CURRENT_URL,
  CLEAR_SELECT_FOR_EDIT,
  CLOSE_TOOLS,
  FETCH_ASSETS_PANEL_ITEMS,
  FETCH_ASSETS_PANEL_ITEMS_COMPLETE,
  FETCH_ASSETS_PANEL_ITEMS_FAILED,
  FETCH_AUDIENCES_PANEL_FORM_DEFINITION,
  FETCH_AUDIENCES_PANEL_FORM_DEFINITION_COMPLETE,
  FETCH_AUDIENCES_PANEL_FORM_DEFINITION_FAILED,
  FETCH_CONTENT_MODEL_COMPLETE,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT,
  GUEST_MODELS_RECEIVED,
  OPEN_TOOLS,
  SELECT_FOR_EDIT,
  SELECT_PREVIOUS_TOOL,
  SELECT_TOOL,
  SET_ACTIVE_MODEL,
  SET_ACTIVE_MODEL_COMPLETE,
  SET_ACTIVE_MODEL_FAILED,
  SET_HOST_HEIGHT,
  SET_HOST_SIZE,
  SET_HOST_WIDTH,
  SET_ITEM_BEING_DRAGGED,
  TOOLS_LOADED,
  UPDATE_AUDIENCES_PANEL_MODEL
} from '../actions/preview';
import { createEntityState, createLookupTable, nnou, nou } from '../../utils/object';
import { CHANGE_SITE } from '../actions/sites';
import { ElasticParams, MediaItem, SearchResult } from '../../models/Search';

// TODO: Notes on currentUrl, computedUrl and guest.url...

const audiencesPanelInitialState = {
  isFetching: false,
  isApplying: false,
  error: null,
  contentType: null,
  model: null,
  applied: false
};

const reducer = createReducer<GlobalState['preview']>({
  computedUrl: null,
  currentUrl: '/studio/preview-landing',
  hostSize: { width: null, height: null },
  showToolsPanel: true,
  previousTool: null,
  selectedTool: 'craftercms.ice.assets',
  tools: null,
  guest: null,
  assets: createEntityState({
    page: [],
    query: {
      keywords: '',
      offset: 0,
      limit: 10,
      filters: {
        'mime-type': ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'image/svg+xml']
      }
    }
  }) as PagedEntityState<MediaItem>,
  audiencesPanel: audiencesPanelInitialState
}, {
  [SELECT_TOOL]: (state, { payload }) => ({
    ...state,
    previousTool: state.selectedTool,
    selectedTool: payload
  }),
  [SELECT_PREVIOUS_TOOL]: (state, { payload }) => {
    return {
      ...state,
      previousTool: state.selectedTool,
      selectedTool: payload
    };
  },
  [OPEN_TOOLS]: (state) => {
    return {
      ...state,
      showToolsPanel: true
    }
  },
  [CLOSE_TOOLS]: (state) => {
    return {
      ...state,
      showToolsPanel: false
    }
  },
  [TOOLS_LOADED]: (state, { payload }) => {
    return {
      ...state,
      tools: payload
    }
  },
  [SET_HOST_SIZE]: (state, { payload }) => {
    if (isNaN(payload.width)) {
      payload.width = state.hostSize.width;
    }
    if (isNaN(payload.height)) {
      payload.height = state.hostSize.height;
    }
    return {
      ...state,
      hostSize: {
        ...state.hostSize,
        width: minFrameSize(payload.width),
        height: minFrameSize(payload.height)
      }
    }
  },
  [SET_HOST_WIDTH]: (state, { payload }) => {
    if (isNaN(payload)) {
      return state;
    }
    return {
      ...state,
      hostSize: {
        ...state.hostSize,
        width: minFrameSize(payload)
      }
    }
  },
  [SET_HOST_HEIGHT]: (state, { payload }) => {
    if (isNaN(payload)) {
      return state;
    }
    return {
      ...state,
      hostSize: {
        ...state.hostSize,
        height: minFrameSize(payload)
      }
    }
  },
  [FETCH_CONTENT_MODEL_COMPLETE]: (state, { payload }) => {
    return {
      ...state,
      currentModels: payload
    }
  },
  [GUEST_CHECK_IN]: (state, { payload }) => {
    return {
      ...state,
      // Setting URL causes dual reload when guest navigation occurs
      // currentUrl: (payload.url && payload.origin ? payload.url.replace(payload.origin, '') : null) ?? state.currentUrl,
      guest: {
        selected: null,
        itemBeingDragged: false,
        ...payload
      },
      computedUrl: payload.__CRAFTERCMS_GUEST_LANDING__ ? '' : payload.url
    }
  },
  [GUEST_CHECK_OUT]: (state) => {
    let nextState = state;
    if (state.guest) {
      nextState = {
        ...nextState,
        guest: null,
        computedUrl: state.guest.url
      };
    }
    // If guest checks out, doesn't mean site is changing necessarily
    // hence content types haven't changed
    // if (state.contentTypes) {
    //   nextState = { ...nextState, contentTypes: null };
    // }
    return nextState;
  },
  [GUEST_MODELS_RECEIVED]: (state, { payload }) => {
    if (nnou(state.guest)) {
      return {
        ...state,
        guest: {
          ...state.guest,
          models: {
            ...state.guest.models,
            ...payload
          }
        }
      };
    } else {
      // TODO: Currently getting models before check in some cases when coming from a different site.
      console.error('[reducer/preview] Guest models received before guest check in.');
      return state;
    }
  },
  [SELECT_FOR_EDIT]: (state, { payload }) => {
    if (state.guest === null) {
      return state;
    }
    return {
      ...state,
      guest: {
        ...state.guest,
        selected: [payload]
      }
    }
  },
  [CLEAR_SELECT_FOR_EDIT]: (state, { payload }) => {
    if (state.guest === null) {
      return state;
    }
    return {
      ...state,
      guest: {
        ...state.guest,
        selected: null
      }
    };
  },
  [SET_ITEM_BEING_DRAGGED]: (state, { payload }) => {
    if (nou(state.guest)) {
      return state;
    }
    return {
      ...state,
      guest: {
        ...state.guest,
        itemBeingDragged: payload
      }
    }
  },
  [CHANGE_CURRENT_URL]: (state, { payload }) => (
    (state.currentUrl === payload)
      ? state
      : {
        ...state,
        currentUrl: payload
      }
  ),
  [CHANGE_SITE]: (state, { payload }) => {
    let nextState = state;
    // TODO: If there's a guest it would have checked out?
    // if (state.guest) {
    //   nextState = { ...nextState, guest: null };
    // }

    nextState = {
      ...nextState,
      audiencesPanel: audiencesPanelInitialState
    };

    if (payload.nextUrl !== nextState.currentUrl) {
      nextState = {
        ...nextState,
        currentUrl: payload.nextUrl
      };
    }
    return nextState;
  },
  [FETCH_AUDIENCES_PANEL_FORM_DEFINITION]: (state) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      isFetching: true,
      error: null
    }
  }),
  [FETCH_AUDIENCES_PANEL_FORM_DEFINITION_COMPLETE]: (state, { payload }) => {
    return {
      ...state,
      audiencesPanel: {
        ...state.audiencesPanel,
        isFetching: false,
        error: null,
        contentType: payload.contentType,
        model: payload.model
      }
    }
  },
  [FETCH_AUDIENCES_PANEL_FORM_DEFINITION_FAILED]: (state, { payload }) => ({
    ...state,
    audiencesPanel: { ...state.audiencesPanel, error: payload.response, isFetching: false }
  }),
  [UPDATE_AUDIENCES_PANEL_MODEL]: (state, { payload }) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      applied: false,
      model: {
        ...state.audiencesPanel.model,
        ...payload
      }
    }
  }),
  [SET_ACTIVE_MODEL]: (state, { payload }) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      isApplying: true,
    }
  }),
  [SET_ACTIVE_MODEL_COMPLETE]: (state, { payload }) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      isApplying: false,
      applied: true
    }
  }),
  [SET_ACTIVE_MODEL_FAILED]: (state, { payload }) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      isApplying: false,
      applied: false,
      error: payload.response
    }
  }),
  [FETCH_ASSETS_PANEL_ITEMS]: (state, { payload: query }: { payload: ElasticParams }) => {
    let new_query = { ...state.assets.query, ...query };
    return {
      ...state,
      assets: {
        ...state.assets,
        isFetching: true,
        query: new_query,
        pageNumber: Math.ceil(new_query.offset / new_query.limit),
      }
    }
  },
  [FETCH_ASSETS_PANEL_ITEMS_COMPLETE]: (state, { payload: searchResult }: { payload: SearchResult }) => {
    let itemsLookupTable = createLookupTable<MediaItem>(searchResult.items, 'path');
    let page = [...state.assets.page];
    page[state.assets.pageNumber] = Object.keys(itemsLookupTable);
    return {
      ...state,
      assets: {
        ...state.assets,
        byId: { ...state.assets.byId, ...itemsLookupTable },
        page,
        count: searchResult.total,
        isFetching: false,
        error: null
      }
    }
  },
  [FETCH_ASSETS_PANEL_ITEMS_FAILED]: (state, { payload }) => ({
    ...state,
    assets: { ...state.assets, error: payload.response, isFetching: false }
  })
});

function minFrameSize(suggestedSize: number): number {
  return suggestedSize === null ? null : suggestedSize < 320 ? 320 : suggestedSize;
}

export default reducer;
