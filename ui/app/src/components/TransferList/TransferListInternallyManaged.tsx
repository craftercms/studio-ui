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

import React from 'react';
import { TransferListProps } from './TransferList';
import { TransferListColumn, TransferListItem } from '../TransferListColumn';
import { LookupTable } from '../../models';
import Box from '@mui/material/Box';
import TransferListButtons from './TransferListButtons';

export interface TransferListInternallyManagedProps extends TransferListProps {
  sourceItems: TransferListItem[];
  targetItems: TransferListItem[];
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

export function TransferListInternallyManaged(props: TransferListInternallyManagedProps) {
  const {
    source,
    target,
    inProgressIds,
    sourceItems,
    targetItems,
    checkedList,
    onItemClicked,
    onCheckAllClicked,
    addToTarget,
    removeFromTarget,
    disableAdd,
    disableRemove,
    sourceItemsAllChecked,
    targetItemsAllChecked,
    disabled
  } = props;

  return (
    <Box display="flex">
      <TransferListColumn
        title={props.source.title}
        items={sourceItems}
        checkedList={checkedList}
        onCheckAllClicked={onCheckAllClicked}
        onItemClick={onItemClicked}
        isAllChecked={sourceItemsAllChecked}
        inProgressIds={inProgressIds}
        emptyStateMessage={source.emptyMessage}
        disabled={disabled}
      />
      <TransferListButtons
        disableAdd={disableAdd}
        disableRemove={disableRemove}
        addToTarget={addToTarget}
        removeFromTarget={removeFromTarget}
        disabled={disabled}
      />
      <TransferListColumn
        title={props.target.title}
        items={targetItems}
        checkedList={checkedList}
        onCheckAllClicked={onCheckAllClicked}
        onItemClick={onItemClicked}
        isAllChecked={targetItemsAllChecked}
        inProgressIds={inProgressIds}
        emptyStateMessage={target.emptyMessage}
        disabled={disabled}
      />
    </Box>
  );
}

export default TransferListInternallyManaged;
