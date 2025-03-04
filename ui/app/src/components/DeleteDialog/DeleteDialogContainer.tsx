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

import React, { useEffect, useState } from 'react';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import {
	fetchDeleteDependencies,
	fetchDeleteDependenciesComplete,
	showEditDialog,
	updateDeleteDialog
} from '../../state/actions/dialogs';
import { deleteItems } from '../../services/content';
import { DeleteDialogUI } from './DeleteDialogUI';
import { DeleteDialogContainerProps, DeleteDialogContentUIProps } from './utils';
import { useSelection } from '../../hooks/useSelection';
import LookupTable from '../../models/LookupTable';
import { createPresenceTable } from '../../utils/array';
import { DetailedItem } from '../../models/Item';
import { isBlank } from '../../utils/string';
import { ApiResponse } from '../../models';
import useFetchSandboxItems from '../../hooks/useFetchSandboxItems';

function createCheckedList(selectedItems: LookupTable<boolean>, excludedPaths?: string[]) {
	return Object.entries(selectedItems)
		.filter(([path, isChecked]) => isChecked && !excludedPaths?.includes(path))
		.map(([path]) => path);
}

function createCheckedLookup(items: Array<DetailedItem | string>, setChecked = true) {
	const isString = typeof items[0] === 'string';
	return items.reduce((checked, item) => {
		// @ts-ignore - `isString` above pre-checks the type, typescript doesn't realise this is safe by this point.
		checked[isString ? item : item.path] = setChecked;
		return checked;
	}, {});
}

export function DeleteDialogContainer(props: DeleteDialogContainerProps) {
	const { items, onClose, isSubmitting, onSuccess, isFetching, childItems, dependentItems, error } = props;
	const [title, setTitle] = useState('');
	const [comment, setComment] = useState('');
	const [submitError, setSubmitError] = useState<ApiResponse>(null);
	const site = useActiveSiteId();
	const isCommentRequired = useSelection((state) => state.uiConfig.publishing.deleteCommentRequired);
	const [selectedItems, setSelectedItems] = useState<LookupTable<boolean>>({});
	const dispatch = useDispatch();
	const [confirmChecked, setConfirmChecked] = useState(false);
	const submitDisabled =
		isSubmitting ||
		Object.values(selectedItems).length === 0 ||
		(isCommentRequired && isBlank(comment)) ||
		isBlank(title) ||
		!confirmChecked;
	const authoringBase = useSelection((state) => state.env.authoringBase);
	useFetchSandboxItems(dependentItems ?? []);

	const onSubmit = () => {
		const paths = createCheckedList(selectedItems);
		dispatch(updateDeleteDialog({ isSubmitting: true }));
		deleteItems(site, paths, title, comment).subscribe({
			next() {
				dispatch(updateDeleteDialog({ isSubmitting: false, hasPendingChanges: false }));
				onSuccess?.({
					items: paths.map((path) => items.find((item) => item.path === path))
				});
			},
			error({ response }) {
				dispatch(updateDeleteDialog({ isSubmitting: false }));
				setSubmitError(response.response);
			}
		});
	};

	const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

	const onInputChange: DeleteDialogContentUIProps['onInputChange'] = (e, fieldId) => {
		dispatch(updateDeleteDialog({ hasPendingChanges: true }));
		switch (fieldId) {
			case 'title':
				setTitle(e.target.value);
				break;
			case 'comment':
				setComment(e.target.value);
				break;
			default:
				break;
		}
	};

	const fetchOrCleanDependencies = (nextChecked) => {
		let paths = createCheckedList(nextChecked);
		if (paths.length) {
			dispatch(fetchDeleteDependencies({ paths }));
		} else {
			dispatch(fetchDeleteDependenciesComplete({ dependentItems: [], childItems: [] }));
		}
	};

	const onItemClicked = (e, path) => {
		let nextChecked = { ...selectedItems, [path]: !selectedItems[path] };
		// Clean the state, only keep checked items
		!nextChecked[path] && delete nextChecked[path];
		// If there aren't any checked main items, uncheck everything.
		const checkedMainItems = createCheckedList(nextChecked, dependentItems);
		checkedMainItems.length === 0 && (nextChecked = {});
		fetchOrCleanDependencies(nextChecked);
		setSelectedItems(nextChecked);
	};

	const onSelectAllClicked = () => {
		const setChecked = Boolean(items.find((item) => !selectedItems[item.path]));
		// If the "select all" checkbox is working to check all, then clean all `false`s and
		// check all main items. Otherwise, if it's working to uncheck all, everything should get
		// unchecked (both main & dependant items).
		const nextChecked = setChecked
			? {
					...createPresenceTable(
						createCheckedList(
							selectedItems,
							items.map((item) => item.path)
						)
					),
					...createCheckedLookup(items, setChecked)
				}
			: {};
		fetchOrCleanDependencies(nextChecked);
		setSelectedItems(nextChecked);
	};

	const onConfirmChange = (e) => {
		setConfirmChecked(e.target.checked);
	};

	const onEditDependantClick = (e, path) => {
		let paths = createCheckedList(selectedItems, dependentItems);
		// We don't have a good way of knowing if the dependant item cleared it's dependency and if it's checked, it
		// needs to get removed from selectedItems after the edit is complete and the item is not even listed as a dependency.
		// Until we find a better way around that, will uncheck when the edit button is pressed.
		selectedItems[path] && onItemClicked(null, path);
		dispatch(showEditDialog({ path, authoringBase, site, onSaveSuccess: fetchDeleteDependencies({ paths }) }));
	};

	useEffect(() => {
		if (items.length) {
			const nextChecked = createPresenceTable(items, true, (item) => item.path);
			setSelectedItems(nextChecked);
			dispatch(fetchDeleteDependencies({ paths: items.map((i) => i.path) }));
		}
	}, [dispatch, items]);

	return (
		<DeleteDialogUI
			items={items}
			childItems={childItems}
			dependentItems={dependentItems}
			selectedItems={selectedItems}
			error={error}
			submitError={submitError}
			setSubmitError={setSubmitError}
			isFetching={isFetching}
			title={title}
			comment={comment}
			onInputChange={onInputChange}
			isDisabled={isSubmitting}
			isSubmitting={isSubmitting}
			onSubmit={onSubmit}
			onCloseButtonClick={onCloseButtonClick}
			isCommentRequired={isCommentRequired}
			isSubmitButtonDisabled={submitDisabled}
			onItemClicked={onItemClicked}
			onSelectAllClicked={onSelectAllClicked}
			onConfirmDeleteChange={onConfirmChange}
			isConfirmDeleteChecked={confirmChecked}
			onEditDependantClick={onEditDependantClick}
		/>
	);
}

export default DeleteDialogContainer;
