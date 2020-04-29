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
import { SandboxItem } from '../../../models/Item';
import NavItem from './PathNavigatorItem';
import React from 'react';
import { Resource } from '../../../models/Resource';

interface NavProps {
  locale: string;
  resource: Resource<SandboxItem[]>;
  isSelectMode?: boolean;
  leafs: string[];
  onItemClicked(item: SandboxItem): void;
  onSelectItem?(item: SandboxItem, unselect: boolean): void;
  onPathSelected(item: SandboxItem): void;
  onOpenItemMenu?(element: Element, item: SandboxItem): void;
}

// PathNavigatorList
export default function (props: NavProps) {
  const {
    resource,
    onPathSelected,
    locale,
    isSelectMode,
    onSelectItem,
    onOpenItemMenu,
    onItemClicked,
    leafs
  } = props;
  const items = resource.read();
  return (
    <List component="nav" disablePadding={true}>
      {items.map((item: SandboxItem) => (
        <NavItem
          item={item}
          key={item.id}
          isLeaf={leafs.includes(item.id)}
          locale={locale}
          onChangeParent={onPathSelected}
          isSelectMode={isSelectMode}
          onItemChecked={onSelectItem}
          onOpenItemMenu={onOpenItemMenu}
          onItemClicked={onItemClicked}
        />
      ))}
    </List>
  );
}
