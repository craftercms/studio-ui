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

import * as React from 'react';
import { Dispatch, useEffect, useMemo, useState } from 'react';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import PencilIcon from '@mui/icons-material/EditOutlined';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import GroovyIcon from '@craftercms/studio-ui/icons/Groovy';
import FreemarkerIcon from '@craftercms/studio-ui/icons/Freemarker';
import UltraStyledIconButton from './UltraStyledIconButton';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import {
  deleteItem,
  duplicateItem,
  getCachedModel,
  getCachedModels,
  getCachedPermissions,
  getCachedSandboxItem,
  getModelIdFromInheritedField,
  insertItem,
  isInheritedField,
  modelHierarchyMap,
  sortDownItem,
  sortUpItem
} from '../contentController';
import { clearAndListen$ } from '../store/subjects';
import { startListening } from '../store/actions';
import { ElementRecord } from '../models/InContextEditing';
import { extractCollection, findParentModelId } from '@craftercms/studio-ui/utils/model';
import { isSimple, popPiece } from '@craftercms/studio-ui/utils/string';
import { AnyAction } from '@reduxjs/toolkit';
import useRef from '@craftercms/studio-ui/hooks/useUpdateRefs';
import { exists, findContainerRecord, getById, getReferentialEntries, runValidation } from '../iceRegistry';
import { post } from '../utils/communicator';
import { requestEdit, snackGuestMessage } from '@craftercms/studio-ui/state/actions/preview';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getParentModelId } from '../utils/ice';
import { fromICEId, get } from '../elementRegistry';
import { beforeWrite$ } from '../store/util';
import { useStore } from './GuestContext';
import UltraStyledTypography from './UltraStyledTypography';
import UltraStyledTooltip from './UltraStyledTooltip';

export interface ZoneMenuProps {
  record: ElementRecord;
  dispatch: Dispatch<AnyAction>;
  isHeadlessMode: boolean;
  isLockedItem?: boolean;
}

export function ZoneMenu(props: ZoneMenuProps) {
  const { record, dispatch, isHeadlessMode, isLockedItem = false } = props;
  const {
    modelId,
    fieldId: [fieldId],
    index
  } = record;

  const permissions = getCachedPermissions();
  const models = getCachedModels();
  const parentModelId = getParentModelId(modelId, models, modelHierarchyMap);
  const modelPath = isInheritedField(modelId, fieldId)
    ? models[getModelIdFromInheritedField(modelId, fieldId)].craftercms.path
    : (models[modelId].craftercms.path ?? models[parentModelId].craftercms.path);

  const trashButtonRef = React.useRef();
  const [showTrashConfirmation, setShowTrashConfirmation] = useState<boolean>(false);

  const iceRecord = getById(record.iceIds[0]);
  const recordType = iceRecord.recordType;

  const collection = useMemo(() => {
    if (['node-selector-item', 'repeat-item'].includes(recordType)) {
      return extractCollection(getCachedModel(modelId), fieldId, index);
    } else if (recordType === 'component') {
      // ToDo: Find container collection
      const mapEntry = modelHierarchyMap[modelId];
      if (mapEntry && mapEntry.parentId) {
        return extractCollection(
          getCachedModel(mapEntry.parentId),
          mapEntry.parentContainerFieldPath,
          mapEntry.parentContainerFieldIndex
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }, [modelId, fieldId, index, recordType]);
  const elementIndex = useMemo(() => {
    // If the record is a component, get the index from searching the
    // model id inside the container collection (previously computed).
    return recordType === 'component'
      ? collection?.indexOf(modelId)
      : parseInt(isSimple(index) ? String(index) : popPiece(String(index)));
  }, [recordType, collection, modelId, index]);
  const nodeSelectorItemRecord = useMemo(
    // region
    () =>
      recordType === 'component'
        ? getById(
            exists({
              modelId: modelHierarchyMap[modelId].parentId,
              fieldId: modelHierarchyMap[modelId].parentContainerFieldPath,
              index: modelHierarchyMap[modelId].parentContainerFieldIndex
            })
          )
        : ['node-selector-item', 'repeat-item'].includes(recordType)
          ? iceRecord
          : null,
    // endregion
    [modelId, recordType, iceRecord]
  );
  // File validations only applies to node-selector, not to repeating-group
  const isItemFile =
    collection && recordType === 'node-selector-item'
      ? Boolean(collection[elementIndex]?.hasOwnProperty('key'))
      : false;
  const collectionContainsFiles =
    collection && recordType === 'node-selector-item' ? collection.some((item) => item.hasOwnProperty('key')) : false;
  const componentId =
    recordType === 'component' ? modelId : recordType === 'node-selector-item' ? collection?.[elementIndex] : null;
  const componentPath = models[componentId]?.craftercms.path;
  const { field, contentType } = useMemo(() => getReferentialEntries(record.iceIds[0]), [record.iceIds]);

  // Use componentId to find the container modelId. If not a component, is unlikely to have a container, but in
  // cases where a page is being referenced by another model, we fall back to modelId.
  // If the current modelId is not being referenced by any other model (no parentModelId found), we use modelId.
  const containerModelId = findParentModelId(componentId ?? modelId, modelHierarchyMap, models) ?? modelId;
  const containerItemAvailableActions = models[containerModelId]
    ? getCachedSandboxItem(models[containerModelId].craftercms.path).availableActionsMap
    : null;
  const containerHasEditAction = containerItemAvailableActions?.edit ?? false;
  const itemAvailableActions = getCachedSandboxItem(componentPath ?? modelPath).availableActionsMap;
  const hasEditAction = itemAvailableActions.edit;

  const isMovable =
    containerHasEditAction &&
    (['node-selector-item', 'repeat-item'].includes(recordType) ||
      Boolean(recordType === 'component' && nodeSelectorItemRecord));
  const numOfItemsInContainerCollection = collection?.length;
  const isFirstItem = isMovable ? elementIndex === 0 : null;
  const isLastItem = isMovable ? elementIndex === numOfItemsInContainerCollection - 1 : null;
  const isOnlyItem = isMovable ? isFirstItem && isLastItem : null;
  const isEmbedded = useMemo(() => !Boolean(getCachedModel(modelId)?.craftercms.path), [modelId]);
  const showCodeEditOptions =
    hasEditAction && !isHeadlessMode && !isItemFile && ['component', 'page', 'node-selector-item'].includes(recordType);
  const showAddItem = hasEditAction && recordType === 'field' && field.type === 'repeat';
  const { isTrashable, showDuplicate } = useMemo(() => {
    const actions = {
      isTrashable: false,
      showDuplicate: false
    };

    const nodeSelectorEntries = Boolean(nodeSelectorItemRecord) ? getReferentialEntries(nodeSelectorItemRecord) : null;

    if (containerHasEditAction && Boolean(collection)) {
      const validations = nodeSelectorEntries?.field?.validations;
      const maxValidation = validations?.maxCount?.value;
      const minValidation = validations?.minCount?.value;
      const trashableValidation = minValidation ? minValidation < numOfItemsInContainerCollection : true;
      const duplicateValidation =
        permissions.includes('content_create') &&
        (maxValidation ? maxValidation > numOfItemsInContainerCollection : true);

      // The trash/duplicate are not applicable outside of item selector or repeat group type fields:
      if (
        // Record is an item, then options apply.
        ['node-selector-item', 'repeat-item'].includes(recordType) ||
        // A component has been directly selected (as opposed to an item selector item that was translated to a component):
        // must determine if it is part of an item selector and not a standalone model being rendered on to the page.
        Boolean(recordType === 'component' && nodeSelectorItemRecord)
      ) {
        actions.isTrashable = trashableValidation && recordType !== 'field' && recordType !== 'page';
        actions.showDuplicate =
          duplicateValidation && !isItemFile && ['repeat-item', 'component', 'node-selector-item'].includes(recordType);
      }
    }

    return actions;
  }, [
    nodeSelectorItemRecord,
    collection,
    numOfItemsInContainerCollection,
    permissions,
    containerHasEditAction,
    recordType,
    isItemFile
  ]);

  const store = useStore();
  const getItemData = () => {
    const models = getCachedModels();
    const isNodeSelectorItem = recordType === 'component' && nodeSelectorItemRecord;
    const itemModelId = isNodeSelectorItem ? nodeSelectorItemRecord.modelId : modelId;
    const itemFieldId = isNodeSelectorItem ? nodeSelectorItemRecord.fieldId : fieldId;
    const itemIndex = isNodeSelectorItem ? nodeSelectorItemRecord.index : index;
    const parentModelId = getParentModelId(itemModelId, models, modelHierarchyMap);
    const path = models[parentModelId ?? itemModelId].craftercms.path;
    return { path, itemModelId, itemFieldId, itemIndex };
  };

  // region Callbacks

  const execOperation = (subscriber: () => void) => {
    const { username, activeSite } = store.getState();
    const { path } = getItemData();
    beforeWrite$({
      path,
      site: activeSite,
      username,
      localItem: getCachedSandboxItem(path)
    }).subscribe(subscriber);
  };

  const onCancel = () => {
    clearAndListen$.next();
    dispatch(startListening());
  };

  const commonEdit = (e, typeOfEdit) => {
    e.stopPropagation();
    e.preventDefault();

    if (recordType === 'node-selector-item' && !collectionContainsFiles) {
      // If it's a node selector item, we transform it into the actual item.
      const parentModelId = getParentModelId(componentId, getCachedModels(), modelHierarchyMap);
      post(requestEdit({ typeOfEdit, modelId: componentId, parentModelId }));
    } else {
      let modelIdToEdit = modelId;
      // If inherited field - set correct modelId to edit
      if (record.inherited) {
        modelIdToEdit = getModelIdFromInheritedField(modelId, fieldId);
      }
      const parentModelId = getParentModelId(modelIdToEdit, getCachedModels(), modelHierarchyMap);
      post(
        requestEdit({
          typeOfEdit,
          modelId: modelIdToEdit,
          parentModelId,
          fields: record.fieldId,
          index
        })
      );
    }
    onCancel();
  };

  const onEdit = (e) => {
    commonEdit(e, 'content');
  };

  const onEditController = (e) => {
    commonEdit(e, 'controller');
  };

  const onEditTemplate = (e) => {
    commonEdit(e, 'template');
  };

  const onAddRepeatItem = (e) => {
    execOperation(() => {
      insertItem(modelId, fieldId, index, contentType);
    });
  };

  const onDuplicateItem = (e) => {
    execOperation(() => {
      if (recordType === 'component' && nodeSelectorItemRecord) {
        duplicateItem(nodeSelectorItemRecord.modelId, nodeSelectorItemRecord.fieldId, nodeSelectorItemRecord.index);
      } else {
        duplicateItem(modelId, fieldId, index);
      }
    });
    onCancel();
  };

  const onMoveUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    execOperation(() => {
      if (recordType === 'component' && nodeSelectorItemRecord) {
        sortUpItem(nodeSelectorItemRecord.modelId, nodeSelectorItemRecord.fieldId, nodeSelectorItemRecord.index);
      } else {
        sortUpItem(modelId, fieldId, index);
      }
    });
    onCancel();
  };

  const onMoveDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    execOperation(() => {
      if (recordType === 'component' && nodeSelectorItemRecord) {
        sortDownItem(nodeSelectorItemRecord.modelId, nodeSelectorItemRecord.fieldId, nodeSelectorItemRecord.index);
      } else {
        sortDownItem(modelId, fieldId, index);
      }
    });
    onCancel();
  };

  const doTrash = () => {
    setShowTrashConfirmation(false);
    const minCount = runValidation(findContainerRecord(modelId, fieldId, index).id, 'minCount', [
      numOfItemsInContainerCollection - 1
    ]);
    if (minCount) {
      post(snackGuestMessage(minCount));
    } else {
      execOperation(() => {
        if (recordType === 'component' && nodeSelectorItemRecord) {
          deleteItem(nodeSelectorItemRecord.modelId, nodeSelectorItemRecord.fieldId, nodeSelectorItemRecord.index);
        } else {
          deleteItem(modelId, fieldId, index);
        }
      });
      onCancel();
    }
  };

  const onTrash = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTrashConfirmation(true);
  };

  const onDragStart = (e) => {
    let _record = record;
    if (recordType === 'component' && nodeSelectorItemRecord) {
      _record = get(fromICEId(nodeSelectorItemRecord.id).id);
    }
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', `${_record.id}`);
    e.dataTransfer.setDragImage(document.querySelector('.craftercms-dragged-element'), 20, 20);
    setTimeout(() => {
      dispatch({ type: 'dragstart', payload: { event: null, record: _record } });
    });
  };

  // endregion

  const refs = useRef({ onMoveUp, onMoveDown, onTrash, doTrash, onCancel, isFirstItem, isLastItem });

  // Listen for key input to sort/delete and for clicking outside the zone to dismiss selection.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp': {
          if (!refs.current.isFirstItem) {
            refs.current.onMoveUp(e);
          }
          break;
        }
        case 'ArrowRight':
        case 'ArrowDown': {
          if (!refs.current.isLastItem) {
            refs.current.onMoveDown(e);
          }
          break;
        }
        case 'Backspace': {
          e.preventDefault();
          setShowTrashConfirmation(true);
          break;
        }
      }
    };
    const onClickOut = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      refs.current.onCancel();
    };
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('click', onClickOut, false);
    return () => {
      document.removeEventListener('keydown', onKeyDown, false);
      document.removeEventListener('click', onClickOut, false);
    };
  }, []);

  return (
    <>
      <UltraStyledTooltip title="Cancel (Esc)" key="cancel">
        <UltraStyledIconButton size="small" onClick={onCancel}>
          <HighlightOffRoundedIcon />
        </UltraStyledIconButton>
      </UltraStyledTooltip>
      {hasEditAction && !isLockedItem && (
        <UltraStyledTooltip title="Edit" key="edit">
          <UltraStyledIconButton size="small" onClick={onEdit}>
            <PencilIcon />
          </UltraStyledIconButton>
        </UltraStyledTooltip>
      )}
      {showCodeEditOptions && (
        <>
          {itemAvailableActions.editTemplate && (
            <UltraStyledTooltip title="Edit template" key="editTemplate">
              <UltraStyledIconButton size="small" onClick={onEditTemplate}>
                <FreemarkerIcon />
              </UltraStyledIconButton>
            </UltraStyledTooltip>
          )}
          {itemAvailableActions.editController && (
            <UltraStyledTooltip title="Edit controller" key="editController">
              <UltraStyledIconButton size="small" onClick={onEditController}>
                <GroovyIcon />
              </UltraStyledIconButton>
            </UltraStyledTooltip>
          )}
        </>
      )}
      {!isLockedItem && showAddItem && (
        <UltraStyledTooltip title="Add new item" key="addNewItem">
          <UltraStyledIconButton size="small" onClick={onAddRepeatItem}>
            <AddCircleOutlineRoundedIcon />
          </UltraStyledIconButton>
        </UltraStyledTooltip>
      )}
      {showDuplicate && (
        <UltraStyledTooltip title="Duplicate item" key="duplicateItem">
          <UltraStyledIconButton size="small" onClick={onDuplicateItem}>
            <ContentCopyRoundedIcon />
          </UltraStyledIconButton>
        </UltraStyledTooltip>
      )}
      {isMovable &&
        (!isLockedItem || !isEmbedded) &&
        !isOnlyItem && [
          !isFirstItem && (
            <UltraStyledTooltip title="Move up/left (← or ↑)" key="moveUp">
              <UltraStyledIconButton size="small" onClick={onMoveUp}>
                <ArrowUpwardRoundedIcon />
              </UltraStyledIconButton>
            </UltraStyledTooltip>
          ),
          !isLastItem && (
            <UltraStyledTooltip title="Move down/right (→ or ↓)" key="moveDown">
              <UltraStyledIconButton size="small" onClick={onMoveDown}>
                <ArrowDownwardRoundedIcon />
              </UltraStyledIconButton>
            </UltraStyledTooltip>
          )
        ]}
      {isTrashable && !isLockedItem && (
        <UltraStyledTooltip title="Trash (⌫)" key="trash">
          <UltraStyledIconButton size="small" onClick={onTrash} ref={trashButtonRef}>
            <DeleteOutlineRoundedIcon />
          </UltraStyledIconButton>
        </UltraStyledTooltip>
      )}
      {isMovable && (!isLockedItem || !isEmbedded) && (
        <UltraStyledTooltip title="Move" key="move">
          <UltraStyledIconButton size="small" draggable sx={{ cursor: 'grab' }} onDragStart={onDragStart}>
            <DragIndicatorRounded />
          </UltraStyledIconButton>
        </UltraStyledTooltip>
      )}
      <Menu
        anchorEl={trashButtonRef.current}
        open={showTrashConfirmation}
        onClose={() => setShowTrashConfirmation(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{ zIndex: 1501 }}
      >
        <UltraStyledTypography variant="body1" sx={{ padding: '10px 16px 10px 16px' }}>
          {isEmbedded ? 'Delete' : 'Disassociate'} this item?
        </UltraStyledTypography>
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            setShowTrashConfirmation(false);
          }}
        >
          <UltraStyledTypography>No</UltraStyledTypography>
        </MenuItem>
        <MenuItem onClick={(e) => refs.current.doTrash()}>
          <UltraStyledTypography>Yes</UltraStyledTypography>
        </MenuItem>
      </Menu>
    </>
  );
}

// Could use a more generic version...
// function IconButtonCollection({ actions }) {
//   return actions.map((action) => (
//     <Tooltip title={`${action.label} ${action.shortcut ?? ''}`.trim()}>
//       <UltraStyledIconButton size="small" {...action.props}>
//         <DragIndicatorRounded />
//       </UltraStyledIconButton>
//     </Tooltip>
//   ));
// }

export default ZoneMenu;
