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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import React, { ReactNode, useState } from 'react';
import { Checkbox } from '@material-ui/core';
import LookupTable from '../../models/LookupTable';
import Button from '@material-ui/core/Button';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import { useStyles } from './styles';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import SearchBar from '../Controls/SearchBar';

interface TransferListProps {
  objectA: TransferListObject;
  objectB: TransferListObject;
}

export interface TransferListObject {
  title?: ReactNode;
  list: TransferListItem[];
}

export default function TransferList(props: TransferListProps) {
  const { objectA, objectB } = props;
  const [checkedList, setCheckedList] = useState({});
  const classes = useStyles();

  const onItemClicked = (item: TransferListItem) => {
    if (checkedList[item.id]) {
      setCheckedList({ ...checkedList, [item.id]: false });
    } else {
      setCheckedList({ ...checkedList, [item.id]: true });
    }
  };

  return (
    <Box display="flex">
      <SubList object={objectA} checkedList={checkedList} onClick={onItemClicked} />
      <section className={classes.buttonsWrapper}>
        <Button variant="outlined" endIcon={<NavigateNextIcon />}>
          <FormattedMessage id="transferList.addAll" defaultMessage="Add all" />
        </Button>
        <Button variant="outlined" endIcon={<NavigateNextIcon />}>
          <FormattedMessage id="words.add" defaultMessage="Add" />
        </Button>
        <Button variant="outlined" startIcon={<NavigateBeforeIcon />}>
          <FormattedMessage id="words.remove" defaultMessage="Remove" />
        </Button>
        <Button variant="outlined" endIcon={<NavigateNextIcon />}>
          <FormattedMessage id="transferList.removeAll" defaultMessage="Remove all" />
        </Button>
      </section>
      <SubList object={objectB} checkedList={checkedList} onClick={onItemClicked} />
    </Box>
  );
}

interface TransferListItem {
  id: string;
  title: string;
  subTitle?: string;
}

interface SubListProps {
  object: TransferListObject;
  onClick(item: TransferListItem): void;
  checkedList: LookupTable<boolean>;
}

function SubList(props: SubListProps) {
  const { object, onClick, checkedList } = props;
  const classes = useStyles();
  return (
    <Paper className={classes.listPaper}>
      <header className={classes.listHeader}>
        <Checkbox />
        {object.title && <Typography color="textSecondary">{object.title}</Typography>}
        <SearchBar keyword="" onChange={() => {}} classes={{ root: classes.searchBar }} />
      </header>
      <List dense component="div" role="list" className={classes.list}>
        {object.list.map((item, i) => (
          <ListItem key={i} role="listitem" button onClick={() => onClick(item)}>
            <ListItemIcon>
              <Checkbox checked={checkedList[item.id]} tabIndex={-1} disableRipple />
            </ListItemIcon>
            <ListItemText primary={item.title} secondary={item.subTitle} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
