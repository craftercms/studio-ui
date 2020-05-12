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

import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import React, { ElementType } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import HistoryIcon from '@material-ui/icons/HistoryRounded';
import BackIcon from '@material-ui/icons/ArrowBackIosRounded';
import CloseIcon from '@material-ui/icons/CloseRounded';

export type ActionIcon = 'HistoryIcon' | 'CloseIcon' | 'BackIcon'

const ActionsIconMap: { [key in ActionIcon]: ElementType } = {
  CloseIcon: CloseIcon,
  HistoryIcon: HistoryIcon,
  BackIcon: BackIcon
};

interface ActionProps extends IconButtonProps {
  icon: ActionIcon | ElementType;
  tooltip: string;
}

export default function (props: ActionProps) {
  const { icon, tooltip, ...rest } = props;
  const Icon = typeof icon === 'string' ? ActionsIconMap[icon] : icon;
  return tooltip ? (
    <Tooltip title={tooltip}>
      <IconButton {...rest}>
        <Icon />
      </IconButton>
    </Tooltip>
  ) : (
    <IconButton {...rest}>
      <Icon />
    </IconButton>
  );
}
