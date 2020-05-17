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

import { ElementRegistry } from '../../classes/ElementRegistry';
import { dragOk } from '../util';
import iceRegistry from '../../classes/ICERegistry';
import { createReducer } from '@reduxjs/toolkit';
import GuestReducer from '../models/GuestReducer';
import { GuestStandardAction } from '../models/GuestStandardAction';
import { Record } from '../../models/InContextEditing';
import { GuestActionTypes } from '../models/Actions';
import { GuestState } from '../models/GuestStore';
import { EditingStatus } from '../../models/ICEStatus';
import { deleteProperty, notNullOrUndefined } from '../../utils/object';
import { getDragContextFromReceptacles, getHighlighted } from '../../utils/dom';

// region mouseover
// TODO: Not pure.
const mouseover: GuestReducer = (state, action) => {
  const { record } = action.payload;
  if (state.status === EditingStatus.LISTENING) {
    const highlight = ElementRegistry.getHoverData(record.id);
    const draggable = ElementRegistry.getDraggable(record.id);
    return {
      ...state,
      draggable: { [record.id]: draggable },
      highlighted: { [record.id]: highlight }
    };
  }
  return state;
};
// endregion

// region mouseleave
const mouseleave: GuestReducer = (state) => {
  if (state.status === EditingStatus.LISTENING) {
    return {
      ...state,
      highlighted: {},
      draggable: {}
    };
  }
};
// endregion

// region host_component_drag_started
// TODO: Not pure.
const host_component_drag_started: GuestReducer = (state, action) => {
  const { contentType } = action.payload;
  if (notNullOrUndefined(contentType)) {

    const receptacles = iceRegistry.getContentTypeReceptacles(contentType);
    const { players, siblings, containers, dropZones } = getDragContextFromReceptacles(receptacles);
    const highlighted = getHighlighted(dropZones);

    return {
      ...state,
      highlighted,
      status: EditingStatus.PLACING_NEW_COMPONENT,
      dragContext: {
        ...state.dragContext,
        players,
        siblings,
        dropZones,
        containers,
        contentType,
        inZone: false,
        targetIndex: null,
        dragged: null
      }
    };
  } else {
    return state;
  }
};
// endregion

// region host_instance_drag_started
// TODO: Not pure.
const host_instance_drag_started: GuestReducer = (state, action) => {
  const { instance } = action.payload;
  if (notNullOrUndefined(instance)) {

    const receptacles = iceRegistry.getContentTypeReceptacles(instance.craftercms.contentTypeId);
    const { players, siblings, containers, dropZones } = getDragContextFromReceptacles(receptacles);
    const highlighted = getHighlighted(dropZones);

    return {
      ...state,
      highlighted,
      status: EditingStatus.PLACING_DETACHED_COMPONENT,
      dragContext: {
        ...state.dragContext,
        players,
        siblings,
        dropZones,
        containers,
        instance,
        inZone: false,
        targetIndex: null,
        dragged: null
      }
    };
  } else {
    return state;
  }
};
// endregion

// region dragstart
// TODO: Not pure.
const dragstart: GuestReducer = (state, action) => {
  const { record } = action.payload;
  // onMouseOver pre-populates the draggable record
  // Items that browser make draggable by default (images, etc)
  const iceId = state.draggable?.[record.id];
  if (notNullOrUndefined(iceId)) {

    const receptacles = iceRegistry.getRecordReceptacles(iceId);
    const { players, siblings, containers, dropZones } = getDragContextFromReceptacles(receptacles, null, record);
    const highlighted = getHighlighted(dropZones);

    return {
      ...state,
      highlighted,
      status: EditingStatus.SORTING_COMPONENT,
      dragContext: {
        ...state.dragContext,
        players,
        siblings,
        dropZones,
        containers,
        inZone: false,
        targetIndex: null,
        dragged: iceRegistry.recordOf(iceId)
      }
    };
  } else {
    return state;
  }
};
// endregion

// region dragover
// const dragover: GuestReducer = (state, action) => {};
// endregion

// region dragleave
const dragleave: GuestReducer = (state) => {
  return dragOk(state.status)
    ? {
      ...state,
      dragContext: {
        ...state.dragContext,
        over: null,
        inZone: false,
        targetIndex: null
      }
    }
    : state;
};
// endregion

// region drop
// const drop: GuestReducer = (state) => state;
// endregion

// region set_drop_position
const set_drop_position: GuestReducer = (state, action) => {
  const { targetIndex } = action.payload;
  return {
    ...state,
    dragContext: {
      ...state.dragContext,
      targetIndex
    }
  };
};
// endregion

// region dragend
// const dragend: GuestReducer = (state, action) => {};
// endregion

// region edit_component_inline
const edit_component_inline: GuestReducer = (state, action) => {
  return {
    ...state,
    status: EditingStatus.EDITING_COMPONENT_INLINE,
    draggable: {},
    highlighted: {}
  };
};
// endregion

// region exit_component_inline_edit
const exit_component_inline_edit: GuestReducer = (state) => {
  return {
    ...state,
    status: EditingStatus.LISTENING,
    highlighted: {}
  };
};
// endregion

// region ice_zone_selected
const ice_zone_selected: GuestReducer = (state, action) => {
  const { record } = action.payload;
  const highlight = ElementRegistry.getHoverData(record.id);
  return {
    ...state,
    status: EditingStatus.EDITING_COMPONENT,
    draggable: {},
    highlighted: { [record.id]: highlight }
  };
};
// endregion

// region dblclick
const dblclick: GuestReducer = (state, action) => {
  const { record } = action.payload;
  return state.status === EditingStatus.LISTENING
    ? {
      ...state,
      status: EditingStatus.EDITING_COMPONENT_INLINE,
      editable: {
        [record.id]: record
      }
    }
    : state;
};
// endregion

// region computed_dragend
const computed_dragend: GuestReducer = (state) => {
  return {
    ...state,
    status: EditingStatus.LISTENING,
    dragContext: null,
    highlighted: {}
  };
  // Previously
  // 1. EditingStatus.OFF
  // 2. EditingStatus.LISTENING after a timeout
  // Chrome didn't trigger the dragend event
  // without the set timeout.
  // setTimeout(() => {
  //   return {
  //     ...state
  //       status: EditingStatus.LISTENING
  //     };
  // });
};
// endregion

// region computed_dragover
// TODO: Not pure.
const computed_dragover: GuestReducer = (state, action) => {
  if (state.dragContext.scrolling) {
    return state;
  } else {
    const dragContext = state.dragContext;
    const { record, event } = action.payload;
    const element = record.element;
    if (dragContext.players.includes(element)) {
      let { next, prev } =
        // No point finding siblings for the drop zone element
        dragContext.containers.includes(element)
          ? { next: null, prev: null }
          : ElementRegistry.getSiblingRects(record.id);
      return {
        ...state,
        dragContext: {
          ...dragContext,
          next,
          prev,
          inZone: true,
          over: record,
          coordinates: { x: event.clientX, y: event.clientY },
          dropZone: dragContext.dropZones.find(
            (dz) => dz.element === element || dz.children.includes(element)
          )
        }
      };
    } else {
      return state;
    }
  }
};
// endregion

// region desktop_asset_upload_complete
// TODO: Carry or retrieve record for these events
const desktop_asset_upload_complete: GuestReducer = (
  state,
  action: GuestStandardAction<{ record: Record }>
) => {
  const { record } = action.payload;
  return {
    ...state,
    uploading: deleteProperty({ ...state.uploading }, `${record.id}`)
  };
};
// endregion

// region desktop_asset_upload_progress
const desktop_asset_upload_progress: GuestReducer = (state, action) => {
  const { percentage, record } = action.payload;
  return {
    ...state,
    uploading: {
      ...state.uploading,
      [record.id]: {
        progress: percentage
      }
    }
  };
};
// endregion

// region desktop_asset_upload_started
const desktop_asset_upload_started: GuestReducer = (state, action) => {
  const { record } = action.payload;
  return {
    ...state,
    uploading: {
      ...state.uploading,
      [record.id]: ElementRegistry.getHoverData(record.id)
    }
  };
};
// endregion

// region start_listening
const start_listening: GuestReducer = (state) => {
  return {
    ...state,
    status: EditingStatus.LISTENING,
    highlighted: {}
  };
};
// endregion

// region scrolling
const scrolling: GuestReducer = (state) => {
  return {
    ...state,
    dragContext: {
      ...state.dragContext,
      scrolling: true
    }
  };
};
// endregion

// region scrolling_end
const scrolling_stopped: GuestReducer = (state) => {
  return {
    ...state,
    dragContext: {
      ...state.dragContext,
      scrolling: false,
      dropZones: state.dragContext?.dropZones?.map((dropZone) => ({
        ...dropZone,
        rect: dropZone.element.getBoundingClientRect(),
        childrenRects: dropZone.children.map((child) => child.getBoundingClientRect())
      }))
    }
  };
};
// endregion

const initialState: GuestState = {
  dragContext: null,
  draggable: {},
  editable: {},
  highlighted: {},
  ICE_GUEST_INIT: false,
  inEditMode: true,
  onEvent: null,
  status: EditingStatus.LISTENING,
  uploading: {}
};

const reducerFunctions: {
  [K in GuestActionTypes]: (...args: any) => GuestState;
} = {
  computed_dragend,
  computed_dragover,
  dblclick,
  desktop_asset_upload_complete,
  desktop_asset_upload_progress,
  dragend: (state) => state,
  dragleave,
  dragover: (state) => state,
  dragstart,
  drop: (state) => state,
  set_drop_position,
  edit_component_inline,
  exit_component_inline_edit,
  ice_zone_selected,
  insert_component: (state) => state,
  insert_instance: (state) => state,
  mouseleave,
  mouseover,
  move_component: (state) => state,
  set_edit_mode: (state) => state,
  start_listening,
  add_asset_types: (state) => state,
  click: (state) => state,
  scrolling,
  scrolling_stopped,
  host_component_drag_started,
  host_instance_drag_started
};

export default createReducer<GuestState>(initialState, reducerFunctions);
