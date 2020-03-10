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
import Checkbox from '@material-ui/core/Checkbox';
import { LookupTable } from '../models/LookupTable';
import CustomMenu, { SectionItem } from './CustomMenu';
import ErrorState from './ErrorState';

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
    color: grayColor
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
  title: {
    id: 'craftercms.pages.widget.title',
    defaultMessage: 'Pages'
  },
  previousPage: {
    id: 'craftercms.pages.widget.previousPage',
    defaultMessage: 'previous page'
  },
  nextPage: {
    id: 'craftercms.pages.widget.nextPage',
    defaultMessage: 'next page'
  },
  itemsSelected: {
    id: 'craftercms.pages.widget.itemsSelected',
    defaultMessage: '{count, plural, one {{count} Item selected} other {{count} Items selected}}'
  }
});

const itemMenuSections = [
  [
    {
      id: 'edit',
      label: 'Edit'
    },
    {
      id: 'view',
      label: 'View'
    },
    {
      id: 'newcontent',
      label: 'New Content'
    },
    {
      id: 'newfolder',
      label: 'New Folder'
    }
  ],
  [
    {
      id: 'delete',
      label: 'Delete'
    },
    {
      id: 'changeTemplate',
      label: 'Change Template'
    }
  ],
  [
    {
      id: 'cut',
      label: 'Cut'
    },
    {
      id: 'copy',
      label: 'Copy'
    },
    {
      id: 'duplicate',
      label: 'Duplicate'
    }
  ],
  [
    {
      id: 'dependencies',
      label: 'Dependencies'
    }
  ],
  [
    {
      id: 'history',
      label: 'History'
    },
    {
      id: 'traslation',
      label: 'Traslation'
    }
  ]
];

const selectedMenu = [
  {
    id: 'itemsSelected',
    label: '',
    type: 'text'
  },
  {
    id: 'terminateSelection',
    label: 'Terminate Selection'
  }
];

const itemsSelectedMenu = [
  [
    {
      id: 'cut',
      label: 'Cut'
    },
    {
      id: 'copy',
      label: 'Copy'
    },
    {
      id: 'paste',
      label: 'Paste'
    },
    {
      id: 'duplicate',
      label: 'Duplicate'
    },
    {
      id: 'delete',
      label: 'Delete'
    }
  ],
  [
    {
      id: 'traslation',
      label: 'Translation'
    }
  ]
];

interface PagesHeaderProps {
  currentLocale: string;

  setCurrentLocale(locale: string): void;

  onPagesMenuOpen(anchorElement: Element, type: string): void;
}

function PagesHeader(props: PagesHeaderProps) {
  const classes = useStyles({});
  const { currentLocale, onPagesMenuOpen } = props;
  const { formatMessage } = useIntl();

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

  return (
    <header className={classes.pagesHeader}>
      <DescriptionOutlinedIcon/>
      <Typography variant="subtitle1" className={classes.pagesHeaderTitle}>
        {formatMessage(translations.title)}
      </Typography>
      <IconButton
        aria-label="language select"
        className={classes.icon}
        onClick={(event) => onPagesMenuOpen(event.currentTarget, 'language')}
      >
        {currentFlag(currentLocale)}
      </IconButton>
      <IconButton
        aria-label="options"
        className={classes.icon}
        onClick={(event) => onPagesMenuOpen(event.currentTarget, 'options')}
      >
        <MoreVertIcon className={classes.blackColor}/>
      </IconButton>
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

  onBreadcrumbSelected(breadcrumb: Breadcrumb): void;

  onOpenBreadcrumbsMenu(element: Element): void;

}

function PagesBreadcrumbs(props: PagesBreadcrumbsProps) {
  const classes = useStyles({});
  const {
    breadcrumb,
    onBreadcrumbSelected,
    onOpenBreadcrumbsMenu
  } = props;

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
          onClick={(event) => onOpenBreadcrumbsMenu(event.currentTarget)}
        >
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
  item: Item;
  currentLocale: string;
  selectMode: boolean;

  onItemSelected(item: Item): void;

  onSelectItem(item: Item, unselect: boolean): void;

  onOpenItemMenu(element: Element): void;
}

function PagesNavItem(props: PagesNavItemProps) {
  const classes = useStyles({});
  const { item, onItemSelected, currentLocale, selectMode, onSelectItem, onOpenItemMenu } = props;
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
      <Typography
        variant="body2"
        className={clsx(classes.pagesNavItemText, (currentLocale !== item.localeCode) && 'opacity')}
      >
        {item.label}
        {
          (currentLocale !== item.localeCode) &&
          <FlagRoundedIcon className={classes.flag}/>
        }
      </Typography>
      {
        over &&
        <div className={classes.optionsWrapper}>
          <IconButton aria-label="options" className={classes.icon}
                      onClick={(event) => onOpenItemMenu(event.currentTarget)}>
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

  onOpenItemMenu(element: Element): void;
}

function PagesNav(props: PagesNavProps) {
  const { items, onItemSelected, currentLocale, selectMode, onSelectItem, onOpenItemMenu } = props;
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
            onOpenItemMenu={onOpenItemMenu}
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
  const [menu, setMenu] = useState({
    sections: [],
    anchorEl: null
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    getChildrenByPath(site, activePath).subscribe(
      (response) => {
        console.log(response);
        setItems(response.items);
      },
      ({ response }) => {
        setError(response);
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
  };

  const onSelectItem = (item: Item, select: boolean) => {
    setSelectedItems({ ...selectedItems, [item.id]: select ? item : false })
  };

  const onMenuItemClicked = (section: SectionItem) => {
    if (section.id === 'select') {
      setSelectMode(true);
      setMenu({
        anchorEl: null,
        sections: itemsSelectedMenu
      });
    } else if (section.id === 'terminateSelection') {
      setSelectMode(false);
      setSelectedItems(null);
      setMenu({
        ...menu,
        anchorEl: null
      });
    } else if (section.id.includes('locale')) {
      setMenu({
        ...menu,
        anchorEl: null
      });
      onChangeLocale(section.id.split('.')[1]);
    }
  };

  const onOpenBreadcrumbsMenu = (element: Element) => {
    if (selectMode) {
      const count = selectedItems && Object.values(selectedItems).filter((item: Item | false) => item !== false).length;
      let _sections = [[...selectedMenu], ...itemsSelectedMenu];
      if (count) {
        let selectedMenuItems = selectedMenu;
        selectedMenuItems[0].label = formatMessage(translations.itemsSelected, { count });
        _sections = [[...selectedMenuItems], ...itemsSelectedMenu];
      }
      setMenu({
        sections: _sections,
        anchorEl: element
      });
    } else {
      setMenu({
        sections: [
          ...itemMenuSections,
          [
            {
              id: 'select',
              label: 'Select'
            }
          ]
        ],
        anchorEl: element
      });
    }

  };

  const onOpenItemMenu = (element: Element) => {
    setMenu({
      sections: itemMenuSections,
      anchorEl: element
    });
  };

  const onChangeLocale = (locale: string) => {
    setCurrentLocale(locale);
  };

  const onPagesMenuOpen = (anchorEl: Element, type: string) => {
    if (type === 'language') {
      setMenu({
        sections: [
          [
            {
              id: 'locale.en',
              label: 'English, US (en)'
            },
            {
              id: 'locale.es',
              label: 'Spanish, Spain (es)'
            }
          ]
        ],
        anchorEl
      });
    } else {
      setMenu({
        sections: [
          [
            {
              id: 'option1',
              label: 'option1'
            }
          ]
        ],
        anchorEl
      });
    }
  };

  return (
    <section className={classes.wrapper}>
      {
        error ? (
          <ErrorState error={error}/>
        ) : (
          <>
            <PagesHeader
              currentLocale={currentLocale}
              setCurrentLocale={setCurrentLocale}
              onPagesMenuOpen={onPagesMenuOpen}
            />
            <PagesBreadcrumbs
              breadcrumb={breadcrumb}
              onBreadcrumbSelected={onBreadcrumbSelected}
              onOpenBreadcrumbsMenu={onOpenBreadcrumbsMenu}
            />
            {
              items &&
              <PagesNav
                items={items}
                onItemSelected={onItemSelected}
                currentLocale={currentLocale}
                selectMode={selectMode}
                onSelectItem={onSelectItem}
                onOpenItemMenu={onOpenItemMenu}
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
            <CustomMenu
              anchorEl={menu.anchorEl}
              open={Boolean(menu.anchorEl)}
              classes={{ paper: classes.MenuPaper, helperText: classes.helperText }}
              onClose={() => {
                setMenu({ ...menu, anchorEl: null });
              }}
              sections={menu.sections}
              onMenuItemClicked={onMenuItemClicked}
            />
          </>
        )
      }
    </section>
  )
}

