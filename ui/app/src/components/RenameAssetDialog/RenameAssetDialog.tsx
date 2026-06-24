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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EnhancedDialog } from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import { RenameAssetDialogProps } from './utils';
import { RenameAssetDialogContainer } from './RenameAssetDialogContainer';
import { useDispatch } from 'react-redux';
import { fetchDependant as fetchDependantService } from '../../services/dependencies';
import { pushErrorDialog } from '../../utils/system';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import type { Subscription } from 'rxjs';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import { contentEvent } from '../../state/actions/system';
import useUpdateRefs from '../../hooks/useUpdateRefs';

export function RenameAssetDialog(props: RenameAssetDialogProps) {
	const { item, allowBraces, onRenamed, type, error, ...rest } = props;
	const siteId = useActiveSiteId();
	const [dependantItems, setDependantItems] = useState([]);
	const [fetchingDependantItems, setFetchingDependantItems] = useState(false);
	const subRef = useRef<Subscription | null>(null);
	const dispatch = useDispatch();
	const refs = useUpdateRefs({
		dependantItems
	});

	const fetchDependant = useCallback(() => {
		if (item) {
			setFetchingDependantItems(true);
			subRef.current?.unsubscribe();
			subRef.current = fetchDependantService(siteId, item.path).subscribe({
				next: (response) => {
					setDependantItems(response);
					setFetchingDependantItems(false);
				},
				error: ({ response }) => {
					setFetchingDependantItems(false);
					dispatch(pushErrorDialog({ props: { error: response.response } }));
				}
			});
		}
	}, [dispatch, item, siteId]);

	useEffect(() => {
		fetchDependant();
		const hostToHost$ = getHostToHostBus();
		const subscription = hostToHost$
			.pipe(
				filter((e) => {
					const isContentEvent = e.type === contentEvent.type;
					if (!isContentEvent) return false;
					return refs.current.dependantItems.some((dependant) => dependant.path === e.payload?.targetPath);
				})
			)
			.subscribe(() => {
				fetchDependant();
			});
		return () => {
			subRef.current?.unsubscribe();
			subscription.unsubscribe();
		};
	}, [fetchDependant, refs]);

	return (
		<EnhancedDialog
			title={<FormattedMessage defaultMessage="Rename Asset" />}
			maxWidth={dependantItems?.length > 0 ? 'md' : 'xs'}
			{...rest}
		>
			<RenameAssetDialogContainer
				item={item}
				allowBraces={allowBraces}
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
