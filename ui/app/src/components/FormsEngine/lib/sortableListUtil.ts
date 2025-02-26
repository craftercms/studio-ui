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

import { ListItemButtonProps } from '@mui/material/ListItemButton';

export type KeyDownEvent = Parameters<ListItemButtonProps['onKeyDown']>[0];

export type SortKey = 'e' | 'v' | 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft';
export type SortAction = 'up' | 'right' | 'down' | 'left';

const sortingKeyToActionMap: Record<SortKey, SortAction | 'edit' | 'view'> = {
	e: 'edit',
	v: 'view',
	ArrowUp: 'up',
	ArrowRight: 'right',
	ArrowDown: 'down',
	ArrowLeft: 'left'
};

export function sortableListKeyDownHandler<T = unknown>(
	event: KeyDownEvent,
	list: T[],
	index: number,
	onChange: (newList: T[]) => void,
	onOpen: (index: number, edit: boolean) => void
): void {
	const action = sortingKeyToActionMap[event.key];
	if (
		// Not a key we're working with.
		!action ||
		// Only one item.
		list.length <= 1
	) {
		// Do nothing.
		return;
	}
	event.preventDefault();
	event.stopPropagation();
	switch (action) {
		case 'edit':
		case 'view':
			onOpen(index, action === 'edit');
			break;
		default:
			sortableListActionProcessor(action, event.shiftKey, list, index, onChange);
	}
}

export function sortableListActionProcessor<T = unknown>(
	action: SortAction,
	moveToEdge: boolean,
	list: T[],
	index: number,
	onChange: (newList: T[]) => void
): void {
	const lastIndex = list.length - 1;
	const isFirst = index === 0;
	const isLast = index === lastIndex;
	switch (action) {
		case 'up':
		case 'left': {
			const item = list[index];
			const newList = list.concat();
			newList.splice(index, 1);
			if (moveToEdge) {
				// Move to first (or last if already first)
				newList.splice(isFirst ? lastIndex : 0, 0, item);
			} else {
				newList.splice(isFirst ? lastIndex : index - 1, 0, item);
			}
			onChange(newList);
			break;
		}
		case 'down':
		case 'right': {
			const item = list[index];
			const newList = list.concat();
			newList.splice(index, 1);
			if (moveToEdge) {
				// Move to last (or first if already last)
				newList.splice(isLast ? 0 : lastIndex, 0, item);
			} else {
				newList.splice(isLast ? 0 : index + 1, 0, item);
			}
			onChange(newList);
			break;
		}
	}
}

export function isTouchDevice() {
	return (
		'ontouchstart' in window || navigator.maxTouchPoints > 0 // || navigator.msMaxTouchPoints > 0
	);
}
