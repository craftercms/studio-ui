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
      <path fillRule="evenodd" clipRule="evenodd"
            d="M6.52174 0H1.65082C0.75 0 0 0.709239 0 1.61005V1.95652V13.6753C0 14.5761 0.423913 15 1.32473 15H8.47826H10.1291C11.0299 15 11.7391 14.25 11.7391 13.3492V5.21739L6.52174 0ZM9.9212 5.21739L6.52174 1.81793V5.21739H9.9212ZM10.1291 13.6957C10.2962 13.6957 10.4348 13.5408 10.4348 13.3492V6.52174H5.21739V1.30435H1.65082C1.45924 1.30435 1.30435 1.44293 1.30435 1.61005V13.3492C1.30435 13.5285 1.47147 13.6957 1.65082 13.6957H10.1291Z"/>
    </SvgIcon>
  );
}
