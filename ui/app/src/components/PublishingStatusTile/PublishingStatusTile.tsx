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

import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/styles';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { ElementType } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { PublishingStatus } from '../../models/Publishing';
import PublishingStatusAvatar from '../PublishingStatusAvatar/PublishingStatusAvatar';

type PublishingStatusTileClassKey = 'root' | 'avatar' | 'text';

type PublishingStatusTileStyles = Partial<Record<PublishingStatusTileClassKey, CSSProperties>>;

export interface PublishingStatusTileProps extends React.HTMLAttributes<HTMLDivElement | HTMLButtonElement> {
  status: PublishingStatus['status'];
  isFetching?: boolean;
  styles?: PublishingStatusTileStyles;
  classes?: Partial<Record<PublishingStatusTileClassKey, string>>;
}

const usePublishingStatusTileStyles = makeStyles((theme) =>
  createStyles<PublishingStatusTileClassKey, PublishingStatusTileStyles>({
    root: (styles) => ({
      width: '120px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
      border: 'none',
      borderRadius: theme.shape.borderRadius,
      borderTop: 'none',
      background: theme.palette.background.paper,
      margin: 5,
      padding: 5,
      'button&': {
        cursor: 'pointer',
        '&:hover, &:focus': {
          background: theme.palette.action.hover,
          boxShadow: theme.shadows[2]
        }
      },
      ...styles.root
    }),
    avatar: (styles) => ({
      marginBottom: theme.spacing(1),
      ...styles.avatar
    }),
    text: (styles) => ({
      width: '100%',
      ...styles.text
    })
  })
);

export const publishingStatusTileMessages = defineMessages({
  ready: {
    id: 'words.ready',
    defaultMessage: 'Ready'
  },
  publishing: {
    id: 'words.publishing',
    defaultMessage: 'Publishing'
  },
  queued: {
    id: 'words.queued',
    defaultMessage: 'Queued'
  },
  stopped: {
    id: 'words.stopped',
    defaultMessage: 'Stopped'
  },
  error: {
    id: 'words.error',
    defaultMessage: 'Error'
  },
  refresh: {
    id: 'words.refresh',
    defaultMessage: 'Refresh'
  },
  unlock: {
    id: 'words.unlock',
    defaultMessage: 'Unlock'
  },
  start: {
    id: 'words.start',
    defaultMessage: 'Start'
  },
  stop: {
    id: 'words.stop',
    defaultMessage: 'Stop'
  },
  publishingStatus: {
    id: 'publishingStatusTile.publishingStatus',
    defaultMessage: 'Publishing Status'
  },
  lockOwner: {
    id: 'publishingStatusTile.lockOwnerDisplayMessage',
    defaultMessage: 'Locked by {lockOwner}'
  },
  lockTTL: {
    id: 'publishingStatusTile.lockTTLMessage',
    defaultMessage: 'TTL {lockTTL}'
  },
  disabled: {
    id: 'publishingStatusTile.isDisabledMessage',
    defaultMessage: 'The publisher is disabled.'
  }
});

const PublishingStatusTile = React.forwardRef<HTMLDivElement | HTMLButtonElement, PublishingStatusTileProps>(function(
  props,
  ref
) {
  const classes = usePublishingStatusTileStyles(props.styles);
  const { formatMessage } = useIntl();
  const { status, onClick, isFetching, classes: propClasses, ...rest } = props;
  const Component = onClick ? ('button' as ElementType) : ('div' as ElementType);
  const statusText = publishingStatusTileMessages[status]
    ? formatMessage(publishingStatusTileMessages[status])
    : status;
  return (
    <Component
      ref={ref}
      {...rest}
      onClick={onClick}
      className={clsx(classes.root, propClasses?.root, !isFetching && status)}
    >
      <PublishingStatusAvatar
        status={isFetching ? null : status}
        className={clsx(classes.avatar, propClasses?.avatar)}
      />
      <Typography className={clsx(classes.text, propClasses?.text)} noWrap title={statusText} color="textPrimary">
        {isFetching ? <Skeleton /> : statusText}
      </Typography>
    </Component>
  );
});

export default PublishingStatusTile;
