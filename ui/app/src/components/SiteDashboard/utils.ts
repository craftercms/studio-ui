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

import { PREVIEW_URL_PATH, UNDEFINED } from '../../utils/constants';
import { Dispatch, SetStateAction, useMemo } from 'react';
import useSpreadState from '../../hooks/useSpreadState';
import { ContentItem, PagedArray, PublishPackage } from '../../models';
import { AnyAction } from '@reduxjs/toolkit';
import { changeCurrentUrl } from '../../state/actions/preview';
import { getSystemLink } from '../../utils/system';
import { IntlShape } from 'react-intl';
import { generateMultipleItemOptions, generateSingleItemOptions } from '../../utils/itemActions';
import { actionsToBeShown } from '../DashletCard/dashletCommons';
import { ActionsBarAction } from '../ActionsBar';
import { isImage, isPdfDocument, isPreviewable, isVideo } from '../PathNavigator/utils';
import { FetchPackagesResponse } from '../../services/publishing';

export interface CommonDashletProps {
	contentHeight?: number | string;
	borderLeftColor?: string;
	onMinimize?(): void;
}

export function parseDashletContentHeight(contentHeight: string | number): number {
	return contentHeight ? parseInt(`${contentHeight}`.replace('px', '')) : UNDEFINED;
}

export interface WithSelectedStateItem {
	id: string | number;
}

export interface WithSelectedState<ItemType extends WithSelectedStateItem = { id: string | number }> {
	items: ItemType[];
	publishingPackages?: Omit<PublishPackage, 'items'>[];
	isAllSelected: boolean;
	hasSelected: boolean;
	selected: Record<string | number, boolean>;
	selectedCount: number;
}

export function useSpreadStateWithSelected<S extends WithSelectedState>(
	initialState: Omit<S, keyof WithSelectedState> & Partial<WithSelectedState>
): [
	S,
	Dispatch<SetStateAction<Partial<S>>>,
	(e, item: WithSelectedStateItem) => void,
	(e) => void,
	<T extends WithSelectedStateItem>(item: T) => boolean
] {
	// @ts-ignore - Unsure how to make the compiler happy. Probably due to the generic ItemType of WithSelectedState.
	const [state, setState] = useSpreadState<S>({
		items: null,
		isAllSelected: false,
		hasSelected: false,
		selected: {},
		selectedCount: 0,
		...initialState
	});
	const { items, selected } = state;
	const onSelectAll = (e) => {
		if (items.length > 0) {
			const nextState: Partial<S> = {};
			if (e.target.checked) {
				// Check all
				nextState.hasSelected = true;
				nextState.selectedCount = items.length;
				nextState.selected = items.reduce((state, item) => {
					state[item.id] = true;
					return state;
				}, {});
				nextState.isAllSelected = true;
			} else {
				// Uncheck all
				nextState.selected = {};
				nextState.hasSelected = false;
				nextState.isAllSelected = false;
				nextState.selectedCount = 0;
			}
			setState(nextState);
		}
	};
	const onSelectItem = (e, item) => {
		let isChecked = !isSelected(item);
		let nextState: Partial<S> = {};
		nextState.selected = { ...selected, [item.id]: isChecked };
		let checkedOnly = Object.values(nextState.selected).filter(Boolean);
		nextState.hasSelected = checkedOnly.length > 0;
		nextState.isAllSelected = items.length && checkedOnly.length === items.length;
		nextState.selectedCount = isChecked ? state.selectedCount + 1 : state.selectedCount - 1;
		setState(nextState);
	};
	const isSelected = (item) => {
		return selected[item.id] ?? false;
	};
	return [state, setState, onSelectItem, onSelectAll, isSelected];
}

export function isPage(systemType) {
	return systemType === 'page';
}

export function previewPage(
	site,
	authoringBase,
	item: ContentItem,
	dispatch: Dispatch<AnyAction>,
	onWidgetModeAction?: Function
) {
	const previewUrl = item.previewUrl;
	const pathname = window.location.pathname;

	if (pathname.includes(PREVIEW_URL_PATH)) {
		dispatch(changeCurrentUrl(previewUrl));
		onWidgetModeAction?.();
	} else {
		window.location.href = getSystemLink({
			page: previewUrl,
			systemLinkId: 'preview',
			site,
			authoringBase
		});
	}
}

export function useSelectionOptions(
	items: ContentItem[],
	formatMessage: IntlShape['formatMessage'],
	selectedCount: number
): ActionsBarAction[] {
	return useMemo(() => {
		return selectedCount
			? selectedCount === 1
				? (generateSingleItemOptions(items[0], formatMessage, {
						includeOnly: actionsToBeShown
					}).flat() as ActionsBarAction[])
				: (generateMultipleItemOptions(items, formatMessage, { includeOnly: actionsToBeShown }) as ActionsBarAction[])
			: [];
	}, [items, formatMessage, selectedCount]);
}

export function getItemViewOption(item) {
	const type = item.systemType;
	let option;
	if (['page', 'component', 'taxonomy', 'levelDescriptor'].includes(type)) {
		option = 'view';
	} else if (isPreviewable(item)) {
		if (isImage(item) || isVideo(item) || isPdfDocument(item.mimeType)) {
			option = 'viewMedia';
		} else {
			option = 'viewCode';
		}
	}
	return option;
}

export function getCurrentPage(offset: number, limit: number) {
	return Math.ceil(offset / limit);
}

export function getPackagesValidatedSelectionState(packages: PagedArray<FetchPackagesResponse>, limit: number) {
	const lastPageWithPackages = packages.length ? Math.ceil(packages.length / limit) - 1 : 0;
	const currentPagePackages = packages.slice(lastPageWithPackages * limit, lastPageWithPackages * limit + limit);

	return {
		items: currentPagePackages,
		offset: limit * lastPageWithPackages,
		total: packages.total,
		loading: false
	};
}

export function getItemsValidatedSelectionState(items, selected, limit) {
	let newItemsById = {};
	// Verify if the number of pages changed
	const lastPageWithItems = items.length ? Math.ceil(items.length / limit) - 1 : 0;
	// Update the itemsById lookup.
	items.forEach((item) => {
		newItemsById[item.id] = item;
	});

	// Update selected items (remove items that no longer exist in the dashlet
	const newSelected = {};
	Object.keys(selected).forEach((selectedKey) => {
		if (newItemsById[selectedKey]) {
			newSelected[selectedKey] = true;
		}
	});
	const newSelectedArray = Object.keys(newSelected);

	// Get the items that belong to the current page
	const currentPageItems = items.slice(lastPageWithItems * limit, lastPageWithItems * limit + limit);
	return {
		itemsById: newItemsById,
		state: {
			items: currentPageItems,
			offset: limit * lastPageWithItems,
			total: items.total,
			loading: false,
			selected: newSelected,
			hasSelected: Boolean(newSelectedArray.length),
			selectedCount: newSelectedArray.length,
			isAllSelected: Boolean(newSelectedArray.length) && newSelectedArray.length === items.total
		}
	};
}
