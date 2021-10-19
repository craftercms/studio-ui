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
import { Dispatch, useEffect, useMemo } from 'react';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UltraStyledIconButton from './UltraStyledIconButton';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { Tooltip } from '@mui/material';
import * as contentController from '../classes/ContentController';
import { clearAndListen$ } from '../store/subjects';
import { startListening } from '../store/actions';
import { ElementRecord } from '../models/InContextEditing';
import { extractCollection } from '@craftercms/studio-ui/build_tsc/utils/model';
import { getCachedModel } from '../classes/ContentController';
import { popPiece, removeLastPiece, isSimple } from '@craftercms/studio-ui/build_tsc/utils/string';
import { AnyAction } from '@reduxjs/toolkit';
import useRef from '@craftercms/studio-ui/build_tsc/utils/hooks/useUpdateRefs';

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

  const elementIndex = useMemo(() => (typeof index === 'string' ? parseInt(popPiece(index), 10) : index), [index]);

  const numOfItemsInContainerCollection = useMemo(
    () => extractCollection(getCachedModel(modelId), fieldId, index).length,
    [modelId, fieldId, index]
  );

  const isFirstItem = elementIndex === 0;
  const isLastItem = elementIndex === numOfItemsInContainerCollection - 1;
  const isOnlyItem = isFirstItem && isLastItem;

  // region callbacks

  const onCancel = () => {
    clearAndListen$.next();
    dispatch(startListening());
  };

  const onMoveUp = () => {
    const targetIndex = elementIndex - 1;
    contentController.sortItem(
      modelId,
      fieldId,
      index,
      isSimple(index) ? targetIndex : `${removeLastPiece(index as string)}.${targetIndex}`
    );
    onCancel();
  };

  const onMoveDown = () => {
    const targetIndex = elementIndex + 1;
    contentController.sortItem(
      modelId,
      fieldId,
      index,
      isSimple(index) ? targetIndex : `${removeLastPiece(index as string)}.${targetIndex}`
    );
    onCancel();
  };

  const onTrash = () => {
    contentController.deleteItem(modelId, fieldId, index);
    onCancel();
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

  const refs = useRef({ onMoveUp, onMoveDown, onTrash, isFirstItem, isLastItem });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': {
          if (!refs.current.isFirstItem) {
            e.preventDefault();
            refs.current.onMoveUp();
          }
          break;
        }
        case 'ArrowDown': {
          if (!refs.current.isLastItem) {
            e.preventDefault();
            refs.current.onMoveDown();
          }
          break;
        }
        case 'Backspace': {
          e.preventDefault();
          refs.current.onTrash();
          break;
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isFirstItem, isLastItem]);

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
