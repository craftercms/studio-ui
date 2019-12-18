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

import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/MenuRounded';
import AppBar from '@material-ui/core/AppBar';
import { closeTools, openTools, usePreviewContext } from './previewContext';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import KeyboardArrowDownRounded from '@material-ui/icons/KeyboardArrowDownRounded';
import KeyboardArrowLeftRounded from '@material-ui/icons/KeyboardArrowLeftRounded';
import KeyboardArrowRightRounded from '@material-ui/icons/KeyboardArrowRightRounded';
import RefreshRounded from '@material-ui/icons/RefreshRounded';
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import ToolbarGlobalNav from '../../components/Navigation/ToolbarGlobalNav';

const useStyles = makeStyles((theme: Theme) => createStyles({
  toolBar: {
    placeContent: 'center space-between'
    // background: palette.gray.dark4
  },
  addressBarInput: {
    width: 400,
    padding: '2px 4px',
    // margin: '0 5px 0 0 ',
    display: 'flex',
    alignItems: 'center'
    // backgroundColor: palette.gray.dark6
  },
  inputContainer: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  input: {
    border: 'none',
    '&:focus:invalid, &:focus': {
      border: 'none',
      boxShadow: 'none'
    }
  },
  iconButton: {
    // padding: 5,
    // margin: '0 5px 0 0',
    // color: palette.gray.light4,
    // backgroundColor: palette.gray.dark2
  },
  divider: {
    height: 28,
    margin: 4
  },

  addressBarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  globalNavSection: {
    display: 'flex',
    alignItems: 'center'
  }

}));

export function AddressBar() {
  const classes = useStyles({});

  const [site, setSite] = useState('editorial');

  return (
    <>
      <IconButton className={classes.iconButton} aria-label="search">
        <KeyboardArrowLeftRounded/>
      </IconButton>
      <IconButton className={classes.iconButton} aria-label="search">
        <KeyboardArrowRightRounded/>
      </IconButton>
      <IconButton className={classes.iconButton} aria-label="search">
        <RefreshRounded/>
      </IconButton>
      <Paper className={classes.addressBarInput}>
        <Select value={site} classes={{ select: classes.input }} onChange={(e: any) => setSite(e.target.value)}>
          <MenuItem value="editorial">
            editorial
          </MenuItem>
          <MenuItem value="empty">
            empty
          </MenuItem>
          <MenuItem value="ecom">
            ecommerce
          </MenuItem>
        </Select>
        <InputBase
          placeholder="/"
          className={classes.inputContainer}
          classes={{ input: classes.input }}
          inputProps={{ 'aria-label': '' }}
        />
        <IconButton aria-label="search">
          <KeyboardArrowDownRounded/>
        </IconButton>
      </Paper>
      <IconButton className={classes.iconButton} aria-label="search">
        <MoreVertRounded/>
      </IconButton>
    </>
  );
}

export default function ToolBar() {
  const [{ showToolsPanel }, dispatch] = usePreviewContext();
  return (
    <ToolBarUI
      onMenuButtonClicked={() => dispatch(showToolsPanel ? closeTools() : openTools())}
    />
  );
}

export function ToolBarUI(props: any) {
  const { onMenuButtonClicked } = props;
  const classes = useStyles({});
  const user = {
    firstName: 'admin',
    lastName: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    authenticationType: 'db'
  };
  return (
    <AppBar position="static" color="inherit">
      <Toolbar className={classes.toolBar}>
        <IconButton
          aria-label="Open drawer"
          onClick={onMenuButtonClicked}
        >
          <MenuIcon/>
        </IconButton>
        <section className={classes.addressBarContainer}>
          <AddressBar/>
        </section>
        <div className={classes.globalNavSection}>
          <ToolbarGlobalNav user={user}/>
        </div>
      </Toolbar>
    </AppBar>
  );
}
