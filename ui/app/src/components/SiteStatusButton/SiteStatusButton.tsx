/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import * as React from 'react';
import { Site } from '../../models';
import Tooltip from '@mui/material/Tooltip';
import { CircularProgress, CircularProgressProps } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface SiteStatusButtonProps extends CircularProgressProps {
  state: Site['state'];
}

export const SiteStatusButton = (props: SiteStatusButtonProps) => {
  const { state, size = 30, sx, color } = props;

  const stateMessage =
    state === 'INITIALIZING' ? (
      <FormattedMessage defaultMessage="Initializing" />
    ) : state === 'DELETING' ? (
      <FormattedMessage defaultMessage="Deleting" />
    ) : (
      <></>
    );
  const stateColor = color ?? state === 'DELETING' ? 'error' : 'primary';

  return (
    <Tooltip title={stateMessage}>
      <CircularProgress size={size} sx={sx} color={stateColor} />
    </Tooltip>
  );
};

export default SiteStatusButton;
