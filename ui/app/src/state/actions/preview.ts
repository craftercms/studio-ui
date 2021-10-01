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

import { StandardAction } from '../../models/StandardAction';
import ContentType, { ContentTypeField } from '../../models/ContentType';
import ContentInstance from '../../models/ContentInstance';
import { WidthAndHeight } from '../../models/WidthAndHeight';
import { createAction } from '@reduxjs/toolkit';
import { ComponentsContentTypeParams, ContentInstancePage, ElasticParams, SearchResult } from '../../models/Search';
import { ContentTypeDropTarget } from '../../models/ContentTypeDropTarget';
import { WidgetDescriptor } from '../../components/Widget';
import LookupTable from '../../models/LookupTable';
import { DetailedItem } from '../../models/Item';
import { HighlightMode } from '../../models/GlobalState';

// region Accommodation Action Creators

export const hostCheckIn = /*#__PURE__*/ createAction('HOST_CHECK_IN');
export const guestCheckIn = /*#__PURE__*/ createAction('GUEST_CHECK_IN');
export const guestCheckOut = /*#__PURE__*/ createAction('GUEST_CHECK_OUT');
export const fetchGuestModel = /*#__PURE__*/ createAction('FETCH_GUEST_MODEL');
export const guestSiteLoad = /*#__PURE__*/ createAction('GUEST_SITE_LOAD'); // Legacy guest check in
export const sortItemOperation = /*#__PURE__*/ createAction('SORT_ITEM_OPERATION');
export const sortItemOperationComplete = /*#__PURE__*/ createAction('SORT_ITEM_OPERATION_COMPLETE');
export const insertComponentOperation = /*#__PURE__*/ createAction('INSERT_COMPONENT_OPERATION');
export const insertOperationComplete = /*#__PURE__*/ createAction('INSERT_OPERATION_COMPLETE');
export const insertInstanceOperation = /*#__PURE__*/ createAction('INSERT_INSTANCE_OPERATION');
export const insertItemOperation = /*#__PURE__*/ createAction('INSERT_ITEM_OPERATION');
export const moveItemOperation = /*#__PURE__*/ createAction('MOVE_ITEM_OPERATION');
export const deleteItemOperation = /*#__PURE__*/ createAction('DELETE_ITEM_OPERATION');
export const deleteItemOperationComplete = /*#__PURE__*/ createAction('DELETE_ITEM_OPERATION_COMPLETE');
export const updateFieldValueOperation = /*#__PURE__*/ createAction('UPDATE_FIELD_VALUE_OPERATION');
export const iceZoneSelected = /*#__PURE__*/ createAction('ICE_ZONE_SELECTED');
export const clearSelectedZones = /*#__PURE__*/ createAction('CLEAR_SELECTED_ZONES');
export const assetDragStarted = /*#__PURE__*/ createAction('ASSET_DRAG_STARTED');
export const assetDragEnded = /*#__PURE__*/ createAction('ASSET_DRAG_ENDED');
export const componentDragStarted = /*#__PURE__*/ createAction('COMPONENT_DRAG_STARTED');
export const componentDragEnded = /*#__PURE__*/ createAction('COMPONENT_DRAG_ENDED');
export const trashed = /*#__PURE__*/ createAction<{ iceId: number }>('TRASHED');
export const contentTypesResponse = /*#__PURE__*/ createAction('CONTENT_TYPES_RESPONSE');
export const instanceDragBegun = /*#__PURE__*/ createAction('INSTANCE_DRAG_BEGUN');
export const instanceDragEnded = /*#__PURE__*/ createAction('INSTANCE_DRAG_ENDED');
export const navigationRequest = /*#__PURE__*/ createAction('NAVIGATION_REQUEST');
export const reloadRequest = /*#__PURE__*/ createAction('RELOAD_REQUEST');
export const desktopAssetDrop = /*#__PURE__*/ createAction('DESKTOP_ASSET_DROP');
export const desktopAssetUploadComplete = /*#__PURE__*/ createAction<{ record; path: string }>(
  'DESKTOP_ASSET_UPLOAD_COMPLETE'
);
export const desktopAssetUploadProgress = /*#__PURE__*/ createAction('DESKTOP_ASSET_UPLOAD_PROGRESS');
export const desktopAssetUploadStarted = /*#__PURE__*/ createAction('DESKTOP_ASSET_UPLOAD_STARTED');
export const componentInstanceDragStarted = /*#__PURE__*/ createAction('COMPONENT_INSTANCE_DRAG_STARTED');
export const componentInstanceDragEnded = /*#__PURE__*/ createAction('COMPONENT_INSTANCE_DRAG_ENDED');
export const contentTypeDropTargetsRequest = /*#__PURE__*/ createAction<{ contentTypeId: string }>(
  'CONTENT_TYPE_DROP_TARGETS_REQUEST'
);
export const contentTypeDropTargetsResponse = /*#__PURE__*/ createAction('CONTENT_TYPE_DROP_TARGETS_RESPONSE');
export const scrollToDropTarget = /*#__PURE__*/ createAction('SCROLL_TO_DROP_TARGET');
export const clearHighlightedDropTargets = /*#__PURE__*/ createAction('CLEAR_HIGHLIGHTED_DROP_TARGETS');
export const contentTreeFieldSelected =
  /*#__PURE__*/ createAction<{ iceProps; scrollElement: string; name: string }>('CONTENT_TREE_FIELD_SELECTED');
export const clearContentTreeFieldSelected = /*#__PURE__*/ createAction('CLEAR_CONTENT_TREE_FIELD_SELECTED');
export const validationMessage = /*#__PURE__*/ createAction('VALIDATION_MESSAGE');
export const editModeToggleHotkey = /*#__PURE__*/ createAction('EDIT_MODE_TOGGLE_HOTKEY');
export const showEditDialog = /*#__PURE__*/ createAction('SHOW_EDIT_DIALOG');
export const updateRteConfig = /*#__PURE__*/ createAction('UPDATE_RTE_CONFIG');
export const highlightModeChanged = /*#__PURE__*/ createAction('HIGHLIGHT_MODE_CHANGED');
export const contentTypesRequest = /*#__PURE__*/ createAction('CONTENT_TYPES_REQUEST');
export const guestModelsReceived = /*#__PURE__*/ createAction('GUEST_MODELS_RECEIVED');
export const desktopAssetDragStarted = /*#__PURE__*/ createAction('DESKTOP_ASSET_DRAG_STARTED');
export const desktopAssetDragEnded = /*#__PURE__*/ createAction('DESKTOP_ASSET_DRAG_ENDED');
export const childrenMapUpdate = /*#__PURE__*/ createAction('CHILDREN_MAP_UPDATE');
export const contentTreeSwitchFieldInstance = /*#__PURE__*/ createAction<{ type: string; scrollElement: string }>(
  'CONTENT_TREE_SWITCH_FIELD_INSTANCE'
);

// endregion

// region Actions

export const SELECT_FOR_EDIT = 'SELECT_FOR_EDIT';
export const CLEAR_SELECT_FOR_EDIT = 'CLEAR_SELECT_FOR_EDIT';
export const OPEN_TOOLS = 'OPEN_TOOLS';
export const CLOSE_TOOLS = 'CLOSE_TOOLS';
export const SET_HOST_SIZE = 'SET_HOST_SIZE';
export const SET_HOST_WIDTH = 'SET_HOST_WIDTH';
export const SET_HOST_HEIGHT = 'SET_HOST_HEIGHT';
export const FETCH_CONTENT_TYPES = 'FETCH_CONTENT_TYPES';
export const FETCH_CONTENT_TYPES_COMPLETE = 'FETCH_CONTENT_TYPES_COMPLETE';
export const FETCH_CONTENT_TYPES_FAILED = 'FETCH_CONTENT_TYPES_FAILED';
export const FETCH_CONTENT_MODEL_COMPLETE = 'FETCH_CONTENT_MODEL_COMPLETE';
export const SET_ITEM_BEING_DRAGGED = 'SET_ITEM_BEING_DRAGGED';
export const CHANGE_CURRENT_URL = 'CHANGE_CURRENT_URL';
export const FETCH_ASSETS_PANEL_ITEMS = 'FETCH_ASSETS_PANEL_ITEMS';
export const FETCH_ASSETS_PANEL_ITEMS_COMPLETE = 'FETCH_ASSETS_PANEL_ITEMS_COMPLETE';
export const FETCH_ASSETS_PANEL_ITEMS_FAILED = 'FETCH_ASSETS_PANEL_ITEMS_FAILED';
export const UPDATE_AUDIENCES_PANEL_MODEL = 'UPDATE_AUDIENCES_PANEL_MODEL';
export const SET_ACTIVE_TARGETING_MODEL = 'SET_ACTIVE_TARGETING_MODEL';
export const SET_ACTIVE_TARGETING_MODEL_COMPLETE = 'SET_ACTIVE_TARGETING_MODEL_COMPLETE';
export const SET_ACTIVE_TARGETING_MODEL_FAILED = 'SET_ACTIVE_TARGETING_MODEL_FAILED';
export const CLEAR_DROP_TARGETS = 'CLEAR_DROP_TARGETS';
export const SET_CONTENT_TYPE_FILTER = 'SET_CONTENT_TYPE_FILTER';
export const EMBEDDED_LEGACY_FORM_CLOSE = 'EMBEDDED_LEGACY_FORM_CLOSE';
export const EMBEDDED_LEGACY_FORM_SUCCESS = 'EMBEDDED_LEGACY_FORM_SUCCESS';
export const EMBEDDED_LEGACY_FORM_RENDERED = 'EMBEDDED_LEGACY_FORM_RENDERED';
export const EMBEDDED_LEGACY_FORM_RENDER_FAILED = 'EMBEDDED_LEGACY_FORM_RENDER_FAILED';
export const EMBEDDED_LEGACY_FORM_PENDING_CHANGES = 'EMBEDDED_LEGACY_FORM_PENDING_CHANGES';
export const EMBEDDED_LEGACY_FORM_SAVE = 'EMBEDDED_LEGACY_FORM_SAVE';
export const EMBEDDED_LEGACY_FORM_FAILURE = 'EMBEDDED_LEGACY_FORM_FAILURE';
export const LEGACY_CODE_EDITOR_SUCCESS = 'LEGACY_CODE_EDITOR_SUCCESS';
export const LEGACY_CODE_EDITOR_CLOSE = 'LEGACY_CODE_EDITOR_CLOSE';
export const LEGACY_CODE_EDITOR_PENDING_CHANGES = 'LEGACY_CODE_EDITOR_PENDING_CHANGES';
export const LEGACY_CODE_EDITOR_RENDERED = 'LEGACY_CODE_EDITOR_RENDERED';
export const EMBEDDED_LEGACY_MINIMIZE_REQUEST = 'EMBEDDED_LEGACY_MINIMIZE_REQUEST';

// endregion

// region Action Creators

export function selectForEdit(data: { modelId: string; fields: string[] }): StandardAction {
  return {
    type: SELECT_FOR_EDIT,
    payload: data
  };
}

export function clearSelectForEdit() {
  return { type: CLEAR_SELECT_FOR_EDIT };
}

export const openToolsPanel = /*#__PURE__*/ createAction(OPEN_TOOLS);

export const closeToolsPanel = /*#__PURE__*/ createAction(CLOSE_TOOLS);

export function setHostSize(dimensions: WidthAndHeight): StandardAction {
  return {
    type: SET_HOST_SIZE,
    payload: dimensions
  };
}

export const fetchContentTypes = /*#__PURE__*/ createAction(FETCH_CONTENT_TYPES);

export function fetchContentTypesComplete(contentTypes: ContentType[]): StandardAction {
  return {
    type: FETCH_CONTENT_TYPES_COMPLETE,
    payload: contentTypes
  };
}

export function fetchContentTypesFailed(error): StandardAction {
  return {
    type: FETCH_CONTENT_TYPES_FAILED,
    payload: error
  };
}

export function fetchContentModelComplete(contentModels: ContentInstance[]): StandardAction {
  return {
    type: FETCH_CONTENT_MODEL_COMPLETE,
    payload: contentModels
  };
}

export const checkInGuest = /*#__PURE__*/ createAction<{
  location: Partial<Location>;
  path: string;
  site: string;
  documentDomain?: string;
}>(guestCheckIn.type);

export function checkOutGuest(): StandardAction {
  return {
    type: guestCheckOut.type
  };
}

// This action is meant for the primary Guest model. The reducer
// should set the guest.modelId of the model that comes in payload.
export const fetchPrimaryGuestModelComplete = /*#__PURE__*/ createAction<{
  model: ContentInstance;
  modelLookup: LookupTable<ContentInstance>;
  childrenMap: LookupTable<string[]>;
}>('FETCH_PRIMARY_GUEST_MODEL_COMPLETE');

// This action is meant for the other Guest models that aren't the main.
// The reducer will shouldn't set the guest.modelId.
export const fetchGuestModelComplete = /*#__PURE__*/ createAction<{
  modelLookup: LookupTable<ContentInstance>;
  childrenMap: LookupTable<string[]>;
}>('FETCH_GUEST_MODELS_COMPLETE');

export const guestModelUpdated = /*#__PURE__*/ createAction<{ model: ContentInstance }>('GUEST_MODEL_UPDATED');

export const guestPathUpdated = /*#__PURE__*/ createAction<{ path: string }>('GUEST_PATH_UPDATED');

export const changeCurrentUrl = /*#__PURE__*/ createAction<string>(CHANGE_CURRENT_URL);

export function setItemBeingDragged(iceId: number): StandardAction {
  return {
    type: SET_ITEM_BEING_DRAGGED,
    payload: iceId
  };
}

export const fetchAudiencesPanelModel =
  /*#__PURE__*/ createAction<{ fields: LookupTable<ContentTypeField> }>('FETCH_AUDIENCES_PANEL_MODEL');

export const fetchAudiencesPanelModelComplete = /*#__PURE__*/ createAction<ContentInstance>(
  'FETCH_AUDIENCES_PANEL_MODEL_COMPLETE'
);

export const fetchAudiencesPanelModelFailed = /*#__PURE__*/ createAction('FETCH_AUDIENCES_PANEL_MODEL_FAILED');

export function updateAudiencesPanelModel(data): StandardAction {
  return {
    type: UPDATE_AUDIENCES_PANEL_MODEL,
    payload: data
  };
}

export function setActiveTargetingModel(): StandardAction {
  return {
    type: SET_ACTIVE_TARGETING_MODEL
  };
}

export function setActiveTargetingModelComplete(data): StandardAction {
  return {
    type: SET_ACTIVE_TARGETING_MODEL_COMPLETE,
    payload: data
  };
}

export function setActiveTargetingModelFailed(error): StandardAction {
  return {
    type: SET_ACTIVE_TARGETING_MODEL_FAILED,
    payload: error
  };
}

export const fetchAssetsPanelItems = /*#__PURE__*/ createAction<Partial<ElasticParams>>(FETCH_ASSETS_PANEL_ITEMS);

export const fetchAssetsPanelItemsComplete = /*#__PURE__*/ createAction<SearchResult>(
  FETCH_ASSETS_PANEL_ITEMS_COMPLETE
);

export const fetchAssetsPanelItemsFailed = /*#__PURE__*/ createAction(FETCH_ASSETS_PANEL_ITEMS_FAILED);

export const fetchComponentsByContentType = /*#__PURE__*/ createAction<Partial<ComponentsContentTypeParams>>(
  'FETCH_COMPONENTS_BY_CONTENT_TYPE'
);

export const fetchComponentsByContentTypeComplete = /*#__PURE__*/ createAction<ContentInstancePage>(
  'FETCH_COMPONENTS_BY_CONTENT_TYPE_COMPLETE'
);

export const fetchComponentsByContentTypeFailed = /*#__PURE__*/ createAction('FETCH_COMPONENTS_BY_CONTENT_TYPE_FAILED');

export const clearDropTargets = /*#__PURE__*/ createAction(CLEAR_DROP_TARGETS);

export const setContentTypeDropTargets = /*#__PURE__*/ createAction<{
  contentType: string;
  dropTarget: ContentTypeDropTarget;
}>(contentTypeDropTargetsResponse.type);

export const setContentTypeFilter = /*#__PURE__*/ createAction<string>(SET_CONTENT_TYPE_FILTER);

export const updateToolsPanelWidth = /*#__PURE__*/ createAction<{ width: number }>('UPDATE_TOOLS_PANEL_WIDTH');

export const setPreviewEditMode =
  /*#__PURE__*/ createAction<{ editMode: boolean; highlightMode?: HighlightMode }>('EDIT_MODE_CHANGED');

export const previewItem = /*#__PURE__*/ createAction<{ item: DetailedItem; newTab?: boolean }>('PREVIEW_ITEM');

export const updateIcePanelWidth = /*#__PURE__#*/ createAction<{ width: number }>('UPDATE_ICE_PANEL_WIDTH');

export const initToolsPanelConfig = /*#__PURE__*/ createAction<{
  configXml: string;
  storedPage?: WidgetDescriptor;
  toolsPanelWidth?: number;
}>('INIT_TOOLS_PANEL_CONFIG');

export const initToolbarConfig = /*#__PURE__*/ createAction<{ configXml: string }>('INIT_TOOLBAR_CONFIG');

export const initIcePanelConfig = /*#__PURE__*/ createAction<{
  configXml: string;
  icePanelWidth?: number;
}>('INIT_ICE_PANEL_CONFIG');

export const initRichTextEditorConfig =
  /*#__PURE__*/ createAction<{ configXml: string; siteId: string }>('INIT_RICH_TEXT_EDITOR_CONFIG');

export const dissociateTemplate = /*#__PURE__*/ createAction<{ contentTypeId: string }>('DISSOCIATE_TEMPLATE');

export const dissociateTemplateComplete =
  /*#__PURE__*/ createAction<{ contentTypeId: string }>('DISSOCIATE_TEMPLATE_COMPLETE');

export const dissociateTemplateFailed = /*#__PURE__*/ createAction('DISSOCIATE_TEMPLATE_FAILED');

// endregion

// region toolsPanelPageStack

export const pushToolsPanelPage = /*#__PURE__*/ createAction<WidgetDescriptor>('PUSH_TOOLS_PANEL_PAGE');

export const popToolsPanelPage = /*#__PURE__*/ createAction('POP_TOOLS_PANEL_PAGE');

// endregion

// region ICE panel stack

export const pushIcePanelPage = /*#__PURE__*/ createAction<WidgetDescriptor>('PUSH_ICE_PANEL_PAGE');

export const popIcePanelPage = /*#__PURE__*/ createAction('POP_ICE_PANEL_PAGE');

// endregion

// region settings Mode

export const setHighlightMode = /*#__PURE__*/ createAction<{ highlightMode: HighlightMode }>('HIGHLIGHT_MODE_CHANGED');

// endregion

// region navigation stack
export const goToLastPage = /*#__PURE__*/ createAction<string>('GO_TO_LAST_PAGE');
export const goToNextPage = /*#__PURE__*/ createAction('GO_TO_NEXT_PAGE');
// endregion
