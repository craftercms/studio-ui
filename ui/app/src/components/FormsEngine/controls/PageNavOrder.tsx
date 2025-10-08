/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import type { ControlProps } from '../types';
import FormsEngineField from '../components/FormsEngineField';
import React, { useEffect, useId, useState } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { FormattedMessage, useIntl } from 'react-intl';
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { EnhancedDialog } from '../../EnhancedDialog';
import useEnhancedDialogState from '../../../hooks/useEnhancedDialogState';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { getNavItemsOrder, type PageNavItem, reorderNavItems } from '../../../services/content';
import { DialogBody } from '../../DialogBody';
import Typography from '@mui/material/Typography';
import useSpreadState from '../../../hooks/useSpreadState';
import { ApiResponse } from '../../../models';
import { SortableList, type TItem } from '../components/SortableList';
import { useItemContext } from '../lib/formsEngineContext';
import { DialogFooter } from '../../DialogFooter';
import SecondaryButton from '../../SecondaryButton';
import PrimaryButton from '../../PrimaryButton';
import { pushErrorDialog } from '../../../utils/system';
import { useDispatch } from 'react-redux';
import Paper from '@mui/material/Paper';
import useUpdateRefs from '../../../hooks/useUpdateRefs';
import { showSystemNotification } from '../../../state/actions/system';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';

export interface PageNavOrderProps extends ControlProps {
	value: string;
}

export function PageNavOrder(props: PageNavOrderProps) {
	const { value, setValue, field, autoFocus, readonly } = props;
	const [initialValue] = useState(value);
	const htmlId = useId();
	const orderDialogState = useEnhancedDialogState();
	const { formatMessage } = useIntl();
	const [pagesOrderState, setPagesOrderState] = useSpreadState<{
		fetching: boolean;
		error: ApiResponse;
		order: TItem<PageNavItem>[] | null;
	}>({
		fetching: false,
		error: null,
		order: null
	});
	const contextItem = useItemContext();
	const currentPath = contextItem?.path;
	const siteId = useActiveSiteId();
	const dispatch = useDispatch();
	const effectRefs = useUpdateRefs({
		initialValue,
		contextItem
	});

	useEffect(() => {
		if (currentPath) {
			setPagesOrderState({ fetching: true, error: null });
			getNavItemsOrder(siteId, currentPath).subscribe({
				next: (order) => {
					const newOrder = createSortableItemList(order);
					// If the initialValue is false, then it means that we'll be adding this page to the navigation (since it won't
					// be in the order response).
					if (!effectRefs.current.initialValue) {
						newOrder.push({
							key: currentPath,
							value: effectRefs.current.contextItem?.label || currentPath
						});
					}
					setPagesOrderState({ fetching: false, order: newOrder });
				},
				error: ({ response }) => setPagesOrderState({ fetching: false, error: response.response })
			});
		}
	}, [siteId, setPagesOrderState, currentPath, effectRefs]);

	const handleChange = (event: SelectChangeEvent) => {
		setValue(event.target.value === 'true');
	};
	const handleUpdateOrder = () => {
		orderDialogState.onClose();

		const currentItemIndex = pagesOrderState.order?.findIndex((item) => item.key === currentPath);
		const previewItemIndex = currentItemIndex - 1;
		const nextItemIndex = currentItemIndex + 1;
		const previewItemPath = previewItemIndex >= 0 ? pagesOrderState.order?.[previewItemIndex]?.key : null;
		const nextItemPath =
			nextItemIndex < (pagesOrderState.order?.length ?? 0) ? pagesOrderState.order?.[nextItemIndex]?.key : null;
		// TODO: Waiting for the new v2 API to handle reordering the full items list. Currently, this only reorders
		//  the current item, and no other items can be re-arranged.
		reorderNavItems(siteId, currentPath, previewItemPath, nextItemPath).subscribe({
			next: () => {
				dispatch(showSystemNotification({ message: formatMessage({ defaultMessage: 'Navigation items reordered.' }) }));
			},
			error: ({ response }) => {
				dispatch(pushErrorDialog({ props: { error: response.response } }));
			}
		});
	};

	return (
		<FormsEngineField htmlFor={htmlId} field={field}>
			<Box display="flex" flexDirection="row" gap={2} justifyContent="space-between">
				<RadioGroup row value={value} onChange={handleChange} sx={{ display: 'inline-flex' }} autoFocus={autoFocus}>
					<FormControlLabel value="true" control={<Radio />} label={<FormattedMessage defaultMessage="Yes" />} />
					<FormControlLabel value="false" control={<Radio />} label={<FormattedMessage defaultMessage="No" />} />
				</RadioGroup>

				{value && (
					<Button
						variant="text"
						startIcon={<ChangeCircleOutlinedIcon />}
						onClick={() => orderDialogState.onOpen()}
						disabled={readonly}
						sx={{ flex: 'none' }}
					>
						<FormattedMessage defaultMessage="Edit Order" />
					</Button>
				)}
			</Box>
			<EnhancedDialog
				open={orderDialogState.open}
				onClose={orderDialogState.onClose}
				maxWidth="sm"
				title={<FormattedMessage defaultMessage="Edit Navigation Order" />}
			>
				<DialogBody>
					<Typography variant="body2">
						<FormattedMessage
							defaultMessage={'Drag and Drop "{page}" to the desired location in the navigation structure.'}
							values={{
								page: contextItem.label
							}}
						/>
					</Typography>
					{/* TODO: Remove after switching to API v2. */}
					<Alert severity="warning" sx={{ mt: 2 }}>
						Development draft. Waiting for 'content/reorder-items' new v2 API to be implemented. The new API will handle
						reordering the full items list.
					</Alert>
					<Paper elevation={0} sx={{ mt: 2 }}>
						<SortableList
							items={pagesOrderState.order}
							selectedItemId={currentPath}
							onlySelectedSortable={true}
							onChange={(fields: TItem<PageNavItem>[]) =>
								setPagesOrderState({
									order: fields
								})
							}
						/>
					</Paper>
				</DialogBody>
				<DialogFooter>
					<SecondaryButton onClick={() => orderDialogState.onClose()}>
						<FormattedMessage defaultMessage="Cancel" />
					</SecondaryButton>
					<PrimaryButton autoFocus onClick={handleUpdateOrder}>
						<FormattedMessage defaultMessage="Save" />
					</PrimaryButton>
				</DialogFooter>
			</EnhancedDialog>
		</FormsEngineField>
	);
}

/**
 * Converts an array of `PageNavItem` objects into an array of sortable items (`TItem<PageNavItem>`).
 * This function is used to transform navigation items into a format compatible with the `SortableList` component.
 *
 * @param order {PageNavItem[]} - The array of navigation items to be converted.
 * @returns {TItem<PageNavItem>[]} - The transformed array of sortable items.
 */
function createSortableItemList(order: PageNavItem[]): TItem<PageNavItem>[] {
	return order.map((item) => ({
		key: item.id,
		value: item.name,
		data: item
	}));
}

export default PageNavOrder;
