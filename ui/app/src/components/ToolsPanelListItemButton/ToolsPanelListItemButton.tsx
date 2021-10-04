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

import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import ChevronRounded from '@mui/icons-material/ChevronRightRounded';
import React from 'react';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';
import { usePossibleTranslation } from '../../utils/hooks/usePossibleTranslation';
import TranslationOrText from '../../models/TranslationOrText';

export interface ToolsPanelListItemButtonProps {
  title: TranslationOrText;
  subtitle?: string;
  icon: SystemIconDescriptor;
  displaySecondaryAction?: boolean;
  secondaryActionIcon?: React.ReactNode;
  onClick(): void;
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
      {displaySecondaryAction ? (
        <ListItemSecondaryAction style={{ right: '5px' }}>
          <IconButton size="small" onClick={onSecondaryActionClick ?? onClick}>
            {secondaryActionIcon}
          </IconButton>
        </ListItemSecondaryAction>
      ) : (
        <ChevronRounded />
      )}
    </ListItem>
  );
}
