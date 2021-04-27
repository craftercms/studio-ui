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

import React, { ReactNode } from 'react';
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

interface TransferListColumnProps {
  title: ReactNode;
  items: TransferListItem[];
  onItemClick(item: TransferListItem): void;
  checkedList: LookupTable<boolean>;
  inProgressIds: (string | number)[];
  isAllChecked(items: TransferListItem[]): boolean;
  onCheckAllClicked(items: TransferListItem[], checked: boolean): void;
}

export default function TransferListColumn(props: TransferListColumnProps) {
  const { title, items, onItemClick, checkedList, isAllChecked, onCheckAllClicked, inProgressIds } = props;
  const classes = useStyles();
  return (
    <Paper className={classes.listPaper}>
      <header className={classes.listHeader}>
        <Checkbox checked={isAllChecked(items)} onChange={(event) => onCheckAllClicked(items, event.target.checked)} />
        {title && <Typography color="textSecondary">{title}</Typography>}
        <SearchBar keyword="" onChange={() => {}} classes={{ root: classes.searchBar }} />
      </header>
      <List dense component="div" role="list" className={classes.list}>
        {items.map((item, i) => (
          <ListItem
            disabled={inProgressIds.includes(item.id)}
            key={i}
            role="listitem"
            button
            onClick={() => onItemClick(item)}
          >
            <ListItemIcon>
              <Checkbox checked={checkedList[item.id] ?? false} tabIndex={-1} disableRipple />
            </ListItemIcon>
            <ListItemText primary={item.title} secondary={item.subTitle} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
