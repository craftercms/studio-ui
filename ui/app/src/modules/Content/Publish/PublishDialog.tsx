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

import React, { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { fetchPublishingChannels } from '../../../services/content';
import { goLive, submitToGoLive } from '../../../services/publishing';
import { fetchDependencies } from '../../../services/dependencies';
import { LegacyItem } from '../../../models/Item';
import moment from 'moment';
import { useSelector } from 'react-redux';
import GlobalState, { APIError } from '../../../models/GlobalState';
import { useActiveSiteId, useOnMount, useSpreadState, useStateResource } from '../../../utils/hooks';
import StandardAction from '../../../models/StandardAction';
import { Resource } from '../../../models/Resource';
import Grid from '@material-ui/core/Grid';
import DependencySelection from '../Dependencies/DependencySelection';
import PublishForm from './PublishForm';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../../../components/DialogHeader';
import DialogBody from '../../../components/DialogBody';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import DialogFooter from '../../../components/DialogFooter';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { palette } from '../../../styles/theme';

const goLiveMessages = defineMessages({
  title: {
    id: 'approveDialog.title',
    defaultMessage: 'Approve for Publish'
  },
  subtitle: {
    id: 'approveDialog.subtitle',
    defaultMessage: 'Selected files will go live upon submission. Hard dependencies are automatically submitted with the ' +
      'main items. You may choose whether to submit or not soft dependencies'
  }
});

const submitMessages = defineMessages({
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
  publishingChannel: null,
  selectedItems: null
};

export interface DependenciesResultObject {
  items1: [],
  items2: []
}

export const checkState = (items: LegacyItem[]) => {
  return (items || []).reduce(
    (table: any, item) => {
      table[item.uri] = true;
      return table;
    },
    {}
  );
};

export const onClickSetChecked = (e: any, item: any, setChecked: Function, checked: any) => {
  e.stopPropagation();
  e.preventDefault();
  setChecked([item.uri], !checked[item.uri]);
};

export const updateCheckedList = (uri: string[], isChecked: boolean, checked: any) => {
  const nextChecked = { ...checked };
  (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
    nextChecked[u] = isChecked;
  });
  return nextChecked;
};

export const selectAllDeps = (setChecked: Function, items: LegacyItem[]) => {
  setChecked(items.map(i => i.uri), true);
};

export const paths = (checked: any) => (
  Object.entries({ ...checked })
    .filter(([key, value]) => value === true)
    .map(([key]) => key)
);

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
  checkedItems: LegacyItem[];
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

  const { items, publishingChannels }: { items: LegacyItem[], publishingChannels: any } = resource.read();

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
  checkedItems: LegacyItem[];
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

interface PublishDialogBaseProps {
  open: boolean;
  items?: LegacyItem[];
  scheduling?: string;
}

export type PublishDialogProps = PropsWithChildren<PublishDialogBaseProps & {
  onClose?(response?: any): any;
  onSuccess?(response?: any): any;
}>;

export interface PublishDialogStateProps extends PublishDialogBaseProps {
  onClose?: StandardAction;
  onSuccess?: StandardAction;
}

const submitMap = {
  'admin': goLive,
  'author': submitToGoLive
};

function PublishDialog(props: PublishDialogProps) {
  const {
    open,
    items,
    scheduling = 'now',
    onClose,
    onSuccess
  } = props;

  const [dialog, setDialog] = useSpreadState({ ...dialogInitialState, scheduling });
  const [publishingChannels, setPublishingChannels] = useState(null);
  const [publishingChannelsStatus, setPublishingChannelsStatus] = useState('Loading');
  const [checkedItems, setCheckedItems] = useState<any>(checkState(items));   // selected deps
  const [checkedSoftDep, _setCheckedSoftDep] = useState<any>({}); // selected soft deps
  const [deps, setDeps] = useState<DependenciesResultObject>();
  const [showDepsButton, setShowDepsButton] = useState(true);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [showDepsDisabled, setShowDepsDisabled] = useState(false);
  const [apiState, setApiState] = useSpreadState<{ error: APIError, submitting: boolean }>({
    error: null,
    submitting: false
  });

  const user = useSelector<GlobalState, GlobalState['user']>(state => state.user);
  const siteId = useActiveSiteId();
  const userSitesRoles: String[] = user.rolesBySite[siteId];
  const userRole = userSitesRoles.includes('admin') ? 'admin' : 'author';
  const submit = submitMap[userRole];

  const { formatMessage } = useIntl();

  const setSelectedItems = useCallback((items) => {
    if (!items || items.length === 0) {
      setSubmitDisabled(true);
      setShowDepsDisabled(true);
    } else {
      setSubmitDisabled(false);
      setShowDepsDisabled(false);
    }
    setDialog({ selectedItems: items });
  }, [setDialog]);

  const getPublishingChannels = useCallback(() => {
    setPublishingChannelsStatus('Loading');
    setSubmitDisabled(true);
    fetchPublishingChannels(siteId).subscribe(
      ({ response }) => {
        setPublishingChannels(response.availablePublishChannels);
        setPublishingChannelsStatus('Success');
        setSubmitDisabled(false);
      },
      ({ response }) => {
        setPublishingChannelsStatus('Error');
        setSubmitDisabled(true);
      }
    );
  }, [siteId]);

  const publishSource = useMemo(() => {
    return {
      items,
      publishingChannels,
      apiState
    }
  },[items, publishingChannels, apiState]);

  const resource = useStateResource<any, any>(
    publishSource,
    {
      shouldResolve: (source) => (Boolean(source.items) && Boolean(source.publishingChannels)),
      shouldReject: (source) => Boolean(source.apiState.error),
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: (source) => {
        return {
          items: source.items,
          publishingChannels: source.publishingChannels
        }
      },
      errorSelector: (source) => source.apiState.error
    }
  )

  useOnMount(getPublishingChannels);

  useEffect(() => {
    const result = (
      Object.entries({ ...checkedItems, ...checkedSoftDep })
        .filter(([key, value]) => value)
        .map(([key]) => key)
    );
    setSelectedItems(result);
  }, [checkedItems, checkedSoftDep, setSelectedItems]);

  useEffect(() => {
    setDialog({ scheduling });
  }, [scheduling, setDialog]);

  useEffect(() => {
    setCheckedItems(checkState(items));
  }, [items, setCheckedItems])

  const handleClose = () => {
    // call externalClose fn
    onClose?.();
  };

  const handleSubmit = () => {
    const data = {
      publishChannel: dialog.environment,
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

    setApiState({ ...apiState, submitting: true });

    submit(siteId, user.username, data).subscribe(
      (response) => {
        setApiState({ error: null, submitting: false });
        onSuccess?.(response);
        onClose?.(response);
      },
      (error) => {
        setApiState({ error });
      }
    );

  };

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

  function selectAllSoft() {
    setCheckedSoftDep(deps.items2, true);
  }

  function showAllDependencies() {
    setShowDepsButton(false);
    fetchDependencies(siteId, paths(checkedItems)).subscribe(
      (items) => {
        setDeps({
          items1: items.hardDependencies,
          items2: items.softDependencies
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

  return (
    <PublishDialogUI
      resource={resource}
      publishingChannelsStatus={publishingChannelsStatus}
      onPublishingChannelsFailRetry={getPublishingChannels}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      submitDisabled={submitDisabled}
      setSubmitDisabled={setSubmitDisabled}
      showDepsDisabled={showDepsDisabled}
      dialog={dialog}
      setDialog={setDialog}
      open={open}
      title={formatMessage(userRole === 'admin' ? goLiveMessages.title : submitMessages.title)}
      subtitle={userRole === 'admin' ? formatMessage(goLiveMessages.subtitle) : null}
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
      apiState={apiState}
      showEmailCheckbox={!(userRole === 'admin')}
    />
  );
}

export default PublishDialog;
