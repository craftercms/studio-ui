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
      <path d="M17.1679 11.554V12.054H17.6679H19.0057C19.4644 12.054 19.9043 12.2363 20.2287 12.5606C20.553 12.885 20.7352 13.3249 20.7352 13.7836C20.7352 14.2423 20.553 14.6822 20.2287 15.0066C19.9043 15.3309 19.4644 15.5132 19.0057 15.5132H17.6679H17.1679V16.0132V19.5805C17.1679 19.9209 17.0327 20.2474 16.7919 20.4882C16.5512 20.7289 16.2247 20.8641 15.8843 20.8641H12.9953V20.0264C12.9953 18.4125 11.7013 17.1185 10.0874 17.1185C8.47349 17.1185 7.17944 18.4125 7.17944 20.0264V20.8641H4.29049C3.95005 20.8641 3.62354 20.7289 3.38281 20.4882C3.14208 20.2474 3.00684 19.9209 3.00684 19.5805V16.6915H3.84458C5.45846 16.6915 6.75252 15.3975 6.75252 13.7836C6.75252 12.1697 5.45846 10.8757 3.84458 10.8757H3.00684V7.98671C3.00684 7.64627 3.14208 7.31976 3.38281 7.07903C3.62354 6.8383 3.95005 6.70306 4.29049 6.70306H7.85781H8.35781V6.20306V4.86531C8.35781 4.4066 8.54003 3.96668 8.86439 3.64232C9.18874 3.31796 9.62867 3.13574 10.0874 3.13574C10.5461 3.13574 10.986 3.31796 11.3104 3.64232L11.66 3.29274L11.3104 3.64232C11.6347 3.96668 11.817 4.4066 11.817 4.86531V6.20306V6.70306H12.317H15.8843C16.5908 6.70306 17.1679 7.27455 17.1679 7.98671V11.554Z" stroke="black"/>
    </SvgIcon>
  );
}
