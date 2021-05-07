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
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LogEvent } from '../../models/monitoring/LogEvent';
import { useMount, useSelection } from '../../utils/hooks';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useStyles } from './styles';

interface LogConsoleDetailsDialogProps {
  open: boolean;
  onClose(): void;
  onClosed?(): void;
  logEvent: LogEvent;
}

export default function LogConsoleDetailsDialog(props: LogConsoleDetailsDialogProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <LogConsoleDetailsDialogUI {...props} />
    </Dialog>
  );
}

function LogConsoleDetailsDialogUI(props: LogConsoleDetailsDialogProps) {
  const { logEvent, onClose, onClosed } = props;
  const localeBranch = useSelection((state) => state.uiConfig.locale);
  const classes = useStyles();

  useMount(() => {
    return () => {
      onClosed?.();
    };
  });

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="logConsoleDetailsDialog.title" defaultMessage="Log Details" />}
        onDismiss={onClose}
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
//
// width: '100%',
//   display: 'flex',
//   alignItems: 'center'
