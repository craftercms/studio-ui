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

export default function Component(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M13.3235 7.61905V8.11905H13.8235H14.9663C15.3389 8.11905 15.6962 8.26705 15.9596 8.53049C16.2231 8.79394 16.3711 9.15124 16.3711 9.52381C16.3711 9.89638 16.2231 10.2537 15.9596 10.5171C15.6962 10.7806 15.3389 10.9286 14.9663 10.9286H13.8235H13.3235V11.4286V14.4762C13.3235 14.7477 13.2156 15.0081 13.0236 15.2001C12.8316 15.3921 12.5712 15.5 12.2997 15.5H9.90443V14.8571C9.90443 13.4381 8.76628 12.3 7.34728 12.3C5.92828 12.3 4.79014 13.4381 4.79014 14.8571V15.5H2.3949C2.12337 15.5 1.86296 15.3921 1.67096 15.2001C1.47896 15.0081 1.37109 14.7477 1.37109 14.4762V12.081H2.01395C3.43295 12.081 4.57109 10.9428 4.57109 9.52381C4.57109 8.10481 3.43295 6.96667 2.01395 6.96667H1.37109V4.57143C1.37109 4.2999 1.47896 4.03949 1.67096 3.84749C1.86296 3.65548 2.12337 3.54762 2.3949 3.54762H5.44252H5.94252V3.04762V1.90476C5.94252 1.5322 6.09052 1.17489 6.35397 0.911445C6.61741 0.648001 6.97472 0.5 7.34728 0.5C7.71985 0.5 8.07716 0.648001 8.3406 0.911445C8.60405 1.17489 8.75205 1.5322 8.75205 1.90476V3.04762V3.54762H9.25205H12.2997C12.8632 3.54762 13.3235 4.00348 13.3235 4.57143V7.61905Z"
        stroke="#5AC8FA"/>
    </SvgIcon>
  );
}
