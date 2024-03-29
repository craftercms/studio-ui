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

import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import ChevronRounded from '@mui/icons-material/ChevronRightRounded';
import React from 'react';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';
import { usePossibleTranslation } from '../../hooks/usePossibleTranslation';
import TranslationOrText from '../../models/TranslationOrText';

export interface ToolsPanelListItemButtonProps extends Omit<ListItemButtonProps, 'title'> {
  title: TranslationOrText;
  subtitle?: string;
  icon?: SystemIconDescriptor;
  secondaryActionIcon?: React.ReactNode;
  onSecondaryActionClick?(): void;
}

export function ToolsPanelListItemButton(props: ToolsPanelListItemButtonProps) {
  const {
    icon,
    title,
    subtitle,
    onClick,
    secondaryActionIcon = <ChevronRounded />,
    onSecondaryActionClick,
    ...listItemButtonProps
  } = props;
  return (
    <ListItemButton {...listItemButtonProps} onClick={onClick}>
      {icon && (
        <ListItemIcon>
          <SystemIcon icon={icon} fontIconProps={{ fontSize: 'small' }} />
        </ListItemIcon>
      )}
      <ListItemText
        primary={usePossibleTranslation(title)}
        secondary={subtitle}
        primaryTypographyProps={{ noWrap: true }}
        secondaryTypographyProps={{ noWrap: true }}
      />
      {onSecondaryActionClick ? (
        <ListItemSecondaryAction style={{ right: '5px' }}>
          <IconButton size="small" onClick={onSecondaryActionClick}>
            {secondaryActionIcon}
          </IconButton>
        </ListItemSecondaryAction>
      ) : (
        <ChevronRounded />
      )}
    </ListItemButton>
  );
}

export default ToolsPanelListItemButton;
