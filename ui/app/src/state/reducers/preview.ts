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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState, { PagedEntityState } from '../../models/GlobalState';
import {
  CLEAR_DROP_TARGETS,
  CLEAR_SELECT_FOR_EDIT,
  closeToolsPanel,
  contentTypeDropTargetsResponse,
  FETCH_ASSETS_PANEL_ITEMS,
  FETCH_ASSETS_PANEL_ITEMS_COMPLETE,
  FETCH_ASSETS_PANEL_ITEMS_FAILED,
  FETCH_CONTENT_MODEL_COMPLETE,
  fetchAudiencesPanelModel,
  fetchAudiencesPanelModelComplete,
  fetchAudiencesPanelModelFailed,
  fetchComponentsByContentType,
  fetchComponentsByContentTypeComplete,
  fetchComponentsByContentTypeFailed,
  fetchGuestModelComplete,
  fetchPrimaryGuestModelComplete,
  guestCheckIn,
  guestCheckOut,
  guestModelUpdated,
  guestPathUpdated,
  initIcePanelConfig,
  initRichTextEditorConfig,
  initToolbarConfig,
  initToolsPanelConfig,
  openToolsPanel,
  popIcePanelPage,
  popToolsPanelPage,
  pushIcePanelPage,
  pushToolsPanelPage,
  SELECT_FOR_EDIT,
  SET_ACTIVE_TARGETING_MODEL,
  SET_ACTIVE_TARGETING_MODEL_COMPLETE,
  SET_ACTIVE_TARGETING_MODEL_FAILED,
  SET_CONTENT_TYPE_FILTER,
  SET_HOST_HEIGHT,
  SET_HOST_SIZE,
  SET_HOST_WIDTH,
  SET_ITEM_BEING_DRAGGED,
  setEditModePadding,
  setHighlightMode,
  setPreviewEditMode,
  setWindowSize,
  toggleEditModePadding,
  UPDATE_AUDIENCES_PANEL_MODEL,
  updateIcePanelWidth,
  updateToolsPanelWidth
} from '../actions/preview';
import {
  applyDeserializedXMLTransforms,
  createEntityState,
  createLookupTable,
  nnou,
  nou,
  reversePluckProps
} from '../../utils/object';
import { ContentInstancePage, ElasticParams, MediaItem, SearchResult } from '../../models/Search';
import ContentInstance from '../../models/ContentInstance';
import { changeSite } from '../actions/sites';
import { deserialize, fromString } from '../../utils/xml';
import { defineMessages } from 'react-intl';
import LookupTable from '../../models/LookupTable';
import { fetchSiteUiConfigComplete } from '../actions/configuration';
import ToolsPanelTarget from '../../models/ToolsPanelTarget';

const messages = defineMessages({
  emptyUiConfigMessageTitle: {
    id: 'emptyUiConfigMessageTitle.title',
    defaultMessage: 'Configuration is empty'
  },
  emptyUiConfigMessageSubtitle: {
    id: 'emptyUiConfigMessageTitle.subtitle',
    defaultMessage: 'Nothing is set to be shown here.'
  },
  noUiConfigMessageTitle: {
    id: 'noUiConfigMessageTitle.title',
    defaultMessage: 'Configuration file missing'
  },
  noUiConfigMessageSubtitle: {
    id: 'noUiConfigMessageTitle.subtitle',
    defaultMessage: 'Add & configure `ui.xml` on your project to show content here.'
  }
});

const audiencesPanelInitialState = {
  isFetching: null,
  isApplying: false,
  error: null,
  model: null,
  applied: false
};

const assetsPanelInitialState = createEntityState({
  page: [],
  query: {
    keywords: '',
    offset: 0,
    limit: 10,
    filters: {
      'mime-type': ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'image/svg+xml']
    }
  }
}) as PagedEntityState<MediaItem>;

const componentsInitialState = createEntityState({
  page: [],
  query: {
    keywords: '',
    offset: 0,
    limit: 10
  },
  contentTypeFilter: 'all',
  inPageInstances: {}
}) as PagedEntityState<ContentInstance>;

const initialState: GlobalState['preview'] = {
  editMode: true,
  highlightMode: 'all',
  hostSize: { width: null, height: null },
  toolsPanelPageStack: [],
  showToolsPanel: process.env.REACT_APP_SHOW_TOOLS_PANEL ? process.env.REACT_APP_SHOW_TOOLS_PANEL === 'true' : true,
  toolsPanelWidth: 240,
  icePanelWidth: 240,
  icePanelStack: [],
  guest: null,
  assets: assetsPanelInitialState,
  audiencesPanel: audiencesPanelInitialState,
  components: componentsInitialState,
  dropTargets: {
    selectedContentType: null,
    byId: null
  },
  toolsPanel: null,
  toolbar: {
    leftSection: null,
    middleSection: null,
    rightSection: null
  },
  icePanel: null,
  richTextEditor: null,
  editModePadding: false,
  windowSize: null
};

const minDrawerWidth = 240;
const minPreviewWidth = 320;

const fetchGuestModelsCompleteHandler = (state, { type, payload }) => {
  if (nnou(state.guest)) {
    return {
      ...state,
      guest: {
        ...state.guest,
        modelId: type === fetchPrimaryGuestModelComplete.type ? payload.model.craftercms.id : state.guest.modelId,
        models: {
          ...state.guest.models,
          ...payload.modelLookup
        },
        modelIdByPath: {
          ...state.guest.modelIdByPath,
          ...payload.modelIdByPath
        },
        hierarchyMap: {
          ...state.guest?.hierarchyMap,
          ...payload.hierarchyMap
        }
      }
    };
  } else {
    // TODO: Currently getting models before check in some cases when coming from a different site.
    console.error('[reducer/preview] Guest models received before guest check in.');
    return state;
  }
};

const reducer = createReducer<GlobalState['preview']>(initialState, {
  [openToolsPanel.type]: (state) => {
    const { windowSize, toolsPanelWidth, icePanelWidth } = state;
    let adjustedToolsPanelWidth = toolsPanelWidth;
    let adjustedIcePanelWidth = icePanelWidth;
    if (windowSize - icePanelWidth - toolsPanelWidth < 320) {
      adjustedToolsPanelWidth = minDrawerWidth;
      adjustedIcePanelWidth = windowSize - 320 - minDrawerWidth;
    }

    return {
      ...state,
      showToolsPanel: true,
      toolsPanelWidth: adjustedToolsPanelWidth,
      icePanelWidth: adjustedIcePanelWidth
    };
  },
  [closeToolsPanel.type]: (state) => {
    return {
      ...state,
      showToolsPanel: false
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
  [guestCheckIn.type]: (state, { payload }) => {
    const { location, path } = payload;
    const href = location.href;
    const origin = location.origin;
    const url = href.replace(location.origin, '');
    return {
      ...state,
      guest: {
        url,
        origin,
        modelId: null,
        path,
        models: null,
        hierarchyMap: null,
        modelIdByPath: null,
        selected: null,
        itemBeingDragged: null
      }
    };
  },
  [guestCheckOut.type]: (state) => {
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
  [fetchPrimaryGuestModelComplete.type]: fetchGuestModelsCompleteHandler,
  [fetchGuestModelComplete.type]: fetchGuestModelsCompleteHandler,
  [guestModelUpdated.type]: (state, { payload: { model } }) => ({
    ...state,
    guest: {
      ...state.guest,
      models: {
        ...state.guest.models,
        [model.craftercms.id]: model
      }
    }
  }),
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
  [fetchAudiencesPanelModel.type]: (state) => ({
    ...state,
    audiencesPanel: {
      ...state.audiencesPanel,
      isFetching: true,
      error: null
    }
  }),
  [fetchAudiencesPanelModelComplete.type]: (state, { payload }) => {
    return {
      ...state,
      audiencesPanel: {
        ...state.audiencesPanel,
        isFetching: false,
        error: null,
        model: payload
      }
    };
  },
  [fetchAudiencesPanelModelFailed.type]: (state, { payload }) => ({
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
    page[state.assets.pageNumber] = searchResult.items.map((item) => item.path);
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
  [fetchComponentsByContentType.type]: (state, { payload }) => {
    return {
      ...state,
      components: {
        ...state.components,
        isFetching: true,
        query: { ...state.components.query, ...payload },
        pageNumber: Math.ceil((payload.offset ?? state.components.query.offset) / state.components.query.limit)
      }
    };
  },
  [fetchComponentsByContentTypeComplete.type]: (state, { payload }: { payload: ContentInstancePage }) => {
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
  [fetchComponentsByContentTypeFailed.type]: (state, { payload }) => ({
    ...state,
    components: { ...state.components, error: payload.response, isFetching: false }
  }),
  [contentTypeDropTargetsResponse.type]: (state, { payload }) => ({
    ...state,
    dropTargets: {
      ...state.dropTargets,
      selectedContentType: payload.contentTypeId,
      byId: { ...state.dropTargets.byId, ...createLookupTable(payload.dropTargets) }
    }
  }),
  [CLEAR_DROP_TARGETS]: (state, { payload }) => ({
    ...state,
    dropTargets: {
      ...state.dropTargets,
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
      pageNumber: 0,
      query: {
        ...state.components.query,
        offset: 0
      }
    }
  }),
  [setPreviewEditMode.type]: (state, { payload }) => {
    const { toolsPanelWidth, icePanelWidth } = state;
    let adjustedToolsPanelWidth = toolsPanelWidth;
    let adjustedIcePanelWidth = icePanelWidth;
    if (payload.editMode) {
      const { windowSize } = state;
      if (windowSize - toolsPanelWidth - icePanelWidth < minPreviewWidth) {
        adjustedIcePanelWidth = minDrawerWidth;
        adjustedToolsPanelWidth = windowSize - minPreviewWidth - minDrawerWidth;
      }
    }

    return {
      ...state,
      editMode: payload.editMode,
      highlightMode: payload.highlightMode ?? state.highlightMode,
      icePanelWidth: adjustedIcePanelWidth,
      toolsPanelWidth: adjustedToolsPanelWidth
    };
  },
  [updateToolsPanelWidth.type]: (state, { payload }) => {
    const { windowSize, editMode, icePanelWidth } = state;
    const maxWidth = windowSize - (editMode ? icePanelWidth : 0) - minPreviewWidth;
    // when resizing tools panel, leave at least 320px for preview.
    if (payload.width < minDrawerWidth || payload.width > maxWidth) {
      return state;
    }
    return {
      ...state,
      toolsPanelWidth: payload.width
    };
  },
  [updateIcePanelWidth.type]: (state, { payload }) => {
    const { windowSize, showToolsPanel, toolsPanelWidth } = state;
    const maxWidth = windowSize - (showToolsPanel ? toolsPanelWidth : 0) - minPreviewWidth;
    // When resizing ice panel, leave at least 320px for preview.
    if (payload.width < minDrawerWidth || payload.width > maxWidth) {
      return state;
    }
    return {
      ...state,
      icePanelWidth: payload.width
    };
  },
  [pushToolsPanelPage.type]: (state, { payload }) => {
    return {
      ...state,
      toolsPanelPageStack: [...state.toolsPanelPageStack, payload]
    };
  },
  [popToolsPanelPage.type]: (state) => {
    let stack = [...state.toolsPanelPageStack];
    stack.pop();
    return {
      ...state,
      toolsPanelPageStack: stack
    };
  },
  [pushIcePanelPage.type]: (state, { payload }) => {
    return {
      ...state,
      icePanelStack: [...state.icePanelStack, payload]
    };
  },
  [popIcePanelPage.type]: (state) => {
    let stack = [...state.icePanelStack];
    stack.pop();
    return {
      ...state,
      icePanelStack: stack
    };
  },
  [guestPathUpdated.type]: (state, { payload }) => ({
    ...state,
    guest: {
      ...state.guest,
      path: payload.path
    }
  }),
  [setHighlightMode.type]: (state, { payload }) => ({
    ...state,
    highlightMode: payload.highlightMode
  }),
  [changeSite.type]: (state) => {
    return {
      ...state,
      ...reversePluckProps(
        initialState,
        'editMode',
        'highlightMode',
        'showToolsPanel',
        'toolsPanelWidth',
        'icePanelWidth'
      )
    };
  },
  [initToolsPanelConfig.type]: (state, { payload }) => {
    let toolsPanelConfig = {
      widgets: [
        {
          id: 'craftercms.component.EmptyState',
          uiKey: -1,
          configuration: {
            title: messages.noUiConfigMessageTitle,
            subtitle: messages.noUiConfigMessageSubtitle
          }
        }
      ]
    };
    const arrays = ['widgets', 'permittedRoles', 'excludes'];
    const lookupTables = ['fields'];
    const configDOM = fromString(payload.configXml);
    const toolsPanelPages = configDOM.querySelector(
      '[id="craftercms.components.ToolsPanel"] > configuration > widgets'
    );
    if (toolsPanelPages) {
      toolsPanelConfig = applyDeserializedXMLTransforms(deserialize(toolsPanelPages), {
        arrays,
        lookupTables
      });
    }

    return {
      ...state,
      ...(payload.storedPage && { toolsPanelPageStack: [payload.storedPage] }),
      toolsPanel: toolsPanelConfig,
      toolsPanelWidth: payload.toolsPanelWidth ?? state.toolsPanelWidth
    };
  },
  // After re-fetching site ui config (e.g. when config is modified), we need the tools to be
  // re-initialized with the latest config. The components checks for whether their property is null before
  // initializing so props must be nulled when config gets re-fetched in order for the components to re-initialize.
  [fetchSiteUiConfigComplete.type]: (state) => ({
    ...state,
    toolsPanel: initialState.toolsPanel,
    toolbar: initialState.toolbar,
    icePanel: initialState.icePanel,
    richTextEditor: initialState.richTextEditor
  }),
  [initToolbarConfig.type]: (state, { payload }) => {
    let toolbarConfig = {
      leftSection: { widgets: [] },
      middleSection: { widgets: [] },
      rightSection: { widgets: [] }
    };
    const arrays = ['widgets', 'permittedRoles'];
    const configDOM = fromString(payload.configXml);
    const toolbar = configDOM.querySelector('[id="craftercms.components.PreviewToolbar"] > configuration');

    if (toolbar) {
      const leftSection = toolbar.querySelector('leftSection > widgets');
      if (leftSection) {
        toolbarConfig.leftSection = applyDeserializedXMLTransforms(deserialize(leftSection), {
          arrays
        });
      }
      const middleSection = toolbar.querySelector('middleSection > widgets');
      if (middleSection) {
        toolbarConfig.middleSection = applyDeserializedXMLTransforms(deserialize(middleSection), {
          arrays
        });
      }
      const rightSection = toolbar.querySelector('rightSection > widgets');
      if (rightSection) {
        toolbarConfig.rightSection = applyDeserializedXMLTransforms(deserialize(rightSection), {
          arrays
        });
      }
    }

    return {
      ...state,
      toolbar: toolbarConfig
    };
  },
  [initIcePanelConfig.type]: (state, { payload }) => {
    let icePanelConfig = {
      widgets: [
        {
          id: 'craftercms.component.EmptyState',
          uiKey: -1,
          configuration: {
            title: messages.noUiConfigMessageTitle,
            subtitle: messages.noUiConfigMessageSubtitle
          }
        }
      ]
    };
    const arrays = ['widgets', 'devices', 'values'];
    const configDOM = fromString(payload.configXml);
    const icePanel = configDOM.querySelector('[id="craftercms.components.ICEToolsPanel"] > configuration > widgets');
    if (icePanel) {
      const lookupTables = ['fields'];
      icePanel.querySelectorAll('widget').forEach((e) => {
        if (e.getAttribute('id') === 'craftercms.components.ToolsPanelPageButton') {
          let target: ToolsPanelTarget = 'icePanel';
          e.querySelector(':scope > configuration')?.setAttribute('target', target);
        }
      });
      icePanelConfig = applyDeserializedXMLTransforms(deserialize(icePanel), {
        arrays,
        lookupTables
      });
    }

    return {
      ...state,
      ...(payload.storedPage && { icePanelStack: [payload.storedPage] }),
      icePanel: icePanelConfig,
      icePanelWidth: payload.icePanelWidth ?? state.icePanelWidth
    };
  },
  [initRichTextEditorConfig.type]: (state, { payload }) => {
    let rteConfig = {};
    const arrays = ['setups'];
    const renameTable = { '#text': 'data' };
    const configDOM = fromString(payload.configXml);
    const rte = configDOM.querySelector('[id="craftercms.components.TinyMCE"] > configuration');
    if (rte) {
      try {
        const conf = applyDeserializedXMLTransforms(deserialize(rte), {
          arrays,
          renameTable
        }).configuration;
        let setups: LookupTable = {};

        conf.setups.forEach((setup) => {
          setup.tinymceOptions = JSON.parse(setup.tinymceOptions.replaceAll('{site}', payload.siteId));
          setups[setup.id] = setup;
        });

        rteConfig = setups;
      } catch (e) {
        console.error(e);
      }
    }

    return {
      ...state,
      richTextEditor: rteConfig
    };
  },
  [setEditModePadding.type]: (state, { payload }) => ({
    ...state,
    editModePadding: payload.editModePadding
  }),
  [toggleEditModePadding.type]: (state) => ({
    ...state,
    editModePadding: !state.editModePadding
  }),
  [setWindowSize.type]: (state, { payload }) => {
    const windowSize = payload.size;
    const { editMode, icePanelWidth, showToolsPanel, toolsPanelWidth } = state;
    const result = windowSize - (showToolsPanel ? toolsPanelWidth : 0) - (editMode ? icePanelWidth : 0);
    let adjustedToolsPanelWidth = toolsPanelWidth < minDrawerWidth ? minDrawerWidth : toolsPanelWidth;
    let adjustedIcePanelWidth = icePanelWidth < minDrawerWidth ? minDrawerWidth : icePanelWidth;
    // if window size is less than minimum (320), or if both panels are bigger than window size, update tools panel and
    // ice panel accordingly.
    if (result < 0) {
      adjustedToolsPanelWidth = minDrawerWidth;
      adjustedIcePanelWidth = minDrawerWidth;
    } else if (result < minPreviewWidth) {
      adjustedToolsPanelWidth =
        toolsPanelWidth - result / 2 < minDrawerWidth ? minDrawerWidth : toolsPanelWidth - result / 2;
      adjustedIcePanelWidth = icePanelWidth - result / 2 < minDrawerWidth ? minDrawerWidth : icePanelWidth - result / 2;
    }
    return {
      ...state,
      windowSize: windowSize,
      toolsPanelWidth: adjustedToolsPanelWidth,
      icePanelWidth: adjustedIcePanelWidth
    };
  }
});

function minFrameSize(suggestedSize: number): number {
  return suggestedSize === null ? null : suggestedSize < 320 ? 320 : suggestedSize;
}

export default reducer;
