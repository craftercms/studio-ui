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

import { Item } from '../../../models/Item';
import { Theme, withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import DependencySelection from '../Dependencies/DependencySelection';
import PublishForm from './PublishForm';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import ErrorState from '../../../components/SystemStatus/ErrorState';
import { palette } from '../../../styles/theme';
import LoadingState from '../../../components/SystemStatus/LoadingState';

const dialogStyles = () => ({
  titleRoot: {
    margin: 0,
    padding: '13px 20px 11px',
    background: palette.white
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10
  },
  subtitle: {
    fontSize: '14px',
    lineHeight: '18px',
    paddingRight: '35px'
  },
  dialogActions: {
    padding: '10px 22px'
  },
  leftAlignedAction: {
    marginRight: 'auto'
  },
  errorPaperRoot: {
    maxHeight: '586px',
    height: '100vh',
    padding: 0
  },
  loadingStateRoot: {
    height: '100%',
  },
  loadingStateGraphic: {
    flexGrow: 1,
    padding: '50px 0'
  },
});

const DialogTitle = withStyles(dialogStyles)((props: any) => {
  const { classes, onClose, title, subtitle } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.titleRoot}>
      <div className={classes.title}>
        <Typography variant="h6">{title}</Typography>
        {onClose ? (
          <IconButton aria-label="close" onClick={onClose} className={classes.closeIcon}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </div>
      {
        subtitle &&
        <Typography variant="subtitle1" className={classes.subtitle}>{subtitle}</Typography>
      }
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: palette.gray.light0
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  }
}))(MuiDialogActions);

interface PublishDialogUIProps {
  items: Item[];
  publishingChannels: any[];
  publishingChannelsStatus: string;
  onPublishingChannelsFailRetry: Function;
  handleClose: any;
  handleSubmit: any;
  submitDisabled: boolean;
  setSubmitDisabled: Function;
  showDepsDisabled: boolean;
  dialog: any;
  setDialog: any;
  open: boolean;
  title: string;
  subtitle?: string;
  checkedItems: Item[];
  setCheckedItems: Function;
  checkedSoftDep: any[];
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any,
  showDepsButton: boolean;
  selectAllDeps: Function;
  selectAllSoft: Function;
  onClickShowAllDeps?: any;
  showEmailCheckbox?: boolean;
  apiState: any;
  handleErrorBack: any;
  classes?: any;
}

const PublishDialogUI = withStyles(dialogStyles)((props: PublishDialogUIProps) => {
  const {
    items,
    publishingChannels,
    publishingChannelsStatus,
    onPublishingChannelsFailRetry,
    handleClose,
    handleSubmit,
    submitDisabled,
    setSubmitDisabled,
    showDepsDisabled,
    dialog,
    setDialog,
    open,
    title,
    subtitle,
    checkedItems,
    setCheckedItems,
    checkedSoftDep,
    setCheckedSoftDep,
    onClickSetChecked,
    deps,
    showDepsButton,
    selectAllDeps,
    selectAllSoft,
    onClickShowAllDeps,
    showEmailCheckbox,
    apiState,
    handleErrorBack,
    classes
  } = props;

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="requestPublishDialogTitle"
      open={open}
      disableBackdropClick={true}
      fullWidth={true}
      maxWidth={'md'}
    >
      {
        (!apiState.error) ?
        (
          <>
            <DialogTitle
              id="requestPublishDialogTitle"
              onClose={handleClose}
              title={title}
              subtitle={subtitle}
            />
            <DialogContent dividers>
              {
                !(apiState.submitting) &&
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
                    <DependencySelection
                      items={items}
                      checked={checkedItems}
                      setChecked={setCheckedItems}
                      checkedSoftDep={checkedSoftDep}
                      setCheckedSoftDep={setCheckedSoftDep}
                      onClickSetChecked={onClickSetChecked}
                      deps={deps}
                      showDepsButton={showDepsButton}
                      onSelectAllClicked={selectAllDeps}
                      onSelectAllSoftClicked={selectAllSoft}
                    />
                  </Grid>

                  <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
                    <PublishForm
                      inputs={dialog}
                      setInputs={setDialog}
                      setSubmitDisabled={setSubmitDisabled}
                      showEmailCheckbox={showEmailCheckbox}
                      publishingChannels={publishingChannels}
                      publishingChannelsStatus={publishingChannelsStatus}
                      onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
                    />
                  </Grid>
                </Grid>
              }
              {
                apiState.submitting &&
                <LoadingState
                  title={''}
                  classes={{
                    root: classes.loadingStateRoot,
                    graphicRoot: classes.loadingStateGraphic
                  }}
                />
              }
            </DialogContent>
            <DialogActions className={ classes.dialogActions }>
              <Button
                color="primary"
                onClick={ onClickShowAllDeps }
                className={classes.leftAlignedAction}
                disabled={showDepsDisabled}
              >
                <FormattedMessage
                  id="publishDialog.showAllDependencies"
                  defaultMessage={`Show All Dependencies`}
                />
              </Button>

              <Button variant="contained" onClick={handleClose}>
                <FormattedMessage
                  id="requestPublishDialog.cancel"
                  defaultMessage={`Cancel`}
                />
              </Button>
              <Button variant="contained" autoFocus onClick={handleSubmit} color="primary" disabled={submitDisabled}>
                <FormattedMessage
                  id="requestPublishDialog.submit"
                  defaultMessage={`Submit`}
                />
              </Button>
            </DialogActions>
          </>
        ) : (
            <ErrorState
              classes={{ root: classes.errorPaperRoot }}
              error={apiState.errorResponse}
              onBack={handleErrorBack}
            />
          )
      }
    </Dialog>
  )
});

export default PublishDialogUI;
