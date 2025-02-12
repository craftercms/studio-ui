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

import { defineMessages } from 'react-intl';
import { PackageActions, PublishPackage } from '../models';
import { ContextMenuOptionDescriptor } from './itemActions';
import { ContextMenuOption } from '../components';
import { createPresenceTable } from './array';
import { Action, Dispatch } from 'redux';
import {
	closeBulkCancelPackageDialog,
	closeCancelPackageDialog,
	closePublishingPackageResubmitDialog,
	closePublishingPackageReviewDialog,
	showBulkCancelPackageDialog,
	showCancelPackageDialog,
	showPublishingPackageResubmitDialog,
	showPublishingPackageReviewDialog
} from '../state/actions/dialogs';
import { batchActions } from '../state/actions/misc';
import { hasApproveAction, hasCancelAction, hasRejectAction, hasResubmitAction } from './content';

const translations = defineMessages({
	review: {
		defaultMessage: 'Review'
	},
	resubmit: {
		defaultMessage: 'Resubmit'
	},
	promote: {
		defaultMessage: 'Promote'
	},
	cancel: {
		defaultMessage: 'Cancel'
	}
});

const unparsedOptions: Record<PackageActions, ContextMenuOptionDescriptor<PackageActions>> = {
	review: {
		id: 'review',
		label: translations.review
	},
	resubmit: {
		id: 'resubmit',
		label: translations.resubmit
	},
	promote: {
		id: 'promote',
		label: translations.promote
	},
	cancel: {
		id: 'cancel',
		label: translations.cancel
	}
};

export const allPackageActions = Object.keys(unparsedOptions);

export const generatePackageOptions = (
	packages: PublishPackage[],
	options?: {
		includeOnly?: PackageActions[];
	}
): ContextMenuOption[] => {
	const actionsToInclude = createPresenceTable(options?.includeOnly ?? allPackageActions) as Record<
		PackageActions,
		boolean
	>;
	const packageOptions = [];
	if (packages?.length) {
		const packagesHaveCancelAction = packages.every((pkg) => hasCancelAction(pkg.availableActions));
		if (packages?.length === 1) {
			const pkg = packages[0];
			if (
				(hasApproveAction(pkg.availableActions) || hasRejectAction(pkg.availableActions)) &&
				pkg.approvalState === 'SUBMITTED' &&
				actionsToInclude.review
			) {
				packageOptions.push(unparsedOptions.review);
			}
			if (hasResubmitAction(pkg.availableActions) && actionsToInclude.resubmit) {
				if (pkg.target === 'staging' && pkg.approvalState === 'APPROVED') {
					// Promote is a virtual action, it's shown when the package is approved and the target is staging
					packageOptions.push(unparsedOptions.promote);
				} else {
					packageOptions.push(unparsedOptions.resubmit);
				}
			}
		}
		if (packagesHaveCancelAction && actionsToInclude.cancel) {
			packageOptions.push(unparsedOptions.cancel);
		}
	}
	return packageOptions;
};

export const packageActionDispatcher = ({
	pkg,
	option,
	dispatch,
	onActionSuccess
}: {
	pkg: PublishPackage | PublishPackage[];
	option: PackageActions;
	dispatch: Dispatch;
	onActionSuccess?: Action;
}) => {
	switch (option) {
		case 'review':
			dispatch(
				showPublishingPackageReviewDialog({
					packageId: (pkg as PublishPackage).id,
					onSuccess: batchActions([closePublishingPackageReviewDialog(), onActionSuccess].filter(Boolean))
				})
			);
			break;
		case 'resubmit':
		case 'promote':
			dispatch(
				showPublishingPackageResubmitDialog({
					pkg,
					type: option,
					onSuccess: batchActions([closePublishingPackageResubmitDialog(), onActionSuccess].filter(Boolean))
				})
			);
			break;
		case 'cancel':
			if (Array.isArray(pkg)) {
				dispatch(
					showBulkCancelPackageDialog({
						packages: pkg,
						onSuccess: batchActions([closeBulkCancelPackageDialog(), onActionSuccess].filter(Boolean))
					})
				);
			} else {
				dispatch(
					showCancelPackageDialog({
						packageId: pkg.id,
						onSuccess: batchActions([closeCancelPackageDialog(), onActionSuccess].filter(Boolean))
					})
				);
			}
			break;
		default:
			break;
	}
};
