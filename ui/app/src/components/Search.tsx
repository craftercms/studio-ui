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
import { Theme, InputBase, MenuItem, Select, Avatar } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import ImageIcon from '@material-ui/icons/Image';
import AppsIcon from '@material-ui/icons/Apps';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import Grid from "@material-ui/core/Grid";
import MediaCard from './MediaCard';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    margin: 'auto',
  },
  searchHeader: {
    padding: '15px 20px',
    display: 'flex',
    borderBottom: '1px solid #EBEBF0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  search: {
    position: 'relative',
    background: '#EBEBF0',
    width: '500px',
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '0px 5px 5px 0px'
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
    minWidth: '187px',
    padding: '10px 12px',
    background: 'rgba(0, 122, 255, 0.1)',
    display: 'flex',
    borderRadius: '5px 0 0 5px',
    alignItems: 'center',
    marginLeft: 'auto',
    '& .select': {
      width: '100%'
    }
  },
  selectRoot:{
    width: '100%',
    color: '#007AFF',
    background: 'none',
    border: 'none',
    '&:focus': {
      boxShadow: 'none',
      background: 'none'
    }
  },
  selectIcon: {
    color: '#000000'
  },
  assetImage: {
    color: '#007AFF',
    fontSize: '30px',
    marginRight: '15px',
  },
  helperContainer: {
    display: 'flex',
    marginLeft: 'auto',
  },
  avatarContent: {
    margin: 5,
    padding: 0,
  },
  avatar: {
    background: '#EBEBF0',
    color: '#8E8E93'
  },
  content: {
    padding: '50px 30px'
  }
}));

function Search() {
  const classes = useStyles({});

  function renderMediaCards() {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <MediaCard/>
      </Grid>
    )
  }

  return (
    <section className={classes.wrapper}>
      <header className={classes.searchHeader}>
        <div className={classes.assetSelector}>
          <ImageIcon className={classes.assetImage}/>
          <Select
            labelId="asset-selector-label"
            id="asset-selector"
            value="all"
            className='select'
            classes={{
              root: classes.selectRoot,
              icon: classes.selectIcon
            }}
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
        <div className={classes.helperContainer}>
          <IconButton className={classes.avatarContent}>
            <Avatar className={classes.avatar}><AppsIcon/></Avatar>
          </IconButton>
          <IconButton className={classes.avatarContent}>
            <Avatar className={classes.avatar}><HelpOutlineIcon/></Avatar>
          </IconButton>
        </div>
      </header>
      <section className={classes.content}>
        <Grid container spacing={3}>
          {renderMediaCards()}
        </Grid>
      </section>
    </section>
  )
}


export default Search;
