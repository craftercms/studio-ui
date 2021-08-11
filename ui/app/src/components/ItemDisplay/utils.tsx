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

import { ItemStateMap, ItemStates } from '../../models/Item';
import { FormattedMessage } from 'react-intl';
import * as React from 'react';

export function getItemPublishingTargetText(stateMap: ItemStateMap) {
  return stateMap.live ? (
    <FormattedMessage id="words.live" defaultMessage="Live" />
  ) : stateMap.staged ? (
    <FormattedMessage id="words.staged" defaultMessage="Staged" />
  ) : (
    <FormattedMessage id="words.unpublished" defaultMessage="Unpublished" />
  );
}

export function getItemStateText(stateMap: ItemStateMap) {
  let map: { [key in ItemStates]: any };
  map = {
    new: () => <FormattedMessage id="itemState.new" defaultMessage="New" />,
    modified: () => <FormattedMessage id="itemState.modified" defaultMessage="Modified" />,
    deleted: () => <FormattedMessage id="itemState.deleted" defaultMessage="Deleted" />,
    locked: () => <FormattedMessage id="itemState.locked" defaultMessage="Locked" />,
    systemProcessing: () => <FormattedMessage id="itemState.systemProcessing" defaultMessage="System Processing" />,
    submitted: () => <FormattedMessage id="itemState.submitted" defaultMessage="Submitted" />,
    scheduled: () => <FormattedMessage id="itemState.scheduled" defaultMessage="Scheduled" />,
    publishing: () => <FormattedMessage id="itemState.publishing" defaultMessage="Publishing" />,
    submittedToStaging: () =>
      stateMap.submitted ? (
        <FormattedMessage id="itemState.submittedToStaging" defaultMessage="Submitted to staging" />
      ) : (
        <FormattedMessage id="itemState.scheduledForStaging" defaultMessage="Scheduled for staging" />
      ),
    submittedToLive: () =>
      stateMap.scheduled ? (
        <FormattedMessage id="itemState.scheduledToGoLive" defaultMessage="Scheduled for live" />
      ) : (
        <FormattedMessage id="itemState.submittedToLive" defaultMessage="Submitted for live" />
      ),
    staged: null,
    live: null,
    disabled: () => <FormattedMessage id="itemState.disabled" defaultMessage="Disabled" />,
    translationUpToDate: null,
    translationPending: null,
    translationInProgress: null
  };
  return map[getItemStateId(stateMap)]?.() ?? <FormattedMessage id="words.unknown" defaultMessage="Unknown" />;
}

export function getItemStateId(stateMap: ItemStateMap): ItemStates {
  switch (true) {
    case stateMap.deleted:
      return 'deleted';
    case stateMap.systemProcessing:
      return 'systemProcessing';
    case stateMap.locked:
      return 'locked';
    case stateMap.submittedToLive:
      return 'submittedToLive';
    case stateMap.submittedToStaging:
      return 'submittedToStaging';
    case stateMap.submitted:
      return 'submitted';
    case stateMap.scheduled:
      return 'scheduled';
    case stateMap.new:
      return 'new';
    case stateMap.modified:
      return 'modified';
    case stateMap.publishing:
      return 'publishing';
    case stateMap.staged:
      return 'staged';
    case stateMap.live:
      return 'live';
    case stateMap.disabled:
      return 'disabled';
    case stateMap.translationUpToDate:
      return 'translationUpToDate';
    case stateMap.translationPending:
      return 'translationPending';
    case stateMap.translationInProgress:
      return 'translationInProgress';
    default:
      return null;
  }
  // region Compiler hints
  // This var below is simply means for typescript to complain if we ever add/remove states; so the compiler
  // complains and we can come edit the above `switch` to make sure all states are covered.
  // eslint-disable-next-line no-unreachable,@typescript-eslint/no-unused-vars
  const control: ItemStateMap = {
    new: false,
    modified: false,
    deleted: false,
    locked: false,
    systemProcessing: false,
    submitted: false,
    scheduled: false,
    publishing: false,
    submittedToStaging: false,
    submittedToLive: false,
    staged: false,
    live: false,
    disabled: false,
    translationUpToDate: false,
    translationPending: false,
    translationInProgress: false
  };
  // endregion
}
