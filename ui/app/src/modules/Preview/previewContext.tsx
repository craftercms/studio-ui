import React, { Dispatch, Reducer, useContext, useMemo, useReducer } from 'react';
import { Subject } from 'rxjs';

export interface StandardAction {
  type: string;
  payload?: any;
}

export type Tools =
  'craftercms.ice.components' |
  'craftercms.ice.assets' |
  'craftercms.ice.audiences' |
  'craftercms.ice.simulator' |
  'craftercms.ice.ice';

interface PreviewState {
  showToolsPanel: boolean;
  selectedTool: Tools;
  tools: Array<any>;
  hostSize: Dimensions;
}

interface Dimensions {
  width: number;
  height: number;
}

export type PreviewContextProps = [PreviewState, Dispatch<StandardAction>];

const PreviewContext = React.createContext<PreviewContextProps>(undefined);

let hostToGuest$: Subject<StandardAction>;
export function getHostToGuestBus() {
  if (!hostToGuest$) {
    hostToGuest$ = new Subject<StandardAction>();
  }
  return hostToGuest$;
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
          height: minFrameSize(payload.height),
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
    default:
      return state;
  }
};

const INITIAL_PREVIEW_CONTEXT = {
  hostSize: { width: null, height: null },
  showToolsPanel: true,
  selectedTool: null,
  tools: null
};

export function PreviewProvider(props: any) {
  const [state, setState] = useReducer(previewProviderReducer, INITIAL_PREVIEW_CONTEXT);
  const value = useMemo(() => [state, setState], [state]);
  // @ts-ignore
  window.previewContext = value;
  return <PreviewContext.Provider value={value} {...props} />
}

// region Preview Context Actions

const SELECT_TOOL = 'SELECT_TOOL';
const OPEN_TOOLS = 'OPEN_TOOLS';
const CLOSE_TOOLS = 'CLOSE_TOOLS';
const TOOLS_LOADED = 'TOOLS_LOADED';
const SET_HOST_SIZE = 'SET_HOST_SIZE';
const SET_HOST_WIDTH = 'SET_HOST_WIDTH';
const SET_HOST_HEIGHT = 'SET_HOST_HEIGHT';

export function selectTool(tool: Tools = null): StandardAction {
  return {
    type: SELECT_TOOL,
    payload: tool
  };
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

function minFrameSize(suggestedSize: number): number {
  return suggestedSize === null ? null : suggestedSize < 320 ? 320 : suggestedSize;
}

// endregion

export const DRAWER_WIDTH = 240;
