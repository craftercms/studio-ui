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
import { Badge, CircularProgress, Tooltip } from '@material-ui/core';
import { PublishingStatus } from '../../models/Publishing';
import { FormattedMessage } from 'react-intl';
import { publishingStatusTileMessages } from '../PublishingStatusTile';

export interface PublishingStatusButtonUIProps extends IconButtonProps {
  isFetching: boolean;
  enabled: boolean;
  numberOfItems: number;
  totalItems: number;
  status: PublishingStatus['status'];
  variant?: PublishingStatusAvatarProps['variant'];
}

const isInProgressPublishingStatus = (status: PublishingStatus['status']) => {
  return ['publishing', 'processing'].includes(status);
};

export const PublishingStatusButtonUI = forwardRef<HTMLButtonElement, PublishingStatusButtonUIProps>(
  ({ enabled, numberOfItems, totalItems, status, isFetching, style, onClick, variant, ...rest }, ref) => (
    <Tooltip
      title={
        <>
          <FormattedMessage id="publishingStatusButton.tooltipMessage" defaultMessage="Publishing status" />
          {status &&
            (publishingStatusTileMessages[status] ? (
              <>
                {' '}
                (<FormattedMessage id={publishingStatusTileMessages[status].id} />)
              </>
            ) : (
              ` (${status})`
            ))}
        </>
      }
    >
      <Badge
        badgeContent={status === 'error' || enabled === false ? '!' : null}
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
            status={isFetching ? null : status}
            variant={variant}
            styles={rest.size === 'small' ? { root: { width: 30, height: 30 } } : null}
          />
        </IconButton>
        {/* TODO:
            The spinner might be better suited to be on the PublishingStatusAvatar component
            so when we have progress, it is show everywhere the publishing avatar shows up. */}
        {(isFetching || isInProgressPublishingStatus(status)) && (
          <CircularProgress
            size={
              // Default progress size matches small button, but the medium
              // size (which is this component's default) needs a larger spinner
              ['medium', void 0].includes(rest.size) ? 48 : void 0
            }
            value={Math.round((numberOfItems / totalItems) * 100)}
            variant={isInProgressPublishingStatus(status) ? 'determinate' : 'indeterminate'}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          />
        )}
      </Badge>
    </Tooltip>
  )
);

export default PublishingStatusButtonUI;
