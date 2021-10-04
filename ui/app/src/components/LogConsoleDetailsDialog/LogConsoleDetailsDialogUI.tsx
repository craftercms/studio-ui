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

import { useStyles } from './styles';
import DialogHeader from '../DialogHeader/DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';
import { LogConsoleDetailsDialogProps } from './LogConsoleDetailsDialog';
import { useSelection } from '../../utils/hooks/useSelection';
import { useUnmount } from '../../utils/hooks/useUnmount';

export default function LogConsoleDetailsDialogUI(props: LogConsoleDetailsDialogProps) {
  const { logEvent, onClose, onClosed } = props;
  const localeBranch = useSelection((state) => state.uiConfig.locale);
  const classes = useStyles();

  useUnmount(onClosed);

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="logConsoleDetailsDialog.title" defaultMessage="Log Details" />}
        onCloseButtonClick={onClose}
      />
      <DialogBody>
        <Box display="flex" p="10px 0" alignItems="center">
          <Typography color="textSecondary" className={classes.label}>
            <FormattedMessage id="words.level" defaultMessage="Level" />
          </Typography>
          <Box display="flex" width="100%" alignItems="center">
            <Typography>{logEvent.level}</Typography>
          </Box>
        </Box>
        <Box display="flex" p="10px 0" alignItems="center">
          <Typography color="textSecondary" className={classes.label}>
            <FormattedMessage id="words.timestamp" defaultMessage="timestamp" />
          </Typography>
          <Box display="flex" width="100%" alignItems="center">
            <Typography>
              {new Intl.DateTimeFormat(localeBranch.localeCode, localeBranch.dateTimeFormatOptions).format(
                new Date(logEvent.timestamp)
              )}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" p="10px 0" alignItems="center">
          <Typography color="textSecondary" className={classes.label}>
            <FormattedMessage id="words.thread" defaultMessage="Thread" />
          </Typography>
          <Box display="flex" width="100%" alignItems="center">
            <Typography>{logEvent.thread}</Typography>
          </Box>
        </Box>
        <Box display="flex" p="10px 0" alignItems="center">
          <Typography color="textSecondary" className={classes.label}>
            <FormattedMessage id="words.site" defaultMessage="Site" />
          </Typography>
          <Box display="flex" width="100%" alignItems="center">
            <Typography>{logEvent.site}</Typography>
          </Box>
        </Box>
        <Box display="flex" p="10px 0" alignItems="center">
          <Typography color="textSecondary" className={classes.label}>
            <FormattedMessage id="words.message" defaultMessage="Message" />
          </Typography>
          <Box display="flex" width="100%" alignItems="center">
            <Typography>{logEvent.message}</Typography>
          </Box>
        </Box>
      </DialogBody>
    </>
  );
}
