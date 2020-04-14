/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import DragIndicatorRounded from '@material-ui/icons/DragIndicatorRounded';
import { getInitials } from '../../../utils/string';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import { createStyles } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(() => createStyles({
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
}));

interface PanelListItemProps {
  primaryText: string;
  secondaryText?: string;
  onDragStart?: (...args: any) => any;
  onDragEnd?: (...args: any) => any;
  onMenu?: (anchor: Element) => any;
}

export function DraggablePanelListItem(props: PanelListItemProps) {
  const classes = useStyles({});
  const {
    onMenu,
    primaryText,
    secondaryText,
    onDragStart,
    onDragEnd
  } = props;
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
          <Avatar classes={{ root: over ? classes.avatarRootOver : '' }}>
            {over ? <DragIndicatorRounded /> : getInitials(primaryText)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={primaryText}
          secondary={secondaryText}
          classes={{ primary: classes.noWrapping, secondary: classes.noWrapping }}
        />
        {
          onMenu &&
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="delete" onClick={(e) => onMenu(e.currentTarget)}>
              <MoreVertRounded />
            </IconButton>
          </ListItemSecondaryAction>
        }
      </ListItem>
    </>
  );
}
