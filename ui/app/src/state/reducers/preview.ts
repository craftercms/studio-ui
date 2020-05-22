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
import GlobalState, { PagedEntityState } from '../../models/GlobalState';
import {
  BROWSE_COMPONENT_INSTANCES,
  CHANGE_CURRENT_URL,
  CHILDREN_MAP_UPDATE,
  CLEAR_RECEPTACLES,
  CLEAR_SELECT_FOR_EDIT,
  CLOSE_TOOLS,
  CONTENT_TYPE_RECEPTACLES_RESPONSE,
  FETCH_ASSETS_PANEL_ITEMS,
  FETCH_ASSETS_PANEL_ITEMS_COMPLETE,
  FETCH_ASSETS_PANEL_ITEMS_FAILED,
  FETCH_AUDIENCES_PANEL_FORM_DEFINITION,
  FETCH_AUDIENCES_PANEL_FORM_DEFINITION_COMPLETE,
  FETCH_AUDIENCES_PANEL_FORM_DEFINITION_FAILED,
  FETCH_COMPONENTS_BY_CONTENT_TYPE,
  FETCH_COMPONENTS_BY_CONTENT_TYPE_COMPLETE,
  FETCH_COMPONENTS_BY_CONTENT_TYPE_FAILED,
  FETCH_CONTENT_MODEL_COMPLETE,
  fetchPreviewToolsConfigComplete,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT,
  GUEST_MODELS_RECEIVED,
  OPEN_TOOLS,
  SELECT_FOR_EDIT,
  SELECT_PREVIOUS_TOOL,
  SELECT_TOOL,
  SET_ACTIVE_TARGETING_MODEL,
  SET_ACTIVE_TARGETING_MODEL_COMPLETE,
  SET_ACTIVE_TARGETING_MODEL_FAILED,
  SET_CONTENT_TYPE_FILTER,
  SET_HOST_HEIGHT,
  SET_HOST_SIZE,
  SET_HOST_WIDTH,
  SET_ITEM_BEING_DRAGGED,
  UPDATE_AUDIENCES_PANEL_MODEL
} from '../actions/preview';
import { createEntityState, createLookupTable, nnou, nou } from '../../utils/object';
import {
  ComponentsContentTypeParams,
  ContentInstancePage,
  ElasticParams,
  MediaItem,
  SearchResult
} from '../../models/Search';
import ContentInstance from '../../models/ContentInstance';
import PreviewTool from '../../models/PreviewTool';
import { changeSite } from './sites';
import { envInitialState } from './env';

const audiencesPanelInitialState = {
  isFetching: false,
  isApplying: false,
  error: null,
  contentType: null,
  model: null,
  applied: false
};

const guestBase = envInitialState.guestBase;

const reducer = createReducer<GlobalState['preview']>({
  // What's shown to the user across the board (url, address bar, etc)
  computedUrl: '',
  // The src of the iframe
  currentUrl: envInitialState.previewLandingBase,
  hostSize: { width: null, height: null },
  showToolsPanel: false,
  previousTool: null,
  // Don't change/commit the tool you're working with. Use your .env.development to set it
  selectedTool: (process.env.REACT_APP_PREVIEW_TOOL_SELECTED as PreviewTool) || null,
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
  audiencesPanel: audiencesPanelInitialState,
  components: createEntityState({
    page: [],
    query: {
      keywords: '',
      offset: 0,
      limit: 10,
      type: 'Component'
    },
    contentTypeFilter: ''
  }) as PagedEntityState<ContentInstance>,
  receptacles: {
    selectedContentType: null,
    byId: null
  }
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
    };
  },
  [CLOSE_TOOLS]: (state) => {
    return {
      ...state,
      showToolsPanel: false
    };
  },
  [fetchPreviewToolsConfigComplete.type]: (state, { payload }) => {
    return {
      ...state,
      tools: payload.modules
    };
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
    };
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
    };
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
    };
  },
  [FETCH_CONTENT_MODEL_COMPLETE]: (state, { payload }) => {
    return {
      ...state,
      currentModels: payload
    };
  },
  [GUEST_CHECK_IN]: (state, { payload }) => {
    const { location, modelId } = payload;
    const href = location.href;
    const origin = location.origin;
    const url = href.replace(location.origin, '');
    return {
      ...state,
      guest: {
        url,
        origin,
        modelId,
        models: null,
        childrenMap: null,
        selected: null,
        itemBeingDragged: null
      },
      computedUrl: payload.__CRAFTERCMS_GUEST_LANDING__ ? '' : url,
      // Setting URL causes dual reload when guest navigation occurs
      // currentUrl: (payload.url && payload.origin ? payload.url.replace(payload.origin, '') : null) ?? state.currentUrl,
      // TODO: Retrieval of guestBase from initialState is not right.
      // currentUrl: payload.__CRAFTERCMS_GUEST_LANDING__
      //   ? envInitialState.previewLandingBase
      //   : `${origin}${url}`
    };
  },
  [GUEST_CHECK_OUT]: (state) => {
    let nextState = state;
    if (state.guest) {
      nextState = {
        ...nextState,
        guest: null
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
    };
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
    };
  },
  [CHANGE_CURRENT_URL]: (state, { payload }) => (
    (state.currentUrl === payload)
      ? state
      : {
        ...state,
        computedUrl: payload,
        currentUrl: `${guestBase}${payload}`
      }
  ),
  [changeSite.type]: (state, { payload }) => {

    let nextState = {
      ...state,
      tools: null,
      audiencesPanel: audiencesPanelInitialState
    };

    // TODO: If there's a guest it would have checked out?
    // if (state.guest) {
    //   nextState = { ...nextState, guest: null };
    // }

    if (payload.nextUrl !== nextState.currentUrl) {
      nextState = {
        ...nextState,
        computedUrl: payload.nextUrl,
        currentUrl: `${guestBase}${payload.nextUrl}`
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
    };
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
  [SET_ACTIVE_TARGETING_MODEL]: (state, { payload }) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      isApplying: true
    }
  }),
  [SET_ACTIVE_TARGETING_MODEL_COMPLETE]: (state, { payload }) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      isApplying: false,
      applied: true
    }
  }),
  [SET_ACTIVE_TARGETING_MODEL_FAILED]: (state, { payload }) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      isApplying: false,
      applied: false,
      error: payload.response
    }
  }),
  [FETCH_ASSETS_PANEL_ITEMS]: (state, { payload: query }: { payload: ElasticParams }) => {
    let newQuery = { ...state.assets.query, ...query };
    return {
      ...state,
      assets: {
        ...state.assets,
        isFetching: true,
        query: newQuery,
        pageNumber: Math.ceil(newQuery.offset / newQuery.limit)
      }
    };
  },
  [FETCH_ASSETS_PANEL_ITEMS_COMPLETE]: (state, { payload: searchResult }: { payload: SearchResult }) => {
    let itemsLookupTable = createLookupTable<MediaItem>(searchResult.items, 'path');
    let page = [...state.assets.page];
    page[state.assets.pageNumber] = searchResult.items.map(item => item.path);
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
    };
  },
  [FETCH_ASSETS_PANEL_ITEMS_FAILED]: (state, { payload }) => ({
    ...state,
    assets: { ...state.assets, error: payload.response, isFetching: false }
  }),
  [FETCH_COMPONENTS_BY_CONTENT_TYPE]: (state, { payload: { contentTypeFilter, options } }: { payload: { contentTypeFilter: string[] | string, options?: ComponentsContentTypeParams } }) => {
    let newQuery = { ...state.components.query, ...options };
    return {
      ...state,
      components: {
        ...state.components,
        isFetching: true,
        query: newQuery,
        pageNumber: Math.ceil(newQuery.offset / newQuery.limit),
        contentTypeFilter: contentTypeFilter ? contentTypeFilter : state.components.contentTypeFilter
      }
    };
  },
  [FETCH_COMPONENTS_BY_CONTENT_TYPE_COMPLETE]: (state, { payload }: { payload: ContentInstancePage }) => {
    let page = [...state.components.page];
    page[state.components.pageNumber] = Object.keys(payload.lookup);
    return {
      ...state,
      components: {
        ...state.components,
        byId: { ...state.components.byId, ...payload.lookup },
        page,
        count: payload.count,
        isFetching: false,
        error: null
      }
    };
  },
  [FETCH_COMPONENTS_BY_CONTENT_TYPE_FAILED]: (state, { payload }) => ({
    ...state,
    components: { ...state.components, error: payload.response, isFetching: false }
  }),
  [BROWSE_COMPONENT_INSTANCES]: (state, { payload }) => ({
    ...state,
    selectedTool: 'craftercms.ice.browseComponents',
    components: { ...state.components, contentTypeFilter: payload }
  }),
  [CONTENT_TYPE_RECEPTACLES_RESPONSE]: (state, { payload }) => ({
    ...state,
    receptacles: {
      ...state.receptacles,
      selectedContentType: payload.contentTypeId,
      byId: { ...state.receptacles.byId, ...createLookupTable(payload.receptacles) }
    }
  }),
  [CLEAR_RECEPTACLES]: (state, { payload }) => ({
    ...state,
    receptacles: {
      ...state.receptacles,
      selectedContentType: null,
      byId: null
    }
  }),
  [SET_CONTENT_TYPE_FILTER]: (state, { payload }) => ({
    ...state,
    components: {
      ...state.components,
      isFetching: null,
      contentTypeFilter: payload,
      query: {
        ...state.components.query,
        offset: 0,
        keywords: ''
      }
    }
  }),
  [CHILDREN_MAP_UPDATE]: (state, { payload }) => ({
    ...state,
    guest: {
      ...state.guest,
      childrenMap: {
        ...state.guest.childrenMap,
        ...payload
      }
    }
  })
});

function minFrameSize(suggestedSize: number): number {
  return suggestedSize === null ? null : suggestedSize < 320 ? 320 : suggestedSize;
}

export default reducer;
