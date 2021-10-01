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

import {
  compileDropZone,
  fromICEId,
  getDragContextFromDropTargets,
  getDraggable,
  getHighlighted,
  getHoverData,
  getRecordsFromIceId,
  getSiblingRects
} from '../../classes/ElementRegistry';
import { dragOk } from '../util';
import * as iceRegistry from '../../classes/ICERegistry';
import { collectMoveTargets } from '../../classes/ICERegistry';
import { Reducer } from '@reduxjs/toolkit';
import { GuestStandardAction } from '../models/GuestStandardAction';
import { ElementRecord } from '../../models/InContextEditing';
import { GuestState } from '../models/GuestStore';
import { notNullOrUndefined, reversePluckProps } from '../../utils/object';
import { updateDropZoneValidations } from '../../utils/dom';
import { EditingStatus, HighlightMode } from '../../constants';
import {
  assetDragStarted,
  clearContentTreeFieldSelected,
  clearHighlightedDropTargets,
  componentDragStarted,
  componentInstanceDragStarted,
  contentTreeFieldSelected,
  contentTypeDropTargetsRequest,
  desktopAssetUploadProgress,
  desktopAssetUploadStarted,
  setPreviewEditMode,
  hostCheckIn,
  updateRteConfig,
  contentTreeSwitchFieldInstance,
  desktopAssetDragStarted,
  highlightModeChanged
} from '@craftercms/studio-ui/build_tsc/state/actions/preview';
import {
  computedDragOver,
  contentReady,
  dropzoneEnter,
  dropzoneLeave,
  editComponentInline,
  exitComponentInlineEdit,
  iceZoneSelected,
  scrolling,
  scrollingStopped,
  setDropPosition,
  setEditMode,
  startListening
} from '../actions';

const initialState: GuestState = {
  dragContext: null,
  draggable: {},
  editable: {},
  highlighted: {},
  status: EditingStatus.LISTENING,
  editMode: false,
  highlightMode: HighlightMode.ALL,
  uploading: {},
  models: {},
  contentTypes: {},
  hostCheckedIn: false,
  rteConfig: {},
  activeSite: ''
};

function prepareMoveMode() {
  const highlighted = {};
  const movableIceRecords = collectMoveTargets();
  const movableElementRecords = movableIceRecords.map(({ id }) => fromICEId(id));
  movableElementRecords.forEach((er) => {
    highlighted[er.id] = getHoverData(er.id);
  });
  return highlighted;
}

type CaseReducer<S = GuestState, A extends GuestStandardAction = GuestStandardAction> = Reducer<S, A>;

type CaseReducers<S = GuestState, A extends GuestStandardAction = GuestStandardAction> = Record<
  string,
  CaseReducer<S, A>
>;

function createReducer<S, CR extends CaseReducers<S>>(initialState: S, actionsMap: CR): Reducer<S> {
  return (state = initialState, action) => {
    const caseReducer = actionsMap[action.type];
    return caseReducer?.(state, action) ?? state;
  };
}

const reducer = createReducer(initialState, {
  // region computed_dragend
  computed_dragend: (state) => ({
    ...state,
    status: EditingStatus.LISTENING,
    dragContext: null,
    highlighted: {}
  }),
  // endregion
  // region computed_dragover
  // TODO: Not pure.
  [computedDragOver.type]: (state, action) => {
    if (state.dragContext.scrolling) {
      return state;
    } else {
      const dragContext = state.dragContext;
      const { record, event } = action.payload;
      const element = record.element;
      if (dragContext.players.includes(element)) {
        let { next, prev } =
          // No point finding siblings for the drop zone element
          dragContext.containers.includes(element) ? { next: null, prev: null } : getSiblingRects(record.id);
        return {
          ...state,
          dragContext: {
            ...dragContext,
            next,
            prev,
            inZone: true,
            over: record,
            coordinates: { x: event.clientX, y: event.clientY },
            dropZone: dragContext.dropZones.find((dz) => dz.element === element || dz.children.includes(element))
          }
        };
      } else {
        return state;
      }
    }
  },
  // endregion
  // region dblclick
  dblclick: (state, action) => {
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
  },
  // endregion
  // region dragleave
  dragleave: (state, action) => {
    const leavingDropZone = !state.dragContext?.dropZone?.element.contains(action.payload.event.relatedTarget);
    return dragOk(state.status)
      ? {
          ...state,
          dragContext: {
            ...state.dragContext,
            over: null,
            inZone: false,
            targetIndex: null,
            dropZone: leavingDropZone ? null : state.dragContext.dropZone
          }
        }
      : state;
  },
  // endregion
  // region dragstart
  // TODO: Not pure.
  dragstart: (state, action) => {
    const { record } = action.payload;
    // onMouseOver pre-populates the draggable record
    // Items that browser make draggable by default (images, etc)
    const iceId = state.draggable?.[record.id];
    if (notNullOrUndefined(iceId)) {
      const dropTargets = iceRegistry.getRecordDropTargets(iceId);
      const validationsLookup = iceRegistry.runDropTargetsValidations(dropTargets);
      const { players, siblings, containers, dropZones } = getDragContextFromDropTargets(
        dropTargets,
        validationsLookup,
        record
      );
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
          dragged: iceRegistry.getById(iceId)
        }
      };
    } else {
      return state;
    }
  },
  // endregion
  // region set_drop_position
  [setDropPosition.type]: (state, action) => {
    const { targetIndex } = action.payload;
    return {
      ...state,
      dragContext: {
        ...state.dragContext,
        targetIndex
      }
    };
  },
  // endregion
  // region edit_component_inline
  [editComponentInline.type]: (state) => {
    return {
      ...state,
      status: EditingStatus.EDITING_COMPONENT_INLINE,
      draggable: {},
      highlighted: {}
    };
  },
  // endregion
  // region exit_component_inline_edit
  [exitComponentInlineEdit.type]: (state) => {
    return {
      ...state,
      status: EditingStatus.LISTENING,
      highlighted: {}
    };
  },
  // endregion
  // region ice_zone_selected
  // TODO: Not pure
  [iceZoneSelected.type]: (state, action) => {
    const { record } = action.payload;
    const highlight = getHoverData(record.id);
    return {
      ...state,
      status: EditingStatus.EDITING_COMPONENT,
      draggable: {},
      highlighted: { [record.id]: highlight }
    };
  },
  // endregion
  // region mouseleave
  mouseleave: (state) => {
    if (state.status === EditingStatus.LISTENING) {
      return {
        ...state,
        highlighted: {},
        draggable: {}
      };
    }
  },
  // endregion
  // region mouseover
  // TODO: Not pure.
  mouseover: (state, action) => {
    const { record } = action.payload;
    if (state.status === EditingStatus.LISTENING) {
      const highlight = getHoverData(record.id);
      const draggable = getDraggable(record.id);
      const nextState = { ...state };

      if (
        (state.highlightMode === HighlightMode.MOVE_TARGETS && draggable !== false) ||
        state.highlightMode === HighlightMode.ALL
      ) {
        nextState.highlighted = { [record.id]: highlight };
      }
      if (draggable !== false) {
        nextState.draggable = { [record.id]: draggable };
      } else if (record.id in state.draggable) {
        nextState.draggable = reversePluckProps(state.draggable, record.id);
      }
      return nextState;
    }
    return state;
  },
  // endregion
  // region set_edit_mode
  [setEditMode.type]: (state, { payload }) => {
    const isMoveTargetsMode = payload.highlightMode === HighlightMode.MOVE_TARGETS;
    return {
      ...state,
      highlightMode: payload.highlightMode,
      highlighted: isMoveTargetsMode ? prepareMoveMode() : {},
      status: isMoveTargetsMode ? EditingStatus.HIGHLIGHT_MOVE_TARGETS : EditingStatus.LISTENING
    };
  },
  // endregion
  // region start_listening
  [startListening.type]: (state) => {
    return {
      ...state,
      status: EditingStatus.LISTENING,
      highlighted: {}
    };
  },
  // endregion
  // region scrolling
  [scrolling.type]: (state) => {
    return {
      ...state,
      dragContext: {
        ...state.dragContext,
        scrolling: true
      }
    };
  },
  // endregion
  // region scrolling_end
  // TODO: Not pure
  [scrollingStopped.type]: (state) => {
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
  },
  // endregion
  // region drop_zone_enter
  // TODO: Not pure
  [dropzoneEnter.type]: (state, action) => {
    const { elementRecordId } = action.payload;
    const { dropZones: currentDropZones } = state.dragContext;
    const currentDropZone = currentDropZones.find((dropZone) => dropZone.elementRecordId === elementRecordId);
    let length = currentDropZone.children.length;
    let invalidDrop = currentDropZone.origin ? false : state.dragContext.invalidDrop;
    let rest = reversePluckProps(currentDropZone.validations, 'maxCount', 'minCount');

    if (state.status === EditingStatus.SORTING_COMPONENT && currentDropZone.origin) {
      length = length - 1;
    }

    const maxCount = !currentDropZone.origin
      ? iceRegistry.runValidation(currentDropZone.iceId as number, 'maxCount', [length])
      : null;

    if (maxCount) {
      rest.maxCount = maxCount;
      invalidDrop = true;
    }

    const dropZones = updateDropZoneValidations(currentDropZone, currentDropZones, rest);

    const highlighted = getHighlighted(dropZones);

    return {
      ...state,
      dragContext: {
        ...state.dragContext,
        dropZones,
        invalidDrop
      },
      highlighted
    };
  },
  // endregion
  // region drop_zone_leave
  // TODO: Not pure
  [dropzoneLeave.type]: (state, action) => {
    const { elementRecordId } = action.payload;
    if (!state.dragContext) {
      return;
    }
    const { dropZones: currentDropZones } = state.dragContext;
    const currentDropZone = currentDropZones.find((dropZone) => dropZone.elementRecordId === elementRecordId);
    let length = currentDropZone.children.length;
    let invalidDrop = state.status === EditingStatus.SORTING_COMPONENT ? state.dragContext.invalidDrop : false;
    let rest = reversePluckProps(currentDropZone.validations, 'minCount');

    if (state.status === EditingStatus.SORTING_COMPONENT && currentDropZone.origin) {
      length = length - 1;
    }

    const minCount = iceRegistry.runValidation(currentDropZone.iceId as number, 'minCount', [length]);

    if (minCount) {
      rest.minCount = minCount;
      invalidDrop = !!currentDropZone.origin;
    }

    const dropZones = updateDropZoneValidations(currentDropZone, currentDropZones, rest);
    const highlighted = getHighlighted(dropZones);

    return {
      ...state,
      dragContext: {
        ...state.dragContext,
        dropZones,
        invalidDrop
      },
      highlighted
    };
  },
  // endregion
  // region set_edit_mode
  [setPreviewEditMode.type]: (state, action) => ({
    ...state,
    editMode: action.payload.editMode
  }),
  // endregion
  // region set_edit_mode
  [highlightModeChanged.type]: (state, { payload }) => {
    const isMoveTargetsMode = payload.highlightMode === HighlightMode.MOVE_TARGETS;
    return {
      ...state,
      highlightMode: payload.highlightMode,
      highlighted: isMoveTargetsMode ? prepareMoveMode() : {},
      status: isMoveTargetsMode ? EditingStatus.HIGHLIGHT_MOVE_TARGETS : EditingStatus.LISTENING
    };
  },
  // endregion
  // region content_type_drop_targets_request
  // TODO: Not pure
  [contentTypeDropTargetsRequest.type]: (state, action) => {
    const { contentTypeId } = action.payload;
    const highlighted = {};

    iceRegistry.getContentTypeDropTargets(contentTypeId).forEach((item) => {
      let { elementRecordId } = compileDropZone(item.id);
      highlighted[elementRecordId] = getHoverData(elementRecordId);
    });

    return {
      ...state,
      dragContext: {
        ...state.dragContext,
        inZone: false
      },
      status: EditingStatus.SHOW_DROP_TARGETS,
      highlighted
    };
  },
  // endregion
  // region clear_highlighted_drop_targets
  [clearHighlightedDropTargets.type]: (state) => {
    return {
      ...state,
      status: EditingStatus.LISTENING,
      highlighted: {}
    };
  },
  // endregion
  // region desktop_asset_upload_started
  // TODO: Not pure
  [desktopAssetUploadStarted.type]: (state, action) => {
    const { record } = action.payload;
    return {
      ...state,
      uploading: {
        ...state.uploading,
        [record.id]: getHoverData(record.id)
      }
    };
  },
  // endregion
  // region desktop_asset_upload_complete
  // TODO: Carry or retrieve record for these events
  DESKTOP_ASSET_UPLOAD_COMPLETE: (state, action: GuestStandardAction<{ record: ElementRecord }>) => {
    const { record } = action.payload;
    return {
      ...state,
      uploading: reversePluckProps(state.uploading, record.id)
    };
  },
  // endregion
  // region desktop_asset_upload_progress
  [desktopAssetUploadProgress.type]: (state, action) => {
    const { percentage, record } = action.payload;
    return {
      ...state,
      uploading: {
        ...state.uploading,
        [record.id]: {
          ...state.uploading[record.id],
          progress: percentage
        }
      }
    };
  },
  // endregion
  // region host_component_drag_started
  // TODO: Not pure.
  [componentDragStarted.type]: (state, action) => {
    const { contentType } = action.payload;
    if (notNullOrUndefined(contentType)) {
      const dropTargets = iceRegistry.getContentTypeDropTargets(contentType);
      const validationsLookup = iceRegistry.runDropTargetsValidations(dropTargets);
      const { players, siblings, containers, dropZones } = getDragContextFromDropTargets(
        dropTargets,
        validationsLookup
      );
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
  },
  // endregion
  // region host_instance_drag_started
  // TODO: Not pure.
  [componentInstanceDragStarted.type]: (state, action) => {
    const { instance, contentType } = action.payload;

    if (notNullOrUndefined(instance)) {
      const dropTargets = iceRegistry.getContentTypeDropTargets(instance.craftercms.contentTypeId);
      const validationsLookup = iceRegistry.runDropTargetsValidations(dropTargets);
      const { players, siblings, containers, dropZones } = getDragContextFromDropTargets(
        dropTargets,
        validationsLookup
      );
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
          contentType,
          inZone: false,
          targetIndex: null,
          dragged: null
        }
      };
    } else {
      return state;
    }
  },
  // endregion
  // region desktop_asset_drag_started
  // TODO: Not pure
  [desktopAssetDragStarted.type]: (state, action) => {
    const { asset } = action.payload;
    if (notNullOrUndefined(asset)) {
      let type;
      if (asset.type.includes('image/')) {
        type = 'image';
      } else if (asset.type.includes('video/')) {
        type = 'video-picker';
      }
      const dropTargets = iceRegistry.getMediaDropTargets(type);
      const { players, containers, dropZones } = getDragContextFromDropTargets(dropTargets);
      const highlighted = getHighlighted(dropZones);

      return {
        ...state,
        highlighted,
        status: EditingStatus.UPLOAD_ASSET_FROM_DESKTOP,
        dragContext: {
          ...state.dragContext,
          players,
          siblings: [],
          dropZones,
          containers,
          inZone: false,
          targetIndex: null,
          dragged: asset
        }
      };
    } else {
      return state;
    }
  },
  // endregion
  // region asset_drag_started
  // TODO: Not pure
  [assetDragStarted.type]: (state, action) => {
    const { asset } = action.payload;
    if (notNullOrUndefined(asset)) {
      let type;
      if (asset.mimeType.includes('image/')) {
        type = 'image';
      } else if (asset.mimeType.includes('video/')) {
        type = 'video-picker';
      }
      const dropTargets = iceRegistry.getMediaDropTargets(type);
      const { players, containers, dropZones } = getDragContextFromDropTargets(dropTargets);
      const highlighted = getHighlighted(dropZones);

      return {
        ...state,
        highlighted,
        status: EditingStatus.PLACING_DETACHED_ASSET,
        dragContext: {
          ...state.dragContext,
          players,
          siblings: [],
          dropZones,
          containers,
          inZone: false,
          targetIndex: null,
          dragged: asset
        }
      };
    } else {
      return state;
    }
  },
  // endregion
  // region content_tree_field_selected
  // TODO: Not pure
  [contentTreeFieldSelected.type]: (state, action) => {
    const { iceProps } = action.payload;
    const iceId = iceRegistry.exists(iceProps);
    if (iceId === -1) return;
    const registryEntries = getRecordsFromIceId(iceId);
    if (!registryEntries) {
      return;
    }

    const highlight = getHoverData(registryEntries[0].id);
    return {
      ...state,
      status: EditingStatus.SELECT_FIELD,
      draggable: iceRegistry.isMovable(iceId) ? { [registryEntries[0].id]: iceId } : {},
      highlighted: { [registryEntries[0].id]: highlight },
      fieldSwitcher:
        registryEntries.length > 1
          ? {
              iceId,
              currentElement: 0,
              registryEntryIds: registryEntries.map((entry) => entry.id)
            }
          : null
    };
  },
  // endregion
  // region content_tree_switch_field
  // TODO: Not pure
  [contentTreeSwitchFieldInstance.type]: (state, action) => {
    const { type } = action.payload;
    let nextElem = type === 'next' ? state.fieldSwitcher.currentElement + 1 : state.fieldSwitcher.currentElement - 1;
    let id = state.fieldSwitcher.registryEntryIds[nextElem];
    const highlight = getHoverData(state.fieldSwitcher.registryEntryIds[nextElem]);
    return {
      ...state,
      draggable: iceRegistry.isMovable(state.fieldSwitcher.iceId) ? { [id]: state.fieldSwitcher.iceId } : {},
      highlighted: { [id]: highlight },
      fieldSwitcher: {
        ...state.fieldSwitcher,
        currentElement: nextElem
      }
    };
  },
  // endregion
  // region clear_content_tree_field_selected
  [clearContentTreeFieldSelected.type]: (state) => {
    return {
      ...state,
      status: EditingStatus.LISTENING,
      draggable: {},
      highlighted: {},
      fieldSwitcher: null
    };
  },
  // endregion
  // region HOST_CHECK_IN
  [hostCheckIn.type]: (state, action) => {
    const isMoveTargetsMode = action.payload.highlightMode === HighlightMode.MOVE_TARGETS;
    return {
      ...state,
      hostCheckedIn: true,
      highlightMode: action.payload.highlightMode,
      editMode: action.payload.editMode,
      rteConfig: action.payload.rteConfig,
      activeSite: action.payload.site,
      highlighted: isMoveTargetsMode ? prepareMoveMode() : {},
      status: isMoveTargetsMode ? EditingStatus.HIGHLIGHT_MOVE_TARGETS : EditingStatus.LISTENING
    };
  },
  // endregion
  // region UPDATE_RTE_CONFIG
  [updateRteConfig.type]: (state, action) => ({
    ...state,
    rteConfig: action.payload.rteConfig
  }),
  // endregion
  // region contentReady
  [contentReady.type]: (state) =>
    state.highlightMode === HighlightMode.MOVE_TARGETS ? { ...state, highlighted: prepareMoveMode() } : state
  // endregion
});

export default reducer;
