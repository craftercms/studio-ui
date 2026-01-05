/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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
import React, { useCallback, useEffect, useState } from 'react';
import RenameContentDialogContainer from './RenameContentDialogContainer';
import { fetchDependant as fetchDependantService } from '../../services/dependencies';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { parseLegacyItemToContentItem } from '../../utils/content';
import useWithPendingChangesCloseRequest from '../../hooks/useWithPendingChangesCloseRequest';
import { ensureSingleSlash, isBlank } from '../../utils/string';
import { ContentItem } from '../../models';

export interface RenameContentDialogProps extends EnhancedDialogProps {
	path: string;
	value?: string;
	validRenameValue?: string; // Specifies a literal item name value (e.g. 'new-article') that is permitted for renaming content. If the user enters this value, it will be accepted even if it doesn't meet the usual validation criteria.
	// e.g.: If validRenameValue is 'new-article', the user can enter 'new-article' even if it already exists. This allows renaming back to the original item name.
	onRenamed(name: string): void;
}

export function RenameContentDialog(props: RenameContentDialogProps) {
	const { path, value, validRenameValue, onRenamed, ...dialogProps } = props;
	const [dependantItems, setDependantItems] = useState<ContentItem[]>(null);
	const [fetchingDependantItems, setFetchingDependantItems] = useState(false);
	const [error, setError] = useState(null);
	const siteId = useActiveSiteId();
	const pendingChangesCloseRequest = useWithPendingChangesCloseRequest(dialogProps.onClose);

	const fetchDependant = useCallback(() => {
		setFetchingDependantItems(true);
		fetchDependantService(siteId, ensureSingleSlash(`${path}/${value}`)).subscribe({
			next: (response) => {
				const dependants = parseLegacyItemToContentItem(response);
				setDependantItems(dependants);
				setFetchingDependantItems(false);
			},
			error: (response) => {
				if (response.status === 404) {
					setDependantItems([]);
				} else {
					setError(response.response);
				}
				setFetchingDependantItems(false);
			}
		});
	}, [path, value, siteId]);

	useEffect(() => {
		if (!isBlank(value) && !isBlank(path)) {
			fetchDependant();
		}
	}, [fetchDependant, path, value]);

	return (
		<EnhancedDialog
			title={<FormattedMessage defaultMessage="Rename Content" />}
			onWithPendingChangesCloseRequest={pendingChangesCloseRequest}
			maxWidth={dependantItems?.length > 0 ? 'md' : 'xs'}
			{...dialogProps}
		>
			<RenameContentDialogContainer
				path={path}
				value={value}
				validRenameValue={validRenameValue}
				fetchDependant={fetchDependant}
				dependantItems={dependantItems}
				fetchingDependantItems={fetchingDependantItems}
				onRenamed={onRenamed}
				error={error}
			/>
		</EnhancedDialog>
	);
}

export default RenameContentDialog;
