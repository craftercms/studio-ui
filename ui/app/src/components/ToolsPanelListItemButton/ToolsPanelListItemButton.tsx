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

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import ChevronRounded from '@material-ui/icons/ChevronRightRounded';
import React from 'react';
import SystemIcon from '../SystemIcon';
import { usePossibleTranslation } from '../../utils/hooks';

export interface ToolsPanelListItemButtonProps {
  title: string;
  subtitle: string;
  icon: { id: string; baseClass: string; baseStyle: object };
  onClick(): void;
  displaySecondaryAction?: boolean;
  secondaryActionIcon?: React.ReactNode;
  onSecondaryActionClick?(): void;
}

export default function ToolsPanelListItemButton(props: ToolsPanelListItemButtonProps) {
  const {
    icon,
    title,
    subtitle,
    onClick,
    displaySecondaryAction = false,
    secondaryActionIcon = <ChevronRounded />,
    onSecondaryActionClick
  } = props;
  return (
    <ListItem button onClick={onClick} ContainerComponent="div">
      <ListItemIcon>
        <SystemIcon icon={icon} fontIconProps={{ fontSize: 'small' }} />
      </ListItemIcon>
      <ListItemText
        primary={usePossibleTranslation(title)}
        secondary={subtitle}
        primaryTypographyProps={{ noWrap: true }}
        secondaryTypographyProps={{ noWrap: true }}
      />
      {displaySecondaryAction && (
        <ListItemSecondaryAction style={{ right: '5px' }}>
          <IconButton size="small" onClick={onSecondaryActionClick ?? onClick}>
            {secondaryActionIcon}
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}
