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

import { Alert } from '@material-ui/lab';
import { publishingStatusTileMessages } from '../PublishingStatusTile';
import { ListItem } from '@material-ui/core';
import ListItemAvatar from '@material-ui/core/ListItemAvatar/ListItemAvatar';
import PublishingStatusAvatar from '../PublishingStatusAvatar';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Skeleton from '@material-ui/lab/Skeleton';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { PublishingStatus } from '../../models/Publishing';

export type PublishingStatusDisplayProps = PublishingStatus & {
  isFetching: boolean;
};

export default function PublishingStatusDisplay(props: PublishingStatusDisplayProps) {
  const { enabled, isFetching, status, message, lockOwner, lockTTL } = props;
  const { formatMessage } = useIntl();

  return (
    <>
      {!enabled && (
        <Alert severity="warning" style={{ marginBottom: '1em' }}>
          {formatMessage(publishingStatusTileMessages.disabled)}
        </Alert>
      )}
      <ListItem component="div">
        <ListItemAvatar>
          <PublishingStatusAvatar status={isFetching ? null : status} />
        </ListItemAvatar>
        <ListItemText
          primary={
            isFetching ? (
              <Skeleton />
            ) : publishingStatusTileMessages[status] ? (
              formatMessage(publishingStatusTileMessages[status])
            ) : (
              status
            )
          }
          secondary={
            isFetching ? (
              <Skeleton />
            ) : (
              <>
                {message && (
                  <>
                    {message}
                    <br />
                  </>
                )}
                {lockOwner && (
                  <>
                    {formatMessage(publishingStatusTileMessages.lockOwner, { lockOwner })}
                    <br />
                  </>
                )}
                {lockTTL && formatMessage(publishingStatusTileMessages.lockTTL, { lockTTL })}
              </>
            )
          }
        />
      </ListItem>
    </>
  );
}
