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

import React, { useCallback, useEffect, useState } from 'react';
import { EnhancedDialog } from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import { RenameAssetDialogProps } from './utils';
import { RenameAssetDialogContainer } from './RenameAssetDialogContainer';
import { useDispatch } from 'react-redux';
import { fetchDependant as fetchDependantService } from '../../services/dependencies';
import { parseLegacyItemToContentItem } from '../../utils/content';
import { pushDialog } from '../../state/actions/dialogStack';
import { createComponentId } from '../../utils/system';
import useActiveSiteId from '../../hooks/useActiveSiteId';

export function RenameAssetDialog(props: RenameAssetDialogProps) {
	const { path, allowBraces, value, onRenamed, type, error, ...rest } = props;
	const siteId = useActiveSiteId();
	const [dependantItems, setDependantItems] = useState([]);
	const [fetchingDependantItems, setFetchingDependantItems] = useState(false);
	const dispatch = useDispatch();

	const fetchDependant = useCallback(() => {
		fetchDependantService(siteId, path).subscribe({
			next: (response) => {
				setDependantItems(parseLegacyItemToContentItem(response));
				setFetchingDependantItems(false);
			},
			error: ({ response }) => {
				setFetchingDependantItems(false);
				dispatch(
					pushDialog({
						component: createComponentId('ErrorDialog'),
						props: { error: response.response }
					})
				);
			}
		});
	}, [dispatch, path, siteId]);

	useEffect(() => {
		setFetchingDependantItems(true);
		fetchDependant();
	}, [fetchDependant]);

	return (
		<EnhancedDialog
			title={<FormattedMessage defaultMessage="Rename Asset" />}
			maxWidth={dependantItems?.length > 0 ? 'md' : 'xs'}
			{...rest}
		>
			<RenameAssetDialogContainer
				path={path}
				allowBraces={allowBraces}
				value={value}
				type={type}
				fetchDependant={fetchDependant}
				dependantItems={dependantItems}
				fetchingDependantItems={fetchingDependantItems}
				onRenamed={onRenamed}
				error={error}
			/>
		</EnhancedDialog>
	);
}

export default RenameAssetDialog;
