/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import List from '@material-ui/core/List';
import { DetailedItem } from '../../../models/Item';
import NavItem from './PathNavigatorItem';
import React, { useMemo } from 'react';
import { Resource } from '../../../models/Resource';

interface NavProps {
  locale?: string;
  resource: Resource<DetailedItem[]>;
  isSelectMode?: boolean;
  leaves: string[];
  computeActiveItems?: (items: DetailedItem[]) => string[];
  showItemNavigateToButton?: boolean;
  classes?: Partial<Record<'root', string>>;
  onItemClicked(item: DetailedItem): void;
  onSelectItem?(item: DetailedItem, unselect: boolean): void;
  onPathSelected?(item: DetailedItem): void;
  onPreview?(item: DetailedItem): void;
  onOpenItemMenu?(element: Element, item: DetailedItem): void;
}

// PathNavigatorList
export default function PathNavigatorList(props: NavProps) {
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
    leaves = [],
    showItemNavigateToButton
  } = props;
  const items = resource.read();
  const active = useMemo(() => computeActiveItems?.(items) ?? [], [items, computeActiveItems]);
  return (
    <List component="nav" disablePadding={true} classes={{ root: props.classes?.root }}>
      {items.map((item: DetailedItem) => (
        <NavItem
          item={item}
          key={item.id}
          isLeaf={leaves.includes(item.id)}
          isActive={active.includes(item.id)}
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
