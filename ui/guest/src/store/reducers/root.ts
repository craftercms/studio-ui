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

import {
  compileDropZone,
  fromICEId,
  getDragContextFromDropTargets,
  getDraggable,
  getHighlighted,
  getHoverData,
  getRecordsFromIceId,
  getSiblingRects
} from '../../elementRegistry';
import { dragOk } from '../util';
import * as iceRegistry from '../../iceRegistry';
import { findChildRecord, getById } from '../../iceRegistry';
import { Reducer } from '@reduxjs/toolkit';
import { GuestStandardAction } from '../models/GuestStandardAction';
import { ElementRecord } from '../../models/InContextEditing';
import { GuestState } from '../models/GuestStore';
import { notNullOrUndefined, reversePluckProps } from '@craftercms/studio-ui/utils/object';
import { updateDropZoneValidations } from '../../utils/dom';
import { EditingStatus, HighlightMode } from '../../constants';
import {
  assetDragStarted,
  clearContentTreeFieldSelected,
  clearHighlightedDropTargets,
  componentDragStarted,
  componentInstanceDragStarted,
  contentTreeFieldSelected,
  contentTreeSwitchFieldInstance,
  contentTypeDropTargetsRequest,
  desktopAssetUploadComplete,
  desktopAssetUploadProgress,
  desktopAssetUploadStarted,
  highlightModeChanged,
  hostCheckIn,
  setEditModePadding,
  setPreviewEditMode,
  updateRteConfig
} from '@craftercms/studio-ui/state/actions/preview';
import {
  computedDragEnd,
  computedDragOver,
  desktopAssetDragStarted,
  dropzoneEnter,
  dropzoneLeave,
  editComponentInline,
  exitComponentInlineEdit,
  iceZoneSelected,
  scrolling,
  scrollingStopped,
  setDropPosition,
  setEditingStatus,
  setEditMode,
  startListening
} from '../actions';

type CaseReducer<S = GuestState, A extends GuestStandardAction = GuestStandardAction> = Reducer<S, A>;

type CaseReducers<S = GuestState, A extends GuestStandardAction = GuestStandardAction> = Record<
  string,
  CaseReducer<S, A>
>;

const initialState: GuestState = {
  dragContext: null,
  draggable: {},
  editable: {},
  highlighted: {},
  status: EditingStatus.LISTENING,
  editMode: false,
  highlightMode: HighlightMode.ALL,
  authoringBase: null,
  uploading: {},
  models: {},
  contentTypes: {},
  hostCheckedIn: false,
  rteConfig: {},
  activeSite: '',
  editModePadding: false,
  username: null
};

function createReducer<S, CR extends CaseReducers<S>>(initialState: S, actionsMap: CR): Reducer<S> {
  return (state = initialState, action) => {
    const caseReducer = actionsMap[action.type];
    return caseReducer?.(state, action) ?? state;
  };
}

const resetState: (state: GuestState) => GuestState = (state: GuestState) => ({
  ...state,
  status: EditingStatus.LISTENING,
  draggable: {},
  highlighted: {},
  dragContext: null
});

const reducer = createReducer(initialState, {
  // region dblclick
  dblclick: (state, { payload: { record } }) =>
    state.status === EditingStatus.LISTENING
      ? {
          ...state,
          status: EditingStatus.EDITING_COMPONENT_INLINE,
          editable: {
            [record.id]: record
          }
        }
      : state,
  // endregion
  // region mouseover
  // TODO: Not pure.
  mouseover: (state, action) => {
    const { record } = action.payload as { record: ElementRecord };
    if (state.status === EditingStatus.LISTENING) {
      const { highlightMode } = state;
      const iceId = record.iceIds[0];
      const movableRecordId = iceRegistry.getMovableParentRecord(iceId);
      if (highlightMode === HighlightMode.ALL) {
        const highlight = getHoverData(record.id);
        if (notNullOrUndefined(movableRecordId)) {
          const elementId = iceId === movableRecordId ? record.id : fromICEId(movableRecordId).id;
          const draggable = getDraggable(elementId);
          return {
            ...state,
            highlighted: { [record.id]: highlight },
            draggable: draggable ? { [elementId]: draggable } : state.draggable
          };
        }
        return { ...state, highlighted: { [record.id]: highlight } };
      } else if (highlightMode === HighlightMode.MOVE_TARGETS && notNullOrUndefined(movableRecordId)) {
        const elementId = iceId === movableRecordId ? record.id : fromICEId(movableRecordId).id;
        const draggable = getDraggable(elementId);
        const highlight = getHoverData(
          // If (iceId == movableRecordId) the current record is already
          // the one to show the highlight on.
          elementId
        );
        return {
          ...state,
          highlighted: { [movableRecordId]: highlight },
          draggable: draggable ? { [elementId]: draggable } : state.draggable
        };
      }
    }
    return state;
  },
  // endregion
  // region mouseleave
  mouseleave: (state) =>
    state.status === EditingStatus.LISTENING
      ? {
          ...state,
          highlighted: {},
          draggable: {}
        }
      : state,
  // endregion
  // region dragstart
  // TODO: Not pure.
  dragstart: (state, action) => {
    const { record } = action.payload;
    // onMouseOver pre-populates the draggable record
    const iceId = state.draggable?.[record.id];
    // Items that browser make draggable by default (images, etc) may not have an ice id
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
  // region computedDragOver
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
  // region computedDragEnd
  [computedDragEnd.type]: (state) => ({
    ...state,
    status: EditingStatus.LISTENING,
    dragContext: null,
    highlighted: {}
  }),
  // endregion
  // region setDropPosition
  [setDropPosition.type]: (state, { payload: { targetIndex } }) => ({
    ...state,
    dragContext: {
      ...state.dragContext,
      targetIndex
    }
  }),
  // endregion
  // region editComponentInline
  [editComponentInline.type]: (state) => ({
    ...state,
    status: EditingStatus.EDITING_COMPONENT_INLINE,
    draggable: {},
    highlighted: {}
  }),
  // endregion
  // region exitComponentInlineEdit
  [exitComponentInlineEdit.type]: (state) => ({
    ...state,
    status: EditingStatus.LISTENING,
    highlighted: {}
  }),
  // endregion
  // region iceZoneSelected
  // TODO: Not pure
  [iceZoneSelected.type]: (state, { payload: { record } }) => ({
    ...state,
    status: EditingStatus.EDITING_COMPONENT,
    draggable: {},
    highlighted: { [record.id]: getHoverData(record.id) }
  }),
  // endregion
  // region startListening
  [startListening.type]: resetState,
  // endregion
  // region scrolling
  [scrolling.type]: (state) => ({
    ...state,
    dragContext: {
      ...state.dragContext,
      scrolling: true
    }
  }),
  // endregion
  // region scrollingStopped
  // TODO: Not pure
  [scrollingStopped.type]: (state) => ({
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
  }),
  // endregion
  // region dropzoneEnter
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
  // region dropzoneLeave
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
  // region setEditMode
  [setEditMode.type]: (state, { payload }) => ({
    ...state,
    highlighted: {},
    highlightMode: payload.highlightMode
  }),
  // endregion
  // region setPreviewEditMode
  [setPreviewEditMode.type]: (state, action) =>
    action.payload.editMode !== state.editMode
      ? {
          ...state,
          highlighted: {},
          editMode: action.payload.editMode
        }
      : state,
  // endregion
  // region highlightModeChanged
  [highlightModeChanged.type]: (state, { payload }) =>
    state.highlightMode !== payload.highlightMode
      ? {
          ...resetState(state),
          highlightMode: payload.highlightMode
        }
      : state,
  // endregion
  // region contentTypeDropTargetsRequest
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
  // region clearHighlightedDropTargets
  [clearHighlightedDropTargets.type]: (state) => ({
    ...state,
    status: EditingStatus.LISTENING,
    highlighted: {}
  }),
  // endregion
  // region desktopAssetUploadStarted
  // TODO: Not pure
  [desktopAssetUploadStarted.type]: (state, { payload: { record } }) => ({
    ...state,
    uploading: {
      ...state.uploading,
      [record.id]: getHoverData(record.id)
    }
  }),
  // endregion
  // region desktopAssetUploadComplete
  // TODO: Carry or retrieve record for these events
  [desktopAssetUploadComplete.type]: (
    state,
    { payload: { record } }: GuestStandardAction<{ record: ElementRecord }>
  ) => ({
    ...state,
    uploading: reversePluckProps(state.uploading, record.id)
  }),
  // endregion
  // region desktopAssetUploadProgress
  [desktopAssetUploadProgress.type]: (state, { payload: { percentage, record } }) => ({
    ...state,
    uploading: {
      ...state.uploading,
      [record.id]: {
        ...state.uploading[record.id],
        progress: percentage
      }
    }
  }),
  // endregion
  // region componentDragStarted
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
  // region componentInstanceDragStarted
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
  // region desktopAssetDragStarted
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
  // region assetDragStarted
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
  // region selectField
  [setEditingStatus.type]: (state, { payload }) => ({
    ...state,
    status: payload.status
  }),
  // endregion
  // region contentTreeFieldSelected
  // TODO: Not pure
  [contentTreeFieldSelected.type]: (state, action) => {
    const { iceProps } = action.payload;
    let iceId = iceRegistry.exists(iceProps);
    if (iceId === null) {
      return state;
    }
    let iceRecord = getById(iceId);
    let registryEntries, highlight;

    if (iceRecord.recordType === 'component') {
      if (state.highlightMode === HighlightMode.MOVE_TARGETS) {
        // If in move mode, dynamically switch components to their movable item record so users can manipulate.
        const movableRecordId = iceRegistry.getMovableParentRecord(iceId);
        iceId = notNullOrUndefined(movableRecordId) ? movableRecordId : iceId;
      }
    } else if (iceRecord.recordType === 'repeat-item' || iceRecord.recordType === 'node-selector-item') {
      if (state.highlightMode === HighlightMode.ALL) {
        // If in edit mode, switching to the component record, so people can edit the component.
        const componentRecord = findChildRecord(iceRecord.modelId, iceRecord.fieldId, iceRecord.index);
        iceId = notNullOrUndefined(componentRecord) ? componentRecord.id : iceId;
      }
    }

    registryEntries = getRecordsFromIceId(iceId);
    if (!registryEntries) {
      return state;
    }

    highlight = getHoverData(registryEntries[0].id);

    return {
      ...state,
      status: EditingStatus.FIELD_SELECTED,
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
  // region contentTreeSwitchFieldInstance
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
  // region clearContentTreeFieldSelected
  [clearContentTreeFieldSelected.type]: (state) => ({
    ...state,
    status: EditingStatus.LISTENING,
    draggable: {},
    highlighted: {},
    fieldSwitcher: null
  }),
  // endregion
  // region hostCheckIn
  [hostCheckIn.type]: (state, action) => ({
    ...state,
    hostCheckedIn: true,
    authoringBase: action.payload.authoringBase,
    editModePadding: action.payload.editModePadding,
    highlightMode: action.payload.highlightMode,
    editMode: action.payload.editMode,
    rteConfig: action.payload.rteConfig,
    activeSite: action.payload.site,
    username: action.payload.username
  }),
  // endregion
  // region updateRteConfig
  [updateRteConfig.type]: (state, action) => ({
    ...state,
    rteConfig: action.payload.rteConfig
  }),
  // endregion
  // region setEditModePadding
  [setEditModePadding.type]: (state, action) => ({
    ...state,
    editModePadding: action.payload.editModePadding
  })
  // endregion
});

export default reducer;
