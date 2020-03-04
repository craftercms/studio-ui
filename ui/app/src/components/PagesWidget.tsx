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

import React, { useEffect, useState } from 'react';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import PhotoSizeSelectActualIcon from '@material-ui/icons/PhotoSizeSelectActual';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import makeStyles from '@material-ui/styles/makeStyles';
import { Theme } from '@material-ui/core';
import { getChildrenByPath } from '../services/content';
import { Item } from '../models/Item';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    padding: '10px',
    border: '1px solid gray',
    width: '260px',
    margin: '0 auto'
  },
  pagesHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '5px'
  },
  pagesHeaderTitle: {
    marginLeft: '6px',
    flexGrow: 1
  },
  icon: {
    padding: '6px'
  },
  pagesBreadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '10px'
  },
  pagesBreadcrumbsUrl: {
    flexGrow: 1
  },
  pagesNavItem: {
    justifyContent: 'space-between',
    padding: '0px 0px 0px 10px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)'
    }
  }
}));

function PagesHeader() {
  const classes = useStyles({});
  return (
    <header className={classes.pagesHeader}>
      <DescriptionOutlinedIcon/>
      <Typography variant="subtitle1" className={classes.pagesHeaderTitle}>
        Pages
      </Typography>
      <IconButton aria-label="language select" className={classes.icon}>
        <PhotoSizeSelectActualIcon/>
      </IconButton>
      <IconButton aria-label="options" className={classes.icon}>
        <MoreVertIcon/>
      </IconButton>
    </header>
  )
}

interface Breadcrumb {
  id: string;
  label: string;
  path: string;
}

function PagesBreadcrumbs(props: any) {
  const classes = useStyles({});
  const { breadcrumb, onBreadcrumbSelected } = props;
  return (
    <section className={classes.pagesBreadcrumbs}>
      <div className={classes.pagesBreadcrumbsUrl}>
        {
          breadcrumb.map((item: Breadcrumb) =>
            <Link
              component="button"
              variant="body2"
              underline="always"
              color="textPrimary"
              onClick={() => onBreadcrumbSelected(item)}
              key={item.id}
            >
              {item.label}
            </Link>
          )
        }
      </div>
      <IconButton aria-label="options" className={classes.icon}>
        <MoreVertIcon/>
      </IconButton>
      <IconButton aria-label="search" className={classes.icon}>
        <SearchRoundedIcon/>
      </IconButton>
    </section>
  )
}

function PagesNav(props: any) {
  const classes = useStyles({});
  const { items, onItemSelected } = props;
  return (
    <List component="nav" aria-label="pages nav" disablePadding={true}>
      {
        items.map((item: Partial<Item>) =>
          <ListItem className={classes.pagesNavItem} key={item.id}>
            <Typography variant="body2">
              {item.label}
            </Typography>
            <IconButton aria-label="options" className={classes.icon}>
              <MoreVertIcon/>
            </IconButton>
          </ListItem>
        )
      }
    </List>
  )
}

export default function PagesWidget(props: any) {
  const classes = useStyles({});
  const { site = 'editorial', path = 'site/website' } = props;
  const [items, setItems] = useState<Item[]>(null);
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb[]>([
    {
      id: 'Home',
      label: 'Home',
      path: 'home'
    }
  ]);
  const [activePath, setActivePath] = useState<string>(path);

  useEffect(() => {
    getChildrenByPath(site, activePath).subscribe(
      (response) => {
        console.log(response);
        setItems(response.items);
      },
      (error) => {
        console.log(error);
      }
    )
  }, [site, activePath]);

  const onItemSelected = (item: Item) => {
    console.log(item);
    //setBreadcrumb();
    setActivePath(item.path);
  };

  const onBreadcrumbSelected = (item: Breadcrumb) => {
    //setBreadcrumb();
    //setActivePath(path);
  };

  return (
    <section className={classes.wrapper}>
      <PagesHeader/>
      <PagesBreadcrumbs breadcrumb={breadcrumb} onBreadcrumbSelected={onBreadcrumbSelected}/>
      {
        items &&
        <PagesNav items={items} onItemSelected={onItemSelected}/>
      }
    </section>
  )
}

