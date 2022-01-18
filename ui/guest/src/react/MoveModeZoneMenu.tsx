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
import { Tooltip } from '@mui/material';
import {
  deleteItem,
  getCachedModel,
  getCachedModels,
  modelHierarchyMap,
  sortDownItem,
  sortUpItem
} from '../contentController';
import { clearAndListen$ } from '../store/subjects';
import { startListening } from '../store/actions';
import { ElementRecord } from '../models/InContextEditing';
import { extractCollection } from '@craftercms/studio-ui/utils/model';
import { isSimple, popPiece } from '@craftercms/studio-ui/utils/string';
import { AnyAction } from '@reduxjs/toolkit';
import useRef from '@craftercms/studio-ui/hooks/useUpdateRefs';
import { exists, findContainerRecord, getById, runValidation } from '../iceRegistry';
import { post } from '../utils/communicator';
import { requestEdit, validationMessage } from '@craftercms/studio-ui/state/actions/preview';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import { getParentModelId } from '../utils/ice';

export interface MoveModeZoneMenuProps {
  record: ElementRecord;
  dispatch: Dispatch<AnyAction>;
}

export function MoveModeZoneMenu(props: MoveModeZoneMenuProps) {
  const { record, dispatch } = props;
  const {
    modelId,
    fieldId: [fieldId],
    index
  } = record;

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
      ? collection.indexOf(modelId)
      : parseInt(isSimple(index) ? String(index) : popPiece(String(index)));
  }, [recordType, collection, modelId, index]);
  const nodeSelectorItemRecord = useMemo(
    () =>
      recordType === 'component'
        ? getById(
            exists({
              modelId: modelHierarchyMap[modelId].parentId,
              fieldId: modelHierarchyMap[modelId].parentContainerFieldPath,
              index: modelHierarchyMap[modelId].parentContainerFieldIndex
            })
          )
        : null,
    [modelId, recordType]
  );
  const componentId =
    recordType === 'component' ? modelId : recordType === 'node-selector-item' ? collection[elementIndex] : null;
  const isMovable =
    ['node-selector-item', 'repeat-item'].includes(recordType) ||
    Boolean(recordType === 'component' && nodeSelectorItemRecord);
  const numOfItemsInContainerCollection = collection?.length;
  const isFirstItem = isMovable ? elementIndex === 0 : null;
  const isLastItem = isMovable ? elementIndex === numOfItemsInContainerCollection - 1 : null;
  const isOnlyItem = isMovable ? isFirstItem && isLastItem : null;
  const isEmbedded = useMemo(() => !Boolean(getCachedModel(modelId)?.craftercms.path), [modelId]);
  const showCodeEditOptions = ['component', 'page', 'node-selector-item'].includes(recordType);
  const isTrashable = recordType !== 'field' && recordType !== 'page';
  const showAddItem = false; // for repeat group item
  const showDuplicate = false; // could apply to repeat items or components

  // region callbacks

  const onCancel = () => {
    clearAndListen$.next();
    dispatch(startListening());
  };

  const commonEdit = (e, typeOfEdit) => {
    e.stopPropagation();
    e.preventDefault();
    const parentModelId = getParentModelId(modelId, getCachedModels(), modelHierarchyMap);
    if (recordType === 'node-selector-item') {
      // If it's a node selector item, we transform it into the actual item.
      post(requestEdit({ typeOfEdit, modelId: componentId, parentModelId }));
    } else {
      post(requestEdit({ typeOfEdit, modelId, parentModelId, fields: record.fieldId }));
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

  const onMoveUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (recordType === 'component' && nodeSelectorItemRecord) {
      sortUpItem(nodeSelectorItemRecord.modelId, nodeSelectorItemRecord.fieldId, nodeSelectorItemRecord.index);
    } else {
      sortUpItem(modelId, fieldId, index);
    }
    onCancel();
  };

  const onMoveDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (recordType === 'component' && nodeSelectorItemRecord) {
      sortDownItem(nodeSelectorItemRecord.modelId, nodeSelectorItemRecord.fieldId, nodeSelectorItemRecord.index);
    } else {
      sortDownItem(modelId, fieldId, index);
    }
    onCancel();
  };

  const doTrash = () => {
    setShowTrashConfirmation(false);
    const minCount = runValidation(findContainerRecord(modelId, fieldId, index).id, 'minCount', [
      numOfItemsInContainerCollection - 1
    ]);
    if (minCount) {
      post(validationMessage(minCount));
    } else {
      deleteItem(modelId, fieldId, index);
      onCancel();
    }
  };

  const onTrash = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTrashConfirmation(true);
  };

  const onDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', `${record.id}`);
    e.dataTransfer.setDragImage(document.querySelector('.craftercms-dragged-element'), 20, 20);
    setTimeout(() => {
      dispatch({ type: 'dragstart', payload: { event: null, record } });
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
      <Tooltip title="Cancel (Esc)">
        <UltraStyledIconButton size="small" onClick={onCancel}>
          <HighlightOffRoundedIcon />
        </UltraStyledIconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <UltraStyledIconButton size="small" onClick={onEdit}>
          <PencilIcon />
        </UltraStyledIconButton>
      </Tooltip>
      {showCodeEditOptions && (
        <>
          <Tooltip title="Edit template">
            <UltraStyledIconButton size="small" onClick={onEditTemplate}>
              <FreemarkerIcon />
            </UltraStyledIconButton>
          </Tooltip>
          <Tooltip title="Edit controller">
            <UltraStyledIconButton size="small" onClick={onEditController}>
              <GroovyIcon />
            </UltraStyledIconButton>
          </Tooltip>
        </>
      )}
      {isMovable &&
        !isOnlyItem && [
          !isFirstItem && (
            <Tooltip title="Move up/left (← or ↑)">
              <UltraStyledIconButton size="small" onClick={onMoveUp}>
                <ArrowUpwardRoundedIcon />
              </UltraStyledIconButton>
            </Tooltip>
          ),
          !isLastItem && (
            <Tooltip title="Move down/right (→ or ↓)">
              <UltraStyledIconButton size="small" onClick={onMoveDown}>
                <ArrowDownwardRoundedIcon />
              </UltraStyledIconButton>
            </Tooltip>
          )
        ]}
      {isTrashable && (
        <Tooltip title="Trash (⌫)">
          <UltraStyledIconButton size="small" onClick={onTrash} ref={trashButtonRef}>
            <DeleteOutlineRoundedIcon />
          </UltraStyledIconButton>
        </Tooltip>
      )}
      {isMovable && (
        <Tooltip title="Move">
          <UltraStyledIconButton size="small" draggable sx={{ cursor: 'grab' }} onDragStart={onDragStart}>
            <DragIndicatorRounded />
          </UltraStyledIconButton>
        </Tooltip>
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
        <Typography variant="body1" sx={{ padding: '10px 16px 10px 16px' }}>
          {isEmbedded ? 'Delete' : 'Disassociate'} this item?
        </Typography>
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            setShowTrashConfirmation(false);
          }}
        >
          No
        </MenuItem>
        <MenuItem onClick={(e) => refs.current.doTrash()}>Yes</MenuItem>
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

export default MoveModeZoneMenu;
