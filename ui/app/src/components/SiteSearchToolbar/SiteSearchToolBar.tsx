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
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import AppsIcon from '@material-ui/icons/Apps';
import palette from '../../styles/palette';

const translations = defineMessages({
  showHideFilters: {
    id: 'searchToolBar.showHideFilters',
    defaultMessage: 'Show/hide filters'
  },
  search: {
    id: 'words.search',
    defaultMessage: 'Search'
  }
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      boxShadow: 'none',
      borderBottom: `1px solid ${palette.gray.light3}`
    },
    toolBar: {
      placeContent: 'center space-between',
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.default : palette.white
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
    },
    searchBarContainer: {
      width: '33%',
      [theme.breakpoints.up('md')]: {
        minWidth: '500px'
      }
    },
    searchBar: {
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.paper : palette.gray.light1
    },
    currentViewButton: {
      marginRight: '10px'
    }
  })
);

interface SiteSearchToolBarProps {
  keyword: string[] | string;
  showActionButton?: boolean;
  currentView: string;
  embedded: boolean;
  handleChangeView(): void;
  onChange(value: string): void;
  onMenuIconClick(): void;
}

export default function SiteSearchToolBar(props: SiteSearchToolBarProps) {
  const { onChange, keyword, showActionButton, handleChangeView, currentView, onMenuIconClick, embedded } = props;
  const { formatMessage } = useIntl();
  const classes = useStyles({});

  return (
    <AppBar position="static" color="default" className={classes.appBar}>
      <Toolbar className={classes.toolBar}>
        <section className={classes.actionButtonSection}>
          <IconButton aria-label={formatMessage(translations.showHideFilters)} onClick={onMenuIconClick}>
            <CustomMenu />
          </IconButton>
          {!embedded && (
            <Typography variant="h5" component="h2">
              {formatMessage(translations.search)}
            </Typography>
          )}
        </section>
        <section className={classes.searchBarContainer}>
          <SearchBar
            onChange={onChange}
            keyword={keyword}
            showActionButton={showActionButton}
            showDecoratorIcon
            classes={{
              root: classes.searchBar
            }}
          />
        </section>
        <div>
          <IconButton onClick={handleChangeView} className={classes.currentViewButton}>
            {currentView === 'grid' ? <FormatListBulletedIcon /> : <AppsIcon />}
          </IconButton>
          {!embedded && <ToolbarGlobalNav />}
        </div>
      </Toolbar>
    </AppBar>
  );
}
