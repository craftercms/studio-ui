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

export default function NodeSelector(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="11.9999" cy="11.9999" r="9.92433" stroke="black" strokeWidth="1.13252"/>
      <path
        d="M16.6774 10.8949V11.4611H17.2436H18.2686C18.5715 11.4611 18.862 11.5814 19.0762 11.7956C19.2904 12.0098 19.4107 12.3003 19.4107 12.6032C19.4107 12.9061 19.2904 13.1966 19.0762 13.4108C18.862 13.6249 18.5715 13.7453 18.2686 13.7453H17.2436H16.6774V14.3115V17.0448C16.6774 17.2571 16.593 17.4607 16.4429 17.6108L16.8433 18.0112L16.4429 17.6108C16.2928 17.7609 16.0892 17.8453 15.8769 17.8453H13.8465V17.3865C13.8465 16.0488 12.773 14.9753 11.4353 14.9753C10.0975 14.9753 9.02403 16.0488 9.02403 17.3865V17.8453H6.99362C6.78134 17.8453 6.57775 17.7609 6.42765 17.6108C6.27754 17.4607 6.19321 17.2571 6.19321 17.0448V15.0144H6.65195C7.98969 15.0144 9.06321 13.9409 9.06321 12.6032C9.06321 11.2654 7.98969 10.1919 6.65195 10.1919H6.19321V8.16152C6.19321 7.94924 6.27754 7.74565 6.42764 7.59555C6.57775 7.44544 6.78134 7.36111 6.99362 7.36111H9.72695H10.2932V6.79485V5.76986C10.2932 5.46696 10.4135 5.17647 10.6277 4.96229C10.8419 4.74811 11.1324 4.62778 11.4353 4.62778C11.7382 4.62778 12.0287 4.74811 12.2428 4.96229C12.457 5.17647 12.5774 5.46696 12.5774 5.76986V6.79485V7.36111H13.1436H15.8769C16.3177 7.36111 16.6774 7.7176 16.6774 8.16152V10.8949Z"
        stroke="black"
        strokeWidth="1.13252"
        fill="none"
      />
    </SvgIcon>
  );
}
