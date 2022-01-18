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

import React, { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import { getInitials } from '../../utils/string';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
    noWrapping: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      display: 'block'
    },
    component: {
      cursor: 'move'
    },
    avatarRootOver: {
      color: 'black',
      background: 'white'
    }
  })
);

interface PanelListItemProps {
  primaryText: string;
  secondaryText?: string;
  avatarSrc?: string;
  onDragStart?: (...args: any) => any;
  onDragEnd?: (...args: any) => any;
  onMenu?: (anchor: Element) => any;
}

export function DraggablePanelListItem(props: PanelListItemProps) {
  const classes = useStyles({});
  const { onMenu, primaryText, avatarSrc, secondaryText, onDragStart, onDragEnd } = props;
  const [over, setOver] = useState(false);
  return (
    <>
      <ListItem
        key={secondaryText}
        className={classes.component}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
      >
        <ListItemAvatar>
          <Avatar classes={{ root: over ? classes.avatarRootOver : '' }} src={over ? null : avatarSrc}>
            {over ? <DragIndicatorRounded /> : getInitials(primaryText)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={primaryText}
          secondary={secondaryText}
          classes={{ primary: classes.noWrapping, secondary: classes.noWrapping }}
        />
        {onMenu && (
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="delete" onClick={(e) => onMenu(e.currentTarget)} size="large">
              <MoreVertRounded />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </>
  );
}

export default DraggablePanelListItem;
