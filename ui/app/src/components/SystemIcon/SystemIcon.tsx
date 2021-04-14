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
import clsx from 'clsx';

export type SystemIconDescriptor = { id?: string; class?: string; style?: object; content?: string };

export interface SystemIconProps {
  icon: SystemIconDescriptor;
  fontIconProps?: IconProps;
  svgIconProps?: SvgIconProps;
}

export default function SystemIcon(props: SystemIconProps) {
  let { icon } = props;
  if ('id' in icon) {
    const IconComponent = components.get(icon.id) as typeof ErrorRounded;
    const style = { ...icon.style, ...props.svgIconProps?.style };
    const className = clsx(icon.class, props.svgIconProps?.className);

    return IconComponent ? (
      <IconComponent {...props.svgIconProps} style={style} className={className} />
    ) : (
      <Tooltip title={`Icon ${icon.id} not found. Check config.`}>
        <ErrorRounded />
      </Tooltip>
    );
  } else {
    return (
      <CoreIcon
        className={icon.class}
        children={icon.content}
        {...props.fontIconProps}
        style={{ ...icon.style, ...props.fontIconProps?.style }}
      />
    );
  }
}
