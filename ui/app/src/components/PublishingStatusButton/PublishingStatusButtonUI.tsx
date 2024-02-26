/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { Badge, CircularProgress, Tooltip } from '@mui/material';
import { PublishingStatus } from '../../models/Publishing';
import { useIntl } from 'react-intl';
import { getPublishingStatusText, publishingStatusMessages } from '../PublishingStatusDisplay';

export interface PublishingStatusButtonUIProps extends IconButtonProps {
  isFetching: boolean;
  enabled: boolean;
  numberOfItems: number;
  totalItems: number;
  status: PublishingStatus['status'];
  variant?: PublishingStatusAvatarProps['variant'];
}

export const PublishingStatusButtonUI = forwardRef<HTMLButtonElement, PublishingStatusButtonUIProps>((props, ref) => {
  const { enabled, numberOfItems, totalItems, status, isFetching, style, onClick, variant, ...rest } = props;
  const isInProgressPublishingStatus = status && ['publishing', 'processing'].includes(status);
  const { formatMessage } = useIntl();
  return (
    <Tooltip
      title={`${formatMessage(publishingStatusMessages.publishingStatus)}: ${getPublishingStatusText(
        props,
        formatMessage
      )}`}
    >
      <Badge
        badgeContent={status === 'error' || status === 'readyWithErrors' || enabled === false ? '!' : null}
        color="error"
        overlap="circular"
        style={{ position: 'relative' }}
      >
        <IconButton
          size="medium"
          {...rest}
          onClick={onClick}
          ref={ref}
          style={{ padding: rest.size === 'small' ? 0 : 4, ...style }}
        >
          <PublishingStatusAvatar
            enabled={enabled}
            status={isFetching ? null : status}
            variant={variant}
            styles={rest.size === 'small' ? { root: { width: 30, height: 30 } } : null}
          />
        </IconButton>
        {/* TODO:
            The spinner might be better suited to be on the PublishingStatusAvatar component
            so when we have progress, it is show everywhere the publishing avatar shows up. */}
        {(isFetching || isInProgressPublishingStatus) && (
          <CircularProgress
            size={
              // Default progress size matches small button, but the medium
              // size (which is this component's default) needs a larger spinner
              ['medium', void 0].includes(rest.size) ? 48 : void 0
            }
            value={isInProgressPublishingStatus ? Math.round((numberOfItems / totalItems) * 100) : undefined}
            variant={isInProgressPublishingStatus ? 'determinate' : 'indeterminate'}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          />
        )}
      </Badge>
    </Tooltip>
  );
});

export default PublishingStatusButtonUI;
