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
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import DependencySelection from '../Dependencies/DependencySelection';
import PublishForm from './PublishForm';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { palette } from '../../../styles/theme';
import CircularProgress from '@material-ui/core/CircularProgress'
import DialogHeader from '../../../components/DialogHeader';
import { CloseRounded } from '@material-ui/icons';
import DialogBody from '../../../components/DialogBody';
import DialogFooter from '../../../components/DialogFooter';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { Resource } from '../../../models/Resource';

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
  btnSpinner: {
    marginLeft: 11,
    marginRight: 11,
    color: '#fff'
  }
});

interface PublishDialogContentUIProps {
  resource: Resource<any>;
  checkedItems: Item[];
  setCheckedItems: Function;
  checkedSoftDep: any[];
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any,
  showDepsButton: boolean;
  selectAllDeps: Function;
  selectAllSoft: Function;
  dialog: any;
  setDialog: any;
  setSubmitDisabled: Function;
  showEmailCheckbox?: boolean;
  publishingChannelsStatus: string;
  onPublishingChannelsFailRetry: Function;
  apiState: any;
}

function PublishDialogContentUI(props: PublishDialogContentUIProps) {
  const {
    resource,
    checkedItems,
    setCheckedItems,
    checkedSoftDep,
    setCheckedSoftDep,
    onClickSetChecked,
    deps,
    showDepsButton,
    selectAllDeps,
    selectAllSoft,
    dialog,
    setDialog,
    setSubmitDisabled,
    showEmailCheckbox,
    publishingChannelsStatus,
    onPublishingChannelsFailRetry,
    apiState
  } = props;

  const { items, publishingChannels }: { items: Item[], publishingChannels: any } = resource.read();

  return (
    <>
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
            disabled={apiState.submitting}
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
            disabled={apiState.submitting}
          />
        </Grid>
      </Grid>
    </>
  );
}

interface PublishDialogUIProps {
  resource: Resource<any>;
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
  classes?: any;
}

const PublishDialogUI = withStyles(dialogStyles)((props: PublishDialogUIProps) => {
  const {
    resource,
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
      <DialogHeader
        title={title}
        subtitle={subtitle}
        onClose={handleClose}
        icon={CloseRounded}
      />
      <DialogBody>
        <SuspenseWithEmptyState resource={resource}>
          <PublishDialogContentUI
            resource={resource}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            checkedSoftDep={checkedSoftDep}
            setCheckedSoftDep={setCheckedSoftDep}
            onClickSetChecked={onClickSetChecked}
            deps={deps}
            showDepsButton={showDepsButton}
            selectAllDeps={selectAllDeps}
            selectAllSoft={selectAllSoft}
            dialog={dialog}
            setDialog={setDialog}
            setSubmitDisabled={setSubmitDisabled}
            showEmailCheckbox={showEmailCheckbox}
            publishingChannelsStatus={publishingChannelsStatus}
            onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
            apiState={apiState}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <Button
          color="primary"
          onClick={ onClickShowAllDeps }
          className={classes.leftAlignedAction}
          disabled={showDepsDisabled || apiState.submitting}
        >
          <FormattedMessage
            id="publishDialog.showAllDependencies"
            defaultMessage={`Show All Dependencies`}
          />
        </Button>

        <Button variant="contained" onClick={handleClose} disabled={apiState.submitting}>
          <FormattedMessage
            id="requestPublishDialog.cancel"
            defaultMessage={`Cancel`}
          />
        </Button>
        <Button variant="contained" autoFocus onClick={handleSubmit} color="primary" disabled={submitDisabled || apiState.submitting}>
          {
            apiState.submitting ?
            (
              <CircularProgress
                className={classes.btnSpinner}
                size={20}
              />
            ) : (
              <FormattedMessage
                id="requestPublishDialog.submit"
                defaultMessage={`Submit`}
              />
            )
          }
        </Button>
      </DialogFooter>
    </Dialog>
  )
});

export default PublishDialogUI;
