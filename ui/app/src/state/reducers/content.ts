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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../models/GlobalState';
import {
	clearClipboard,
	fetchContentItem,
	fetchContentItemComplete,
	fetchQuickCreateList,
	fetchQuickCreateListComplete,
	fetchQuickCreateListFailed,
	fetchContentItems,
	fetchContentItemsComplete,
	reloadContentItem,
	restoreClipboard,
	setClipboard,
	updateItemsByPath
} from '../actions/content';
import QuickCreateItem from '../../models/content/QuickCreateItem';
import StandardAction from '../../models/StandardAction';
import { AjaxError } from 'rxjs/ajax';
import {
	pathNavigatorBulkFetchPathComplete,
	pathNavigatorConditionallySetPathComplete,
	pathNavigatorFetchParentItemsComplete,
	pathNavigatorFetchPathComplete
} from '../actions/pathNavigator';
import { createLookupTable, reversePluckProps } from '../../utils/object';
import { changeSiteComplete } from '../actions/sites';
import {
	pathNavigatorTreeBulkFetchPathChildrenComplete,
	pathNavigatorTreeBulkRestoreComplete,
	pathNavigatorTreeFetchPathChildrenComplete,
	pathNavigatorTreeFetchPathPageComplete,
	pathNavigatorTreeRestoreComplete,
	PathNavigatorTreeRestoreCompletePayload
} from '../actions/pathNavigatorTree';
import { STATE_LOCKED_MASK } from '../../utils/constants';
import { deleteContentEvent, deleteContentEvents, lockContentEvent, moveContentEvent } from '../actions/system';
import { ContentItem, LookupTable } from '../../models';

type ContentState = GlobalState['content'];

const initialState: ContentState = {
	quickCreate: {
		error: null,
		isFetching: false,
		items: null
	},
	itemsByPath: {},
	clipboard: null,
	itemsBeingFetchedByPath: {}
};

const updateItemByPath = (state: ContentState, { payload }) => {
	const { parent, children } = payload;
	const nextByPath: LookupTable<ContentItem> = {
		...state.itemsByPath,
		...createLookupTable(children, 'path')
	};
	if (children.levelDescriptor) {
		nextByPath[children.levelDescriptor.path] = children.levelDescriptor;
	}
	if (parent) {
		nextByPath[parent.path] = parent;
	}
	return {
		...state,
		itemsByPath: nextByPath
	};
};

const updateItemsByPaths = (state: ContentState, { payload: { paths } }) => {
	let nextByPath = state.itemsByPath;
	paths.forEach((path) => {
		nextByPath = {
			...nextByPath,
			...updateItemByPath({ ...state, itemsByPath: nextByPath }, { payload: path }).itemsByPath
		};
	});
	return {
		...state,
		itemsByPath: nextByPath
	};
};

const updateItemsBeingFetchedByPath = (state: ContentState, { payload: { path } }) => {
	state.itemsBeingFetchedByPath[path] = true;
};

const updateItemsBeingFetchedByPaths = (state, { payload: { paths } }) => {
	paths.forEach((path) => {
		state.itemsBeingFetchedByPath[path] = true;
	});
};

const updateItemsFromRestoredTree = (state, payload: PathNavigatorTreeRestoreCompletePayload) => {
	const { children, items } = payload;
	const nextByPath: LookupTable<ContentItem> = {};
	Object.values(children).forEach((children) => {
		Object.assign(nextByPath, createLookupTable(children, 'path'));
		if (children.levelDescriptor) {
			nextByPath[children.levelDescriptor.path] = children.levelDescriptor;
		}
	});
	items.forEach((item) => {
		nextByPath[item.path] = item;
	});
	return { ...state, itemsByPath: { ...state.itemsByPath, ...nextByPath } };
};

const reducer = createReducer<ContentState>(initialState, (builder) => {
	builder
		.addCase(fetchQuickCreateList, (state) => ({
			...state,
			quickCreate: {
				...state.quickCreate,
				isFetching: true
			}
		}))
		.addCase(fetchQuickCreateListComplete, (state, { payload }: StandardAction<QuickCreateItem[]>) => ({
			...state,
			quickCreate: {
				...state.quickCreate,
				items: payload,
				isFetching: false
			}
		}))
		.addCase(fetchQuickCreateListFailed, (state, error: StandardAction<AjaxError>) => ({
			...state,
			quickCreate: {
				...state.quickCreate,
				isFetching: false,
				error: error.payload.response
			}
		}))
		.addCase(fetchContentItem, updateItemsBeingFetchedByPath)
		.addCase(reloadContentItem, updateItemsBeingFetchedByPath)
		.addCase(fetchContentItems, updateItemsBeingFetchedByPaths)
		.addCase(fetchContentItemsComplete, (state, { payload: { items } }) => {
			items.forEach((item) => {
				const path = item.path;
				state.itemsByPath[path] = item;
				delete state.itemsBeingFetchedByPath[path];
			});
		})
		.addCase(fetchContentItemComplete, (state, { payload: { item } }) => {
			const path = item.path;
			state.itemsByPath[path] = item;
			state.itemsBeingFetchedByPath[path] = false;
		})
		.addCase(restoreClipboard, (state, { payload }) => ({
			...state,
			clipboard: payload
		}))
		.addCase(setClipboard, (state, { payload }) => ({
			...state,
			clipboard: payload
		}))
		.addCase(clearClipboard, (state) => ({
			...state,
			clipboard: null
		}))
		.addCase(pathNavigatorConditionallySetPathComplete, updateItemByPath)
		.addCase(pathNavigatorFetchPathComplete, updateItemByPath)
		.addCase(pathNavigatorBulkFetchPathComplete, updateItemsByPaths)
		.addCase(pathNavigatorFetchParentItemsComplete, (state, { payload: { items, children } }) => {
			return {
				...state,
				itemsByPath: {
					...state.itemsByPath,
					...createLookupTable(children, 'path'),
					...(children.levelDescriptor && {
						[children.levelDescriptor.path]: state.itemsByPath[children.levelDescriptor.path]
					}),
					...createLookupTable(
						items.reduce((items, item) => {
							if (state.itemsByPath[item.path]?.live) {
								item.live = state.itemsByPath[item.path].live;
								item.staging = state.itemsByPath[item.path].staging;
							}
							return items;
						}, items),
						'path'
					)
				}
			};
		})
		.addCase(pathNavigatorTreeFetchPathChildrenComplete, updateItemByPath)
		.addCase(pathNavigatorTreeBulkFetchPathChildrenComplete, updateItemsByPaths)
		.addCase(pathNavigatorTreeFetchPathPageComplete, updateItemByPath)
		.addCase(
			pathNavigatorTreeRestoreComplete,
			(state, action: { payload: PathNavigatorTreeRestoreCompletePayload }) => {
				const { payload } = action;
				return updateItemsFromRestoredTree(state, payload);
			}
		)
		.addCase(pathNavigatorTreeBulkRestoreComplete, (state, { payload: { trees } }) => {
			let nextByPath = state.itemsByPath;
			trees.forEach((tree) => {
				nextByPath = {
					...nextByPath,
					...updateItemsFromRestoredTree({ ...state, itemsByPath: nextByPath }, tree).itemsByPath
				};
			});
			return {
				...state,
				itemsByPath: nextByPath
			};
		})
		.addCase(updateItemsByPath, (state, { payload }) => {
			return updateItemByPath(state, { payload: { parent: null, children: payload.items } });
		})
		.addCase(changeSiteComplete, () => initialState)
		.addCase(lockContentEvent, (state, { payload }) => {
			const { targetPath: path, user, locked } = payload;
			if (
				!state.itemsByPath[path] ||
				(locked && state.itemsByPath[path].stateMap.locked) ||
				(!locked && !state.itemsByPath[path].stateMap.locked)
			) {
				return state;
			}
			const updatedState: ContentState = {
				...state,
				itemsByPath: {
					...state.itemsByPath,
					[path]: {
						...state.itemsByPath[path],
						lockOwner: locked ? user : null,
						state: locked
							? state.itemsByPath[path].state + STATE_LOCKED_MASK
							: state.itemsByPath[path].state - STATE_LOCKED_MASK,
						stateMap: { ...state.itemsByPath[path].stateMap, locked }
					}
				}
			};
			return updatedState;
		})
		.addCase(deleteContentEvent, (state, { payload: { targetPath } }) => {
			delete state.itemsByPath[targetPath];
			delete state.itemsBeingFetchedByPath[targetPath];
		})
		.addCase(deleteContentEvents, (state, { payload: { targetPaths } }) => {
			targetPaths.forEach((targetPath) => {
				delete state.itemsByPath[targetPath];
				delete state.itemsBeingFetchedByPath[targetPath];
			});
		})
		.addCase(moveContentEvent, (state, { payload: { sourcePath } }) => {
			delete state.itemsByPath[sourcePath];
			delete state.itemsBeingFetchedByPath[sourcePath];
		});
});

export default reducer;
