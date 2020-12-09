/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CustomMenu from '../../components/Icons/CustomMenu';
import IconButton from '@material-ui/core/IconButton';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import ToolbarGlobalNav from '../../components/Navigation/ToolbarGlobalNav';
import SearchBar from '../../components/Controls/SearchBar';

const translations = defineMessages({
  label: {
    id: 'searchToolBar.label',
    defaultMessage: 'Open filters panel'
  },
  search: {
    id: 'searchToolBar.search',
    defaultMessage: 'Search'
  }
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolBar: {
      placeContent: 'center space-between'
    },
    actionButtonSection: {
      display: 'flex',
      alignItems: 'center',

      '& > *': {
        marginRight: theme.spacing(1)
      }
    },
    globalNavSection: {
      display: 'flex',
      alignItems: 'center'
    }
  })
);

// TODO: create global Toolbar Component to reuse in preview and search
export default function ToolBar() {
  const { formatMessage } = useIntl();
  const classes = useStyles({});

  return (
    <AppBar position="static" color="default">
      <Toolbar className={classes.toolBar}>
        <section className={classes.actionButtonSection}>
          <IconButton aria-label={formatMessage(translations.label)} onClick={() => {}}>
            <CustomMenu />
          </IconButton>
          <section>
            <Typography variant="h5" component="h2">
              {formatMessage(translations.search)}
            </Typography>
          </section>
        </section>
        <section>
          <SearchBar onChange={() => {}} keyword="awesome" showActionButton={Boolean('awesome')} showDecoratorIcon />
        </section>
        <div>
          <ToolbarGlobalNav />
        </div>
      </Toolbar>
    </AppBar>
  );
}
