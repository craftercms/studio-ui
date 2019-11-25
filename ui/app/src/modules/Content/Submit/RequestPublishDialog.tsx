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

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';
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
import moment from 'moment';

import { Item } from '../../../models/Item';
import DependencySelection from '../Dependencies/DependencySelection';
import { fetchPublishingChannels } from "../../../services/content";
import { submitToGoLive } from '../../../services/publishing';
import PublishForm from './PulishForm';
import { backgroundColor } from '../../../styles/theme';

const dialogInitialState: any = {
  emailOnApprove: false,
  environment: '',
  submissionComment: '',
  scheduling: 'now',
  scheduledDateTime: moment(),
  scheduledTimeZone: 'America/Costa_Rica',
  publishingChannel: null,
  selectedItems: null
};

const dialogTitleStyles = () => ({
  root: {
    margin: 0,
    padding: '20px',
    paddingBottom: '20px',
    background: backgroundColor
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

const DialogTitle = withStyles(dialogTitleStyles)((props: any) => {
  const { classes, onClose, title, subtitle } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6">{title}</Typography>
        {onClose ? (
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </div>
      {
        subtitle &&
        <Typography variant="subtitle1">{subtitle}</Typography>
      }
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
  title: string;
  subtitle?: string;
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
    open,
    title,
    subtitle
  } = props;

  return (
    <Dialog onClose={handleClose} aria-labelledby="requestPublishDialogTitle" open={open} disableBackdropClick={true}
            fullWidth={true} maxWidth={'md'}>
      <DialogTitle id="requestPublishDialogTitle" onClose={handleClose}
                   title={title} subtitle={subtitle}/>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
            <DependencySelection items={items} siteId={'editorial'} onChange={(result: any) => { setSelectedItems(result) }} />
          </Grid>

          <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
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
        setOpen(false);
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
          title={'Request Publish'}
        />
      }
    </>
  );
}

export default RequestPublishDialog;
