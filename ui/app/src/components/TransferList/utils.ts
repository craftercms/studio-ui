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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransferListItem } from '../TransferListColumn';
import { createLookupTable } from '../../utils/object';
import { LookupTable } from '../../models';

function intersection(a: any, b: any) {
  return a.filter((value) => b.find((next) => value.id === next.id));
}

export function not(a: any, b: any) {
  return a.filter((value) => !b.find((next) => value.id === next.id));
}

// Client-side default filtering
export const transferListItemsFilter = (items, keyword) =>
  items?.length
    ? items.filter((item) => {
        const lowerCaseKeyword = keyword.toLowerCase();
        return (
          item.title.toLowerCase().includes(lowerCaseKeyword) || item.subtitle.toLowerCase().includes(lowerCaseKeyword)
        );
      })
    : null;

export interface useTransferListStateReturn {
  sourceItems: TransferListItem[];
  setSourceItems(items: TransferListItem[]): void;
  sourceFilterKeyword: string;
  setSourceFilterKeyword(keyword: string): void;
  filteredSourceItems: TransferListItem[];
  filteredTargetItems: TransferListItem[];
  targetItems: TransferListItem[];
  setTargetItems(items: TransferListItem[]): void;
  targetFilterKeyword: string;
  setTargetFilterKeyword(keyword: string): void;
  checkedList: LookupTable<boolean>;
  setCheckedList(list: LookupTable<boolean>): void;
  onItemClicked(item: TransferListItem): void;
  isAllChecked(items: TransferListItem[]): boolean;
  onCheckAllClicked(items: TransferListItem[], checked: boolean): void;
  getChecked(items: TransferListItem[]): TransferListItem[];
  disableAdd: boolean;
  disableRemove: boolean;
  sourceItemsAllChecked: boolean;
  targetItemsAllChecked: boolean;
  addToTarget(): void;
  removeFromTarget(): void;
}

export const useTransferListState = (): useTransferListStateReturn => {
  const [sourceItems, setSourceItems] = useState<TransferListItem[]>([]);
  const [targetItems, setTargetItems] = useState<TransferListItem[]>([]);
  const [checkedList, setCheckedList] = useState({});
  const [sourceFilterKeyword, setSourceFilterKeyword] = useState('');
  const [targetFilterKeyword, setTargetFilterKeyword] = useState('');
  // Client-side filtered items
  const filteredSourceItems = transferListItemsFilter(sourceItems, sourceFilterKeyword);
  const filteredTargetItems = transferListItemsFilter(targetItems, targetFilterKeyword);
  const [itemsLookup, setItemsLookup] = useState({});
  const itemsLookupRef = useRef({});
  itemsLookupRef.current = itemsLookup;

  useEffect(() => {
    setItemsLookup({
      ...itemsLookupRef.current,
      ...createLookupTable(sourceItems),
      ...createLookupTable(targetItems)
    });
  }, [sourceItems, targetItems]);

  const isAllChecked = useCallback(
    (items: TransferListItem[]) => {
      return items?.length
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

  const getChecked = (items: TransferListItem[]) => {
    return intersection(
      Object.keys(checkedList)
        .filter((key) => checkedList[key])
        .map((id) => itemsLookup[id]),
      items
    );
  };

  const disableAdd = getChecked(sourceItems).length === 0;
  const disableRemove = getChecked(targetItems).length === 0;

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

  const addToTarget = () => {
    const nextCheckedList = {};
    const leftCheckedItems = getChecked(sourceItems);
    if (leftCheckedItems.length) {
      leftCheckedItems.forEach((item) => (nextCheckedList[item.id] = false));
      setCheckedList({ ...checkedList, ...nextCheckedList });
      setSourceItems(not(sourceItems, leftCheckedItems));
      setTargetItems([...targetItems, ...leftCheckedItems]);
    }
  };

  const removeFromTarget = () => {
    const nextCheckedList = {};
    const rightCheckedItems = getChecked(targetItems);
    if (rightCheckedItems.length) {
      rightCheckedItems.forEach((item) => (nextCheckedList[item.id] = false));
      setCheckedList({ ...checkedList, ...nextCheckedList });
      setTargetItems(not(targetItems, rightCheckedItems));
      setSourceItems([...sourceItems, ...rightCheckedItems]);
    }
  };

  const sourceItemsAllChecked = useMemo(() => {
    return isAllChecked(filteredSourceItems);
  }, [isAllChecked, filteredSourceItems]);

  const targetItemsAllChecked = useMemo(() => {
    return isAllChecked(filteredTargetItems);
  }, [isAllChecked, filteredTargetItems]);

  return {
    sourceItems,
    setSourceItems,
    sourceFilterKeyword,
    setSourceFilterKeyword,
    filteredSourceItems,
    targetItems,
    setTargetItems,
    targetFilterKeyword,
    setTargetFilterKeyword,
    filteredTargetItems,
    checkedList,
    setCheckedList,
    onItemClicked,
    isAllChecked,
    onCheckAllClicked,
    getChecked,
    disableAdd,
    disableRemove,
    sourceItemsAllChecked,
    targetItemsAllChecked,
    addToTarget,
    removeFromTarget
  };
};
