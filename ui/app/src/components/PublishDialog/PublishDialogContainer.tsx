/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { useSpreadState } from '../../utils/hooks/useSpreadState';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PublishingTarget } from '../../models/Publishing';
import LookupTable from '../../models/LookupTable';
import {
  ApiState,
  DependenciesResultObject,
  ExtendedGoLiveResponse,
  InternalDialogState,
  paths,
  PublishDialogBaseProps,
  PublishDialogResourceBody,
  PublishDialogResourceInput,
  updateCheckedList
} from './utils';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { usePermissionsBySite } from '../../utils/hooks/usePermissionsBySite';
import { useDispatch } from 'react-redux';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { fetchPublishingTargets, goLive, submitToGoLive } from '../../services/publishing';
import { emitSystemEvent, itemsApproved, itemsScheduled } from '../../state/actions/system';
import { getComputedPublishingTarget, getDateScheduled } from '../../utils/detailedItem';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { createPresenceTable } from '../../utils/array';
import { DetailedItem } from '../../models/Item';
import { fetchDependencies } from '../../services/dependencies';
import { PublishDialogUI } from './PublishDialogUI';
import translations from './translations';
import useStyles from './styles';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useSelection } from '../../utils/hooks/useSelection';
import { isBlank } from '../../utils/string';
import { useLocale } from '../../utils/hooks/useLocale';
import { getUserTimeZone } from '../../utils/datetime';
import { DateChangeData } from '../Controls/DateTimePicker';

export interface PublishDialogContainerProps extends PublishDialogBaseProps {
  onClosed?(response?: any): any;
  onDismiss?(response?: any): any;
  onSuccess?(response?: ExtendedGoLiveResponse): any;
}

export function PublishDialogContainer(props: PublishDialogContainerProps) {
  const { items, scheduling = 'now', onDismiss, onSuccess } = props;
  const {
    dateTimeFormatOptions: { timeZone = getUserTimeZone() }
  } = useLocale();
  const [dialogState, setDialogState] = useSpreadState<InternalDialogState>({
    emailOnApprove: false,
    requestApproval: false,
    environment: '',
    submissionComment: '',
    scheduling: scheduling,
    scheduledDateTime: new Date(),
    publishingChannel: null,
    selectedItems: null,
    scheduledTimeZone: timeZone
  });
  const [publishingChannels, setPublishingTargets] = useState<PublishingTarget[]>(null);
  const [publishingChannelsStatus, setPublishingTargetsStatus] = useState('Loading');
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
  const submissionCommentRequired = useSelection((state) => state.uiConfig.publishing.publishCommentRequired);

  useUnmount(props.onClosed);

  const user = useActiveUser();
  const submit = !hasPublishPermission || dialogState.requestApproval ? submitToGoLive : goLive;
  const propagateAction = !hasPublishPermission || dialogState.requestApproval ? itemsScheduled : itemsApproved;
  const { mixedPublishingTargets, mixedPublishingDates, dateScheduled, environment } = useMemo(() => {
    const state = {
      mixedPublishingTargets: false,
      mixedPublishingDates: false,
      dateScheduled: null,
      environment: null
    };

    let itemsChecked = items.filter((item) => checkedItems[item.path]);

    if (itemsChecked.length === 0) {
      state.environment = '';
      return state;
    }

    // region Discover mixed targets and/or schedules and sets the environment based off the items
    let target: string;
    let schedule: string;
    itemsChecked.some((item, index) => {
      const computedTarget = getComputedPublishingTarget(itemsChecked[0]);
      const computedSchedule = getDateScheduled(itemsChecked[0]);
      if (index === 0) {
        target = computedTarget;
        schedule = computedSchedule;
      } else {
        if (target !== computedTarget) {
          // If the computed target is different, we have mixed targets.
          // Could be any combination of live vs staging vs null that triggers mixed targets.
          state.mixedPublishingTargets = true;
        }
        if (schedule !== computedSchedule) {
          // If the current item's computed scheduled date is different, we have mixed dates.
          // Could be any combination of live vs staging vs null that triggers mixed targets.
          state.mixedPublishingDates = true;
        }
      }
      if (state.environment === null && computedTarget !== null) {
        state.environment = computedTarget;
      }
      // First found dateScheduled cached for later
      if (state.dateScheduled === null && computedSchedule !== null) {
        state.dateScheduled = computedSchedule;
      }
      // Once these things are found to be true, no need to iterate further.
      return state.mixedPublishingTargets && state.mixedPublishingDates && state.dateScheduled !== null;
    });
    // endregion

    // If there aren't any available target (or they haven't loaded), dialog should not have a selected target.
    if (publishingChannels?.length) {
      // If there are mixed targets, we want manual user selection of a target.
      // Otherwise, use what was previously found as the target on the selected items.
      if (state.mixedPublishingTargets) {
        state.environment = '';
      } else {
        // If we haven't found a target by this point, we wish to default the dialog to
        // staging (as long as that target is enabled in the system, which is checked next).
        if (state.environment === null) {
          state.environment = 'staging';
        }
        state.environment = publishingChannels.some((target) => target.name === state.environment)
          ? state.environment
          : publishingChannels[0].name;
      }
    } else {
      state.environment = '';
    }

    return state;
  }, [checkedItems, items, publishingChannels]);

  const { formatMessage } = useIntl();

  const setSelectedItems = useCallback(
    (pItems) => {
      if (!pItems || pItems.length === 0) {
        setShowDepsDisabled(true);
      } else {
        setShowDepsDisabled(false);
      }
      setDialogState({ selectedItems: pItems });
    },
    [setDialogState]
  );

  const getPublishingChannels = useCallback(
    (success?: (channels) => any, error?: (error) => any) => {
      setPublishingTargetsStatus('Loading');
      fetchPublishingTargets(siteId).subscribe(
        (targets) => {
          setPublishingTargets(targets);
          setPublishingTargetsStatus('Success');
          success?.(targets);
        },
        (e) => {
          setPublishingTargetsStatus('Error');
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

  const resource = useLogicResource<PublishDialogResourceBody, PublishDialogResourceInput>(publishSource, {
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
    setDialogState({ scheduling });
  }, [scheduling, setDialogState]);

  useEffect(() => {
    if (dateScheduled && scheduling !== 'now') {
      setDialogState({
        scheduling: 'custom',
        environment,
        scheduledDateTime: dateScheduled
      });
    } else if (dateScheduled === null && scheduling === null) {
      setDialogState({
        scheduling: 'now',
        environment
      });
    } else {
      setDialogState({
        environment
      });
    }
  }, [dateScheduled, environment, setDialogState, scheduling]);

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
        !dialogState.environment ||
        // If submission comment is required (per config) and blank
        (submissionCommentRequired && isBlank(dialogState.submissionComment))
    );
  }, [
    apiState.submitting,
    checkedItems,
    publishingChannels,
    dialogState.environment,
    dialogState.submissionComment,
    submissionCommentRequired
  ]);

  const handleSubmit = () => {
    const {
      environment,
      selectedItems: items,
      scheduling: schedule,
      emailOnApprove: sendEmail,
      submissionComment,
      scheduledDateTime: scheduledDate
    } = dialogState;
    const data = {
      ...(!hasPublishPermission || dialogState.requestApproval
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
          type: !hasPublishPermission || dialogState.requestApproval ? 'submit' : 'publish',
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

  const setCheckedSoftDep = (e: any, path: string[], isChecked: boolean) => {
    const nextCheckedSoftDep = { ...checkedSoftDep };
    (Array.isArray(path) ? path : [path]).forEach((u) => {
      nextCheckedSoftDep[u] = isChecked;
    });
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  function selectAllSoft() {
    const isAllChecked = !deps.items2.some((path) => !checkedSoftDep[path]);
    setCheckedSoftDep(null, deps.items2, !isAllChecked);
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

  const onPublishingArgumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value;
    switch (e.target.type) {
      case 'checkbox':
        value = e.target.checked;
        break;
      case 'textarea':
        value = e.target.value;
        break;
      case 'radio':
        value = e.target.value;
        break;
      case 'dateTimePicker': {
        // @ts-ignore
        const changes: DateChangeData = e.target.value;
        value = changes.dateString;
        setDialogState({
          [e.target.name]: value,
          scheduledTimeZone: changes.timeZoneName
        });
        return;
      }
      default:
        console.error('Publishing argument change event ignored.');
        return;
    }
    setDialogState({ [e.target.name]: value });
  };

  return (
    <PublishDialogUI
      resource={resource}
      publishingChannelsStatus={publishingChannelsStatus}
      onPublishingChannelsFailRetry={getPublishingChannels}
      onDismiss={onDismiss}
      handleSubmit={handleSubmit}
      showDepsDisabled={showDepsDisabled}
      dialog={dialogState}
      title={formatMessage(translations.title)}
      subtitle={
        !hasPublishPermission || dialogState.requestApproval
          ? formatMessage(translations.requestPublishSubtitle) + ' ' + formatMessage(translations.subtitleHelperText)
          : formatMessage(translations.publishSubtitle) + ' ' + formatMessage(translations.subtitleHelperText)
      }
      checkedItems={checkedItems}
      checkedSoftDep={checkedSoftDep}
      setCheckedSoftDep={setCheckedSoftDep}
      onClickSetChecked={onClickSetChecked}
      deps={deps}
      selectAllDeps={selectAllDeps}
      selectAllSoft={selectAllSoft}
      onClickShowAllDeps={showAllDependencies}
      apiState={apiState}
      classes={useStyles()}
      showEmailCheckbox={!hasPublishPermission || dialogState.requestApproval}
      showRequestApproval={hasPublishPermission && items.every((item) => !item.stateMap.submitted)}
      submitLabel={
        dialogState.scheduling === 'custom' ? (
          <FormattedMessage id="words.schedule" defaultMessage="Schedule" />
        ) : !hasPublishPermission || dialogState.requestApproval ? (
          <FormattedMessage id="words.submit" defaultMessage="Submit" />
        ) : (
          <FormattedMessage id="words.publish" defaultMessage="Publish" />
        )
      }
      mixedPublishingTargets={mixedPublishingTargets}
      mixedPublishingDates={mixedPublishingDates}
      submissionCommentRequired={submissionCommentRequired}
      submitDisabled={submitDisabled}
      onPublishingArgumentChange={onPublishingArgumentChange}
    />
  );
}
