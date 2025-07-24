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

import React from 'react';
import { PublishPackage } from '../../models';
import { EnhancedDialog, EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { FormattedMessage } from 'react-intl';
import BulkCancelPackageDialogContainer from './BulkCancelPackageDialogContainer';
import StandardAction from '../../models/StandardAction';

export interface BulkCancelPackageDialogBaseProps {
	packages?: PublishPackage[];
}

export interface BulkCancelPackageDialogProps extends EnhancedDialogProps, BulkCancelPackageDialogBaseProps {
	onSuccess?(): void;
}

export interface BulkCancelPackageDialogStateProps extends BulkCancelPackageDialogBaseProps, EnhancedDialogState {
	onClose?: StandardAction;
	onClosed?: StandardAction;
	onSuccess?: StandardAction;
}

export function BulkCancelPackageDialog(props: BulkCancelPackageDialogProps) {
	const { packages, onSuccess, isSubmitting, ...enhancedDialogProps } = props;

	return (
		<EnhancedDialog
			fullWidth
			maxWidth="sm"
			{...enhancedDialogProps}
			title={<FormattedMessage defaultMessage="Cancel Packages" />}
			subtitle={<FormattedMessage defaultMessage="Confirm the cancellation of the following packages?" />}
			isSubmitting={isSubmitting}
		>
			<BulkCancelPackageDialogContainer packages={packages} onSuccess={onSuccess} isSubmitting={isSubmitting} />
		</EnhancedDialog>
	);
}

export default BulkCancelPackageDialog;
