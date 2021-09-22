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

export interface MoveModeZoneMenuProps {}

export function MoveModeZoneMenu(props: MoveModeZoneMenuProps) {
  // region callbacks
  const onMoveUp = () => void 0;
  const onMoveDown = () => void 0;
  const onTrash = () => void 0;
  const onDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag start');
  };
  // endregion
  return (
    <>
      <UltraStyledIconButton size="small" onClick={onMoveUp}>
        <ArrowUpwardRoundedIcon />
      </UltraStyledIconButton>
      <UltraStyledIconButton size="small" onClick={onMoveDown}>
        <ArrowDownwardRoundedIcon />
      </UltraStyledIconButton>
      <UltraStyledIconButton size="small" onClick={onTrash}>
        <DeleteOutlineRoundedIcon />
      </UltraStyledIconButton>
      <UltraStyledIconButton size="small" draggable sx={{ cursor: 'grab' }} onDragStart={onDragStart}>
        <DragIndicatorRounded />
      </UltraStyledIconButton>
    </>
  );
}

export default MoveModeZoneMenu;
