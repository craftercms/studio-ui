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
import Avatar from '@material-ui/core/Avatar';
import CloudUploadOutlined from '@material-ui/icons/CloudUploadOutlined';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { ElementType } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';

type PublishingStatusTileClassKey = 'root' | 'avatar' | 'text';

type PublishingStatusTileStyles = Partial<Record<PublishingStatusTileClassKey, CSSProperties>>;

export interface PublishingStatusTileProps extends React.HTMLAttributes<HTMLDivElement | HTMLButtonElement> {
  status: 'ready' | 'busy' | 'publishing' | 'queued' | 'stopped' | 'started';
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
      // Please revisit PublishingStatusDialog styles too if these are changed.
      '&.ready': {
        background: theme.palette.success.main
      },
      '&.busy': {
        background: theme.palette.warning.main
      },
      '&.publishing': {
        background: theme.palette.warning.main
      },
      '&.queued': {
        background: theme.palette.warning.main
      },
      '&.stopped': {
        background: theme.palette.error.main
      },
      '&.started': {
        background: theme.palette.success.main
      },
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
  busy: {
    id: 'words.busy',
    defaultMessage: 'Busy'
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
  started: {
    id: 'words.started',
    defaultMessage: 'Started'
  },
  refresh: {
    id: 'words.refresh',
    defaultMessage: 'Refresh'
  },
  publishingStatus: {
    id: 'publishingStatusTile.publishingStatus',
    defaultMessage: 'Publishing Status'
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
      <Avatar variant="circular" className={clsx(classes.avatar, propClasses?.avatar, !isFetching && status)}>
        <CloudUploadOutlined />
      </Avatar>
      <Typography className={clsx(classes.text, propClasses?.text)} noWrap title={statusText} color="textPrimary">
        {isFetching ? <Skeleton /> : statusText}
      </Typography>
    </Component>
  );
});

export default PublishingStatusTile;
