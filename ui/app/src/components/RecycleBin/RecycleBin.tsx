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

import React from 'react';
import RecycleBinGridUI from './RecycleBinGridUI';
import Box from '@mui/material/Box';
import { ViewToolbar } from '../ViewToolbar';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { SearchBar } from '../SearchBar';

// TODO: update to use sx
const useStyles = makeStyles()((theme: Theme) => ({
  searchBarContainer: {
    width: '30%',
    [theme.breakpoints.up('md')]: {
      minWidth: '500px'
    }
  },
  searchPaper: {
    flex: 1
  }
}));

// TODO: remove - for testing purposes
const deletePackages = [
  {
    id: 1,
    comment: 'Delete Screenshot 2022-08-02 at 12.44.44.png',
    numOfItems: 1,
    published: null,
    dateDeleted: '2022-08-18T13:42:48-06:00',
    deletedBy: 'parturient.ipsum@eidiculus.esque'
  },
  {
    id: 2,
    comment: 'Delete Entertainment page and 6 more items',
    numOfItems: 1,
    published: 'live',
    dateDeleted: '2022-08-18T13:42:48-06:00',
    deletedBy: 'parturient.ipsum@eidiculus.esque'
  },
  {
    id: 3,
    comment: 'Cleanup for site 2022 redesign',
    numOfItems: 1,
    published: 'stage',
    dateDeleted: '2022-08-18T13:42:48-06:00',
    deletedBy: 'parturient.ipsum@eidiculus.esque'
  }
];

export function RecycleBin() {
  const { classes } = useStyles();

  return (
    <Box>
      <ViewToolbar styles={{ toolbar: { justifyContent: 'center' } }}>
        <section className={classes.searchBarContainer}>
          <SearchBar
            onChange={() => {}}
            keyword={null}
            showActionButton={false}
            showDecoratorIcon
            classes={{ root: classes.searchPaper }}
          />
        </section>
      </ViewToolbar>
      <RecycleBinGridUI packages={deletePackages} />
    </Box>
  );
}

export default RecycleBin;
