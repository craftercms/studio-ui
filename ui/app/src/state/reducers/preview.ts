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
  clearDropTargets,
  clearSelectForEdit,
  closeToolsPanel,
  contentTypeDropTargetsResponse,
  fetchAssetsPanelItems,
  fetchAssetsPanelItemsComplete,
  fetchAssetsPanelItemsFailed,
  fetchAudiencesPanelModel,
  fetchAudiencesPanelModelComplete,
  fetchAudiencesPanelModelFailed,
  fetchComponentsByContentType,
  fetchComponentsByContentTypeComplete,
  fetchComponentsByContentTypeFailed,
  fetchContentModelComplete,
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
  selectForEdit,
  setActiveTargetingModel,
  setActiveTargetingModelComplete,
  setActiveTargetingModelFailed,
  setContentTypeFilter,
  setEditModePadding,
  setHighlightMode,
  setHostHeight,
  setHostSize,
  setHostWidth,
  setItemBeingDragged,
  setPreviewEditMode,
  toggleEditModePadding,
  updateAudiencesPanelModel,
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
import { ComponentsContentTypeParams, ContentInstancePage, ElasticParams, MediaItem } from '../../models/Search';
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
  editModePadding: false
};

const minDrawerWidth = 240;
const maxDrawerWidth = 500;

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

const reducer = createReducer<GlobalState['preview']>(initialState, (builder) => {
  builder
    .addCase(openToolsPanel, (state) => ({
      ...state,
      showToolsPanel: true
    }))
    .addCase(closeToolsPanel, (state) => ({
      ...state,
      showToolsPanel: false
    }))
    .addCase(setHostSize, (state, { payload }) => {
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
    })
    .addCase(setHostWidth, (state, { payload }) => {
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
    })
    .addCase(setHostHeight, (state, { payload }) => {
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
    })
    .addCase(fetchContentModelComplete, (state, { payload }) => {
      return {
        ...state,
        currentModels: payload
      };
    })
    .addCase(guestCheckIn, (state, { payload }) => {
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
    })
    .addCase(guestCheckOut, (state) => {
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
    })
    .addCase(fetchPrimaryGuestModelComplete, fetchGuestModelsCompleteHandler)
    .addCase(fetchGuestModelComplete, fetchGuestModelsCompleteHandler)
    .addCase(guestModelUpdated, (state, { payload: { model } }) => ({
      ...state,
      guest: {
        ...state.guest,
        models: {
          ...state.guest.models,
          [model.craftercms.id]: model
        }
      }
    }))
    .addCase(selectForEdit, (state, { payload }) => {
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
    })
    .addCase(clearSelectForEdit, (state, { payload }) => {
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
    })
    .addCase(setItemBeingDragged, (state, { payload }) => {
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
    })
    .addCase(fetchAudiencesPanelModel, (state) => ({
      ...state,
      audiencesPanel: {
        ...state.audiencesPanel,
        isFetching: true,
        error: null
      }
    }))
    .addCase(fetchAudiencesPanelModelComplete, (state, { payload }) => {
      return {
        ...state,
        audiencesPanel: {
          ...state.audiencesPanel,
          isFetching: false,
          error: null,
          model: payload
        }
      };
    })
    .addCase(fetchAudiencesPanelModelFailed, (state, { payload }) => ({
      ...state,
      audiencesPanel: { ...state.audiencesPanel, error: payload.response, isFetching: false }
    }))
    .addCase(updateAudiencesPanelModel, (state, { payload }) => ({
      ...state,
      audiencesPanel: {
        ...state.audiencesPanel,
        applied: false,
        model: {
          ...state.audiencesPanel.model,
          ...payload
        }
      }
    }))
    .addCase(setActiveTargetingModel, (state, { payload }) => ({
      ...state,
      audiencesPanel: {
        ...state.audiencesPanel,
        isApplying: true
      }
    }))
    .addCase(setActiveTargetingModelComplete, (state, { payload }) => ({
      ...state,
      audiencesPanel: {
        ...state.audiencesPanel,
        isApplying: false,
        applied: true
      }
    }))
    .addCase(setActiveTargetingModelFailed, (state, { payload }) => ({
      ...state,
      audiencesPanel: {
        ...state.audiencesPanel,
        isApplying: false,
        applied: false,
        error: payload.response
      }
    }))
    .addCase(fetchAssetsPanelItems, (state, { payload: query }) => {
      let newQuery = { ...state.assets.query, ...(query as Partial<ElasticParams>) };
      return {
        ...state,
        assets: {
          ...state.assets,
          isFetching: true,
          query: newQuery,
          pageNumber: Math.ceil(newQuery.offset / newQuery.limit)
        }
      };
    })
    .addCase(fetchAssetsPanelItemsComplete, (state, { payload: searchResult }) => {
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
    })
    .addCase(fetchAssetsPanelItemsFailed, (state, { payload }) => ({
      ...state,
      assets: { ...state.assets, error: payload.response, isFetching: false }
    }))
    .addCase(fetchComponentsByContentType, (state, { payload }) => {
      return {
        ...state,
        components: {
          ...state.components,
          isFetching: true,
          query: { ...state.components.query, ...(payload as Partial<ComponentsContentTypeParams>) },
          pageNumber: Math.ceil(
            ((payload as Partial<ComponentsContentTypeParams>).offset ?? state.components.query.offset) /
              state.components.query.limit
          )
        }
      };
    })
    .addCase(fetchComponentsByContentTypeComplete, (state, { payload }: { payload: ContentInstancePage }) => {
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
    })
    .addCase(fetchComponentsByContentTypeFailed, (state, { payload }) => ({
      ...state,
      components: { ...state.components, error: payload.response, isFetching: false }
    }))
    .addCase(contentTypeDropTargetsResponse, (state, { payload }) => ({
      ...state,
      dropTargets: {
        ...state.dropTargets,
        selectedContentType: payload.contentTypeId,
        byId: { ...state.dropTargets.byId, ...createLookupTable(payload.dropTargets) }
      }
    }))
    .addCase(clearDropTargets, (state) => ({
      ...state,
      dropTargets: {
        ...state.dropTargets,
        selectedContentType: null,
        byId: null
      }
    }))
    .addCase(setContentTypeFilter, (state, { payload }) => ({
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
    }))
    .addCase(setPreviewEditMode, (state, { payload }) => ({
      ...state,
      editMode: payload.editMode,
      highlightMode: payload.highlightMode ?? state.highlightMode
    }))
    .addCase(updateToolsPanelWidth, (state, { payload }) => {
      if (payload.width < minDrawerWidth || payload.width > maxDrawerWidth) {
        return state;
      }
      return {
        ...state,
        toolsPanelWidth: payload.width
      };
    })
    .addCase(updateIcePanelWidth, (state, { payload }) => {
      if (payload.width < minDrawerWidth || payload.width > maxDrawerWidth) {
        return state;
      }
      return {
        ...state,
        icePanelWidth: payload.width
      };
    })
    .addCase(pushToolsPanelPage, (state, { payload }) => {
      return {
        ...state,
        toolsPanelPageStack: [...state.toolsPanelPageStack, payload]
      };
    })
    .addCase(popToolsPanelPage, (state) => {
      let stack = [...state.toolsPanelPageStack];
      stack.pop();
      return {
        ...state,
        toolsPanelPageStack: stack
      };
    })
    .addCase(pushIcePanelPage, (state, { payload }) => {
      return {
        ...state,
        icePanelStack: [...state.icePanelStack, payload]
      };
    })
    .addCase(popIcePanelPage, (state) => {
      let stack = [...state.icePanelStack];
      stack.pop();
      return {
        ...state,
        icePanelStack: stack
      };
    })
    .addCase(guestPathUpdated, (state, { payload }) => ({
      ...state,
      guest: {
        ...state.guest,
        path: payload.path
      }
    }))
    .addCase(setHighlightMode, (state, { payload }) => ({
      ...state,
      highlightMode: payload.highlightMode
    }))
    .addCase(changeSite, (state) => {
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
    })
    .addCase(initToolsPanelConfig, (state, { payload }) => {
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

      const toolsPanelWidth =
        payload.toolsPanelWidth < minDrawerWidth
          ? minDrawerWidth
          : payload.toolsPanelWidth > maxDrawerWidth
          ? maxDrawerWidth
          : payload.toolsPanelWidth;

      return {
        ...state,
        ...(payload.storedPage && { toolsPanelPageStack: [payload.storedPage] }),
        toolsPanel: toolsPanelConfig,
        toolsPanelWidth: toolsPanelWidth ?? state.toolsPanelWidth
      };
    })
    // After re-fetching site ui config (e.g. when config is modified), we need the tools to be
    // re-initialized with the latest config. The components checks for whether their property is null before
    // initializing so props must be nulled when config gets re-fetched in order for the components to re-initialize.
    .addCase(fetchSiteUiConfigComplete, (state) => ({
      ...state,
      toolsPanel: initialState.toolsPanel,
      toolbar: initialState.toolbar,
      icePanel: initialState.icePanel,
      richTextEditor: initialState.richTextEditor
    }))
    .addCase(initToolbarConfig, (state, { payload }) => {
      let toolbarConfig = {
        leftSection: { widgets: [] },
        middleSection: { widgets: [] },
        rightSection: { widgets: [] }
      };
      const arrays = ['widgets'];
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
    })
    .addCase(initIcePanelConfig, (state, { payload }) => {
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

      const icePanelWidth =
        payload.icePanelWidth < minDrawerWidth
          ? minDrawerWidth
          : payload.icePanelWidth > maxDrawerWidth
          ? maxDrawerWidth
          : payload.icePanelWidth;

      return {
        ...state,
        ...(payload.storedPage && { icePanelStack: [payload.storedPage] }),
        icePanel: icePanelConfig,
        icePanelWidth: icePanelWidth ?? state.icePanelWidth
      };
    })
    .addCase(initRichTextEditorConfig, (state, { payload }) => {
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
    })
    .addCase(setEditModePadding, (state, { payload }) => ({
      ...state,
      editModePadding: payload.editModePadding
    }))
    .addCase(toggleEditModePadding, (state) => ({
      ...state,
      editModePadding: !state.editModePadding
    }));
});

function minFrameSize(suggestedSize: number): number {
  return suggestedSize === null ? null : suggestedSize < 320 ? 320 : suggestedSize;
}

export default reducer;
