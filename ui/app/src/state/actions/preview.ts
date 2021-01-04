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
import { GuestData } from '../../models/GlobalState';
import { ComponentsContentTypeParams, ContentInstancePage, ElasticParams, SearchResult } from '../../models/Search';
import { ContentTypeReceptacle } from '../../models/ContentTypeReceptacle';
import { WidgetDescriptor } from '../../components/Widget';
import LookupTable from '../../models/LookupTable';

// region Accommodation Actions
// To be moved to a common file for sharing across apps

export const HOST_CHECK_IN = 'HOST_CHECK_IN';
export const GUEST_CHECK_IN = 'GUEST_CHECK_IN';
export const GUEST_CHECK_OUT = 'GUEST_CHECK_OUT';
export const FETCH_GUEST_MODEL = 'FETCH_GUEST_MODEL';
export const GUEST_SITE_LOAD = 'GUEST_SITE_LOAD'; // Legacy guest check in
export const SORT_ITEM_OPERATION = 'SORT_ITEM_OPERATION';
export const SORT_ITEM_OPERATION_COMPLETE = 'SORT_ITEM_OPERATION_COMPLETE';
export const INSERT_COMPONENT_OPERATION = 'INSERT_COMPONENT_OPERATION';
export const INSERT_OPERATION_COMPLETE = 'INSERT_OPERATION_COMPLETE';
export const INSERT_INSTANCE_OPERATION = 'INSERT_INSTANCE_OPERATION';
export const INSERT_ITEM_OPERATION = 'INSERT_ITEM_OPERATION';
export const MOVE_ITEM_OPERATION = 'MOVE_ITEM_OPERATION';
export const DELETE_ITEM_OPERATION = 'DELETE_ITEM_OPERATION';
export const DELETE_ITEM_OPERATION_COMPLETE = 'DELETE_ITEM_OPERATION_COMPLETE';
export const UPDATE_FIELD_VALUE_OPERATION = 'UPDATE_FIELD_VALUE_OPERATION';
export const ICE_ZONE_SELECTED = 'ICE_ZONE_SELECTED';
export const CLEAR_SELECTED_ZONES = 'CLEAR_SELECTED_ZONES';
export const EDIT_MODE_CHANGED = 'EDIT_MODE_CHANGED';
export const ASSET_DRAG_STARTED = 'ASSET_DRAG_STARTED';
export const ASSET_DRAG_ENDED = 'ASSET_DRAG_ENDED';
export const COMPONENT_DRAG_STARTED = 'COMPONENT_DRAG_STARTED';
export const COMPONENT_DRAG_ENDED = 'COMPONENT_DRAG_ENDED';
export const TRASHED = 'TRASHED';
export const CONTENT_TYPES_RESPONSE = 'CONTENT_TYPES_RESPONSE';
export const INSTANCE_DRAG_BEGUN = 'INSTANCE_DRAG_BEGUN';
export const INSTANCE_DRAG_ENDED = 'INSTANCE_DRAG_ENDED';
export const NAVIGATION_REQUEST = 'NAVIGATION_REQUEST';
export const RELOAD_REQUEST = 'RELOAD_REQUEST';
export const DESKTOP_ASSET_DROP = 'DESKTOP_ASSET_DROP';
export const DESKTOP_ASSET_UPLOAD_COMPLETE = 'DESKTOP_ASSET_UPLOAD_COMPLETE';
export const DESKTOP_ASSET_UPLOAD_PROGRESS = 'DESKTOP_ASSET_UPLOAD_PROGRESS';
export const DESKTOP_ASSET_UPLOAD_STARTED = 'DESKTOP_ASSET_UPLOAD_STARTED';
export const COMPONENT_INSTANCE_DRAG_STARTED = 'COMPONENT_INSTANCE_DRAG_STARTED';
export const COMPONENT_INSTANCE_DRAG_ENDED = 'COMPONENT_INSTANCE_DRAG_ENDED';
export const COMPONENT_INSTANCE_HTML_REQUEST = 'COMPONENT_INSTANCE_HTML_REQUEST';
export const COMPONENT_INSTANCE_HTML_RESPONSE = 'COMPONENT_INSTANCE_HTML_RESPONSE';
export const CONTENT_TYPE_RECEPTACLES_REQUEST = 'CONTENT_TYPE_RECEPTACLES_REQUEST';
export const CONTENT_TYPE_RECEPTACLES_RESPONSE = 'CONTENT_TYPE_RECEPTACLES_RESPONSE';
export const SCROLL_TO_RECEPTACLE = 'SCROLL_TO_RECEPTACLE';
export const CLEAR_HIGHLIGHTED_RECEPTACLES = 'CLEAR_HIGHLIGHTED_RECEPTACLES';
export const CONTENT_TREE_FIELD_SELECTED = 'CONTENT_TREE_FIELD_SELECTED';
export const CLEAR_CONTENT_TREE_FIELD_SELECTED = 'CLEAR_CONTENT_TREE_FIELD_SELECTED';
export const VALIDATION_MESSAGE = 'VALIDATION_MESSAGE';
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
export const FETCH_COMPONENTS_BY_CONTENT_TYPE = 'FETCH_COMPONENTS_BY_CONTENT_TYPE';
export const FETCH_COMPONENTS_BY_CONTENT_TYPE_COMPLETE = 'FETCH_COMPONENTS_BY_CONTENT_TYPE_COMPLETE';
export const FETCH_COMPONENTS_BY_CONTENT_TYPE_FAILED = 'FETCH_COMPONENTS_BY_CONTENT_TYPE_FAILED';
export const UPDATE_AUDIENCES_PANEL_MODEL = 'UPDATE_AUDIENCES_PANEL_MODEL';
export const SET_ACTIVE_TARGETING_MODEL = 'SET_ACTIVE_TARGETING_MODEL';
export const SET_ACTIVE_TARGETING_MODEL_COMPLETE = 'SET_ACTIVE_TARGETING_MODEL_COMPLETE';
export const SET_ACTIVE_TARGETING_MODEL_FAILED = 'SET_ACTIVE_TARGETING_MODEL_FAILED';
export const CLEAR_RECEPTACLES = 'CLEAR_RECEPTACLES';
export const SET_CONTENT_TYPE_FILTER = 'SET_CONTENT_TYPE_FILTER';
export const EMBEDDED_LEGACY_FORM_CLOSE = 'EMBEDDED_LEGACY_FORM_CLOSE';
export const EMBEDDED_LEGACY_FORM_SUCCESS = 'EMBEDDED_LEGACY_FORM_SUCCESS';
export const EMBEDDED_LEGACY_FORM_RENDERED = 'EMBEDDED_LEGACY_FORM_RENDERED';
export const EMBEDDED_LEGACY_FORM_PENDING_CHANGES = 'EMBEDDED_LEGACY_FORM_PENDING_CHANGES';
export const EMBEDDED_LEGACY_FORM_SAVE = 'EMBEDDED_LEGACY_FORM_SAVE';
export const EMBEDDED_LEGACY_FORM_FAILURE = 'EMBEDDED_LEGACY_FORM_FAILURE';
export const LEGACY_CODE_EDITOR_SUCCESS = 'LEGACY_CODE_EDITOR_SUCCESS';
export const LEGACY_CODE_EDITOR_CLOSE = 'LEGACY_CODE_EDITOR_CLOSE';
export const LEGACY_CODE_EDITOR_RENDERED = 'LEGACY_CODE_EDITOR_RENDERED';

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

export function openTools(): StandardAction {
  return { type: OPEN_TOOLS };
}

export function closeTools(): StandardAction {
  return { type: CLOSE_TOOLS };
}

export function setHostSize(dimensions: WidthAndHeight): StandardAction {
  return {
    type: SET_HOST_SIZE,
    payload: dimensions
  };
}

export const fetchContentTypes = createAction(FETCH_CONTENT_TYPES);

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

export function checkInGuest(data: GuestData): StandardAction {
  return {
    type: GUEST_CHECK_IN,
    payload: data
  };
}

export function checkOutGuest(): StandardAction {
  return {
    type: GUEST_CHECK_OUT
  };
}

// This action is meant for the primary Guest model. The reducer
// should set the guest.modelId of the model that comes in payload.
export const fetchPrimaryGuestModelComplete = createAction<{
  model: ContentInstance;
  modelLookup: LookupTable<ContentInstance>;
  childrenMap: LookupTable<string[]>;
}>('FETCH_PRIMARY_GUEST_MODEL_COMPLETE');

// This action is meant for the other Guest models that aren't the main.
// The reducer will shouldn't set the guest.modelId.
export const fetchGuestModelComplete = createAction<{
  modelLookup: LookupTable<ContentInstance>;
  childrenMap: LookupTable<string[]>;
}>('FETCH_GUEST_MODELS_COMPLETE');

export const guestModelUpdated = createAction<{ model: ContentInstance }>('GUEST_MODEL_UPDATED');

export const guestPathUpdated = createAction<{ path: string }>('GUEST_PATH_UPDATED');

export function changeCurrentUrl(nextValue: string): StandardAction {
  return {
    type: CHANGE_CURRENT_URL,
    payload: nextValue
  };
}

export function setItemBeingDragged(iceId: number): StandardAction {
  return {
    type: SET_ITEM_BEING_DRAGGED,
    payload: iceId
  };
}

export const fetchAudiencesPanelModel = createAction<{ fields: LookupTable<ContentTypeField> }>(
  'FETCH_AUDIENCES_PANEL_MODEL'
);

export const fetchAudiencesPanelModelComplete = createAction<ContentInstance>('FETCH_AUDIENCES_PANEL_MODEL_COMPLETE');

export const fetchAudiencesPanelModelFailed = createAction('FETCH_AUDIENCES_PANEL_MODEL_FAILED');

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

export const fetchAssetsPanelItems = createAction<Partial<ElasticParams>>(FETCH_ASSETS_PANEL_ITEMS);

export const fetchAssetsPanelItemsComplete = createAction<SearchResult>(FETCH_ASSETS_PANEL_ITEMS_COMPLETE);

export const fetchAssetsPanelItemsFailed = createAction(FETCH_ASSETS_PANEL_ITEMS_FAILED);

export function fetchComponentsByContentType(
  contentTypeFilter?: string,
  options?: Partial<ComponentsContentTypeParams>
): StandardAction {
  return {
    type: FETCH_COMPONENTS_BY_CONTENT_TYPE,
    payload: { contentTypeFilter, options }
  };
}

export const fetchComponentsByContentTypeComplete = createAction<ContentInstancePage>(
  FETCH_COMPONENTS_BY_CONTENT_TYPE_COMPLETE
);

export const fetchComponentsByContentTypeFailed = createAction(FETCH_COMPONENTS_BY_CONTENT_TYPE_FAILED);

export const clearReceptacles = createAction(CLEAR_RECEPTACLES);

export const setContentTypeReceptacles = createAction<{
  contentType: string;
  receptacle: ContentTypeReceptacle;
}>(CONTENT_TYPE_RECEPTACLES_RESPONSE);

export const setContentTypeFilter = createAction<string>(SET_CONTENT_TYPE_FILTER);

export const updateToolsPanelWidth = createAction<{ width: number }>('UPDATE_TOOLS_PANEL_WIDTH');

export const setPreviewEditMode = createAction<{ editMode: boolean }>(EDIT_MODE_CHANGED);

// endregion

// region toolsPanelPageStack

export const pushToolsPanelPage = createAction<WidgetDescriptor>('PUSH_TOOLS_PANEL_PAGE');

export const popToolsPanelPage = createAction('POP_TOOLS_PANEL_PAGE');

// endregion

// settings Mode

export const setHighlightMode = createAction<{ highlightMode: string }>('HIGHLIGHT_MODE_CHANGED');
