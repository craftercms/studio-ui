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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import DialogHeader from '../Dialogs/DialogHeader';
import { publishingStatusTileMessages } from '../PublishingStatusTile';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';
import LockOpenRoundedIcon from '@material-ui/icons/LockOpenRounded';
import DialogBody from '../Dialogs/DialogBody';
import * as React from 'react';
import { PublishingStatus } from '../../models/Publishing';
import PublishingStatusDisplay from '../PublishingStatusDisplay';
import PauseCircleOutlineOutlinedIcon from '@material-ui/icons/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@material-ui/icons/PlayCircleOutlineOutlined';

export type PublishingStatusDialogContainerProps = Pick<
  PublishingStatus,
  'enabled' | 'status' | 'message' | 'lockOwner' | 'lockTTL'
> & {
  isFetching: boolean;
  onClose(): void;
  onRefresh?(): void;
  onUnlock?(): void;
  onStartStop?(): void;
};

const useStyles = makeStyles(() =>
  createStyles({
    body: {
      minHeight: 145,
      placeContent: 'center'
    }
  })
);

function PublishingStatusDialogContainer(props: PublishingStatusDialogContainerProps) {
  const { status, message, enabled, lockOwner, lockTTL, onClose, onRefresh, onUnlock, onStartStop, isFetching } = props;
  const classes = useStyles();
  const { formatMessage } = useIntl();
  return (
    <>
      <DialogHeader
        title={formatMessage(publishingStatusTileMessages.publishingStatus)}
        onCloseButtonClick={onClose}
        rightActions={[
          onUnlock && {
            icon: LockOpenRoundedIcon,
            onClick: onUnlock,
            tooltip: formatMessage(publishingStatusTileMessages.unlock)
          },
          onStartStop && {
            icon: status === 'ready' ? PauseCircleOutlineOutlinedIcon : PlayCircleOutlineOutlinedIcon,
            onClick: onStartStop,
            tooltip: formatMessage(
              status === 'ready' ? publishingStatusTileMessages.stop : publishingStatusTileMessages.start
            )
          },
          onRefresh && {
            icon: RefreshRoundedIcon,
            onClick: onRefresh,
            tooltip: formatMessage(publishingStatusTileMessages.refresh)
          }
        ].filter(Boolean)}
      />
      <DialogBody className={classes.body}>
        <PublishingStatusDisplay
          enabled={enabled}
          isFetching={isFetching}
          status={status}
          message={message}
          lockOwner={lockOwner}
          lockTTL={lockTTL}
        />
      </DialogBody>
    </>
  );
}

export default PublishingStatusDialogContainer;
