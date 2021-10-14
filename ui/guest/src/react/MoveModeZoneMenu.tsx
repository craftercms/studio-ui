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
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UltraStyledIconButton from './UltraStyledIconButton';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { Tooltip } from '@mui/material';
import { useDispatch } from './GuestContext';
import * as elementRegistry from '../classes/ElementRegistry';
import DragGhostElement from './DragGhostElement';

export interface MoveModeZoneMenuProps {
  [key: string]: any;
}

export function MoveModeZoneMenu(props: MoveModeZoneMenuProps) {
  const { record, dispatch } = props;
  // const dispatch = useDispatch();
  // region callbacks
  const onMoveUp = () => void 0;
  const onMoveDown = () => void 0;
  const onTrash = () => void 0;
  const onCancel = () => void 0;
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
      <Tooltip title="Move up/left (← or ↑)">
        <UltraStyledIconButton size="small" onClick={onMoveUp}>
          <ArrowUpwardRoundedIcon />
        </UltraStyledIconButton>
      </Tooltip>
      <Tooltip title="Move down/right (→ or ↓)">
        <UltraStyledIconButton size="small" onClick={onMoveDown}>
          <ArrowDownwardRoundedIcon />
        </UltraStyledIconButton>
      </Tooltip>
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
