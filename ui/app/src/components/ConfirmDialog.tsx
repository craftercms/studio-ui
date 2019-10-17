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

interface ConfirmDialog {
  open: boolean;
  onOk(): any;
  onClose(): any;
  description: string;
  title: string;
}

export default function ConfirmDialog(props: ConfirmDialog) {
  const {open, onOk, onClose, description, title} = props;
  const {formatMessage} = useIntl();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
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
