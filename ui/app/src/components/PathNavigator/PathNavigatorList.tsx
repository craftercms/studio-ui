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

import List from '@mui/material/List';
import { ContentItem } from '../../models/Item';
import NavItem from './PathNavigatorItem';
import React, { useMemo } from 'react';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { PartialSxRecord } from '../../models';

export interface NavProps {
	locale?: string;
	items: ContentItem[];
	isSelectMode?: boolean;
	computeActiveItems?: (items: ContentItem[]) => string[];
	showItemNavigateToButton?: boolean;
	classes?: Partial<Record<'root', string>>;
	sxs?: PartialSxRecord<'root'>;
	onItemClicked?(item: ContentItem, event?: React.MouseEvent): void;
	onSelectItem?(item: ContentItem, unselect: boolean): void;
	onPathSelected?(item: ContentItem): void;
	onPreview?(item: ContentItem): void;
	onOpenItemMenu?(element: Element, item: ContentItem): void;
}

function PathNavigatorList(props: NavProps) {
	const {
		items,
		onPathSelected,
		onPreview,
		locale,
		computeActiveItems,
		isSelectMode,
		onSelectItem,
		onOpenItemMenu,
		onItemClicked,
		showItemNavigateToButton,
		sxs
	} = props;
	const fnRefs = useUpdateRefs({ computeActiveItems });
	const active = useMemo(() => fnRefs.current.computeActiveItems?.(items) ?? [], [items, fnRefs]);
	return (
		<List component="nav" disablePadding classes={{ root: props.classes?.root }} sx={sxs?.root}>
			{items?.map((item: ContentItem) => (
				<NavItem
					item={item}
					key={item.id}
					isActive={active.includes(item.path)}
					locale={locale}
					onChangeParent={onPathSelected}
					onPreview={onPreview}
					isSelectMode={isSelectMode}
					onItemChecked={onSelectItem}
					onOpenItemMenu={onOpenItemMenu}
					onItemClicked={onItemClicked}
					showItemNavigateToButton={showItemNavigateToButton}
				/>
			))}
		</List>
	);
}

export default PathNavigatorList;
