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

import React, { useCallback, useReducer, useState } from 'react';
import { useIntl } from 'react-intl';
import TablePagination from '@material-ui/core/TablePagination';
import {
  copyItem,
  cutItem,
  getChildrenByPath,
  getPages,
  pasteItem
} from '../../../services/content';
import { getTargetLocales } from '../../../services/translation';
import { LegacyItem, SandboxItem } from '../../../models/Item';
import clsx from 'clsx';
import { LookupTable } from '../../../models/LookupTable';
import ContextMenu, { SectionItem } from '../../ContextMenu';
import {
  useActiveSiteId,
  useOnMount,
  useSpreadState,
  useStateResource
} from '../../../utils/hooks';
import CopyItemsDialog from '../../Dialogs/CopyItemsDialog';
import ContentLocalizationDialog from '../../Dialogs/ContentLocalizationDialog';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';
import { showHistoryDialog } from '../../../state/reducers/dialogs/history';
import { Resource } from '../../../models/Resource';
import { SuspenseWithEmptyState } from '../../SystemStatus/Suspencified';
import StandardAction from '../../../models/StandardAction';
import { createAction } from '@reduxjs/toolkit';
import { createLookupTable, nou } from '../../../utils/object';
import { GetChildrenResponse } from '../../../models/GetChildrenResponse';
import { withIndex, withoutIndex } from '../../../utils/path';
import { useStyles } from './styles';
import { translations } from './translations';
import Header from './PathNavigatorHeader';
import Breadcrumbs from './PathNavigatorBreadcrumbs';
import Nav from './PathNavigatorList';
import { fetchItemVersions } from '../../../state/reducers/versions';

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

function generateMenuSections(item: SandboxItem, menuState: MenuState, count?: number) {
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

interface WidgetProps {
  path: string;
  icon?: string | React.ElementType;
  title?: string;
  locale: string;
  classes?: {
    root?: string;
  }
}

interface MenuState {
  selectMode: boolean;
  hasClipboard: boolean;
}

interface WidgetState {
  rootPath: string;
  currentPath: string;
  localeCode: string;
  keyword: '';
  isSelectMode: boolean;
  hasClipboard: boolean;
  itemsInPath: string[];
  items: LookupTable<SandboxItem>;
  breadcrumb: SandboxItem[];
  selectedItems: string[];
  leafs: string[];
  count: number; // Number of items in the current path
  limit: number;
  offset: number;
}

// TODO: an initial path with trailing `/` breaks
function itemsFromPath(path: string, root: string, items: LookupTable<SandboxItem>): SandboxItem[] {
  const rootWithIndex = withIndex(root);
  const rootWithoutIndex = withoutIndex(root);
  const rootItem = items[rootWithIndex] ?? items[root];
  if (path === rootWithIndex || path === root) {
    return [rootItem];
  }
  const regExp = new RegExp(`${rootWithIndex}|${rootWithoutIndex}|\\/index\\.xml|/$`, 'g');
  const pathWithoutRoot = path.replace(regExp, '');
  let accum = rootWithoutIndex;
  return [
    rootItem,
    ...pathWithoutRoot
      .split('/')
      .slice(1)
      .map((folder) => {
        accum += `/${folder}`;
        return items[accum] ?? items[withIndex(accum)];
      })
  ];
}

const init: (props: WidgetProps) => WidgetState = (props: WidgetProps) => ({
  rootPath: props.path,
  currentPath: props.path,
  localeCode: props.locale,
  keyword: '',
  isSelectMode: false,
  hasClipboard: false,
  itemsInPath: null,
  items: {},
  breadcrumb: [],
  selectedItems: [],
  leafs: [],
  limit: 10,
  offset: 0,
  count: 0
});

type WidgetReducer = React.Reducer<WidgetState, StandardAction>;

const reducer: WidgetReducer = (state, { type, payload }) => {
  switch (type) {
    case fetchPath.type:
      return state;
    case fetchPathComplete.type: {
      const path = state.currentPath;
      // Check and handle if the item has no children
      if (
        payload.length === 0 &&
        // If it is the root path, we want to show the empty state,
        // vs child paths, want to show the previous path and inform
        // that there aren't any items at that path
        withoutIndex(path) !== withoutIndex(state.rootPath)
      ) {
        let pieces = path.split('/').slice(0);
        pieces.pop();
        if (path.includes('index.xml')) {
          pieces.pop();
        }
        let nextPath = pieces.join('/');
        if (nou(state.items[nextPath])) {
          nextPath = withIndex(nextPath);
        }
        return {
          ...state,
          // Revert path to previous (parent) path
          currentPath: nextPath,
          leafs: state.leafs.concat(path)
        };
      } else {
        const nextItems = {
          ...state.items,
          [payload.parent.id]: payload.parent,
          ...createLookupTable(payload)
        };
        return {
          ...state,
          breadcrumb: itemsFromPath(path, state.rootPath, nextItems),
          itemsInPath: payload.map((item) => item.id),
          items: nextItems,
          count: payload.length
        };
      }
    }
    case setCurrentPath.type:
      return {
        ...state,
        keyword: '',
        currentPath: payload
      };
    case setKeyword.type:
      return {
        ...state,
        keyword: payload
      };
    case itemUnchecked.type:
    case setLocaleCode.type:
    case itemChecked.type:
    case clearChecked.type:
      return state;
    default:
      throw new Error(`Unknown action "${type}"`);
  }
};

const setLocaleCode = createAction<string>('SET_LOCALE_CODE');
const setCurrentPath = createAction<string>('SET_CURRENT_PATH');
const itemChecked = createAction<SandboxItem>('ITEM_CHECKED');
const itemUnchecked = createAction<SandboxItem>('ITEM_UNCHECKED');
const clearChecked = createAction('CLEAR_CHECKED');
const fetchPath = createAction<string>('FETCH_PATH');
const fetchPathComplete = createAction<GetChildrenResponse>('FETCH_PATH_COMPLETE');
const setKeyword = createAction<string>('SET_KEYWORD');

// function useReducerMiddleware(reducer, initialArg, init, middleware) {
//   const [state, _dispatch] = useReducer(reducer, initialArg, init);
//   return [
//     state,
//     useCallback(
//       (action) => {
//         _dispatch(action);
//         middleware(action, _dispatch);
//       },
//       [middleware]
//     )
//   ];
// }

// PathNavigator
export default function(props: WidgetProps) {
  const { title, icon, path } = props;
  const [state, _dispatch] = useReducer(reducer, props, init);

  const classes = useStyles({});
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const exec = useCallback(
    (action) => {
      _dispatch(action);
      const { type, payload } = action;
      switch (type) {
        case fetchPath.type:
        case setCurrentPath.type:
          getChildrenByPath(site, fetchPath.type === type ? state.currentPath : payload).subscribe(
            (response) => exec(fetchPathComplete(response)),
            (response) => dispatch(showErrorDialog({ error: response }))
          );
          break;
      }
    },
    [dispatch, site, state]
  );

  const [collapsed, setCollapsed] = useState(false);
  const [menuState, setMenuState] = useSpreadState<MenuState>({
    selectMode: false,
    hasClipboard: false
  });
  const [menu, setMenu] = useSpreadState({
    sections: [],
    anchorEl: null,
    activeItem: null
  });
  const [copyDialog, setCopyDialog] = useState(null);
  const [translationDialog, setTranslationDialog] = useState(null);

  useOnMount(() => {
    exec(fetchPath(path));
  });

  const itemsResource: Resource<SandboxItem[]> = useStateResource(state.itemsInPath, {
    shouldResolve: (items) => Boolean(items),
    shouldRenew: (items, resource) => resource.complete,
    shouldReject: () => false,
    resultSelector: (items) => items.map((path) => state.items[path]),
    errorSelector: null
  });

  const onPathSelected = (item: SandboxItem) => exec(setCurrentPath(item.path));

  const onPageChanged = (page: number) => void 0;

  const onSelectItem = (item: SandboxItem, checked: boolean) =>
    exec(checked ? itemChecked(item) : itemUnchecked(item));

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
        exec(clearChecked());
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
        getTargetLocales(site, menu.activeItem.path).subscribe(
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
        setMenu({
          activeItem: null,
          anchorEl: null
        });
        break;
      }
      case 'history': {
        dispatch(fetchItemVersions({ path: menu.activeItem.path  }));
        dispatch(showHistoryDialog());
        setMenu({
          activeItem: null,
          anchorEl: null
        });
        break;
      }
      default: {
        if (section.id.includes('locale')) {
          setMenu({
            ...menu,
            anchorEl: null
          });
          exec(setLocaleCode(section.id.split('.')[1]));
        }
        break;
      }
    }
  };

  const onCurrentParentMenu = (element: Element) => {
    const count = state.selectedItems.length;
    setMenu({
      sections: generateMenuSections(null, menuState, count),
      anchorEl: element,
      activeItem: state.currentPath
    });
  };

  const onOpenItemMenu = (element: Element, item: SandboxItem) =>
    setMenu({
      sections: generateMenuSections(item, menuState),
      anchorEl: element,
      activeItem: item
    });

  const onHeaderButtonClick = (anchorEl: Element, type: string) => {
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

  const onCloseCustomMenu = () => setMenu({ ...menu, anchorEl: null, activeItem: null });

  const onCopyDialogClose = () => setCopyDialog(null);

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

  const onTranslationDialogClose = () => setTranslationDialog(null);

  const onItemClicked = (item: SandboxItem) => {
    window.location.href = `/studio/preview#/?page=${item.previewUrl}&site=${site}`;
  };

  const onBreadcrumbSelected = (item: SandboxItem) => {
    if (withoutIndex(item.path) === withoutIndex(state.currentPath)) {
      onItemClicked(item);
    } else {
      exec(setCurrentPath(item.path));
    }
  };

  return (
    <section className={clsx(classes.root, props.classes?.root, collapsed && 'collapsed')}>
      <Header
        icon={icon}
        title={title}
        locale={state.localeCode}
        onClick={() => setCollapsed(!collapsed)}
        onContextMenu={(anchor) => onHeaderButtonClick(anchor, 'options')}
        onLanguageMenu={(anchor) => onHeaderButtonClick(anchor, 'language')}
      />
      <div {...collapsed ? { hidden: true } : {}}>
        <SuspenseWithEmptyState
          resource={itemsResource}
          loadingStateProps={{
            graphicProps: { className: classes.stateGraphics }
          }}
          errorBoundaryProps={{
            errorStateProps: { classes: { graphic: classes.stateGraphics } }
          }}
          withEmptyStateProps={{
            emptyStateProps: {
              title: 'No items at this location',
              classes: { image: classes.stateGraphics }
            }
          }}
        >
          <Breadcrumbs
            keyword={state.keyword}
            breadcrumb={state.breadcrumb}
            onMenu={onCurrentParentMenu}
            onSearch={(q) => exec(setKeyword(q))}
            onCrumbSelected={onBreadcrumbSelected}
          />
          <Nav
            leafs={state.leafs}
            locale={state.localeCode}
            resource={itemsResource}
            isSelectMode={menuState.selectMode}
            onSelectItem={onSelectItem}
            onPathSelected={onPathSelected}
            onOpenItemMenu={onOpenItemMenu}
            onItemClicked={onItemClicked}
          />
          <TablePagination
            className={classes.pagination}
            classes={{
              root: classes.pagination,
              selectRoot: 'hidden',
              toolbar: clsx(classes.paginationToolbar, classes.widgetSection)
            }}
            component="div"
            labelRowsPerPage=""
            count={state.count}
            rowsPerPage={state.limit}
            page={Math.ceil(state.offset / state.limit)}
            backIconButtonProps={{ 'aria-label': formatMessage(translations.previousPage) }}
            nextIconButtonProps={{ 'aria-label': formatMessage(translations.nextPage) }}
            onChangePage={(e, page: number) => onPageChanged(page)}
          />
        </SuspenseWithEmptyState>
      </div>
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
