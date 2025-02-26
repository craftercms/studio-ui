/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import {
	CANCELLED_MASK,
	COMPLETED_MASK,
	LIVE_COMPLETED_WITH_ERRORS_MASK,
	LIVE_FAILED_MASK,
	LIVE_SUCCESS_MASK,
	PROCESSING_MASK,
	READY_MASK,
	STAGING_COMPLETED_WITH_ERRORS_MASK,
	STAGING_FAILED_MASK,
	STAGING_SUCCESS_MASK
} from '../../utils/constants';

export const isReady = (state: number) => Boolean(state & READY_MASK);
export const isProcessing = (state: number) => Boolean(state & PROCESSING_MASK);
export const isLiveSuccess = (state: number) => Boolean(state & LIVE_SUCCESS_MASK);
export const isLiveCompletedWithErrors = (state: number) => Boolean(state & LIVE_COMPLETED_WITH_ERRORS_MASK);
export const isLiveFailed = (state: number) => Boolean(state & LIVE_FAILED_MASK);
export const isStagingSuccess = (state: number) => Boolean(state & STAGING_SUCCESS_MASK);
export const isStagingCompletedWithErrors = (state) => Boolean(state & STAGING_COMPLETED_WITH_ERRORS_MASK);
export const isStagingFailed = (state: number) => Boolean(state & STAGING_FAILED_MASK);
export const isCompleted = (state: number) => Boolean(state & COMPLETED_MASK);
export const isCancelled = (state: number) => Boolean(state & CANCELLED_MASK);

export type PackageState =
	| 'ready'
	| 'processing'
	| 'liveSuccess'
	| 'liveCompletedWithErrors'
	| 'liveFailed'
	| 'stagingSuccess'
	| 'stagingCompletedWithErrors'
	| 'stagingFailed'
	| 'completed'
	| 'cancelled';

export const packageStatesMap = {
	ready: { mask: READY_MASK, validation: isReady, state: 'READY' },
	processing: { mask: PROCESSING_MASK, validation: isProcessing, state: 'PROCESSING' },
	liveSuccess: { mask: LIVE_SUCCESS_MASK, validation: isLiveSuccess, state: 'LIVE_SUCCESS' },
	liveCompletedWithErrors: {
		mask: LIVE_COMPLETED_WITH_ERRORS_MASK,
		validation: isLiveCompletedWithErrors,
		state: 'LIVE_COMPLETED_WITH_ERRORS'
	},
	liveFailed: { mask: LIVE_FAILED_MASK, validation: isLiveFailed, state: 'LIVE_FAILED' },
	stagingSuccess: { mask: STAGING_SUCCESS_MASK, validation: isStagingSuccess, state: 'STAGING_SUCCESS' },
	stagingCompletedWithErrors: {
		mask: STAGING_COMPLETED_WITH_ERRORS_MASK,
		validation: isStagingCompletedWithErrors,
		state: 'STAGING_COMPLETED_WITH_ERRORS'
	},
	stagingFailed: { mask: STAGING_FAILED_MASK, validation: isStagingFailed, state: 'STAGING_FAILED' },
	completed: { mask: COMPLETED_MASK, validation: isCompleted, state: 'COMPLETED' },
	cancelled: { mask: CANCELLED_MASK, validation: isCancelled, state: 'CANCELLED' }
};

// Utility function to get the state label of a package
export function getPackageStateLabel(state: number): string {
	const states = [];
	for (const key in packageStatesMap) {
		if (packageStatesMap[key].validation(state)) {
			states.push(packageStatesMap[key].state);
		}
	}
	return states.join(', ');
}
