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

import Dialog from '@material-ui/core/Dialog';
import * as React from 'react';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import CloudUploadOutlined from '@material-ui/icons/CloudUploadOutlined';
import Avatar from '@material-ui/core/Avatar';
import { ListItem } from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useIntl } from 'react-intl';
import { publishingStatusTileMessages, PublishingStatusTileProps } from '../PublishingStatusTile';
import StandardAction from '../../models/StandardAction';
import Skeleton from '@material-ui/lab/Skeleton';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';

export interface PublishingStatusDialogBaseProps {
  open: boolean;
  status: PublishingStatusTileProps['status'];
  details: string;
  error?: any;
  isFetching: boolean;
}

export interface PublishingStatusDialogProps extends PublishingStatusDialogBaseProps {
  onClose(): void;
  onRefresh?(): void;
}

export interface PublishingStatusDialogStateProps extends PublishingStatusDialogBaseProps {
  onClose: StandardAction;
  onRefresh: StandardAction;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    avatar: {
      // Please revisit PublishingStatusTile styles too if these are changed.
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
        background: theme.palette.warning.main
      }
    },
    body: {
      minHeight: 145,
      placeContent: 'center'
    }
  })
);

function PublishingStatusDialog(props: PublishingStatusDialogProps) {
  const { open, onClose, onRefresh, status, details, isFetching } = props;
  const classes = useStyles();
  const { formatMessage } = useIntl();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogHeader
        title={formatMessage(publishingStatusTileMessages.publishingStatus)}
        onDismiss={onClose}
        rightActions={onRefresh ? [{ icon: RefreshRoundedIcon, onClick: onRefresh }] : null}
      />
      <DialogBody className={classes.body}>
        <ListItem component="div">
          <ListItemAvatar>
            <Avatar className={clsx(classes.avatar, !isFetching && status)}>
              <CloudUploadOutlined />
            </Avatar>
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
            secondary={isFetching ? null : details}
          />
        </ListItem>
      </DialogBody>
    </Dialog>
  );
}

export default PublishingStatusDialog;
