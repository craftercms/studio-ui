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

import { ItemStates } from '../../models/Item';
import { FormattedMessage } from 'react-intl';
import * as React from 'react';

export function getPublishingTargetText(state: ItemStates) {
  return state === 'live' ? (
    <FormattedMessage id="itemPublishingTarget.live" defaultMessage="Live" />
  ) : state === 'staged' ? (
    <FormattedMessage id="itemPublishingTarget.staged" defaultMessage="Staged" />
  ) : (
    <FormattedMessage id="itemPublishingTarget.unpublished" defaultMessage="Unpublished" />
  );
}

export function getStateText(state: ItemStates) {
  switch (state) {
    case 'systemProcessing':
      return <FormattedMessage id="itemState.systemProcessing" defaultMessage="System Processing" />;
    case 'locked':
      return <FormattedMessage id="itemState.locked" defaultMessage="Locked" />;
    case 'deleted':
      return <FormattedMessage id="itemState.deleted" defaultMessage="Deleted" />;
    case 'modified':
      return <FormattedMessage id="itemState.modified" defaultMessage="Modified" />;
    case 'scheduled':
      return <FormattedMessage id="itemState.scheduled" defaultMessage="Scheduled" />;
    case 'submitted':
      return <FormattedMessage id="itemState.submitted" defaultMessage="Submitted" />;
    case 'new':
      return <FormattedMessage id="itemState.new" defaultMessage="New" />;
    default:
      return <FormattedMessage id="words.unknown" defaultMessage="Unknown" />;
  }
}
