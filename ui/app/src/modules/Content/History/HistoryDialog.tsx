/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../../../components/DialogHeader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { DialogContent } from '@material-ui/core';
import DialogBody from '../../../components/DialogBody';

const translations = defineMessages({
  headerTitle: {
    id: 'historyDialog.headerTitle',
    defaultMessage: 'Content Item History'
  }
});

export default function HistoryDialog(props) {
  const { open = true, handleClose = () => {}} = props;
  const { formatMessage } = useIntl();

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      fullWidth
      maxWidth="md"
    >
      <DialogHeader title={formatMessage(translations.headerTitle)} onClose={handleClose}/>
      <DialogBody>
        holita
      </DialogBody>
    </Dialog>
  )
}
