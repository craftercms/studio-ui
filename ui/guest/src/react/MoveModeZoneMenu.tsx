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
import { useMemo } from 'react';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UltraStyledIconButton from './UltraStyledIconButton';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { Tooltip } from '@mui/material';
import DragGhostElement from './DragGhostElement';
import * as contentController from '../classes/ContentController';
import { clearAndListen$ } from '../store/subjects';
import { startListening } from '../store/actions';
import { compileDropZone, fromElement, getParentElementFromICEProps } from '../classes/ElementRegistry';
import { ElementRecord } from '../models/InContextEditing';

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

  const elementIndex = useMemo(() => {
    if (typeof index === 'string') {
      return parseInt(index.substr(index.lastIndexOf('.') + 1), 10);
    }
    return index;
  }, [index]);

  const dropzoneRecord = useMemo(
    () => fromElement(getParentElementFromICEProps(modelId, fieldId, index)[0] as Element),
    [fieldId, index, modelId]
  );

  const dropzoneChildrenLength = useMemo(
    () => compileDropZone(dropzoneRecord.iceIds[0]).children.length,
    [dropzoneRecord.iceIds]
  );

  // region callbacks
  const clearAndStartListening = () => {
    clearAndListen$.next();
    dispatch(startListening());
  };

  const onMoveUp = () => {
    contentController.sortItem(modelId, fieldId, index, elementIndex - 1);
    clearAndStartListening();
  };

  const onMoveDown = () => {
    contentController.sortItem(modelId, fieldId, index, elementIndex + 1);
    clearAndStartListening();
  };

  const onTrash = () => {
    contentController.deleteItem(modelId, fieldId[0], index);
    clearAndStartListening();
  };

  const onCancel = () => {
    clearAndStartListening();
  };

  const onDragStart = (e) => {
    e.stopPropagation();
    const image = document.querySelector('.craftercms-dragged-element');
    e.dataTransfer.setData('text/plain', `${record.id}`);
    e.dataTransfer.setDragImage(image, 20, 20);
    setTimeout(() => {
      dispatch({ type: 'dragstart', payload: { event: e, record } });
    });
  };
  // endregion

  return (
    <>
      <DragGhostElement label="Test Test Test" />
      <Tooltip title="Cancel (Esc)">
        <UltraStyledIconButton size="small" onClick={onCancel}>
          <HighlightOffRoundedIcon />
        </UltraStyledIconButton>
      </Tooltip>
      {index !== 0 && (
        <Tooltip title="Move up/left (← or ↑)">
          <UltraStyledIconButton size="small" onClick={onMoveUp}>
            <ArrowUpwardRoundedIcon />
          </UltraStyledIconButton>
        </Tooltip>
      )}
      {index < dropzoneChildrenLength - 1 && (
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
