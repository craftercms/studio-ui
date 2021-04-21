/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { forwardRef } from 'react';
import { PublishingStatusAvatar, PublishingStatusAvatarProps } from '../PublishingStatusAvatar/PublishingStatusAvatar';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { Badge, CircularProgress } from '@material-ui/core';
import { PublishingStatus } from '../../models/Publishing';

export interface PublishingStatusButtonUIProps extends IconButtonProps {
  isFetching: boolean;
  enabled: boolean;
  status: PublishingStatus['status'];
  variant?: PublishingStatusAvatarProps['variant'];
}

export const PublishingStatusButtonUI = forwardRef<HTMLButtonElement, PublishingStatusButtonUIProps>(
  ({ enabled, status, isFetching, style, onClick, variant, ...rest }, ref) => (
    <Badge
      badgeContent={status === 'error' || !enabled ? '!' : null}
      color="error"
      overlap="circle"
      style={{ position: 'relative' }}
    >
      <IconButton {...rest} size="medium" onClick={onClick} ref={ref} style={{ ...style, padding: 0 }}>
        <PublishingStatusAvatar status={isFetching ? null : status} variant={variant} />
      </IconButton>
      {/* TODO:
            The spinner might be better suited to be on the PublishingStatusAvatar component
            so when we have progress, it is show everywhere the publishing avatar shows up. */}
      {(isFetching || status === 'publishing') && (
        <CircularProgress
          variant="indeterminate"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        />
      )}
    </Badge>
  )
);

export default PublishingStatusButtonUI;
