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

export default function Page(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.1918 4.83884L18.1221 7.76907C18.4696 8.11657 18.7607 8.81156 18.7607 9.30932V20.1287C18.7607 20.6264 18.3568 21.0303 17.8591 21.0303H6.14087C5.6431 21.0303 5.23926 20.6264 5.23926 20.1287V5.10181C5.23926 4.60404 5.6431 4.2002 6.14087 4.2002H13.6516C14.1493 4.2002 14.8443 4.49134 15.1918 4.83884ZM14.3372 5.6841C14.2714 5.61835 14.1118 5.53383 13.9521 5.47748V9.00879H17.4834C17.4271 8.84913 17.3425 8.68947 17.2768 8.62372L14.3372 5.6841ZM6.44141 19.8281H17.5585V10.2109H13.6516C13.1538 10.2109 12.75 9.80709 12.75 9.30932V5.40234H6.44141V19.8281Z"
      />
    </SvgIcon>
  );
}
