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

import React, { Dispatch, Reducer, useContext, useMemo, useReducer } from 'react';
import { Subject } from 'rxjs';
import ContentType from '../../models/ContentType';
import ContentInstance from '../../models/ContentInstance';
import { LookupTable } from '../../models/LookupTable';
import { nou } from '../../utils/object';

// region Preview Context Actions

// region Accommodation Actions
// To be moved to a common file for sharing across apps

export const HOST_CHECK_IN = 'HOST_CHECK_IN';
export const GUEST_CHECK_IN = 'GUEST_CHECK_IN';
export const GUEST_CHECK_OUT = 'GUEST_CHECK_OUT';
export const SORT_ITEM_OPERATION = 'SORT_ITEM_OPERATION';
export const INSERT_COMPONENT_OPERATION = 'INSERT_COMPONENT_OPERATION';
export const INSERT_ITEM_OPERATION = 'INSERT_ITEM_OPERATION';
export const MOVE_ITEM_OPERATION = 'MOVE_ITEM_OPERATION';
export const DELETE_ITEM_OPERATION = 'DELETE_ITEM_OPERATION';
export const UPDATE_FIELD_VALUE_OPERATION = 'UPDATE_FIELD_VALUE_OPERATION';
export const ICE_ZONE_SELECTED = 'ICE_ZONE_SELECTED';
export const CLEAR_SELECTED_ZONES = 'CLEAR_SELECTED_ZONES';
export const EDIT_MODE_CHANGED = 'EDIT_MODE_CHANGED';
export const ASSET_DRAG_STARTED = 'ASSET_DRAG_STARTED';
export const ASSET_DRAG_ENDED = 'ASSET_DRAG_ENDED';
export const COMPONENT_DRAG_STARTED = 'COMPONENT_DRAG_STARTED';
export const COMPONENT_DRAG_ENDED = 'COMPONENT_DRAG_ENDED';
export const TRASHED = 'TRASHED';
export const CONTENT_TYPES_REQUEST = 'CONTENT_TYPES_REQUEST';
export const CONTENT_TYPES_RESPONSE = 'CONTENT_TYPES_RESPONSE';
export const INSTANCE_DRAG_BEGUN = 'INSTANCE_DRAG_BEGUN';
export const INSTANCE_DRAG_ENDED = 'INSTANCE_DRAG_ENDED';
export const GUEST_MODELS_RECEIVED = 'GUEST_MODELS_RECEIVED';

// endregion

const SELECT_TOOL = 'SELECT_TOOL';
const SELECT_FOR_EDIT = 'SELECT_FOR_EDIT';
const CLEAR_SELECT_FOR_EDIT = 'CLEAR_SELECT_FOR_EDIT';
const SELECT_PREVIOUS_TOOL = 'SELECT_PREVIOUS_TOOL';
const OPEN_TOOLS = 'OPEN_TOOLS';
const CLOSE_TOOLS = 'CLOSE_TOOLS';
const TOOLS_LOADED = 'TOOLS_LOADED';
const SET_HOST_SIZE = 'SET_HOST_SIZE';
const SET_HOST_WIDTH = 'SET_HOST_WIDTH';
const SET_HOST_HEIGHT = 'SET_HOST_HEIGHT';
const FETCH_CONTENT_TYPES_COMPLETE = 'FETCH_CONTENT_TYPES_COMPLETE';
const FETCH_CONTENT_MODEL_COMPLETE = 'FETCH_CONTENT_MODEL_COMPLETE';
const SET_ITEM_BEING_DRAGGED = 'SET_ITEM_BEING_DRAGGED';

export function selectTool(tool: Tools = null): StandardAction {
  return {
    type: SELECT_TOOL,
    payload: tool
  };
}

export function selectPreviousTool(): StandardAction {
  return {
    type: SELECT_TOOL
  };
}

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

export function toolsLoaded(tools: Array<any>): StandardAction {
  return {
    type: TOOLS_LOADED,
    payload: tools
  }
}

export function setHostSize(dimensions: Dimensions): StandardAction {
  return {
    type: SET_HOST_SIZE,
    payload: dimensions
  };
}

export function fetchContentTypesComplete(contentTypes: ContentType[]): StandardAction {
  return {
    type: FETCH_CONTENT_TYPES_COMPLETE,
    payload: contentTypes
  }
}

export function fetchContentModelComplete(contentModels: ContentInstance[]): StandardAction {
  return {
    type: FETCH_CONTENT_MODEL_COMPLETE,
    payload: contentModels
  }
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
  }
}

export function guestModelsReceived(data): StandardAction {
  return {
    type: GUEST_MODELS_RECEIVED,
    payload: data
  };
}

export function setItemBeingDragged(active: boolean): StandardAction {
  return {
    type: SET_ITEM_BEING_DRAGGED,
    payload: active
  };
}

function minFrameSize(suggestedSize: number): number {
  return suggestedSize === null ? null : suggestedSize < 320 ? 320 : suggestedSize;
}

// endregion

export const DRAWER_WIDTH = 240;

export interface StandardAction {
  type: string;
  payload?: any;
}

export type Tools =
  'craftercms.ice.components' |
  'craftercms.ice.assets'     |
  'craftercms.ice.audiences'  |
  'craftercms.ice.simulator'  |
  'craftercms.ice.ice'        |
  'craftercms.ice.editForm';

export interface EditSelection {
  modelId: string;
  fieldId: string[];
  index: number;
}

export interface GuestData {
  url: string;
  origin: string;
  models: LookupTable<ContentInstance>;
  modelId: string;
  selected: EditSelection[];
  itemBeingDragged: boolean;
}

interface PreviewState {
  site: string;
  currentUrl: string;
  showToolsPanel: boolean;
  selectedTool: Tools;
  previousTool: Tools;
  tools: Array<any>;
  hostSize: Dimensions;
  contentTypes: Array<ContentType>;
  guest: GuestData;
}

interface Dimensions {
  width: number;
  height: number;
}

type PreviewContextProps = [PreviewState, Dispatch<StandardAction>];

const PreviewContext = React.createContext<PreviewContextProps>(undefined);

let hostToGuest$: Subject<StandardAction>;
let GuestToHost$: Subject<StandardAction>;

export function getHostToGuestBus() {
  if (!hostToGuest$) {
    hostToGuest$ = new Subject<StandardAction>();
  }
  return hostToGuest$;
}

export function getGuestToHostBus() {
  if (!GuestToHost$) {
    GuestToHost$ = new Subject<StandardAction>();
  }
  return GuestToHost$;
}

export function usePreviewContext() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error(`usePreviewContext should be used inside a PreviewProvider`);
  }
  return context;
}

const previewProviderReducer: Reducer<PreviewState, StandardAction> = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case SELECT_TOOL:
      return {
        ...state,
        previousTool: state.selectedTool,
        selectedTool: payload
      };
    case SELECT_PREVIOUS_TOOL:
      return {
        ...state,
        previousTool: state.selectedTool,
        selectedTool: payload
      };
    case OPEN_TOOLS:
      return {
        ...state,
        showToolsPanel: true
      };
    case CLOSE_TOOLS:
      return {
        ...state,
        showToolsPanel: false
      };
    case TOOLS_LOADED:
      return {
        ...state,
        tools: payload
      };
    case SET_HOST_SIZE:
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
    case SET_HOST_WIDTH:
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
    case SET_HOST_HEIGHT:
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
    case FETCH_CONTENT_TYPES_COMPLETE:
      return {
        ...state,
        contentTypes: payload
      };
    case FETCH_CONTENT_MODEL_COMPLETE:
      return {
        ...state,
        currentModels: payload
      };
    case GUEST_CHECK_IN:
      return {
        ...state,
        guest: { ...payload, itemBeingDragged: false, selected: null }
      };
    case GUEST_CHECK_OUT:
      return {
        ...state,
        guest: null
      };
    case GUEST_MODELS_RECEIVED:
      // If guest hasn't checked in, these models will come later when it does check in.
      if (state.guest != null) {
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
        return state;
      }
    case SELECT_FOR_EDIT: {
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
      break;
    }
    case CLEAR_SELECT_FOR_EDIT: {
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
    }
    case SET_ITEM_BEING_DRAGGED:
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
    default:
      return state;
  }
};

const INITIAL_PREVIEW_CONTEXT: PreviewState = {
  site: 'editorial',
  currentUrl: 'http://authoring.sample.com:8080',
  hostSize: { width: null, height: null },
  showToolsPanel: true,
  previousTool: null,
  selectedTool: 'craftercms.ice.components',
  tools: null,
  contentTypes: null,
  guest: null
};

export function PreviewProvider(props: any) {
  const [state, dispatch] = useReducer(previewProviderReducer, INITIAL_PREVIEW_CONTEXT);
  const value = useMemo(() => [state, dispatch], [state]);
  // @ts-ignore
  window.previewContext = value;
  return <PreviewContext.Provider value={value} {...props} />
}

// TODO: Temp. To be removed.
document.domain = 'authoring.sample.com';
