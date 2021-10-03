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

import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import PublishingStatusAvatar from '../PublishingStatusAvatar';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { PublishingStatus } from '../../models/Publishing';
import { getPublishingStatusMessage, publishingStatusMessages } from './utils';

export type PublishingStatusDisplayProps = PublishingStatus & {
  isFetching: boolean;
};

export default function PublishingStatusDisplay(props: PublishingStatusDisplayProps) {
  const { isFetching, status, lockOwner, lockTTL } = props;
  const { formatMessage } = useIntl();
  return (
    <>
      <ListItem component="div">
        <ListItemAvatar>
          <PublishingStatusAvatar status={isFetching ? null : status} />
        </ListItemAvatar>
        <ListItemText
          primary={isFetching ? <Skeleton /> : getPublishingStatusMessage(props, formatMessage)}
          secondary={
            isFetching ? (
              <Skeleton />
            ) : (
              <>
                {lockOwner && (
                  <>
                    {formatMessage(publishingStatusMessages.lockOwner, { lockOwner })}
                    <br />
                  </>
                )}
                {lockTTL && formatMessage(publishingStatusMessages.lockTTL, { lockTTL })}
              </>
            )
          }
        />
      </ListItem>
    </>
  );
}
