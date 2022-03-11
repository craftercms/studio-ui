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
import { DetailedItem } from '../../models/Item';
import NavItem from './PathNavigatorItem';
import React, { useMemo } from 'react';
import { Resource } from '../../models/Resource';

export interface NavProps {
  locale?: string;
  resource: Resource<DetailedItem[]>;
  isSelectMode?: boolean;
  computeActiveItems?: (items: DetailedItem[]) => string[];
  showItemNavigateToButton?: boolean;
  classes?: Partial<Record<'root', string>>;
  onItemClicked?(item: DetailedItem, event?: React.MouseEvent): void;
  onSelectItem?(item: DetailedItem, unselect: boolean): void;
  onPathSelected?(item: DetailedItem): void;
  onPreview?(item: DetailedItem): void;
  onOpenItemMenu?(element: Element, item: DetailedItem): void;
}

// PathNavigatorList
function PathNavigatorList(props: NavProps) {
  const {
    resource,
    onPathSelected,
    onPreview,
    locale,
    computeActiveItems,
    isSelectMode,
    onSelectItem,
    onOpenItemMenu,
    onItemClicked,
    showItemNavigateToButton
  } = props;
  const items = resource.read();
  const active = useMemo(() => computeActiveItems?.(items) ?? [], [items, computeActiveItems]);
  return (
    <List component="nav" disablePadding classes={{ root: props.classes?.root }}>
      {items.map((item: DetailedItem) => (
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
