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

import { EnhancedDialog, EnhancedDialogProps } from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import CancelPackageDialogContainer from './CancelPackageDialogContainer';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import StandardAction from '../../models/StandardAction';

export interface CancelPackageDialogBaseProps {
	packageId?: number;
}

export interface CancelPackageDialogProps extends EnhancedDialogProps, CancelPackageDialogBaseProps {
	onSuccess?(): void;
}

export interface CancelPackageDialogStateProps extends CancelPackageDialogBaseProps, EnhancedDialogState {
	onClose?: StandardAction;
	onClosed?: StandardAction;
	onSuccess?: StandardAction;
}

export function CancelPackageDialog(props: CancelPackageDialogProps) {
	const { packageId, onSuccess, isSubmitting, ...enhancedDialogProps } = props;
	return (
		<EnhancedDialog
			fullWidth
			maxWidth="lg"
			{...enhancedDialogProps}
			title={<FormattedMessage defaultMessage="Cancel Package" />}
			isSubmitting={isSubmitting}
		>
			<CancelPackageDialogContainer packageId={packageId} onSuccess={onSuccess} isSubmitting={isSubmitting} />
		</EnhancedDialog>
	);
}

export default CancelPackageDialog;
