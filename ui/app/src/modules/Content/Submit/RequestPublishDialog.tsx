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
 *
 *
 */

import React, { MouseEvent, useEffect, useReducer, useRef, useState } from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from "react-intl";
import Grid from "@material-ui/core/Grid";

import { Item } from '../../../models/Item';
import DependencySelection from '../Dependencies/DependencySelection';
import { fetchPublishingChannels } from "../../../services/content";
import { submitToGoLive } from '../../../services/publishing';
import PublishForm from './PulishForm';
import { copyFile } from 'fs';
import { Publish } from '@material-ui/icons';

const dialogInitialState: any = {
  emailOnApprove: false,
  environment: '',
  submissionComment: '',
  scheduling: 'now',
  scheduledDateTime: new Date(),
  scheduledTimeZone: '',
  publishingChannel: null,
  selectedItems: null
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

interface PublishDialogUIProps {
  items: Item[];
  setSelectedItems: any;
  publishingChannels: any[];
  handleClose: any;
  handleSubmit: any;
  dialog: any;
  setDialog: any;
  siteId: string;
  open: boolean;
}

export function PublishDialogUI(props: PublishDialogUIProps) {
  const {
    items,
    setSelectedItems,
    publishingChannels,
    handleClose,
    handleSubmit,
    dialog,
    setDialog,
    siteId,
    open
  } = props;

  return (
    <Dialog onClose={handleClose} aria-labelledby="requestPublishDialogTitle" open={open} disableBackdropClick={true}
            fullWidth={true} maxWidth={'md'}>
      <DialogTitle id="requestPublishDialogTitle" onClose={handleClose}>
        <FormattedMessage
          id="requestPublishDialog.dialogTitle"
          defaultMessage={`Request Publish`}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={7} md={8} lg={8} xl={8}>
            <DependencySelection items={items} siteId={'editorial'} onChange={(result: any) => { setSelectedItems(result) }} />
          </Grid>

          <Grid item xs={12} sm={5} md={4} lg={4} xl={4}>
            <PublishForm
              inputs={dialog}
              setInputs={setDialog}
              showEmailCheckbox={true}
              siteId={siteId}
              publishingChannels={publishingChannels}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="primary">
          <FormattedMessage
            id="requestPublishDialog.cancel"
            defaultMessage={`Cancel`}
          />
        </Button>
        <Button autoFocus onClick={handleSubmit} color="primary">
          <FormattedMessage
            id="requestPublishDialog.submit"
            defaultMessage={`Submit`}
          />
        </Button>
      </DialogActions>
    </Dialog>
  )
};

interface RequestPublishDialogProps {
  onClose(): any;
  items: Item[];
  siteId: string;
}

function RequestPublishDialog(props: RequestPublishDialogProps) {
  const { items, siteId } = props;
  const [open, setOpen] = React.useState(true);
  const [dialog, setDialog] = useReducer((a, b) => ({ ...a, ...b }), dialogInitialState);
  const [publishingChannels, setPublishingChannels] = useState(null);

  useEffect(getPublishingChannels, []);

  function getPublishingChannels() {
    fetchPublishingChannels(siteId)
      .subscribe(
        ({ response }) => {
          setPublishingChannels(response.availablePublishChannels);
        },
        ({ response }) => {

        }
      );
  }

  const setSelectedItems = (items) => {
    setDialog({ ...dialog, 'selectedItems': items });
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    console.log("DIALOG DATA", dialog);

    const data = {
      environment: dialog.environment,
      items: dialog.selectedItems,
      schedule: dialog.scheduling,
      sendEmail: dialog.emailOnApprove,
      submissionComment: dialog.submissionComment,
      ...(
        (dialog.scheduling === 'custom')
          ? { scheduledDate: dialog.scheduledDateTime }
          : {}
      )
    };

    submitToGoLive(siteId, 'author', data).subscribe(
      ({ response }) => {
        console.log("SUBMIT RESPONSE", response);
      },
      ({ response }) => {

      }
    );

  }

  return (
    <>
      { publishingChannels &&
        <PublishDialogUI
          items={items}
          setSelectedItems={setSelectedItems}
          publishingChannels={publishingChannels}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          dialog={dialog}
          setDialog={setDialog}
          siteId={siteId}
          open={open}
        />
      }
    </>
  );
}

export default RequestPublishDialog;
