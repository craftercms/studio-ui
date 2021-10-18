/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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
import { useCallback, useEffect, useMemo } from 'react';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UltraStyledIconButton from './UltraStyledIconButton';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { Tooltip } from '@mui/material';
import * as contentController from '../classes/ContentController';
import { getCachedModel } from '../classes/ContentController';
import { clearAndListen$ } from '../store/subjects';
import { startListening } from '../store/actions';
import { ElementRecord } from '../models/InContextEditing';
import { extractCollection } from '../utils/model';
import { popPiece, removeLastPiece } from '../utils/string';

export interface MoveModeZoneMenuProps {
  [key: string]: any;
  record: ElementRecord;
}

export function MoveModeZoneMenu(props: MoveModeZoneMenuProps) {
  const { record, dispatch } = props;
  const {
    modelId,
    fieldId: [fieldId],
    index
  } = record;

  const { parentIndex, elementIndex } = useMemo(() => {
    return {
      parentIndex: typeof index === 'string' ? removeLastPiece(index) : null,
      elementIndex: typeof index === 'string' ? parseInt(popPiece(index)) : index
    };
  }, [index]);
  

  const collectionLength = useMemo(() => extractCollection(getCachedModel(modelId), fieldId, index).length, []);

  const isFirstItem = elementIndex === 0;
  const isLastItem = elementIndex === collectionLength - 1;
  const isOnlyItem = isFirstItem && isLastItem;

  // region callbacks
  const clearAndStartListening = useCallback(() => {
    clearAndListen$.next();
    dispatch(startListening());
  }, [dispatch]);

  const onMoveUp = useCallback(() => {
    contentController.sortItem(
      modelId,
      fieldId,
      fieldId.includes('.') ? `${parentIndex}.${elementIndex}` : elementIndex,
      fieldId.includes('.') ? `${parentIndex}.${elementIndex - 1}` : elementIndex - 1
    );
    clearAndStartListening();
  }, [modelId, fieldId, parentIndex, elementIndex, clearAndStartListening]);

  const onMoveDown = useCallback(() => {
    contentController.sortItem(
      modelId,
      fieldId,
      fieldId.includes('.') ? `${parentIndex}.${elementIndex}` : elementIndex,
      fieldId.includes('.') ? `${parentIndex}.${elementIndex + 1}` : elementIndex + 1
    );
    clearAndStartListening();
  }, [clearAndStartListening, fieldId, modelId, parentIndex, elementIndex]);

  const onTrash = useCallback(() => {
    contentController.deleteItem(modelId, fieldId, index);
    clearAndStartListening();
  }, [clearAndStartListening, fieldId, index, modelId]);

  const onCancel = () => {
    clearAndStartListening();
  };

  const onDragStart = (e) => {
    e.stopPropagation();
    const image = document.querySelector('.craftercms-dragged-element');
    e.dataTransfer.setData('text/plain', `${record.id}`);
    e.dataTransfer.setDragImage(image, 20, 20);
    setTimeout(() => {
      dispatch({ type: 'dragstart', payload: { event: null, record } });
    });
  };
  // endregion

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': {
          if (!isFirstItem) {
            e.preventDefault();
            onMoveUp();
          }
          break;
        }
        case 'ArrowDown': {
          if (!isLastItem) {
            e.preventDefault();
            onMoveDown();
          }
          break;
        }
        case 'Backspace': {
          e.preventDefault();
          onTrash();
          break;
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isFirstItem, isLastItem, onMoveDown, onMoveUp, onTrash]);

  useEffect(() => {
    const onClickingOutsideOfSelectedZone = (e: MouseEvent) => {
      console.log('click');
    };
    window.addEventListener('click', onClickingOutsideOfSelectedZone);
    return () => {
      window.removeEventListener('click', onClickingOutsideOfSelectedZone);
    };
  }, []);

  return (
    <>
      <Tooltip title="Cancel (Esc)">
        <UltraStyledIconButton size="small" onClick={onCancel}>
          <HighlightOffRoundedIcon />
        </UltraStyledIconButton>
      </Tooltip>
      {!isFirstItem && !isOnlyItem && (
        <Tooltip title="Move up/left (← or ↑)">
          <UltraStyledIconButton size="small" onClick={onMoveUp}>
            <ArrowUpwardRoundedIcon />
          </UltraStyledIconButton>
        </Tooltip>
      )}
      {!isLastItem && !isOnlyItem && (
        <Tooltip title="Move down/right (→ or ↓)">
          <UltraStyledIconButton size="small" onClick={onMoveDown}>
            <ArrowDownwardRoundedIcon />
          </UltraStyledIconButton>
        </Tooltip>
      )}
      <Tooltip title="Trash (⌫)">
        <UltraStyledIconButton size="small" onClick={onTrash}>
          <DeleteOutlineRoundedIcon />
        </UltraStyledIconButton>
      </Tooltip>
      <Tooltip title="Move">
        <UltraStyledIconButton size="small" draggable sx={{ cursor: 'grab' }} onDragStart={onDragStart}>
          <DragIndicatorRounded />
        </UltraStyledIconButton>
      </Tooltip>
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
