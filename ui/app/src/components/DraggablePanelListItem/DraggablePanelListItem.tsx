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

import React, { useState } from 'react';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import { toColor } from '../../utils/string';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import { darken, useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';

interface PanelListItemProps {
  primaryText: string;
  secondaryText?: string;
  onDragStart?: (...args: any) => any;
  onDragEnd?: (...args: any) => any;
  onMenu?: (anchor: Element) => any;
  isBeingDragged?: boolean;
}

export function DraggablePanelListItem(props: PanelListItemProps) {
  const { onMenu, primaryText, secondaryText, onDragStart, onDragEnd, isBeingDragged = false } = props;
  const hasMenu = Boolean(onMenu);
  const theme = useTheme();
  const color = toColor(primaryText);
  const bgColor = theme.palette.mode === 'dark' ? darken(color, 0.2) : color;
  const textColor = theme.palette.getContrastText(color);
  const [over, setOver] = useState(false);
  return (
    <ListItemButton
      role="option"
      disableRipple
      key={secondaryText}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
      sx={{
        pl: 1.5,
        pr: hasMenu ? 6 : undefined,
        border: `1px solid ${isBeingDragged ? bgColor : 'transparent'}`,
        borderRadius: isBeingDragged ? 2 : 0,
        cursor: isBeingDragged ? 'grabbing' : 'grab'
      }}
    >
      <ListItemAvatar sx={{ minWidth: 0 }}>
        <Avatar
          sx={{
            mr: 1.5,
            width: 30,
            height: 30,
            backgroundColor: over ? 'transparent' : bgColor,
            transition: 'background-color 0.25s ease-in-out'
          }}
        >
          <DragIndicatorRounded
            fontSize="small"
            sx={{
              color: over ? bgColor : textColor,
              transition: 'color 0.25s ease-in-out'
            }}
          />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={primaryText} secondary={secondaryText} />
      {hasMenu && (
        <ListItemSecondaryAction sx={{ right: '10px', display: isBeingDragged ? 'none' : undefined }}>
          <IconButton edge="end" onClick={(e) => onMenu(e.currentTarget)} size="small">
            <MoreVertRounded />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItemButton>
  );
}

export default DraggablePanelListItem;
