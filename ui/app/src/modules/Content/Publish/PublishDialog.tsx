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

import React, { PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { fetchPublishingTargets, goLive, submitToGoLive } from '../../../services/publishing';
import { fetchDependencies } from '../../../services/dependencies';
import { DetailedItem } from '../../../models/Item';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import GlobalState from '../../../models/GlobalState';
import StandardAction from '../../../models/StandardAction';
import { Resource } from '../../../models/Resource';
import Grid from '@material-ui/core/Grid';
import DependencySelection from '../Dependencies/DependencySelection';
import PublishForm from './PublishForm';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import DialogHeader from '../../../components/Dialogs/DialogHeader';
import DialogBody from '../../../components/Dialogs/DialogBody';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import DialogFooter from '../../../components/Dialogs/DialogFooter';
import { ApiResponse } from '../../../models/ApiResponse';
import Dialog from '@material-ui/core/Dialog';
import LookupTable from '../../../models/LookupTable';
import SecondaryButton from '../../../components/SecondaryButton';
import PrimaryButton from '../../../components/PrimaryButton';
import { emitSystemEvent, itemsApproved, itemsScheduled } from '../../../state/actions/system';
import { useActiveSiteId } from '../../../utils/hooks/useActiveSiteId';
import { usePermissionsBySite } from '../../../utils/hooks/usePermissionsBySite';
import { useLogicResource } from '../../../utils/hooks/useLogicResource';
import { useUnmount } from '../../../utils/hooks/useUnmount';
import { useSpreadState } from '../../../utils/hooks/useSpreadState';
import { createPresenceTable } from '../../../utils/array';
import { getDateScheduled } from '../../../utils/detailedItem';
import { PublishingTarget } from '../../../models/Publishing';

// region Typings

type ApiState = { error: ApiResponse; submitting: boolean; fetchingDependencies: boolean };
type Source = { items: DetailedItem[]; publishingChannels: any[]; apiState: ApiState };
type Return = Omit<Source, 'apiState'>;

export interface DependenciesResultObject {
  items1: string[];
  items2: string[];
}

interface PublishDialogContentUIProps {
  resource: Resource<{ items: DetailedItem[]; publishingChannels: PublishingTarget[] }>;
  checkedItems: LookupTable<boolean>;
  setCheckedItems: Function;
  checkedSoftDep: LookupTable<boolean>;
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any;
  selectAllDeps: Function;
  selectAllSoft: Function;
  dialog: any;
  setDialog: any;
  setSubmitDisabled: Function;
  showEmailCheckbox?: boolean;
  showRequestApproval?: boolean;
  publishingChannelsStatus: string;
  onPublishingChannelsFailRetry: Function;
  apiState: any;
  mixedPublishingDates?: boolean;
  mixedPublishingTargets?: boolean;
}

interface PublishDialogUIProps {
  resource: Resource<Return>;
  publishingChannelsStatus: string;
  onPublishingChannelsFailRetry: Function;
  onDismiss?(): void;
  handleSubmit: any;
  submitDisabled: boolean;
  setSubmitDisabled: Function;
  showDepsDisabled: boolean;
  dialog: InternalDialogState;
  setDialog: any;
  title: string;
  subtitle?: string;
  checkedItems: LookupTable<boolean>;
  setCheckedItems: Function;
  checkedSoftDep: LookupTable<boolean>;
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any;
  selectAllDeps: Function;
  selectAllSoft: Function;
  onClickShowAllDeps?: any;
  showEmailCheckbox?: boolean;
  showRequestApproval: boolean;
  apiState: any;
  classes?: any;
  submitLabel: ReactNode;
  mixedPublishingDates?: boolean;
  mixedPublishingTargets?: boolean;
}

interface PublishDialogBaseProps {
  open: boolean;
  items?: DetailedItem[];
  // if null it means the dialog should determinate which one to use
  scheduling?: 'now' | 'custom';
}

interface Response {
  commitId: string;
  invalidateCache: boolean;
  item: any;
  message: string;
  status: boolean;
  success: boolean;
  schedule: 'now' | 'custom';
  environment: string;
  type: 'submit' | 'publish';
  items: DetailedItem[];
}

export type PublishDialogProps = PropsWithChildren<
  PublishDialogBaseProps & {
    onClose?(response?: any): any;
    onClosed?(response?: any): any;
    onDismiss?(response?: any): any;
    onSuccess?(response?: Response): any;
  }
>;

export interface PublishDialogStateProps extends PublishDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
  onSuccess?: StandardAction;
}

export interface InternalDialogState {
  emailOnApprove: boolean;
  requestApproval: boolean;
  environment: string;
  submissionComment: string;
  scheduling: 'now' | 'custom';
  scheduledDateTime: any;
  publishingChannel: string;
  selectedItems: string[];
}

// endregion

const translations = defineMessages({
  title: {
    id: 'publishDialog.title',
    defaultMessage: 'Publish'
  },
  publishSubtitle: {
    id: 'publishDialog.publishSubtitle',
    defaultMessage: 'Selected files will go live upon submission.'
  },
  requestPublishSubtitle: {
    id: 'publishDialog.requestPublishSubtitle',
    defaultMessage: 'Selected files will be submitted for review upon submission.'
  },
  subtitleHelperText: {
    id: 'publishDialog.subtitleHelperText',
    defaultMessage:
      'Hard dependencies are automatically submitted with the main items. You may choose whether to submit or not soft dependencies'
  }
});

export const updateCheckedList = (path: string[], isChecked: boolean, checked: any) => {
  const nextChecked = { ...checked };
  (Array.isArray(path) ? path : [path]).forEach((u) => {
    nextChecked[u] = isChecked;
  });
  return nextChecked;
};

export const paths = (checked: any) =>
  Object.entries({ ...checked })
    .filter(([, value]) => value === true)
    .map(([key]) => key);

const dialogInitialState: InternalDialogState = {
  emailOnApprove: false,
  requestApproval: false,
  environment: 'staging',
  submissionComment: '',
  scheduling: 'now',
  scheduledDateTime: moment().format(),
  publishingChannel: null,
  selectedItems: null
};

const useStyles = makeStyles(() =>
  createStyles({
    leftAlignedAction: {
      marginRight: 'auto'
    },
    btnSpinner: {
      marginLeft: 11,
      marginRight: 11,
      color: '#fff'
    }
  })
);

function PublishDialogContentUI(props: PublishDialogContentUIProps) {
  // region { ... } = props
  const {
    resource,
    checkedItems,
    setCheckedItems,
    checkedSoftDep,
    setCheckedSoftDep,
    onClickSetChecked,
    deps,
    selectAllDeps,
    selectAllSoft,
    dialog,
    setDialog,
    setSubmitDisabled,
    showEmailCheckbox,
    showRequestApproval,
    publishingChannelsStatus,
    onPublishingChannelsFailRetry,
    apiState,
    mixedPublishingDates,
    mixedPublishingTargets
  } = props;
  // endregion
  const { items, publishingChannels } = resource.read();

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
            showRequestApproval={showRequestApproval}
            publishingChannels={publishingChannels}
            publishingChannelsStatus={publishingChannelsStatus}
            onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
            disabled={apiState.submitting}
            mixedPublishingDates={mixedPublishingDates}
            mixedPublishingTargets={mixedPublishingTargets}
          />
        </Grid>
      </Grid>
    </>
  );
}

function PublishDialogUI(props: PublishDialogUIProps) {
  const {
    resource,
    publishingChannelsStatus,
    onPublishingChannelsFailRetry,
    onDismiss,
    handleSubmit,
    submitDisabled,
    setSubmitDisabled,
    showDepsDisabled,
    dialog,
    setDialog,
    title,
    subtitle,
    checkedItems,
    setCheckedItems,
    checkedSoftDep,
    setCheckedSoftDep,
    onClickSetChecked,
    deps,
    selectAllDeps,
    selectAllSoft,
    onClickShowAllDeps,
    showEmailCheckbox,
    showRequestApproval,
    apiState,
    classes,
    submitLabel,
    mixedPublishingDates,
    mixedPublishingTargets
  } = props;

  return (
    <>
      <DialogHeader title={title} subtitle={subtitle} onDismiss={onDismiss} />
      <DialogBody>
        <SuspenseWithEmptyState
          resource={resource}
          withEmptyStateProps={{
            emptyStateProps: {
              title: (
                <FormattedMessage id="publishDialog.noItemsSelected" defaultMessage="No items have been selected" />
              )
            },
            isEmpty: (value) => value.items.length === 0
          }}
        >
          <PublishDialogContentUI
            resource={resource}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            checkedSoftDep={checkedSoftDep}
            setCheckedSoftDep={setCheckedSoftDep}
            onClickSetChecked={onClickSetChecked}
            deps={deps}
            selectAllDeps={selectAllDeps}
            selectAllSoft={selectAllSoft}
            dialog={dialog}
            setDialog={setDialog}
            setSubmitDisabled={setSubmitDisabled}
            showEmailCheckbox={showEmailCheckbox}
            showRequestApproval={showRequestApproval}
            publishingChannelsStatus={publishingChannelsStatus}
            onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
            apiState={apiState}
            mixedPublishingDates={mixedPublishingDates}
            mixedPublishingTargets={mixedPublishingTargets}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton
          color="primary"
          onClick={onClickShowAllDeps}
          className={classes.leftAlignedAction}
          disabled={showDepsDisabled || apiState.submitting || apiState.fetchingDependencies}
          loading={apiState.fetchingDependencies}
        >
          <FormattedMessage id="publishDialog.showAllDependencies" defaultMessage="Show All Dependencies" />
        </SecondaryButton>
        <SecondaryButton onClick={onDismiss} disabled={apiState.submitting}>
          <FormattedMessage id="requestPublishDialog.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={handleSubmit} disabled={submitDisabled} loading={apiState.submitting}>
          {submitLabel}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default function PublishDialog(props: PublishDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="requestPublishDialogTitle"
      fullWidth
      maxWidth="md"
    >
      <PublishDialogWrapper {...props} />
    </Dialog>
  );
}

function PublishDialogWrapper(props: PublishDialogProps) {
  const { items, scheduling = dialogInitialState.scheduling, onDismiss, onSuccess } = props;
  const [dialog, setDialog] = useSpreadState<InternalDialogState>({ ...dialogInitialState, scheduling });
  const [publishingChannels, setPublishingChannels] = useState<{ name: string }[]>(null);
  const [publishingChannelsStatus, setPublishingChannelsStatus] = useState('Loading');
  const [checkedItems, setCheckedItems] = useState<LookupTable<boolean>>({}); // selected deps
  const [checkedSoftDep, _setCheckedSoftDep] = useState<LookupTable<boolean>>({}); // selected soft deps
  const [deps, setDeps] = useState<DependenciesResultObject>(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [showDepsDisabled, setShowDepsDisabled] = useState(false);
  const [apiState, setApiState] = useSpreadState<ApiState>({
    error: null,
    submitting: false,
    fetchingDependencies: false
  });

  const siteId = useActiveSiteId();
  const permissionsBySite = usePermissionsBySite();
  const myPermissions = permissionsBySite[siteId];
  const hasPublishPermission = myPermissions.includes('publish');
  const dispatch = useDispatch();

  useUnmount(props.onClosed);

  const user = useSelector<GlobalState, GlobalState['user']>((state) => state.user);
  const submit = !hasPublishPermission || dialog.requestApproval ? submitToGoLive : goLive;
  const propagateAction = !hasPublishPermission || dialog.requestApproval ? itemsScheduled : itemsApproved;
  const { mixedPublishingTargets, mixedPublishingDates, dateScheduled, environment } = useMemo(() => {
    let state = {
      mixedPublishingTargets: false,
      mixedPublishingDates: false,
      dateScheduled: null,
      environment: dialogInitialState.environment
    };

    let itemsChecked = items.filter((item) => checkedItems[item.path]);

    if (itemsChecked.length === 0) {
      return state;
    }

    // Discover whether there are mixed targets and/or mixed schedules and sets the environment based off the items
    itemsChecked?.reduce((prev, current) => {
      let prevEnvironment = prev.stateMap.submittedToLive ? 'live' : prev.stateMap.submittedToStaging ? 'staging' : '';
      // prettier-ignore
      let currentEnvironment =
        current.stateMap.submittedToLive
          ? 'live'
          : current.stateMap.submittedToStaging
            ? 'staging'
            : '';
      if (prevEnvironment !== currentEnvironment || prev.stateMap.live !== current.stateMap.live) {
        state.mixedPublishingTargets = true;
        // When there are mixed publishing targets, we want to force manual user selection.
        state.environment = '';
      }
      if (prev[prevEnvironment]?.dateScheduled !== current[currentEnvironment]?.dateScheduled) {
        state.mixedPublishingDates = true;
      }
      if (state.dateScheduled === null) {
        state.dateScheduled = prev[prevEnvironment]?.dateScheduled
          ? prev[prevEnvironment].dateScheduled
          : current[prevEnvironment]?.dateScheduled ?? null;
      }
      // TODO: What's this condition for/about?
      if (state.environment === '' && state.mixedPublishingTargets === false) {
        state.environment = prevEnvironment;
      }
      return current;
    });

    return {
      ...state,
      // prettier-ignore
      environment:
        itemsChecked.length > 1
          ? state.environment
          : itemsChecked[0].stateMap.submittedToLive
            ? 'live'
            : itemsChecked[0].stateMap.submittedToStaging
              ? 'staging'
              : state.environment,
      dateScheduled: itemsChecked.length > 1 ? state.dateScheduled : getDateScheduled(itemsChecked[0])
    };
  }, [checkedItems, items]);

  const { formatMessage } = useIntl();

  const setSelectedItems = useCallback(
    (pItems) => {
      if (!pItems || pItems.length === 0) {
        setShowDepsDisabled(true);
      } else {
        setShowDepsDisabled(false);
      }
      setDialog({ selectedItems: pItems });
    },
    [setDialog]
  );

  const getPublishingChannels = useCallback(
    (success?: (channels) => any, error?: (error) => any) => {
      setPublishingChannelsStatus('Loading');
      fetchPublishingTargets(siteId).subscribe(
        (response) => {
          setPublishingChannels(response);
          setPublishingChannelsStatus('Success');
          success?.(response);
        },
        (e) => {
          setPublishingChannelsStatus('Error');
          error?.(e);
        }
      );
    },
    [siteId]
  );

  const publishSource = useMemo(
    () => ({
      items,
      apiState,
      publishingChannels,
      myPermissions
    }),
    [items, publishingChannels, apiState, myPermissions]
  );

  const resource = useLogicResource<Return, Source>(publishSource, {
    shouldResolve: (source) => Boolean(source.items && source.publishingChannels && myPermissions.length),
    shouldReject: (source) => Boolean(source.apiState.error),
    shouldRenew: (source, resource) => source.apiState.submitting && resource.complete,
    resultSelector: (source) => ({
      items: source.items,
      publishingChannels: source.publishingChannels
    }),
    errorSelector: (source) => source.apiState.error
  });

  useEffect(() => {
    getPublishingChannels(() => {
      setCheckedItems(createPresenceTable(items, true, (item) => item.path));
    });
  }, [getPublishingChannels, items]);

  useEffect(() => {
    const result = Object.entries({ ...checkedItems, ...checkedSoftDep })
      .filter(([, value]) => value)
      .map(([key]) => key);
    setSelectedItems(result);
  }, [checkedItems, checkedSoftDep, setSelectedItems]);

  useEffect(() => {
    setDialog({ scheduling });
  }, [scheduling, setDialog]);

  useEffect(() => {
    if (dateScheduled && scheduling !== 'now') {
      setDialog({
        scheduling: 'custom',
        environment,
        scheduledDateTime: moment(dateScheduled).format()
      });
    } else if (dateScheduled === null && scheduling === null) {
      setDialog({
        scheduling: 'now',
        environment
      });
    } else {
      setDialog({
        environment
      });
    }
  }, [dateScheduled, environment, setDialog, scheduling]);

  useEffect(() => {
    // Submit button should be disabled:
    setSubmitDisabled(
      // While submitting
      apiState.submitting ||
        // When no items are selected
        !Object.values(checkedItems).filter(Boolean).length ||
        // When there are no available/loaded publishing targets
        !publishingChannels?.length ||
        // When no publishing target is selected
        !dialog.environment
    );
  }, [apiState.submitting, checkedItems, publishingChannels, dialog.environment]);

  const handleSubmit = () => {
    const {
      environment,
      selectedItems: items,
      scheduling: schedule,
      emailOnApprove: sendEmail,
      submissionComment,
      scheduledDateTime: scheduledDate
    } = dialog;
    const data = {
      ...(!hasPublishPermission || dialog.requestApproval
        ? { environment: environment }
        : { publishChannel: environment }),
      items,
      schedule,
      sendEmail,
      submissionComment,
      ...(schedule === 'custom' ? { scheduledDate } : {})
    };

    setApiState({ ...apiState, submitting: true });

    submit(siteId, user.username, data).subscribe(
      (response) => {
        setApiState({ ...apiState, error: null, submitting: false });
        dispatch(emitSystemEvent(propagateAction({ targets: items })));
        onSuccess?.({
          ...response,
          schedule: schedule,
          environment: environment,
          type: !hasPublishPermission || dialog.requestApproval ? 'submit' : 'publish',
          items: items.map((path) => props.items.find((item) => item.path === path))
        });
      },
      (error) => {
        setApiState({ ...apiState, error });
      }
    );
  };

  const setChecked = (path: string[], isChecked: boolean) => {
    setCheckedItems(updateCheckedList(path, isChecked, checkedItems));
    setDeps(null);
    cleanCheckedSoftDep();
  };

  const onClickSetChecked = (e: any, item: DetailedItem) => {
    e.stopPropagation();
    e.preventDefault();
    setChecked([item.path], !checkedItems[item.path]);
  };

  const selectAllDeps = () => {
    const isAllChecked = !items.some((item) => !checkedItems[item.path]);
    setChecked(
      items.map((i) => i.path),
      !isAllChecked
    );
  };

  const cleanCheckedSoftDep = () => {
    const nextCheckedSoftDep = {};
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  const setCheckedSoftDep = (path: string[], isChecked: boolean) => {
    const nextCheckedSoftDep = { ...checkedSoftDep };
    (Array.isArray(path) ? path : [path]).forEach((u) => {
      nextCheckedSoftDep[u] = isChecked;
    });
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  function selectAllSoft() {
    setCheckedSoftDep(deps.items2, true);
  }

  function showAllDependencies() {
    setApiState({ ...apiState, fetchingDependencies: true });
    fetchDependencies(siteId, paths(checkedItems)).subscribe(
      (items) => {
        setApiState({ ...apiState, fetchingDependencies: false });
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
      onDismiss={onDismiss}
      handleSubmit={handleSubmit}
      submitDisabled={submitDisabled}
      setSubmitDisabled={setSubmitDisabled}
      showDepsDisabled={showDepsDisabled}
      dialog={dialog}
      setDialog={setDialog}
      title={formatMessage(translations.title)}
      subtitle={
        !hasPublishPermission || dialog.requestApproval
          ? formatMessage(translations.requestPublishSubtitle) + ' ' + formatMessage(translations.subtitleHelperText)
          : formatMessage(translations.publishSubtitle) + ' ' + formatMessage(translations.subtitleHelperText)
      }
      checkedItems={checkedItems}
      setCheckedItems={setChecked}
      checkedSoftDep={checkedSoftDep}
      setCheckedSoftDep={setCheckedSoftDep}
      onClickSetChecked={onClickSetChecked}
      deps={deps}
      selectAllDeps={selectAllDeps}
      selectAllSoft={selectAllSoft}
      onClickShowAllDeps={showAllDependencies}
      apiState={apiState}
      classes={useStyles()}
      showEmailCheckbox={!hasPublishPermission || dialog.requestApproval}
      showRequestApproval={hasPublishPermission && items.every((item) => !item.stateMap.submitted)}
      submitLabel={
        dialog.scheduling === 'custom' ? (
          <FormattedMessage id="requestPublishDialog.schedule" defaultMessage="Schedule" />
        ) : !hasPublishPermission || dialog.requestApproval ? (
          <FormattedMessage id="requestPublishDialog.submit" defaultMessage="Submit" />
        ) : (
          <FormattedMessage id="requestPublishDialog.publish" defaultMessage="Publish" />
        )
      }
      mixedPublishingTargets={mixedPublishingTargets}
      mixedPublishingDates={mixedPublishingDates}
    />
  );
}
