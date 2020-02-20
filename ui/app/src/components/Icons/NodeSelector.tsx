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
      <g clipPath="url(#clip0)">
        <circle cx="8.74471" cy="7.96737" r="7.44862" stroke="#5AC8FA" strokeWidth="0.85"/>
        <path
          d="M12.2552 7.13797V7.56297H12.6802H13.4495C13.6768 7.56297 13.8949 7.65328 14.0556 7.81403C14.2164 7.97478 14.3067 8.19281 14.3067 8.42015C14.3067 8.64748 14.2164 8.86551 14.0556 9.02626C13.8949 9.18701 13.6768 9.27732 13.4495 9.27732H12.6802H12.2552V9.70232V11.7538C12.2552 11.9131 12.1919 12.0659 12.0793 12.1786C11.9666 12.2912 11.8138 12.3545 11.6545 12.3545H10.1306V12.0102C10.1306 11.0062 9.32484 10.2005 8.32082 10.2005C7.31679 10.2005 6.51107 11.0062 6.51107 12.0102V12.3545H4.98716C4.82784 12.3545 4.67504 12.2912 4.56238 12.1786C4.44972 12.0659 4.38643 11.9131 4.38643 11.7538V10.2299H4.73073C5.73476 10.2299 6.54048 9.42417 6.54048 8.42015C6.54048 7.41612 5.73476 6.6104 4.73073 6.6104H4.38643V5.08649C4.38643 4.92717 4.44972 4.77437 4.56238 4.66171C4.67504 4.54905 4.82784 4.48575 4.98716 4.48575H7.03864H7.46364V4.06076V3.29145C7.46364 3.06411 7.55395 2.84609 7.7147 2.68534C7.87545 2.52459 8.09348 2.43428 8.32082 2.43428C8.54815 2.43428 8.76618 2.52459 8.92693 2.68534C9.08768 2.84609 9.17799 3.06411 9.17799 3.29145V4.06076V4.48575H9.60299H11.6545C11.9853 4.48575 12.2552 4.75331 12.2552 5.08649V7.13797Z"
          stroke="#5AC8FA" strokeWidth="0.85"/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect x="0.871094" y="0.09375" width="15.7472" height="15.7472" fill="white"/>
        </clipPath>
      </defs>
    </SvgIcon>
  );
}
