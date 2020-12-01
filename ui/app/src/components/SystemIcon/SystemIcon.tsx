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

import React from 'react';
import CoreIcon, { IconProps } from '@material-ui/core/Icon';
import ErrorRounded from '@material-ui/icons/ErrorRounded';
import { components } from '../../services/plugin';
import { SvgIconProps, Tooltip } from '@material-ui/core';

export interface SystemIconProps {
  icon: Partial<{ id: string; baseClass: string; baseStyle: object; content: string }>;
  iconProps?: IconProps;
  svgIconProps?: SvgIconProps;
}

export default function SystemIcon(props: SystemIconProps) {
  let icon = props.icon;
  if (icon.id) {
    const IconComponent = components.get(icon.id) as typeof ErrorRounded;
    if (!IconComponent) {
      return (
        <Tooltip title={`Icon ${icon.id} not found. Check config.`}>
          <ErrorRounded />
        </Tooltip>
      );
    } else {
      return <IconComponent {...props.svgIconProps} />;
    }
  } else {
    return (
      <CoreIcon
        fontSize="small"
        className={icon.baseClass}
        style={{ ...icon.baseStyle, ...props.iconProps?.style }}
        children={icon.content}
      />
    );
  }
}
