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
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { copyItem, cutItem, getChildrenByPath, getPages, pasteItem } from '../services/content';
import { getTargetLocales } from '../services/translation';
import { Item, LegacyItem } from '../models/Item';
import clsx from 'clsx';
import Checkbox from '@material-ui/core/Checkbox';
import { LookupTable } from '../models/LookupTable';
import ContextMenu, { SectionItem } from './ContextMenu';
import SearchBar from './SearchBar';
import { setRequestForgeryToken } from '../utils/auth';
import { useActiveSiteId, useSpreadState } from '../utils/hooks';
import CopyItemsDialog from './CopyItemsDialog';
import ContentLocalizationDialog from './ContentLocalizationDialog';
import { palette } from '../styles/theme';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../state/reducers/dialogs/error';

const flagColor = 'rgba(255, 59, 48, 0.5)';

const useStyles = makeStyles((theme) =>
  createStyles({
    wrapper: {
    },
    primaryColor: {
      color: theme.palette.primary.main
    },
    blackColor: {
      color: palette.black
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
    searchRoot: {
      //margin: '10px 0'
    },
    pagesBreadcrumbs: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '10px'
    },
    pagesBreadcrumbsOl: {
      display: 'flex',
      alignItems: 'center',
      padding: '9px 0',
      '& li': {
        lineHeight: 1
      }
    },
    PagesBreadCrumbsSeparator: {
      margin: '0 2px'
    },
    pagesBreadcrumbsTypo: {
      fontWeight: 'bold',
      color: palette.gray.medium4
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
      color: theme.palette.primary.main,
      padding: 0,
      marginRight: 'auto',
      '&.opacity': {
        opacity: '0.7'
      }
    },
    pagesNavItemCheckbox: {
      padding: '6px',
      color: theme.palette.primary.main
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
    menuPaper: {
      width: '182px'
    },
    menuList: {
      padding: 0
    },
    menuItemRoot: {
      whiteSpace: 'initial'
    },
    helperText: {
      padding: '10px 16px 10px 16px',
      color: '#8E8E93'
    }
  })
);

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
  },
  copyDialogTitle: {
    id: 'craftercms.copy.dialog.title',
    defaultMessage: 'Copy'
  },
  copyDialogSubtitle: {
    id: 'craftercms.copy.dialog.subtitle',
    defaultMessage:
      'Please select any of the sub-pages you would like to batch copy. When pasting, any selected sub-pages and their positional heirarchy will be retained.'
  },
  edit: {
    id: 'words.edit',
    defaultMessage: 'Edit'
  },
  view: {
    id: 'words.view',
    defaultMessage: 'View'
  },
  newContent: {
    id: 'craftercms.pages.option.newContent',
    defaultMessage: 'New Content'
  },
  newFolder: {
    id: 'craftercms.pages.option.newFolder',
    defaultMessage: 'New Folder'
  },
  changeTemplate: {
    id: 'craftercms.pages.option.changeTemplate',
    defaultMessage: 'Change Template'
  },
  cut: {
    id: 'words.cut',
    defaultMessage: 'Cut'
  },
  copy: {
    id: 'words.copy',
    defaultMessage: 'Copy'
  },
  paste: {
    id: 'words.paste',
    defaultMessage: 'Paste'
  },
  duplicate: {
    id: 'words.duplicate',
    defaultMessage: 'Duplicate'
  },
  delete: {
    id: 'words.delete',
    defaultMessage: 'Delete'
  },
  dependencies: {
    id: 'words.dependencies',
    defaultMessage: 'Dependencies'
  },
  history: {
    id: 'words.history',
    defaultMessage: 'History'
  },
  translation: {
    id: 'words.translation',
    defaultMessage: 'Translation'
  },
  select: {
    id: 'words.select',
    defaultMessage: 'Select'
  },
  terminateSelection: {
    id: 'craftercms.pages.option.terminateSelection',
    defaultMessage: 'Terminate Selection'
  }
});

const menuOptions = {
  edit: {
    id: 'edit',
    label: translations.edit
  },
  view: {
    id: 'view',
    label: translations.view
  },
  newContent: {
    id: 'newcontent',
    label: translations.newContent
  },
  newFolder: {
    id: 'newfolder',
    label: translations.newFolder
  },
  changeTemplate: {
    id: 'changeTemplate',
    label: translations.changeTemplate
  },
  cut: {
    id: 'cut',
    label: translations.cut
  },
  copy: {
    id: 'copy',
    label: translations.copy
  },
  paste: {
    id: 'paste',
    label: translations.paste
  },
  duplicate: {
    id: 'duplicate',
    label: translations.duplicate
  },
  delete: {
    id: 'delete',
    label: translations.delete
  },
  dependencies: {
    id: 'dependencies',
    label: translations.dependencies
  },
  history: {
    id: 'history',
    label: translations.history
  },
  translation: {
    id: 'translation',
    label: translations.translation
  },
  select: {
    id: 'select',
    label: translations.select
  },
  itemsSelected: {
    id: 'itemsSelected',
    label: translations.itemsSelected,
    type: 'text',
    values: {
      count: 0
    }
  },
  terminateSelection: {
    id: 'terminateSelection',
    label: translations.terminateSelection
  }
};

function generateMenuSections(item: Item, menuState: MenuState, count?: number) {
  let sections = [];
  if (menuState.selectMode && !item) {
    if (count > 0) {
      let selectedMenuItems = menuOptions.itemsSelected;
      selectedMenuItems.values.count = count;
      sections.push([selectedMenuItems, menuOptions.terminateSelection]);
    } else {
      sections.push([menuOptions.terminateSelection]);
    }
    sections.push(
      menuState.hasClipboard
        ? [
          menuOptions.cut,
          menuOptions.copy,
          menuOptions.paste,
          menuOptions.duplicate,
          menuOptions.delete
        ]
        : [menuOptions.cut, menuOptions.copy, menuOptions.duplicate, menuOptions.delete]
    );
    sections.push([menuOptions.translation]);
  } else {
    sections.push(
      [menuOptions.edit, menuOptions.view, menuOptions.newContent, menuOptions.newFolder],
      [menuOptions.delete, menuOptions.changeTemplate]
    );
    sections.push(
      menuState.hasClipboard
        ? [menuOptions.cut, menuOptions.copy, menuOptions.paste, menuOptions.duplicate]
        : [menuOptions.cut, menuOptions.copy, menuOptions.duplicate]
    );
    sections.push([menuOptions.dependencies], [menuOptions.history, menuOptions.translation]);
    if (!item) {
      sections.push([menuOptions.select]);
    }
  }

  return sections;
}

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
        return <PhotoSizeSelectActualIcon className={classes.blackColor} />;
      }
      case 'es': {
        return <PlaceRoundedIcon className={classes.blackColor} />;
      }
      default: {
        return <PhotoSizeSelectActualIcon className={classes.blackColor} />;
      }
    }
  };

  return (
    <header className={classes.pagesHeader}>
      <DescriptionOutlinedIcon />
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
        <MoreVertIcon className={classes.blackColor} />
      </IconButton>
    </header>
  );
}

interface Breadcrumb {
  id: string;
  label: string;
  path: string;
}

interface PagesBreadcrumbsProps {
  breadcrumb: Breadcrumb[];
  keyword: string;

  onBreadcrumbSelected(breadcrumb: Breadcrumb): void;

  onOpenBreadcrumbsMenu(element: Element): void;

  onSearch(keyword: string): void;
}

function PagesBreadcrumbs(props: PagesBreadcrumbsProps) {
  const classes = useStyles({});
  const { breadcrumb, onBreadcrumbSelected, onOpenBreadcrumbsMenu, keyword, onSearch } = props;
  const [showSearch, setShowSearch] = useState(false);

  const onChange = (keyword: string) => {
    if (keyword === '') {
      setShowSearch(false);
    }
    onSearch(keyword);
  };

  return (
    <section className={classes.pagesBreadcrumbs}>
      {showSearch ? (
        <SearchBar
          onChange={onChange}
          keyword={keyword}
          showActionButton={true}
          onActionButtonClick={() => onChange('')}
          classes={{ root: classes.searchRoot }}
        />
      ) : (
        <>
          <Breadcrumbs
            aria-label="breadcrumb"
            maxItems={2}
            separator={<NavigateNextIcon fontSize="small" />}
            classes={{
              ol: classes.pagesBreadcrumbsOl,
              separator: classes.PagesBreadCrumbsSeparator
            }}
          >
            {breadcrumb.map((item: Breadcrumb, i: number) => {
              return breadcrumb.length !== i + 1 ? (
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
              ) : (
                <Typography
                  key={item.id}
                  variant="subtitle2"
                  className={classes.pagesBreadcrumbsTypo}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
          <div className={classes.optionsWrapper}>
            <IconButton
              aria-label="options"
              className={clsx(classes.icon, classes.primaryColor)}
              onClick={(event) => onOpenBreadcrumbsMenu(event.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
            <IconButton
              aria-label="search"
              className={clsx(classes.icon, classes.primaryColor)}
              onClick={() => setShowSearch(true)}
            >
              <SearchRoundedIcon />
            </IconButton>
          </div>
        </>
      )}
    </section>
  );
}

interface PagesNavItemProps {
  item: Item;
  currentLocale: string;
  selectMode: boolean;

  onItemSelected(item: Item): void;

  onSelectItem(item: Item, unselect: boolean): void;

  onOpenItemMenu(element: Element, item: Item): void;
}

function PagesNavItem(props: PagesNavItemProps) {
  const classes = useStyles({});
  const { item, onItemSelected, currentLocale, selectMode, onSelectItem, onOpenItemMenu } = props;
  const [over, setOver] = useState(false);
  return (
    <ListItem
      className={clsx(classes.pagesNavItem, selectMode && 'noLeftPadding')}
      onMouseOver={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
    >
      {selectMode && (
        <Checkbox
          color="default"
          className={classes.pagesNavItemCheckbox}
          onChange={(e) => {
            onSelectItem(item, e.currentTarget.checked);
          }}
          value="primary"
        />
      )}
      <Typography
        variant="body2"
        className={clsx(classes.pagesNavItemText, currentLocale !== item.localeCode && 'opacity')}
      >
        {item.label}
        {currentLocale !== item.localeCode && <FlagRoundedIcon className={classes.flag} />}
      </Typography>
      {over && (
        <div className={classes.optionsWrapper}>
          <IconButton
            aria-label="options"
            className={classes.icon}
            onClick={(event) => onOpenItemMenu(event.currentTarget, item)}
          >
            <MoreVertIcon />
          </IconButton>
          <IconButton
            aria-label="options"
            className={classes.icon}
            onClick={() => onItemSelected(item)}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </div>
      )}
    </ListItem>
  );
}

interface PagesNavProps {
  items: Item[];
  currentLocale: string;
  selectMode: boolean;

  onSelectItem(item: Item, unselect: boolean): void;

  onItemSelected(item: Item): void;

  onOpenItemMenu(element: Element, item: Item): void;
}

function PagesNav(props: PagesNavProps) {
  const { items, onItemSelected, currentLocale, selectMode, onSelectItem, onOpenItemMenu } = props;
  return (
    <List component="nav" aria-label="pages nav" disablePadding={true}>
      {items.map((item: Item) => (
        <PagesNavItem
          item={item}
          key={item.id}
          onItemSelected={onItemSelected}
          currentLocale={currentLocale}
          selectMode={selectMode}
          onSelectItem={onSelectItem}
          onOpenItemMenu={onOpenItemMenu}
        />
      ))}
    </List>
  );
}

interface PagesWidgetProps {
  path?: string;
  locale?: string;
}

interface MenuState {
  selectMode: boolean;
  hasClipboard: boolean;
}

export default function PagesWidget(props: PagesWidgetProps) {
  const classes = useStyles({});
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { path, locale } = props;
  const [currentLocale, setCurrentLocale] = React.useState(locale);
  const site = useActiveSiteId();
  const [menuState, setMenuState] = useSpreadState<MenuState>({
    selectMode: false,
    hasClipboard: false
  });
  const [items, setItems] = useState<Item[]>(null);
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb[]>([]);
  const [activePath, setActivePath] = useState<string>(path);
  const [selectedItems, setSelectedItems] = useState<LookupTable>(null);
  const [menu, setMenu] = useSpreadState({
    sections: [],
    anchorEl: null,
    activeItem: null
  });
  const [keyword, setKeyword] = useState('');

  const [copyDialog, setCopyDialog] = useState(null);
  const [translationDialog, setTranslationDialog] = useState(null);

  useEffect(() => {
    getChildrenByPath(site, activePath).subscribe(
      (response) => {
        setItems(response.items);
        setBreadcrumb([...breadcrumb, response.parent]);
      },
      (response) => {
        dispatch(
          showErrorDialog({
            error: response
          })
        );
      }
    );
  }, [site, activePath]);

  setRequestForgeryToken();

  const onItemSelected = (item: Item) => {
    //setBreadcrumb([...breadcrumb, item]);
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
    setSelectedItems({ ...selectedItems, [item.id]: select ? item : false });
  };

  const onMenuItemClicked = (section: SectionItem) => {
    switch (section.id) {
      case 'select': {
        setMenuState({ selectMode: true });
        setMenu({
          activeItem: null,
          anchorEl: null
        });
        break;
      }
      case 'terminateSelection': {
        setMenuState({ selectMode: false });
        setSelectedItems(null);
        setMenu({
          activeItem: null,
          anchorEl: null
        });
        break;
      }
      case 'copy': {
        getPages(site, menu.activeItem).subscribe(
          (legacyItem: LegacyItem) => {
            if (legacyItem.children.length) {
              setMenu({
                activeItem: null,
                anchorEl: null
              });
              setCopyDialog(legacyItem);
            } else {
              copyItem(site, menu.activeItem).subscribe(
                (response) => {
                  if (response.success) {
                    setMenu({
                      activeItem: null,
                      anchorEl: null
                    });
                    setMenuState({ hasClipboard: true });
                  }
                },
                (response) => {
                  dispatch(
                    showErrorDialog({
                      error: response
                    })
                  );
                }
              );
            }
          },
          (response) => {
            dispatch(
              showErrorDialog({
                error: response
              })
            );
          }
        );
        break;
      }
      case 'paste': {
        pasteItem(site, menu.activeItem).subscribe(
          () => {
            setMenu({
              activeItem: null,
              anchorEl: null
            });
            setMenuState({ hasClipboard: false });
          },
          (response) => {
            dispatch(
              showErrorDialog({
                error: response
              })
            );
          }
        );
        break;
      }
      case 'duplicate': {
        break;
      }
      case 'cut': {
        cutItem(site, menu.activeItem).subscribe(
          (response) => {
            if (response.success) {
              setMenu({
                activeItem: null,
                anchorEl: null
              });
              setMenuState({ hasClipboard: true });
            }
          },
          (response) => {
            dispatch(
              showErrorDialog({
                error: response
              })
            );
          }
        );
        break;
      }
      case 'translation': {
        const path = menu.activeItem.path;
        setMenu({
          activeItem: null,
          anchorEl: null
        });
        getTargetLocales(site, path).subscribe(
          (response) => {
            setTranslationDialog(response.items);
          },
          (response) => {
            dispatch(
              showErrorDialog({
                error: response
              })
            );
          }
        );
        break;
      }
      default: {
        if (section.id.includes('locale')) {
          setMenu({
            ...menu,
            anchorEl: null
          });
          onChangeLocale(section.id.split('.')[1]);
        }
        break;
      }
    }
  };

  const onOpenBreadcrumbsMenu = (element: Element) => {
    const count =
      selectedItems &&
      Object.values(selectedItems).filter((item: Item | false) => item !== false).length;
    setMenu({
      sections: generateMenuSections(null, menuState, count),
      anchorEl: element,
      activeItem: breadcrumb[breadcrumb.length - 1]
    });
  };

  const onOpenItemMenu = (element: Element, item: Item) => {
    setMenu({
      sections: generateMenuSections(item, menuState),
      anchorEl: element,
      activeItem: item
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
              label: { id: 'locale.en', defaultMessage: 'English, US (en)' }
            },
            {
              id: 'locale.es',
              label: { id: 'locale.es', defaultMessage: 'Spanish, Spain (es)' }
            }
          ]
        ],
        anchorEl,
        activeItem: null
      });
    } else {
      setMenu({
        sections: [
          [
            {
              id: 'option1',
              label: { id: 'option1', defaultMessage: 'Option 1' }
            }
          ]
        ],
        anchorEl,
        activeItem: null
      });
    }
  };

  const onSearch = (keyword: string) => {
    setKeyword(keyword);
  };

  const onCloseCustomMenu = () => {
    setMenu({ ...menu, anchorEl: null, activeItem: null });
  };

  const onCopyDialogClose = () => {
    setCopyDialog(null);
  };

  const onCopyDialogOk = (item: Partial<LegacyItem>) => {
    setCopyDialog(null);
    copyItem(site, item).subscribe(
      (response) => {
        if (response.success) {
          setMenu({
            activeItem: null,
            anchorEl: null
          });
          setMenuState({ hasClipboard: true });
        }
      },
      (response) => {
        dispatch(
          showErrorDialog({
            error: response
          })
        );
      }
    );
  };

  const onTranslationDialogClose = () => {
    setTranslationDialog(null);
  };

  return (
    <section className={classes.wrapper}>
      {items !== null && (
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
            keyword={keyword}
            onSearch={onSearch}
          />
          {items && (
            <PagesNav
              items={items}
              onItemSelected={onItemSelected}
              currentLocale={currentLocale}
              selectMode={menuState.selectMode}
              onSelectItem={onSelectItem}
              onOpenItemMenu={onOpenItemMenu}
            />
          )}
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
            onChangePage={(e: React.MouseEvent<HTMLButtonElement>, page: number) =>
              onPageChanged(page)
            }
          />
          <ContextMenu
            anchorEl={menu.anchorEl}
            open={Boolean(menu.anchorEl)}
            classes={{
              paper: classes.menuPaper,
              helperText: classes.helperText,
              itemRoot: classes.menuItemRoot,
              menuList: classes.menuList
            }}
            onClose={onCloseCustomMenu}
            sections={menu.sections}
            onMenuItemClicked={onMenuItemClicked}
          />
        </>
      )}
      {copyDialog && (
        <CopyItemsDialog
          title={formatMessage(translations.copyDialogTitle)}
          subtitle={formatMessage(translations.copyDialogSubtitle)}
          onClose={onCopyDialogClose}
          open={true}
          onOk={onCopyDialogOk}
          item={copyDialog}
        />
      )}
      {translationDialog && (
        <ContentLocalizationDialog
          locales={translationDialog}
          open={true}
          onClose={onTranslationDialogClose}
          site={site}
        />
      )}
    </section>
  );
}
