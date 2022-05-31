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

import Box from '@mui/material/Box';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import useStyles from './styles';
import { createLookupTable } from '../../utils/object';
import TransferListColumn, { TransferListItem } from '../TransferListColumn';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';

export interface TransferListProps {
  source: TransferListObject;
  target: TransferListObject;
  inProgressIds: (string | number)[];
  onTargetListItemsAdded(items: TransferListItem[]): void;
  onTargetListItemsRemoved(items: TransferListItem[]): void;
}

export interface TransferListObject {
  title?: ReactNode;
  emptyMessage?: ReactNode;
  items: TransferListItem[];
}

function not(a: any, b: any) {
  return a.filter((value) => !b.find((next) => value.id === next.id));
}

function intersection(a: any, b: any) {
  return a.filter((value) => b.find((next) => value.id === next.id));
}

export function TransferList(props: TransferListProps) {
  const { source, target, inProgressIds, onTargetListItemsAdded, onTargetListItemsRemoved } = props;
  const [sourceItems, setSourceItems] = useState<TransferListItem[]>(source.items);
  const [targetItems, setTargetItems] = useState<TransferListItem[]>(target.items);

  const itemsLookup = {
    ...createLookupTable(sourceItems),
    ...createLookupTable(targetItems)
  };

  const [checkedList, setCheckedList] = useState({});
  const { classes } = useStyles();

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
      setSourceItems(not(sourceItems, leftCheckedItems));
      setTargetItems([...targetItems, ...leftCheckedItems]);
      onTargetListItemsAdded(leftCheckedItems);
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
      />
      <section className={classes.buttonsWrapper}>
        <Tooltip
          title={
            disableAdd ? (
              <FormattedMessage
                id="transferList.addDisabledTooltip"
                defaultMessage="Select items to add from the left"
              />
            ) : (
              <FormattedMessage id="transferList.addToTarget" defaultMessage="Add selected" />
            )
          }
        >
          <span>
            <IconButton onClick={addToTarget} disabled={disableAdd} size="large">
              <NavigateNextIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip
          title={
            disableRemove ? (
              <FormattedMessage
                id="transferList.removeDisabledTooltip"
                defaultMessage="Select items to remove from the right"
              />
            ) : (
              <FormattedMessage id="transferList.removeFromTarget" defaultMessage="Remove selected" />
            )
          }
        >
          <span>
            <IconButton onClick={removeFromTarget} disabled={disableRemove} size="large">
              <NavigateBeforeIcon />
            </IconButton>
          </span>
        </Tooltip>
      </section>
      <TransferListColumn
        title={props.target.title}
        items={targetItems}
        checkedList={checkedList}
        onCheckAllClicked={onCheckAllClicked}
        onItemClick={onItemClicked}
        isAllChecked={targetItemsAllChecked}
        inProgressIds={inProgressIds}
        emptyStateMessage={target.emptyMessage}
      />
    </Box>
  );
}

export default TransferList;
