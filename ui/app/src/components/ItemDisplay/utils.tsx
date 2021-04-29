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

import { ItemStateMap } from '../../models/Item';
import { FormattedMessage } from 'react-intl';
import * as React from 'react';

export function getItemPublishingTargetText(stateMap: ItemStateMap) {
  return stateMap.live ? (
    <FormattedMessage id="itemPublishingTarget.live" defaultMessage="Live" />
  ) : stateMap.staged ? (
    <FormattedMessage id="itemPublishingTarget.staged" defaultMessage="Staged" />
  ) : (
    <FormattedMessage id="itemPublishingTarget.unpublished" defaultMessage="Unpublished" />
  );
}

export function getItemStateText(stateMap: ItemStateMap) {
  switch (true) {
    case stateMap.modified:
      return <FormattedMessage id="itemState.modified" defaultMessage="Modified" />;
    case stateMap.deleted:
      return <FormattedMessage id="itemState.deleted" defaultMessage="Deleted" />;
    case stateMap.locked:
      return <FormattedMessage id="itemState.locked" defaultMessage="Locked" />;
    case stateMap.systemProcessing:
      return <FormattedMessage id="itemState.systemProcessing" defaultMessage="System Processing" />;
    case stateMap.submitted:
      return <FormattedMessage id="itemState.submitted" defaultMessage="Submitted" />;
    case stateMap.scheduled:
      return <FormattedMessage id="itemState.scheduled" defaultMessage="Scheduled" />;
    case stateMap.new:
      return <FormattedMessage id="itemState.new" defaultMessage="New" />;
    default:
      return <FormattedMessage id="words.unknown" defaultMessage="Unknown" />;
  }
}
