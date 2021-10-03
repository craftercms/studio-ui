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

import createStyles from '@mui/styles/createStyles';

import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import DialogHeader from '../DialogHeader';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import DialogBody from '../Dialogs/DialogBody';
import * as React from 'react';
import PublishingStatusDisplay, { publishingStatusMessages } from '../PublishingStatusDisplay';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import { PublishingStatusDialogContainerProps } from './utils';

const useStyles = makeStyles(() =>
  createStyles({
    body: {
      minHeight: 145,
      placeContent: 'center'
    }
  })
);

export function PublishingStatusDialogContainer(props: PublishingStatusDialogContainerProps) {
  const {
    status,
    enabled,
    lockOwner,
    lockTTL,
    numberOfItems,
    totalItems,
    publishingTarget,
    submissionId,
    onClose,
    onRefresh,
    onUnlock,
    onStartStop,
    isFetching
  } = props;
  const classes = useStyles();
  const { formatMessage } = useIntl();
  return (
    <>
      <DialogHeader
        title={formatMessage(publishingStatusMessages.publishingStatus)}
        onCloseButtonClick={(e) => onClose(e, null)}
        rightActions={[
          onUnlock && {
            icon: LockOpenRoundedIcon,
            onClick: onUnlock,
            tooltip: formatMessage(publishingStatusMessages.unlock)
          },
          onStartStop && {
            icon: status === 'ready' ? PauseCircleOutlineOutlinedIcon : PlayCircleOutlineOutlinedIcon,
            onClick: onStartStop,
            tooltip: formatMessage(status === 'ready' ? publishingStatusMessages.stop : publishingStatusMessages.start)
          },
          onRefresh && {
            icon: RefreshRoundedIcon,
            onClick: onRefresh,
            tooltip: formatMessage(publishingStatusMessages.refresh)
          }
        ].filter(Boolean)}
      />
      <DialogBody className={classes.body}>
        <PublishingStatusDisplay
          enabled={enabled}
          isFetching={isFetching}
          status={status}
          lockOwner={lockOwner}
          lockTTL={lockTTL}
          numberOfItems={numberOfItems}
          totalItems={totalItems}
          publishingTarget={publishingTarget}
          submissionId={submissionId}
        />
      </DialogBody>
    </>
  );
}

export default PublishingStatusDialogContainer;
