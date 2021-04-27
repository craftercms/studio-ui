/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import Box from '@material-ui/core/Box';
import React, { ReactNode, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import useStyles from './styles';
import { createLookupTable } from '../../utils/object';
import TransferListColumn from '../TransferListColumn';

interface TransferListProps {
  source: TransferListObject;
  target: TransferListObject;
  inProgressIds: string[];
  onTargetListItemsAdded(items: TransferListItem[]): void;
  onTargetListItemsRemoved(items: TransferListItem[]): void;
}

export interface TransferListObject {
  title?: ReactNode;
  items: TransferListItem[];
}

export interface TransferListItem {
  id: string | number;
  title: string;
  subTitle?: string;
}

function not(a: any, b: any) {
  return a.filter((value) => !b.find((next) => value.id === next.id));
}

function intersection(a: any, b: any) {
  return a.filter((value) => b.find((next) => value.id === next.id));
}

export default function TransferList(props: TransferListProps) {
  const { source, target, inProgressIds, onTargetListItemsAdded, onTargetListItemsRemoved } = props;
  const [sourceItems, setSourceItems] = useState<TransferListItem[]>(source.items);
  const [targetItems, setTargetItems] = useState<TransferListItem[]>(target.items);

  const itemsLookup = {
    ...createLookupTable(sourceItems),
    ...createLookupTable(targetItems)
  };

  const [checkedList, setCheckedList] = useState({});
  const classes = useStyles();

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

  const moveLeftToRight = () => {
    const nextCheckedList = {};
    const leftCheckedItems = getChecked(sourceItems);

    leftCheckedItems.forEach((item) => {
      nextCheckedList[item.id] = false;
    });

    setCheckedList({ ...checkedList, ...nextCheckedList });
    setSourceItems(not(sourceItems, leftCheckedItems));
    setTargetItems([...targetItems, ...leftCheckedItems]);
    onTargetListItemsAdded(leftCheckedItems);
  };

  const moveRightToLeft = () => {
    const nextCheckedList = {};
    const rightCheckedItems = getChecked(targetItems);

    rightCheckedItems.forEach((item) => {
      nextCheckedList[item.id] = false;
    });

    setCheckedList({ ...checkedList, ...nextCheckedList });
    setTargetItems(not(targetItems, rightCheckedItems));
    setSourceItems([...sourceItems, ...rightCheckedItems]);
    onTargetListItemsRemoved(rightCheckedItems);
  };

  const isAllChecked = (items: TransferListItem[]) => {
    return items.length
      ? !items.some(
          (item) =>
            !Object.keys(checkedList).find(function(checked) {
              return checked === item.id && checkedList[checked];
            })
        )
      : false;
  };

  return (
    <Box display="flex">
      <TransferListColumn
        title={props.source.title}
        items={sourceItems}
        checkedList={checkedList}
        onCheckAllClicked={onCheckAllClicked}
        onItemClick={onItemClicked}
        isAllChecked={isAllChecked}
        inProgressIds={inProgressIds}
      />
      <section className={classes.buttonsWrapper}>
        <IconButton onClick={moveLeftToRight}>
          <NavigateNextIcon />
        </IconButton>
        <IconButton onClick={moveRightToLeft}>
          <NavigateBeforeIcon />
        </IconButton>
      </section>
      <TransferListColumn
        title={props.target.title}
        items={targetItems}
        checkedList={checkedList}
        onCheckAllClicked={onCheckAllClicked}
        onItemClick={onItemClicked}
        isAllChecked={isAllChecked}
        inProgressIds={inProgressIds}
      />
    </Box>
  );
}
