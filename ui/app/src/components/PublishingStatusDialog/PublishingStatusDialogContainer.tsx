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

import { makeStyles } from 'tss-react/mui';
import { useIntl } from 'react-intl';
import DialogHeader from '../DialogHeader';
import DialogBody from '../DialogBody/DialogBody';
import * as React from 'react';
import PublishingStatusDisplay, { publishingStatusMessages } from '../PublishingStatusDisplay';
import { PublishingStatusDialogContainerProps } from './utils';
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import useActiveUser from '../../hooks/useActiveUser';
import useActiveSiteId from '../../hooks/useActiveSiteId';

const useStyles = makeStyles()(() => ({
  body: {
    minHeight: 145,
    placeContent: 'center'
  }
}));

const permittedRoles = ['developer', 'admin'];

export function PublishingStatusDialogContainer(props: PublishingStatusDialogContainerProps) {
  const {
    status,
    enabled,
    published,
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
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const [unlockAnchorEl, setUnlockAnchorEl] = useState(null);
  const user = useActiveUser();
  const siteId = useActiveSiteId();
  const userRoles = user?.rolesBySite[siteId];
  const allowedUser = (userRoles && permittedRoles?.some((role) => userRoles.includes(role))) ?? false;

  const handleClose = () => {
    setUnlockAnchorEl(null);
  };

  const handleConfirm = () => {
    handleClose();
    onUnlock();
  };

  return (
    <>
      <DialogHeader
        title={formatMessage(publishingStatusMessages.publishingStatus)}
        onCloseButtonClick={onClose}
        rightActions={[
          onUnlock &&
            allowedUser && {
              icon: { id: '@mui/icons-material/LockOpenRounded' },
              onClick: (e) => {
                setUnlockAnchorEl(e.currentTarget);
              },
              tooltip: formatMessage(publishingStatusMessages.unlock)
            },
          onStartStop &&
            allowedUser && {
              icon: enabled
                ? { id: '@mui/icons-material/PauseCircleOutlineOutlined' }
                : { id: '@mui/icons-material/PlayCircleOutlineOutlined' },
              onClick: onStartStop,
              tooltip: formatMessage(enabled ? publishingStatusMessages.stop : publishingStatusMessages.start)
            },
          onRefresh && {
            icon: { id: '@mui/icons-material/RefreshRounded' },
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
          published={published}
          lockOwner={lockOwner}
          lockTTL={lockTTL}
          numberOfItems={numberOfItems}
          totalItems={totalItems}
          publishingTarget={publishingTarget}
          submissionId={submissionId}
        />
      </DialogBody>
      <Menu
        anchorEl={unlockAnchorEl}
        open={Boolean(unlockAnchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Typography
          variant="body1"
          sx={{
            padding: '10px 16px 10px 16px'
          }}
        >
          {formatMessage(publishingStatusMessages.confirmUnlockPublisher)}
        </Typography>
        <MenuItem onClick={handleClose}>{formatMessage(publishingStatusMessages.no)}</MenuItem>
        <MenuItem onClick={handleConfirm}>{formatMessage(publishingStatusMessages.yes)}</MenuItem>
      </Menu>
    </>
  );
}

export default PublishingStatusDialogContainer;
