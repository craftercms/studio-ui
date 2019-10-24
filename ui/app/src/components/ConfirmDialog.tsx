/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import React from "react";
import { defineMessages, useIntl } from "react-intl";

const messages = defineMessages({
  ok: {
    id: 'common.ok',
    defaultMessage: 'Ok'
  },
  cancel: {
    id: 'common.cancel',
    defaultMessage: 'Cancel'
  }
});

interface ConfirmDialogProps {
  open: boolean;
  onOk(): any;
  onClose(): any;
  description: string;
  title: string;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  const {open, onOk, onClose, description, title} = props;
  const {formatMessage} = useIntl();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      disableEnforceFocus={true}
    >
      {
        title &&
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      }

      <DialogContent>
        {
          description &&
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {formatMessage(messages.cancel)}
        </Button>
        <Button onClick={onOk} variant="contained" color="primary" autoFocus>
          {formatMessage(messages.ok)}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
