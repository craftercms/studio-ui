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
import CustomMenu from '../../components/Icons/CustomMenu';
import IconButton from '@material-ui/core/IconButton';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import ToolbarGlobalNav from '../../components/Navigation/ToolbarGlobalNav';
import SearchBar from '../../components/Controls/SearchBar';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import AppsIcon from '@material-ui/icons/Apps';
import ViewToolbar from '../ViewToolbar';

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
    searchBarContainer: {
      width: '30%',
      [theme.breakpoints.up('md')]: {
        minWidth: '500px'
      }
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
    <ViewToolbar>
      <section>
        <IconButton aria-label={formatMessage(translations.showHideFilters)} onClick={onMenuIconClick}>
          <CustomMenu />
        </IconButton>
        <Typography variant="h5" component="h2" color="textPrimary">
          {formatMessage(translations.search)}
        </Typography>
      </section>
      <section className={classes.searchBarContainer}>
        <SearchBar onChange={onChange} keyword={keyword} showActionButton={showActionButton} showDecoratorIcon />
      </section>
      <section>
        <IconButton onClick={handleChangeView}>
          {currentView === 'grid' ? <FormatListBulletedIcon /> : <AppsIcon />}
        </IconButton>
        {!embedded && <ToolbarGlobalNav />}
      </section>
    </ViewToolbar>
  );
}
