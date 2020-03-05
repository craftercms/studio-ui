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
import { defineMessages, useIntl } from 'react-intl';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TablePagination from '@material-ui/core/TablePagination';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import PhotoSizeSelectActualIcon from '@material-ui/icons/PhotoSizeSelectActual';
import PlaceRoundedIcon from '@material-ui/icons/PlaceRounded';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import NavigateNextIcon from '@material-ui/icons/NavigateNextRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import makeStyles from '@material-ui/styles/makeStyles';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import { Breadcrumbs, Theme } from '@material-ui/core';
import { getChildrenByPath } from '../services/content';
import { Item } from '../models/Item';
import clsx from 'clsx';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const blueColor = '#7E9DBA';
const grayColor = '#7C7C80';
const blackColor = '#000000';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    padding: '10px',
    border: '1px solid gray',
    width: '260px',
    margin: '0 auto'
  },
  primaryColor: {
    color: blueColor
  },
  blackColor: {
    color: blackColor
  },
  optionsWrapper: {
    marginLeft: 'auto'
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
  pagesBreadcrumbsOl: {
    display: 'flex',
    alignItems: 'center',
    '& li': {
      lineHeight: 1
    }
  },
  PagesBreadCrumbsSeparator: {
    margin: '0 2px'
  },
  pagesBreadcrumbsTypo: {
    fontWeight: 'bold',
    color: grayColor,
    lineHeight: 1
  },
  pagesNavItem: {
    justifyContent: 'space-between',
    padding: '0px 0px 0px 10px',
    height: '36px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)'
    }
  },
  pagination: {
    marginTop: '10px',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    '& p': {
      padding: 0
    },
    '& svg': {
      top: 'inherit'
    },
    '& .hidden': {
      display: 'none'
    }
  },
  toolbar: {
    padding: 0,
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '20px',
    '& .MuiTablePagination-spacer': {
      display: 'none'
    },
    '& .MuiTablePagination-spacer + p': {
      display: 'none'
    }
  }
}));

const translations = defineMessages({
  previousPage: {
    id: 'craftercms.pages.widget.previousPage',
    defaultMessage: 'previous page'
  },
  nextPage: {
    id: 'craftercms.pages.widget.nextPage',
    defaultMessage: 'next page'
  }
});

interface PagesHeaderProps {
  currentLocale: string;

  setCurrentLocale(locale: string): void;
}

function PagesHeader(props: PagesHeaderProps) {
  const classes = useStyles({});
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { currentLocale, setCurrentLocale } = props;

  const currentFlag = (locale: string) => {
    switch (locale) {
      case 'en': {
        return <PhotoSizeSelectActualIcon className={classes.blackColor}/>
      }
      case 'es': {
        return <PlaceRoundedIcon className={classes.blackColor}/>
      }
      default: {
        return <PhotoSizeSelectActualIcon className={classes.blackColor}/>
      }
    }
  };

  const changeLocale = (locale: string) => {
    setAnchorEl(null);
    setCurrentLocale(locale);
  };

  return (
    <header className={classes.pagesHeader}>
      <DescriptionOutlinedIcon/>
      <Typography variant="subtitle1" className={classes.pagesHeaderTitle}>
        Pages
      </Typography>
      <IconButton
        aria-label="language select"
        className={classes.icon}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {currentFlag(currentLocale)}
      </IconButton>
      <IconButton aria-label="options" className={classes.icon}>
        <MoreVertIcon className={classes.blackColor}/>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null)
        }}
      >
        <MenuItem onClick={() => changeLocale('en')}>English, US (en)</MenuItem>
        <MenuItem onClick={() => changeLocale('es')}>Spanish, Spain (es)</MenuItem>
      </Menu>
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
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small"/>}
        classes={{ ol: classes.pagesBreadcrumbsOl, separator: classes.PagesBreadCrumbsSeparator }}
      >
        {
          breadcrumb.map((item: Breadcrumb) =>
            <Link
              key={item.id}
              color="inherit"
              component="button"
              variant="subtitle2"
              underline="always"
              TypographyClasses={{ root: classes.pagesBreadcrumbsTypo }}
              onClick={() => onBreadcrumbSelected(item)}
            >
              {item.label}
            </Link>
          )
        }
      </Breadcrumbs>
      <div className={classes.optionsWrapper}>
        <IconButton aria-label="options" className={clsx(classes.icon, classes.primaryColor)}>
          <MoreVertIcon/>
        </IconButton>
        <IconButton aria-label="search" className={clsx(classes.icon, classes.primaryColor)}>
          <SearchRoundedIcon/>
        </IconButton>
      </div>
    </section>
  )
}

interface PagesNavItemProps {
  item: Item

  onItemSelected(item: Item): void;
}

function PagesNavItem(props: PagesNavItemProps) {
  const classes = useStyles({});
  const { item, onItemSelected } = props;
  const [over, setOver] = useState(false);
  return (
    <ListItem
      className={classes.pagesNavItem}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
    >
      <Typography variant="body2" className={classes.primaryColor}>
        {item.label}
      </Typography>
      {
        over &&
        <div className={classes.optionsWrapper}>
          <IconButton aria-label="options" className={classes.icon}>
            <MoreVertIcon/>
          </IconButton>
          <IconButton aria-label="options" className={classes.icon} onClick={() => onItemSelected(item)}>
            <ChevronRightRoundedIcon/>
          </IconButton>
        </div>
      }
    </ListItem>
  )
}

function PagesNav(props: any) {
  const { items, onItemSelected } = props;
  return (
    <List component="nav" aria-label="pages nav" disablePadding={true}>
      {
        items.map((item: Item) =>
          <PagesNavItem item={item} key={item.id} onItemSelected={onItemSelected}/>
        )
      }
    </List>
  )
}

interface PagesWidgetProps {
  site?: string;
  path?: string;
  locale?: string;
}

export default function PagesWidget(props: PagesWidgetProps) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { site = 'editorial', path = 'site/website', locale = 'en' } = props;
  const [currentLocale, setCurrentLocale] = React.useState(locale);
  const [items, setItems] = useState<Item[]>(null);
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb[]>([
    {
      id: 'Home',
      label: 'Home',
      path: 'home'
    },
    {
      id: 'Second',
      label: 'Second',
      path: 'Second'
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

  function onPageChanged(page: number) {
    console.log(page);
  }

  return (
    <section className={classes.wrapper}>
      <PagesHeader currentLocale={currentLocale} setCurrentLocale={setCurrentLocale}/>
      <PagesBreadcrumbs breadcrumb={breadcrumb} onBreadcrumbSelected={onBreadcrumbSelected}/>
      {
        items &&
        <PagesNav items={items} onItemSelected={onItemSelected}/>
      }
      <TablePagination
        className={classes.pagination}
        classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
        component="div"
        labelRowsPerPage=""
        count={10}
        rowsPerPage={10}
        page={0}
        backIconButtonProps={{
          'aria-label': formatMessage(translations.previousPage)
        }}
        nextIconButtonProps={{
          'aria-label': formatMessage(translations.nextPage)
        }}
        onChangePage={(e: React.MouseEvent<HTMLButtonElement>, page: number) => onPageChanged(page)}
      />
    </section>
  )
}

