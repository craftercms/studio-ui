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

import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { createLookupTable } from '../../utils/object';
import { TransferListItem } from '../TransferListColumn';
import { LookupTable, PaginationOptions } from '../../models';
import TransferListInternallyManaged from './TransferListInternallyManaged';
import TransferListExternallyManaged from './TransferListExternallyManaged';

export interface TransferListProps {
  source: TransferListObject;
  target: TransferListObject;
  inProgressIds: (string | number)[];
  disabled?: boolean;
  externallyManaged: boolean;
  onTargetListItemsAdded(items: TransferListItem[]): void;
  onTargetListItemsRemoved(items: TransferListItem[]): void;
}

export interface TransferListObject {
  title?: ReactNode;
  emptyMessage?: ReactNode;
  items: TransferListItem[];
  hasMore?: boolean;
  onFilter?(options?: Partial<PaginationOptions & { keyword?: string }>): void;
  onLoadMore?(options?: Partial<PaginationOptions & { keyword?: string }>): void;
  disabledItems?: LookupTable<boolean>;
}

function not(a: any, b: any) {
  return a.filter((value) => !b.find((next) => value.id === next.id));
}

function intersection(a: any, b: any) {
  return a.filter((value) => b.find((next) => value.id === next.id));
}

export function TransferList(props: TransferListProps) {
  const {
    externallyManaged,
    source,
    target,
    onTargetListItemsAdded,
    onTargetListItemsRemoved,
    disabled = false
  } = props;
  const [sourceItems, setSourceItems] = useState<TransferListItem[]>(source.items);
  const [targetItems, setTargetItems] = useState<TransferListItem[]>(target.items);
  const [checkedList, setCheckedList] = useState({});

  const itemsLookup = {
    ...createLookupTable(sourceItems),
    ...createLookupTable(targetItems)
  };

  const onItemClicked = (item: TransferListItem) => {
    if (checkedList[item.id]) {
      setCheckedList({ ...checkedList, [item.id]: false });
    } else {
      setCheckedList({ ...checkedList, [item.id]: true });
    }
  };

  const onCheckAllClicked = (items: TransferListItem[], checked: boolean) => {
    const nextCheckedList = {};
    items.forEach((item) => {
      nextCheckedList[item.id] = checked;
    });
    setCheckedList({ ...checkedList, ...nextCheckedList });
  };

  const getChecked = (items: TransferListItem[]) => {
    return intersection(
      Object.keys(checkedList)
        .filter((key) => checkedList[key])
        .map((id) => itemsLookup[id]),
      items
    );
  };

  const addToTarget = () => {
    const nextCheckedList = {};
    const leftCheckedItems = getChecked(sourceItems);
    if (leftCheckedItems.length) {
      leftCheckedItems.forEach((item) => (nextCheckedList[item.id] = false));
      setCheckedList({ ...checkedList, ...nextCheckedList });

      if (!externallyManaged) {
        setSourceItems(not(sourceItems, leftCheckedItems));
        setTargetItems([...targetItems, ...leftCheckedItems]);
      }
      onTargetListItemsAdded(leftCheckedItems);
    }
  };

  const removeFromTarget = () => {
    const nextCheckedList = {};
    const rightCheckedItems = getChecked(targetItems);
    if (rightCheckedItems.length) {
      rightCheckedItems.forEach((item) => (nextCheckedList[item.id] = false));
      setCheckedList({ ...checkedList, ...nextCheckedList });
      if (!externallyManaged) {
        setTargetItems(not(targetItems, rightCheckedItems));
        setSourceItems([...sourceItems, ...rightCheckedItems]);
      }
      onTargetListItemsRemoved(rightCheckedItems);
    }
  };

  const disableAdd = getChecked(sourceItems).length === 0;
  const disableRemove = getChecked(targetItems).length === 0;

  const isAllChecked = useCallback(
    (items: TransferListItem[]) => {
      return items.length
        ? !items.some(
            (item) =>
              !Object.keys(checkedList).find(function (checked) {
                return checked === item.id && checkedList[checked];
              })
          )
        : false;
    },
    [checkedList]
  );

  const sourceItemsAllChecked = useMemo(() => {
    return isAllChecked(sourceItems);
  }, [isAllChecked, sourceItems]);

  const targetItemsAllChecked = useMemo(() => {
    return isAllChecked(targetItems);
  }, [isAllChecked, targetItems]);

  return (
    <>
      {externallyManaged ? (
        <TransferListExternallyManaged
          {...props}
          sourceItems={sourceItems}
          setSourceItems={setSourceItems}
          targetItems={targetItems}
          setTargetItems={setTargetItems}
          checkedList={checkedList}
          onItemClicked={onItemClicked}
          onCheckAllClicked={onCheckAllClicked}
          addToTarget={addToTarget}
          removeFromTarget={removeFromTarget}
          disableAdd={disableAdd}
          disableRemove={disableRemove}
          sourceItemsAllChecked={sourceItemsAllChecked}
          targetItemsAllChecked={targetItemsAllChecked}
          disabled={disabled}
        />
      ) : (
        <TransferListInternallyManaged
          {...props}
          sourceItems={sourceItems}
          targetItems={targetItems}
          checkedList={checkedList}
          onItemClicked={onItemClicked}
          onCheckAllClicked={onCheckAllClicked}
          addToTarget={addToTarget}
          removeFromTarget={removeFromTarget}
          disableAdd={disableAdd}
          disableRemove={disableRemove}
          sourceItemsAllChecked={sourceItemsAllChecked}
          targetItemsAllChecked={targetItemsAllChecked}
          disabled={disabled}
        />
      )}
    </>
  );
}

export default TransferList;
