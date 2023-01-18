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

import React, { ReactNode, useState } from 'react';
import LookupTable from '../../models/LookupTable';
import useStyles from './styles';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import SearchBar from '../SearchBar/SearchBar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import EmptyState from '../EmptyState/EmptyState';
import { FormattedMessage } from 'react-intl';
import TransferListItem from './TransferListItem';
import { PaginationOptions } from '../../models';

export interface TransferListColumnProps {
  title: ReactNode;
  emptyStateMessage?: ReactNode;
  items: TransferListItem[];
  disabledItems?: LookupTable<boolean>;
  onItemClick(item: TransferListItem, e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  checkedList: LookupTable<boolean>;
  inProgressIds: (string | number)[];
  isAllChecked?: boolean;
  onCheckAllClicked?(items: TransferListItem[], checked: boolean): void;
  hasMore?: boolean;
  onFilter?(options?: Partial<PaginationOptions & { keyword?: string }>);
  onLoadMore?(options?: Partial<PaginationOptions & { keyword?: string }>);
}

export function TransferListColumn(props: TransferListColumnProps) {
  const {
    title,
    items,
    disabledItems,
    onItemClick,
    hasMore,
    onFilter,
    onLoadMore,
    checkedList,
    isAllChecked,
    onCheckAllClicked,
    inProgressIds,
    emptyStateMessage
  } = props;
  const { classes } = useStyles();
  const [keyword, setKeyword] = useState('');

  const onSearch = (value) => {
    onFilter?.({ keyword: value });
    setKeyword(value);
  };

  const onScroll = (e) => {
    if (onLoadMore) {
      const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
      if (bottom && hasMore) {
        onLoadMore({
          ...(keyword && { keyword })
        });
      }
    }
  };

  // If there is an external filter, do not filter in this component.
  let list = onFilter ? items : items.filter((item) => item.title.includes(keyword) || item.subtitle.includes(keyword));
  return (
    <Paper className={classes.listPaper}>
      <header className={classes.listHeader}>
        {onCheckAllClicked && (
          <Checkbox
            disabled={items.length === 0}
            checked={isAllChecked}
            onChange={(event) => onCheckAllClicked(items, event.target.checked)}
          />
        )}
        {title && <Typography color="textSecondary">{title}</Typography>}
        <SearchBar
          keyword={keyword}
          onChange={onSearch}
          classes={{ root: classes.searchBar }}
          showActionButton={Boolean(keyword)}
        />
      </header>
      <List dense component="div" role="list" className={classes.list} onScroll={onScroll}>
        {items.length ? (
          list.length === 0 ? (
            <EmptyState
              title={
                <FormattedMessage
                  id="transferListColumn.noResults"
                  defaultMessage="No results, try to change the query"
                />
              }
            />
          ) : (
            <>
              {list.map((item, i) => (
                <ListItem
                  disabled={inProgressIds.includes(item.id) || disabledItems?.[item.id]}
                  key={item.id}
                  role="listitem"
                  button
                  onClick={(e) => onItemClick(item, e)}
                >
                  <ListItemIcon>
                    {inProgressIds.includes(item.id) ? (
                      <CircularProgress size={42} />
                    ) : (
                      <Checkbox
                        checked={(checkedList[item.id] && !disabledItems?.[item.id]) ?? false}
                        tabIndex={-1}
                        disableRipple
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={item.subtitle}
                    primaryTypographyProps={{ noWrap: true, title: item.title }}
                  />
                </ListItem>
              ))}
            </>
          )
        ) : (
          emptyStateMessage && <EmptyState title={emptyStateMessage} />
        )}
      </List>
    </Paper>
  );
}

export default TransferListColumn;
