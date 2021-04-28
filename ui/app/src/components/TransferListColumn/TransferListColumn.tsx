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

import React, { ReactNode, useState } from 'react';
import LookupTable from '../../models/LookupTable';
import useStyles from './styles';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import SearchBar from '../Controls/SearchBar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { TransferListItem } from '../TransferList';
import CircularProgress from '@material-ui/core/CircularProgress';
import EmptyState from '../SystemStatus/EmptyState';
import { FormattedMessage } from 'react-intl';

interface TransferListColumnProps {
  title: ReactNode;
  emptyStateMessage?: ReactNode;
  items: TransferListItem[];
  onItemClick(item: TransferListItem, e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  checkedList: LookupTable<boolean>;
  inProgressIds: (string | number)[];
  isAllChecked?: boolean;
  onCheckAllClicked?(items: TransferListItem[], checked: boolean): void;
}

export default function TransferListColumn(props: TransferListColumnProps) {
  const {
    title,
    items,
    onItemClick,
    checkedList,
    isAllChecked,
    onCheckAllClicked,
    inProgressIds,
    emptyStateMessage
  } = props;
  const classes = useStyles();
  const [keyword, setKeyword] = useState('');

  const onSearch = (value) => {
    setKeyword(value);
  };

  const filteredList = items.filter((item) => item.title.includes(keyword) || item.subtitle.includes(keyword));

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
          disabled={items.length === 0}
          keyword={keyword}
          onChange={onSearch}
          classes={{ root: classes.searchBar }}
          showActionButton={Boolean(keyword)}
        />
      </header>
      <List dense component="div" role="list" className={classes.list}>
        {items.length ? (
          filteredList.length === 0 ? (
            <EmptyState
              title={
                <FormattedMessage
                  id="transferListColumn.noResults"
                  defaultMessage="No results, try to change the query"
                />
              }
            />
          ) : (
            filteredList.map((item, i) => (
              <ListItem
                disabled={inProgressIds.includes(item.id)}
                key={item.id}
                role="listitem"
                button
                onClick={(e) => onItemClick(item, e)}
              >
                <ListItemIcon>
                  {inProgressIds.includes(item.id) ? (
                    <CircularProgress size={42} />
                  ) : (
                    <Checkbox checked={checkedList[item.id] ?? false} tabIndex={-1} disableRipple />
                  )}
                </ListItemIcon>
                <ListItemText primary={item.title} secondary={item.subtitle} />
              </ListItem>
            ))
          )
        ) : (
          emptyStateMessage && <EmptyState title={emptyStateMessage} />
        )}
      </List>
    </Paper>
  );
}
