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
import FlagRoundedIcon from '@material-ui/icons/FlagRounded';
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
import Checkbox from '@material-ui/core/Checkbox';
import { LookupTable } from '../models/LookupTable';
import Divider from '@material-ui/core/Divider';

const blueColor = '#7E9DBA';
const grayColor = '#7C7C80';
const blackColor = '#000000';
const flagColor = 'rgba(255, 59, 48, 0.5)';

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
  flag: {
    color: flagColor,
    fontSize: '1rem',
    marginLeft: '5px'
  },
  optionsWrapper: {
    marginLeft: 'auto',
    display: 'flex'
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
  },
  pagesNavItem: {
    justifyContent: 'space-between',
    padding: '0px 0px 0px 10px',
    height: '36px',
    '&.noLeftPadding': {
      paddingLeft: 0
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)'
    }
  },
  pagesNavItemText: {
    color: blueColor,
    marginRight: 'auto',
    '&.opacity': {
      opacity: '0.7'
    }
  },
  pagesNavItemCheckbox: {
    padding: '6px',
    color: blueColor
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
  },
  MenuPaper: {
    width: '182px',
    '& ul': {
      padding: 0
    },
    '& li': {
      paddingTop: '10px',
      paddingBottom: '10px',
      whiteSpace: 'initial'
    }
  },
  helperText: {
    padding: '10px 16px 10px 16px',
    color: '#8E8E93'
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
  const [menu, setMenu] = React.useState({
    anchorEl: null,
    type: null
  });
  const { currentLocale, setCurrentLocale } = props;

  const localeList = [
    {
      id: 'en',
      label: 'English, US (en)'
    },
    {
      id: 'es',
      label: 'Spanish, Spain (es)'
    }
  ];

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
    setMenu({ ...menu, anchorEl: null });
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
        onClick={(event) => setMenu({ ...menu, anchorEl: event.currentTarget, type: 'language' })}
      >
        {currentFlag(currentLocale)}
      </IconButton>
      <IconButton
        aria-label="options"
        className={classes.icon}
        onClick={(event) => setMenu({ ...menu, anchorEl: event.currentTarget, type: 'options' })}
      >
        <MoreVertIcon className={classes.blackColor}/>
      </IconButton>
      <Menu
        anchorEl={menu.anchorEl}
        open={Boolean(menu.anchorEl)}
        onClose={() => {
          setMenu({ ...menu, anchorEl: null });
        }}
      >
        {
          menu.type === 'language' ? (
            localeList.map(locale =>
              <MenuItem key={locale.id} onClick={() => changeLocale(locale.id)}>{locale.label}</MenuItem>
            )
          ) : (
            <MenuItem onClick={() => {
            }}>
              option1
            </MenuItem>
          )
        }
      </Menu>
    </header>
  )
}

interface Breadcrumb {
  id: string;
  label: string;
  path: string;
}

interface PagesBreadcrumbsProps {
  breadcrumb: Breadcrumb[];
  selectMode: boolean;
  selectedItems: LookupTable<Item>;

  setSelectMode(toggle: boolean): void;

  onBreadcrumbSelected(breadcrumb: Breadcrumb): void;

  terminateSelection(): void;

}

function PagesBreadcrumbs(props: PagesBreadcrumbsProps) {
  const classes = useStyles({});
  const { breadcrumb, onBreadcrumbSelected, selectMode, setSelectMode, terminateSelection, selectedItems } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const checkSelectedLength = () => {
    if (selectedItems) {
      return (
        <div>
          <Typography variant="body1" className={classes.helperText}>
            {Object.values(selectedItems).filter((item: Item | false) => item != false).length} Items Selected.
          </Typography>
          <Divider/>
        </div>
      )
    }
    return null
  };

  const changeSelectMode = (select: boolean) => {
    setAnchorEl(null);
    setSelectMode(select);
    if (!select) {
      terminateSelection();
    }
  };

  return (
    <section className={classes.pagesBreadcrumbs}>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small"/>}
        classes={{ ol: classes.pagesBreadcrumbsOl, separator: classes.PagesBreadCrumbsSeparator }}
      >
        {
          breadcrumb.map((item: Breadcrumb, i: number) => {
            return (breadcrumb.length !== i + 1) ? (
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
              ) :
              (
                <Typography key={item.id} variant="subtitle2"
                            className={classes.pagesBreadcrumbsTypo}>{item.label}</Typography>
              )
          })
        }
      </Breadcrumbs>
      <div className={classes.optionsWrapper}>
        <IconButton
          aria-label="options"
          className={clsx(classes.icon, classes.primaryColor)}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <MoreVertIcon/>
        </IconButton>
        <IconButton aria-label="search" className={clsx(classes.icon, classes.primaryColor)}>
          <SearchRoundedIcon/>
        </IconButton>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        classes={{ paper: classes.MenuPaper }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        {
          selectMode && checkSelectedLength()
        }
        <MenuItem onClick={() => changeSelectMode(!selectMode)}>
          {!selectMode ? 'Select' : 'Terminate Selection'}
        </MenuItem>
      </Menu>
    </section>
  )
}

interface PagesNavItemProps {
  item: Item;
  currentLocale: string;
  selectMode: boolean;

  onItemSelected(item: Item): void;

  onSelectItem(item: Item, unselect: boolean): void;
}

function PagesNavItem(props: PagesNavItemProps) {
  const classes = useStyles({});
  const { item, onItemSelected, currentLocale, selectMode, onSelectItem } = props;
  const [over, setOver] = useState(false);
  return (
    <ListItem
      className={clsx(classes.pagesNavItem, selectMode && 'noLeftPadding')}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
    >
      {
        selectMode &&
        <Checkbox
          color="default"
          className={classes.pagesNavItemCheckbox}
          onChange={(e) => {
            onSelectItem(item, e.currentTarget.checked)
          }}
          value="primary"
        />
      }
      <Typography variant="body2"
                  className={clsx(classes.pagesNavItemText, (currentLocale !== item.localeCode) && 'opacity')}>
        {item.label}
        {
          (currentLocale === item.localeCode) &&
          <FlagRoundedIcon className={classes.flag}/>
        }
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

interface PagesNavProps {
  items: Item[];
  currentLocale: string;
  selectMode: boolean;

  onSelectItem(item: Item, unselect: boolean): void;

  onItemSelected(item: Item): void;
}

function PagesNav(props: PagesNavProps) {
  const { items, onItemSelected, currentLocale, selectMode, onSelectItem } = props;
  return (
    <List component="nav" aria-label="pages nav" disablePadding={true}>
      {
        items.map((item: Item) =>
          <PagesNavItem
            item={item}
            key={item.id}
            onItemSelected={onItemSelected}
            currentLocale={currentLocale}
            selectMode={selectMode}
            onSelectItem={onSelectItem}
          />
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
  const [selectMode, setSelectMode] = React.useState(false);
  const [items, setItems] = useState<Item[]>(null);
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb[]>([
    {
      id: 'Home',
      label: 'Home',
      path: 'home'
    }
  ]);
  const [activePath, setActivePath] = useState<string>(path);
  const [selectedItems, setSelectedItems] = useState<LookupTable>(null);

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
    setBreadcrumb([...breadcrumb, item]);
    setActivePath(item.path);
  };

  const onBreadcrumbSelected = (item: Breadcrumb) => {
    let newBreadcrumb = [...breadcrumb];
    let i = newBreadcrumb.indexOf(item);
    newBreadcrumb.splice(i + 1);
    setBreadcrumb(newBreadcrumb);
    setActivePath(item.path);
  };

  const onPageChanged = (page: number) => {
    console.log(page);
  };

  const onSelectItem = (item: Item, select: boolean) => {
    setSelectedItems({ ...selectedItems, [item.id]: select ? item : false })
  };

  const terminateSelection = () => {
    setSelectedItems(null);
  };

  return (
    <section className={classes.wrapper}>
      <PagesHeader
        currentLocale={currentLocale}
        setCurrentLocale={setCurrentLocale}
      />
      <PagesBreadcrumbs
        breadcrumb={breadcrumb}
        onBreadcrumbSelected={onBreadcrumbSelected}
        selectMode={selectMode}
        setSelectMode={setSelectMode}
        terminateSelection={terminateSelection}
        selectedItems={selectedItems}
      />
      {
        items &&
        <PagesNav
          items={items}
          onItemSelected={onItemSelected}
          currentLocale={currentLocale}
          selectMode={selectMode}
          onSelectItem={onSelectItem}
        />
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

