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
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import LauncherOpenerButton from '../LauncherOpenerButton/LauncherOpenerButton';
import SearchBar from '../SearchBar/SearchBar';
import ListViewIcon from '@mui/icons-material/ViewStreamRounded';
import GridViewIcon from '@mui/icons-material/GridOnRounded';
import ViewToolbar from '../ViewToolbar';
import Tooltip from '@mui/material/Tooltip';
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
    id: 'words.filters',
    defaultMessage: 'Filters'
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
  showTitle?: boolean;
  currentView: string;
  embedded: boolean;
  handleChangeView(): void;
  onChange(value: string): void;
  onMenuIconClick(): void;
}

export function SiteSearchToolBar(props: SiteSearchToolBarProps) {
  const { onChange, keyword, showActionButton, showTitle, handleChangeView, currentView, onMenuIconClick, embedded } =
    props;
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
        {showTitle && (
          <Typography variant="h5" component="h2" color="textPrimary">
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
          classes={{ root: classes.searchPaper }}
        />
      </section>
      <section>
        <Tooltip title={formatMessage(translations.changeViewButtonTip)}>
          <IconButton onClick={handleChangeView} size="large">
            {currentView === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </IconButton>
        </Tooltip>
        {!embedded && <LauncherOpenerButton sitesRailPosition="left" icon="apps" />}
      </section>
    </ViewToolbar>
  );
}

export default SiteSearchToolBar;

