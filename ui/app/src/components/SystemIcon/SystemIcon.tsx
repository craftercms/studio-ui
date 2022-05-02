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

import React, { Suspense } from 'react';
import MuiIcon, { IconProps } from '@mui/material/Icon';
import ErrorRounded from '@mui/icons-material/ErrorRounded';
import { components } from '../../utils/constants';
import { SvgIconProps, Tooltip } from '@mui/material';
import clsx from 'clsx';
import { Skeleton } from '@mui/material';

export type SystemIconDescriptor = { id?: string; class?: string; style?: object; content?: string };

export interface SystemIconProps {
  icon: SystemIconDescriptor;
  fontIconProps?: IconProps;
  svgIconProps?: SvgIconProps;
  className?: string;
  style?: object;
}

export function SystemIcon(props: SystemIconProps) {
  let { icon, className, style } = props;
  if ('id' in icon) {
    const IconComponent = components.get(icon.id) as typeof ErrorRounded;
    const iconStyle = { ...icon.style, ...style, ...props.svgIconProps?.style };
    const iconClassName = clsx(icon.class, className, props.svgIconProps?.className);
    return IconComponent ? (
      <Suspense fallback={<Skeleton variant="rectangular" width="24px" style={iconStyle} className={iconClassName} />}>
        <IconComponent {...props.svgIconProps} style={iconStyle} className={iconClassName} />
      </Suspense>
    ) : (
      <Tooltip title={`Icon ${icon.id} not found. Check config.`}>
        <ErrorRounded />
      </Tooltip>
    );
  } else {
    return (
      <MuiIcon
        className={icon.class}
        children={icon.content}
        {...props.fontIconProps}
        style={{ ...icon.style, ...style, ...props.fontIconProps?.style }}
      />
    );
  }
}

export default SystemIcon;
