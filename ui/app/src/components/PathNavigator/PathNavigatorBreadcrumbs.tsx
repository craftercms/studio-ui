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

import { DetailedItem } from '../../models/Item';
import { useStyles } from './styles';
import React, { useState } from 'react';
import clsx from 'clsx';
import SearchBar from '../SearchBar/SearchBar';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNextRounded';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseIconRounded from '@mui/icons-material/CloseRounded';
import { defineMessages, useIntl } from 'react-intl';

export type PathNavigatorBreadcrumbsClassKey =
  | 'root'
  | 'searchRoot'
  | 'searchInput'
  | 'searchCleanButton'
  | 'searchCloseButton';

export interface BreadcrumbsProps {
  breadcrumb: DetailedItem[];
  keyword?: string;
  classes?: Partial<Record<PathNavigatorBreadcrumbsClassKey, string>>;
  onSearch?(keyword: string): void;
  onCrumbSelected(breadcrumb: DetailedItem, event: React.SyntheticEvent): void;
}

const messages = defineMessages({
  filter: { id: 'pathNavigator.pathFilterInputPlaceholder', defaultMessage: 'Filter children of {name}...' }
});

// PathBreadcrumbs + PathOptions + (Path)Search
function PathNavigatorBreadcrumbs(props: BreadcrumbsProps) {
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const { breadcrumb, onCrumbSelected, keyword, onSearch } = props;
  const [showSearch, setShowSearch] = useState(Boolean(keyword));

  const onChange = (keyword: string) => onSearch(keyword);

  const maxIndex = breadcrumb.length - 1;
  const forceSearch = breadcrumb.length <= 1;

  return (
    <section className={clsx(classes.breadcrumbs, classes.widgetSection, props.classes?.root)}>
      {(showSearch && onSearch) || forceSearch ? (
        <>
          <SearchBar
            autoFocus={!forceSearch}
            onChange={onChange}
            keyword={keyword}
            placeholder={formatMessage(messages.filter, { name: breadcrumb[0]?.label })}
            showActionButton={Boolean(keyword)}
            classes={{
              root: clsx(classes.searchRoot, props.classes?.searchRoot),
              inputInput: clsx(classes.searchInput, props.classes?.searchInput),
              actionIcon: clsx(classes.searchCloseIcon, props.classes?.searchCleanButton)
            }}
          />
          {!forceSearch && (
            <IconButton
              size="small"
              onClick={() => {
                onSearch('');
                setShowSearch(false);
              }}
              className={clsx(classes.searchCloseButton, props.classes?.searchCloseButton)}
            >
              <CloseIconRounded />
            </IconButton>
          )}
        </>
      ) : (
        <>
          <MuiBreadcrumbs
            maxItems={2}
            aria-label="Breadcrumbs"
            separator={<NavigateNextIcon fontSize="small" />}
            classes={{
              ol: classes.breadcrumbsList,
              separator: classes.breadcrumbsSeparator
            }}
          >
            {breadcrumb.map((item: DetailedItem, i: number) =>
              maxIndex !== i ? (
                <Link
                  key={item.id}
                  color="inherit"
                  component="button"
                  variant="subtitle2"
                  underline="always"
                  TypographyClasses={{
                    root: clsx(classes.breadcrumbsTypography, maxIndex === i && classes.breadcrumbLast)
                  }}
                  onClick={(e) => onCrumbSelected(item, e)}
                  children={item.label}
                />
              ) : (
                <Typography
                  key={item.id}
                  variant="subtitle2"
                  className={classes.breadcrumbsTypography}
                  children={item.label}
                />
              )
            )}
          </MuiBreadcrumbs>
          <div className={clsx(classes.breadcrumbActionsWrapper)}>
            {onSearch && (
              <IconButton
                aria-label="search"
                className={clsx(classes.iconButton)}
                onClick={() => setShowSearch(true)}
                size="large"
              >
                <SearchRoundedIcon />
              </IconButton>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default PathNavigatorBreadcrumbs;
