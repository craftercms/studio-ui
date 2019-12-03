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

import React, { useEffect, useReducer, useState } from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Typography from '@material-ui/core/Typography';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import Grid from "@material-ui/core/Grid";
import moment from 'moment';

import { Item } from '../../../models/Item';
import DependencySelection from '../Dependencies/DependencySelection';
import { fetchPublishingChannels } from "../../../services/content";
import { submitToGoLive } from '../../../services/publishing';
import PublishForm from './PulishForm';
import { backgroundColor } from '../../../styles/theme';
import {get} from "../../../utils/ajax";

const messages = defineMessages({
  title: {
    id: 'requestPublishDialog.title',
    defaultMessage: 'Request Publish'
  }
});

const dialogInitialState: any = {
  emailOnApprove: false,
  environment: '',
  submissionComment: '',
  scheduling: 'now',
  scheduledDateTime: moment().format(),
  scheduledTimeZone: 'America/Costa_Rica',
  publishingChannel: null,
  selectedItems: null
};

const dialogStyles = () => ({
  titleRoot: {
    margin: 0,
    padding: '16px 20px 13px',
    background: '#fff'
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
  closeIcon: {
    padding: 0
  },
  leftAlignedAction: {
    marginRight: 'auto'
  }
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
    backgroundColor: '#FAFAFA'
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
  showAllDeps: {

  }
}))(MuiDialogActions);

export interface DependenciesResultObject {
  items1: [],
  items2: []
}

interface PublishDialogUIProps {
  items: Item[];
  publishingChannels: any[];
  handleClose: any;
  handleSubmit: any;
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
  showDepsButton: boolean,
  selectAllDeps: Function,
  selectAllSoft: Function,
  onClickShowAllDeps?: any,
  showEmailCheckbox?: boolean
  classes?: any;
}

export const PublishDialogUI = withStyles(dialogStyles)((props: PublishDialogUIProps) => {
  const {
    items,
    publishingChannels,
    handleClose,
    handleSubmit,
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
      <DialogTitle
        id="requestPublishDialogTitle"
        onClose={handleClose}
        title={title}
        subtitle={subtitle}
      />
      <DialogContent dividers>
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
              showEmailCheckbox={showEmailCheckbox}
              publishingChannels={publishingChannels}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={ onClickShowAllDeps }
          className={ classes.leftAlignedAction }
          startIcon={<InfoOutlinedIcon />}
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
        <Button variant="contained" autoFocus onClick={handleSubmit} color="primary">
          <FormattedMessage
            id="requestPublishDialog.submit"
            defaultMessage={`Submit`}
          />
        </Button>
      </DialogActions>
    </Dialog>
  )
});

// dependency selection common methods
export const checkState = (items: Item[]) => {
  return (items || []).reduce(
    (table: any, item) => {
      table[item.uri] = true;
      return table;
    },
    {}
  )
};

export const onClickSetChecked = (e: any, item: any, setChecked: Function, checked: any) => {
  e.stopPropagation();
  e.preventDefault();
  setChecked([item.uri], !checked[item.uri])
};

export const updateCheckedList = (uri: string[], isChecked: boolean, checked: any) => {
  const nextChecked = { ...checked };
  (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
    nextChecked[u] = isChecked;
  });
  return nextChecked;
};

export const selectAllDeps = (setChecked: Function, items: Item[]) => {
  setChecked(items.map(i => i.uri), true);
};

export const paths = (checked: any) => (
  Object.entries({ ...checked })
    .filter(([key, value]) => value === true)
    .map(([key]) => key)
);
// end of dependency selection common methods

interface RequestPublishDialogProps {
  onClose(): any;
  items: Item[];
  siteId: string;
}

function RequestPublishDialog(props: RequestPublishDialogProps) {
  const { items, siteId, onClose } = props;

  const [open, setOpen] = React.useState(true);
  const [dialog, setDialog] = useReducer((a, b) => ({ ...a, ...b }), dialogInitialState);
  const [publishingChannels, setPublishingChannels] = useState(null);
  const [checkedItems, setCheckedItems] = useState<any>(checkState(items));   // selected deps
  const [checkedSoftDep, _setCheckedSoftDep] = useState<any>({}); // selected soft deps
  const [deps, setDeps] = useState<DependenciesResultObject>();
  const [showDepsButton, setShowDepsButton] = useState(true);

  const { formatMessage } = useIntl();

  useEffect(getPublishingChannels, []);
  useEffect(setRef, [checkedItems, checkedSoftDep]);

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
  };

  const handleClose = () => {
    setOpen(false);

    //call externalClose fn
    onClose();
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

  // dependency selection internal
  const setChecked = (uri: string[], isChecked: boolean) => {
    setCheckedItems(updateCheckedList(uri, isChecked, checkedItems));
    setShowDepsButton(true);
    setDeps(null);
    cleanCheckedSoftDep();
  };

  const cleanCheckedSoftDep = () => {
    const nextCheckedSoftDep = {};
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  const setCheckedSoftDep = (uri: string[], isChecked: boolean) => {
    const nextCheckedSoftDep = { ...checkedSoftDep };
    (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
      nextCheckedSoftDep[u] = isChecked;
    });
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  function setRef() {
    const result = (
      Object.entries({ ...checkedItems, ...checkedSoftDep })
        .filter(([key, value]) => value === true)
        .map(([key]) => key)
    );
    setSelectedItems(result);
  }

  function selectAllSoft() {
    setCheckedSoftDep(deps.items2, true);
  }

  function showAllDependencies() {
    setShowDepsButton(false);
    get(`/studio/api/2/dependency/dependencies?siteId=${siteId}&paths=${paths(checkedItems)}`)
      .subscribe(
        (response: any) => {
          setDeps({
            items1: response.response.items.hardDependencies,
            items2: response.response.items.softDependencies
          });
        },
        () => {
          setDeps({
            items1: [],
            items2: []
          });
        }
      );
  }
  ///////////////////////

  return (
    <>
      {
        publishingChannels &&
        <PublishDialogUI
          items={items}
          publishingChannels={publishingChannels}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          dialog={dialog}
          setDialog={setDialog}
          open={open}
          title={formatMessage(messages.title)}
          checkedItems={checkedItems}
          setCheckedItems={setChecked}
          checkedSoftDep={checkedSoftDep}
          setCheckedSoftDep={setCheckedSoftDep}
          onClickSetChecked={onClickSetChecked}
          deps={deps}
          showDepsButton={showDepsButton}
          selectAllDeps={selectAllDeps}
          selectAllSoft={selectAllSoft}
          onClickShowAllDeps={showAllDependencies}
          showEmailCheckbox={true}
        />
      }
    </>
  );
}

export default RequestPublishDialog;
