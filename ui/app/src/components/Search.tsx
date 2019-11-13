/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import { defineMessages, useIntl } from "react-intl";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Theme, InputBase, MenuItem, Select } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import ImageIcon from '@material-ui/icons/Image';

const useStyles = makeStyles((theme: Theme) => ({
  content: {
    width: '800px',
    margin: 'auto',
  },
  searchHeader: {
    padding: '15px 20px',
    display: 'flex'
  },
  search: {
    position: 'relative',
    background: '#EBEBF0',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '15px'
  },
  searchIcon: {
    marginLeft: '10px',
    fontSize: '30px',
    color: theme.palette.text.secondary
  },
  inputRoot: {
    flexGrow: 1,
  },
  inputInput: {
    background: 'none',
    border: 'none',
    width: '100%',
    '&:focus': {
      boxShadow: 'none'
    }
  },
  assetSelector: {
    width: '200px',
    padding: '15px',
    background: 'rgba(0, 122, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    '& .select': {
      width: '100%'
    }
  },
  assetImage: {
    color: '#007AFF',
    fontSize: '30px',
    marginRight: '15px'
  }
}));

function Search() {
  const classes = useStyles({});

  return (
    <section className={classes.content}>
      <header className={classes.searchHeader}>
        <div className={classes.assetSelector}>
          <ImageIcon className={classes.assetImage}/>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            value="all"
            className='select'
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </div>
        <div className={classes.search}>
          <InputBase
            placeholder="Search…"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            inputProps={{ 'aria-label': 'search' }}
          />
          <SearchIcon className={classes.searchIcon}/>
        </div>
      </header>
    </section>
  )
}


export default Search;
