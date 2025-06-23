/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import { IntlFormatters } from 'react-intl';
import * as React from 'react';

export function getItemPublishingTargetText(
	stateMap: ItemStateMap,
	formatMessage: IntlFormatters['formatMessage']
): string {
	return stateMap.live
		? formatMessage({ defaultMessage: 'Live' })
		: stateMap.staged
			? formatMessage({ defaultMessage: 'Staged' })
			: formatMessage({ defaultMessage: 'Unpublished' });
}

export function getItemStateText(
	stateMap: ItemStateMap,
	formatMessage: IntlFormatters['formatMessage'],
	values?: { user: string }
): string {
	const map: { [key in ItemStates]: string } = {
		new: formatMessage({ defaultMessage: 'New' }),
		modified: formatMessage({ defaultMessage: 'Modified' }),
		deleted: formatMessage({ defaultMessage: 'Deleted' }),
		locked: values?.user
			? (formatMessage({ defaultMessage: 'Locked by {user}' }, { user: values.user }) as string)
			: formatMessage({ defaultMessage: 'Locked' }),
		systemProcessing: formatMessage({ defaultMessage: 'System Processing' }),
		submitted: formatMessage({ defaultMessage: 'Submitted' }),
		scheduled: formatMessage({ defaultMessage: 'Scheduled' }),
		publishing: formatMessage({ defaultMessage: 'Publishing' }),
		submittedToStaging: stateMap.submitted
			? formatMessage({ defaultMessage: 'Submitted to staging' })
			: formatMessage({ defaultMessage: 'Scheduled to staging' }),
		submittedToLive: stateMap.submitted
			? formatMessage({ defaultMessage: 'Submitted to live' })
			: formatMessage({ defaultMessage: 'Scheduled to live' }),
		staged: null,
		live: null,
		disabled: formatMessage({ defaultMessage: 'Disabled' }),
		translationUpToDate: null,
		translationPending: null,
		translationInProgress: null
	};

	return map[getItemStateId(stateMap)] ?? formatMessage({ defaultMessage: 'Not in workflow' });
}

// Disable case was removed from the switch statement to allow for rendering both workflow state and disabled status.
// (by using DisabledItemIcon)
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

export function isInWorkflow(stateMap: ItemStateMap): boolean {
	return stateMap
		? stateMap.deleted ||
				stateMap.disabled ||
				stateMap.systemProcessing ||
				stateMap.locked ||
				stateMap.submittedToLive ||
				stateMap.submittedToStaging ||
				stateMap.submitted ||
				stateMap.scheduled ||
				stateMap.new ||
				stateMap.modified ||
				stateMap.publishing
		: false;
}
