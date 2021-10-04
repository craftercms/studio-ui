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
  InternalDialogState,
  paths,
  PublishDialogContainerProps,
  PublishDialogResourceBody,
  PublishDialogResourceInput
} from './utils';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { usePermissionsBySite } from '../../utils/hooks/usePermissionsBySite';
import { useDispatch } from 'react-redux';
import { fetchPublishingTargets, goLive, submitToGoLive } from '../../services/publishing';
import { emitSystemEvent, itemsApproved, itemsScheduled } from '../../state/actions/system';
import { getComputedPublishingTarget, getDateScheduled } from '../../utils/detailedItem';
import { FormattedMessage } from 'react-intl';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { createPresenceTable } from '../../utils/array';
import { fetchDependencies, FetchDependenciesResponse } from '../../services/dependencies';
import { PublishDialogUI } from './PublishDialogUI';
import useStyles from './styles';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useSelection } from '../../utils/hooks/useSelection';
import { isBlank } from '../../utils/string';
import { useLocale } from '../../utils/hooks/useLocale';
import { getUserTimeZone } from '../../utils/datetime';
import { DateChangeData } from '../Controls/DateTimePicker';
import { pluckProps } from '../../utils/object';
import moment from 'moment-timezone';
import { updatePublishDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';

export function PublishDialogContainer(props: PublishDialogContainerProps) {
  const { items, scheduling = 'now', onSuccess, onClose, isSubmitting } = props;
  const {
    dateTimeFormatOptions: { timeZone = getUserTimeZone() }
  } = useLocale();
  const [state, setState] = useSpreadState<InternalDialogState>({
    emailOnApprove: false,
    requestApproval: false,
    publishingTarget: '',
    submissionComment: '',
    scheduling,
    scheduledDateTime: ((date) => {
      date.setSeconds(0);
      return moment(date).tz(timeZone).format();
    })(new Date()),
    publishingChannel: null,
    scheduledTimeZone: timeZone,
    error: null,
    fetchingDependencies: false
  });
  const [publishingTargets, setPublishingTargets] = useState<PublishingTarget[]>(null);
  const [publishingTargetsStatus, setPublishingTargetsStatus] = useState('Loading');
  const [selectedItems, setSelectedItems] = useState<LookupTable<boolean>>({});
  const [dependencies, setDependencies] = useState<FetchDependenciesResponse>(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const siteId = useActiveSiteId();
  const permissionsBySite = usePermissionsBySite();
  const myPermissions = permissionsBySite[siteId];
  const hasPublishPermission = myPermissions.includes('publish');
  const dispatch = useDispatch();
  const submissionCommentRequired = useSelection((state) => state.uiConfig.publishing.publishCommentRequired);

  const user = useActiveUser();
  const submit = !hasPublishPermission || state.requestApproval ? submitToGoLive : goLive;
  const propagateAction = !hasPublishPermission || state.requestApproval ? itemsScheduled : itemsApproved;
  const { mixedPublishingTargets, mixedPublishingDates, dateScheduled, publishingTarget } = useMemo(() => {
    const state = {
      mixedPublishingTargets: false,
      mixedPublishingDates: false,
      dateScheduled: null,
      publishingTarget: null
    };

    let itemsChecked = items.filter((item) => selectedItems[item.path]);

    if (itemsChecked.length === 0) {
      state.publishingTarget = '';
      return state;
    }

    // region Discover mixed targets and/or schedules and sets the publishingTarget based off the items
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
      if (state.publishingTarget === null && computedTarget !== null) {
        state.publishingTarget = computedTarget;
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
    if (publishingTargets?.length) {
      // If there are mixed targets, we want manual user selection of a target.
      // Otherwise, use what was previously found as the target on the selected items.
      if (state.mixedPublishingTargets) {
        state.publishingTarget = '';
      } else {
        // If we haven't found a target by this point, we wish to default the dialog to
        // staging (as long as that target is enabled in the system, which is checked next).
        if (state.publishingTarget === null) {
          state.publishingTarget = 'staging';
        }
        state.publishingTarget = publishingTargets.some((target) => target.name === state.publishingTarget)
          ? state.publishingTarget
          : publishingTargets[0].name;
      }
    } else {
      state.publishingTarget = '';
    }

    return state;
  }, [selectedItems, items, publishingTargets]);

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
      error: state.error,
      submitting: isSubmitting,
      publishingTargets,
      myPermissions
    }),
    [items, state.error, isSubmitting, publishingTargets, myPermissions]
  );

  const resource = useLogicResource<PublishDialogResourceBody, PublishDialogResourceInput>(publishSource, {
    shouldResolve: (source) => Boolean(source.items && source.publishingTargets && myPermissions.length),
    shouldReject: (source) => Boolean(source.error),
    shouldRenew: (source, resource) => source.submitting && resource.complete,
    resultSelector: (source) => pluckProps(source, 'items', 'publishingTargets'),
    errorSelector: (source) => source.error
  });

  useEffect(() => {
    getPublishingChannels(() => {
      setSelectedItems(createPresenceTable(items, true, (item) => item.path));
    });
  }, [getPublishingChannels, items]);

  useEffect(() => {
    setState({ scheduling });
  }, [scheduling, setState]);

  useEffect(() => {
    if (dateScheduled && scheduling !== 'now') {
      setState({
        scheduling: 'custom',
        publishingTarget,
        scheduledDateTime: dateScheduled
      });
    } else if (dateScheduled === null && scheduling === null) {
      setState({
        scheduling: 'now',
        publishingTarget
      });
    } else {
      setState({ publishingTarget });
    }
  }, [dateScheduled, publishingTarget, setState, scheduling]);

  useEffect(() => {
    // Submit button should be disabled:
    setSubmitDisabled(
      // While submitting
      isSubmitting ||
        // When no items are selected
        !Object.values(selectedItems).filter(Boolean).length ||
        // When there are no available/loaded publishing targets
        !publishingTargets?.length ||
        // When no publishing target is selected
        !state.publishingTarget ||
        // If submission comment is required (per config) and blank
        (submissionCommentRequired && isBlank(state.submissionComment))
    );
  }, [
    isSubmitting,
    selectedItems,
    publishingTargets,
    state.publishingTarget,
    state.submissionComment,
    submissionCommentRequired
  ]);

  const handleSubmit = () => {
    const {
      publishingTarget,
      scheduling: schedule,
      emailOnApprove: sendEmail,
      submissionComment,
      scheduledDateTime: scheduledDate
    } = state;

    const items = Object.entries(selectedItems)
      .filter(([, isChecked]) => isChecked)
      .map(([path]) => path);

    const data = {
      ...(!hasPublishPermission || state.requestApproval
        ? { environment: publishingTarget }
        : { publishChannel: publishingTarget }),
      items,
      schedule,
      sendEmail,
      submissionComment,
      ...(schedule === 'custom' ? { scheduledDate } : {})
    };

    dispatch(updatePublishDialog({ isSubmitting: true }));

    submit(siteId, user.username, data).subscribe(
      (response) => {
        dispatch(
          batchActions([
            updatePublishDialog({ isSubmitting: false, hasPendingChanges: false }),
            emitSystemEvent(propagateAction({ targets: items }))
          ])
        );
        onSuccess?.({
          ...response,
          schedule: schedule,
          publishingTarget,
          // @ts-ignore - TODO: Not quite sure if users of this dialog are making use of the `environment` prop name. Should use `publishingTarget` instead.
          environment: publishingTarget,
          type: !hasPublishPermission || state.requestApproval ? 'submit' : 'publish',
          items: items.map((path) => props.items.find((item) => item.path === path))
        });
      },
      (error) => {
        dispatch(updatePublishDialog({ isSubmitting: false }));
      }
    );
  };

  const onItemClicked = (e: any, path: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedItems({ ...selectedItems, [path]: !selectedItems[path] });
  };

  const onSelectAll = () => {
    setSelectedItems(
      items.reduce(
        (checked, item) => {
          checked[item.path] = true;
          return checked;
        },
        { ...selectedItems }
      )
    );
  };

  function onSelectAllSoft() {
    // If one that is not checked is found, check all. Otherwise, uncheck all.
    const check = Boolean(dependencies.softDependencies.find((path) => !selectedItems[path]));
    setSelectedItems(
      dependencies.softDependencies.reduce(
        (nextCheckedSoftDependencies, path) => {
          nextCheckedSoftDependencies[path] = check;
          return nextCheckedSoftDependencies;
        },
        { ...selectedItems }
      )
    );
  }

  function onFetchDependenciesClick() {
    setState({ fetchingDependencies: true });
    fetchDependencies(siteId, paths(selectedItems)).subscribe(
      (items) => {
        setState({ fetchingDependencies: false });
        setDependencies(items);
      },
      () => {
        setState({ fetchingDependencies: false });
        setDependencies(null);
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
        dispatch(
          updatePublishDialog({
            hasPendingChanges: true
          })
        );
        break;
      case 'radio':
        value = e.target.value;
        break;
      case 'dateTimePicker': {
        // @ts-ignore
        const changes: DateChangeData = e.target.value;
        value = changes.dateString;
        setState({
          [e.target.name]: value,
          scheduledTimeZone: changes.timeZoneName
        });
        return;
      }
      default:
        console.error('Publishing argument change event ignored.');
        return;
    }
    setState({ [e.target.name]: value });
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <PublishDialogUI
      resource={resource}
      publishingTargetsStatus={publishingTargetsStatus}
      onPublishingChannelsFailRetry={getPublishingChannels}
      onCloseButtonClick={onCloseButtonClick}
      handleSubmit={handleSubmit}
      state={state}
      isSubmitting={isSubmitting}
      selectedItems={selectedItems}
      onItemClicked={onItemClicked}
      dependencies={dependencies}
      onSelectAll={onSelectAll}
      onSelectAllSoftDependencies={onSelectAllSoft}
      onClickShowAllDeps={onFetchDependenciesClick}
      classes={useStyles()}
      showEmailCheckbox={!hasPublishPermission || state.requestApproval}
      showRequestApproval={hasPublishPermission && items.every((item) => !item.stateMap.submitted)}
      submitLabel={
        state.scheduling === 'custom' ? (
          <FormattedMessage id="words.schedule" defaultMessage="Schedule" />
        ) : !hasPublishPermission || state.requestApproval ? (
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

export default PublishDialogContainer;
