/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect } from 'react';
import { TransferListProps } from './TransferList';
import { TransferListColumn, TransferListItem } from '../TransferListColumn';
import { LookupTable } from '../../models';
import Box from '@mui/material/Box';
import TransferListButtons from './TransferListButtons';

export interface TransferListExternallyManagedProps extends TransferListProps {
  sourceItems: TransferListItem[];
  setSourceItems(items: TransferListItem[]): void;
  targetItems: TransferListItem[];
  setTargetItems(items: TransferListItem[]): void;
  checkedList: LookupTable<boolean>;
  onItemClicked(item: TransferListItem): void;
  onCheckAllClicked(items: TransferListItem[], checked: boolean): void;
  addToTarget(): void;
  removeFromTarget(): void;
  disableAdd: boolean;
  disableRemove: boolean;
  sourceItemsAllChecked: boolean;
  targetItemsAllChecked: boolean;
}

export function TransferListExternallyManaged(props: TransferListExternallyManagedProps) {
  const {
    source,
    target,
    inProgressIds,
    sourceItems,
    setSourceItems,
    targetItems,
    setTargetItems,
    checkedList,
    onItemClicked,
    onCheckAllClicked,
    addToTarget,
    removeFromTarget,
    disableAdd,
    disableRemove,
    sourceItemsAllChecked,
    targetItemsAllChecked
  } = props;

  useEffect(() => {
    setSourceItems(source.items);
  }, [source.items, setSourceItems]);

  useEffect(() => {
    setTargetItems(target.items);
  }, [target.items, setTargetItems]);

  return (
    <Box display="flex">
      <TransferListColumn
        title={source.title}
        items={sourceItems}
        hasMore={source.hasMore}
        disabledItems={source.disabledItems}
        checkedList={checkedList}
        onCheckAllClicked={onCheckAllClicked}
        onItemClick={onItemClicked}
        onFilter={source.onFilter}
        onLoadMore={source.onLoadMore}
        isAllChecked={sourceItemsAllChecked}
        inProgressIds={inProgressIds}
        emptyStateMessage={source.emptyMessage}
      />
      <TransferListButtons
        disableAdd={disableAdd}
        disableRemove={disableRemove}
        addToTarget={addToTarget}
        removeFromTarget={removeFromTarget}
      />
      <TransferListColumn
        title={target.title}
        items={targetItems}
        hasMore={target.hasMore}
        disabledItems={target.disabledItems}
        checkedList={checkedList}
        onCheckAllClicked={onCheckAllClicked}
        onItemClick={onItemClicked}
        onFilter={target.onFilter}
        onLoadMore={target.onLoadMore}
        isAllChecked={targetItemsAllChecked}
        inProgressIds={inProgressIds}
        emptyStateMessage={target.emptyMessage}
      />
    </Box>
  );
}

export default TransferListExternallyManaged;
