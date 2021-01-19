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

import { DetailedItem } from '../../../models/Item';
import { useStyles } from './styles';
import React, { useState } from 'react';
import clsx from 'clsx';
import SearchBar from '../../Controls/SearchBar';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNextRounded';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import { isNavigable } from './utils';

export type BreadcrumbsClassKey = 'root' | 'searchRoot' | 'searchInput' | 'searchButton';

interface BreadcrumbsProps {
  breadcrumb: DetailedItem[];
  keyword?: string;
  classes?: Partial<Record<BreadcrumbsClassKey, string>>;
  onMenu?(element: Element): void;
  onSearch?(keyword: string): void;
  onCrumbSelected(breadcrumb: DetailedItem): void;
}

// PathBreadcrumbs + PathOptions + (Path)Search
export default function PathNavigatorBreadcrumbs(props: BreadcrumbsProps) {
  const classes = useStyles({});
  const { breadcrumb, onCrumbSelected, onMenu, keyword, onSearch } = props;
  const [showSearch, setShowSearch] = useState(false);

  const onChange = (keyword: string) => {
    if (keyword === '') {
      setShowSearch(false);
    }
    onSearch(keyword);
  };

  const maxIndex = breadcrumb.length - 1;

  return (
    <section className={clsx(classes.breadcrumbs, classes.widgetSection, props.classes?.root)}>
      {showSearch && onSearch ? (
        <SearchBar
          autoFocus
          onChange={onChange}
          keyword={keyword}
          onActionButtonClick={() => {
            if (keyword === '') {
              setShowSearch(false);
            } else {
              onSearch('');
            }
          }}
          showActionButton={true}
          classes={{
            root: clsx(classes.searchRoot, props.classes?.searchRoot),
            inputInput: clsx(classes.searchInput, props.classes?.searchInput),
            actionIcon: clsx(classes.searchCloseIcon, props.classes?.searchButton)
          }}
        />
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
              maxIndex !== i || (maxIndex === i && isNavigable(item)) ? (
                <Link
                  key={item.id}
                  color="inherit"
                  component="button"
                  variant="subtitle2"
                  underline="always"
                  TypographyClasses={{
                    root: clsx(classes.breadcrumbsTypography, maxIndex === i && classes.breadcrumbLast)
                  }}
                  onClick={() => onCrumbSelected(item)}
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
          <div className={clsx(classes.optionsWrapper, classes.optionsWrapperOver)}>
            {onMenu && (
              <IconButton
                aria-label="options"
                className={clsx(classes.iconButton)}
                onClick={(event) => onMenu(event.currentTarget)}
              >
                <MoreVertIcon />
              </IconButton>
            )}
            {onSearch && (
              <IconButton aria-label="search" className={clsx(classes.iconButton)} onClick={() => setShowSearch(true)}>
                <SearchRoundedIcon />
              </IconButton>
            )}
          </div>
        </>
      )}
    </section>
  );
}
