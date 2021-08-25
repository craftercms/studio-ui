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
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import LauncherOpenerButton from '../LauncherOpenerButton/LauncherOpenerButton';
import SearchBar from '../../components/Controls/SearchBar';
import ListViewIcon from '@material-ui/icons/ViewStreamRounded';
import GridViewIcon from '@material-ui/icons/GridOnRounded';
import ViewToolbar from '../ViewToolbar';
import Tooltip from '@material-ui/core/Tooltip';
import LogoAndMenuBundleButton from '../LogoAndMenuBundleButton';

const translations = defineMessages({
  showHideFilters: {
    id: 'searchToolBar.showHideFilters',
    defaultMessage: 'Show/hide filters'
  },
  search: {
    id: 'words.search',
    defaultMessage: 'Search'
  },
  changeViewButtonTip: {
    id: 'searchToolBar.changeViewButtonTooltip',
    defaultMessage: 'Change view'
  },
  toggleSidebarTooltip: {
    id: 'common.toggleSidebarTooltip',
    defaultMessage: 'Toggle sidebar'
  }
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchBarContainer: {
      width: '30%',
      [theme.breakpoints.up('md')]: {
        minWidth: '500px'
      }
    },
    searchPaper: {
      flex: 1
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
  const classes = useStyles();
  return (
    <ViewToolbar>
      <section>
        <Tooltip title={formatMessage(translations.toggleSidebarTooltip)}>
          <LogoAndMenuBundleButton
            aria-label={formatMessage(translations.showHideFilters)}
            onClick={onMenuIconClick}
            showCrafterIcon={!embedded}
          />
        </Tooltip>
        <Typography variant="h5" component="h2" color="textPrimary">
          {formatMessage(translations.search)}
        </Typography>
      </section>
      <section className={classes.searchBarContainer}>
        <SearchBar
          onChange={onChange}
          keyword={keyword}
          showActionButton={showActionButton}
          showDecoratorIcon
          classes={{ root: classes.searchPaper }}
        />
      </section>
      <section>
        <Tooltip title={formatMessage(translations.changeViewButtonTip)}>
          <IconButton onClick={handleChangeView}>
            {currentView === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </IconButton>
        </Tooltip>
        {!embedded && <LauncherOpenerButton sitesRailPosition="left" icon="apps" />}
      </section>
    </ViewToolbar>
  );
}
