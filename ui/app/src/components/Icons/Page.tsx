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
        d="M12.5217 4H7.65082C6.75 4 6 4.70924 6 5.61005V5.95652V17.6753C6 18.5761 6.42391 19 7.32473 19H14.4783H16.1291C17.0299 19 17.7391 18.25 17.7391 17.3492V9.21739L12.5217 4ZM15.9212 9.21739L12.5217 5.81793V9.21739H15.9212ZM16.1291 17.6957C16.2962 17.6957 16.4348 17.5408 16.4348 17.3492V10.5217H11.2174V5.30435H7.65082C7.45924 5.30435 7.30435 5.44293 7.30435 5.61005V17.3492C7.30435 17.5285 7.47147 17.6957 7.65082 17.6957H16.1291Z"
      />
    </SvgIcon>
  );
}
