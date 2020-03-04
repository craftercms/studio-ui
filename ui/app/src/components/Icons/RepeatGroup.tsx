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
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

export default function RepeatGroup(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12.126" cy="12.2466" r="9.31986" stroke="black" strokeWidth="1.08199"/>
      <path d="M10.8305 10.709V11.148H11.2695H12.968H13.407V10.709V8.13386H16.7082V10.709V11.148H17.1472H18.7085V16.3588H5.54353V11.148H7.0854H7.52443V10.709V8.13386H10.8305V10.709Z" stroke="black" strokeWidth="0.878068"/>
    </SvgIcon>
  );
}
