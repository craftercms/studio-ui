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

import React, { Fragment, useCallback, useEffect, useReducer, useState } from 'react';
import { useIntl } from 'react-intl';
import TablePagination from '@material-ui/core/TablePagination';
import {
  changeContentType,
  copy,
  cut,
  duplicate,
  fetchWorkflowAffectedItems,
  getChildrenByPath,
  getContentInstance,
  getDetailedItem,
  getPages,
  paste
} from '../../../services/content';
import { getTargetLocales } from '../../../services/translation';
import { LegacyItem, SandboxItem } from '../../../models/Item';
import clsx from 'clsx';
import { LookupTable } from '../../../models/LookupTable';
import ContextMenu, { SectionItem } from '../../ContextMenu';
import {
  useActiveSiteId,
  useContentTypes,
  useEnv,
  useLogicResource,
  useMount,
  useSpreadState,
  useSiteLocales
} from '../../../utils/hooks';
import CopyItemsDialog from '../../Dialogs/CopyItemsDialog';
import ContentLocalizationDialog from '../../Dialogs/ContentLocalizationDialog';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';
import { Resource } from '../../../models/Resource';
import { SuspenseWithEmptyState } from '../../SystemStatus/Suspencified';
import StandardAction from '../../../models/StandardAction';
import { createAction } from '@reduxjs/toolkit';
import { createLookupTable, nou } from '../../../utils/object';
import { GetChildrenResponse } from '../../../models/GetChildrenResponse';
import { itemsFromPath, withIndex, withoutIndex } from '../../../utils/path';
import { useStyles } from './styles';
import { translations } from './translations';
import Header from './PathNavigatorHeader';
import Breadcrumbs from './PathNavigatorBreadcrumbs';
import Nav from './PathNavigatorList';
import { fetchItemVersions } from '../../../state/reducers/versions';
import {
  closeConfirmDialog,
  closeDeleteDialog,
  closeNewContentDialog,
  showConfirmDialog,
  showDeleteDialog,
  showDependenciesDialog,
  showHistoryDialog,
  showNewContentDialog,
  showPublishDialog,
  showWorkflowCancellationDialog
} from '../../../state/actions/dialogs';
import ContentLoader from 'react-content-loader';
import { showEditDialog } from '../../../state/reducers/dialogs/edit';
import CreateNewFolderDialog from '../../Dialogs/CreateNewFolderDialog';
import BulkUploadDialog, { DropZoneStatus } from '../../Dialogs/BulkUploadDialog';
import CreateNewFileDialog from '../../Dialogs/CreateNewFileDialog';
import { batchActions } from '../../../state/actions/misc';
import queryString from 'query-string';
import { languages } from '../../../utils/i18n-legacy';

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
const createRand = () => rand(70, 85);

const MyLoader = React.memo(function () {
  const [items] = useState(() => {
    const numOfItems = 5;
    const start = 20;
    return new Array(numOfItems).fill(null).map((_, i) => ({
      y: start + (30 * i),
      width: createRand()
    }));
  });
  return (
    <ContentLoader
      speed={2}
      width="100%"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {items.map(({ y, width }, i) =>
        <Fragment key={i}>
          <circle cx="10" cy={y} r="8" />
          <rect x="25" y={y - 5} rx="5" ry="5" width={`${width}%`} height="10" />
        </Fragment>
      )}
    </ContentLoader>
  );
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
    id: 'newContent',
    label: translations.newContent
  },
  newFolder: {
    id: 'newFolder',
    label: translations.newFolder
  },
  renameFolder: {
    id: 'renameFolder',
    label: translations.renameFolder
  },
  changeTemplate: {
    id: 'changeTemplate',
    label: translations.changeTemplate
  },
  createTemplate: {
    id: 'createTemplate',
    label: translations.createTemplate
  },
  createController: {
    id: 'createController',
    label: translations.createController
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
  publish: {
    id: 'publish',
    label: translations.publish
  },
  history: {
    id: 'history',
    label: translations.history
  },
  translation: {
    id: 'translation',
    label: translations.translation
  },
  upload: {
    id: 'upload',
    label: translations.upload
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

function defaultMenu(menuState): Array<[]> {
  const defaultMenu = [];
  defaultMenu.push(
    [menuOptions.edit, menuOptions.view, menuOptions.newContent, menuOptions.newFolder],
    [menuOptions.delete, menuOptions.changeTemplate]
  );
  defaultMenu.push(
    menuState.hasClipboard
      ? [menuOptions.cut, menuOptions.copy, menuOptions.paste, menuOptions.duplicate]
      : [menuOptions.cut, menuOptions.copy, menuOptions.duplicate]
  );
  defaultMenu.push([menuOptions.publish, menuOptions.dependencies], [menuOptions.history, menuOptions.translation]);
  return defaultMenu;
}

function generateMenuSections(
  item: SandboxItem,
  menuState: MenuState,
  options?: {
    upload: boolean;
    createTemplate: boolean;
    createController: boolean;
    translation: boolean;
  },
  isRoot: boolean = false,
  count?: number
) {
  let sections = [];
  if (menuState.selectMode) {
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
        : [
          menuOptions.cut,
          menuOptions.copy,
          menuOptions.duplicate,
          menuOptions.delete
        ]
    );
    if (options.translation) {
      sections.push([menuOptions.translation]);
    }
  } else {
    switch (item.systemType) {
      case 'page': {
        sections = defaultMenu(menuState);
        break;
      }
      case 'folder': {
        // TODO: check if the folder support newContent;
        sections.push(
          [menuOptions.newContent, menuOptions.newFolder, menuOptions.renameFolder],
          [menuOptions.delete]
        );
        sections.push(
          menuState.hasClipboard
            ? [
              menuOptions.cut, menuOptions.copy, menuOptions.paste
            ] : [
              menuOptions.cut, menuOptions.copy
            ]
        );
        // TODO: check if the folder support upload/createTemplate/createController;
        if (options.upload) {
          sections.push([menuOptions.upload]);
        }
        if (options.createTemplate) {
          sections.push([menuOptions.createTemplate]);
        }
        if (options.createController) {
          sections.push([menuOptions.createController]);
        }
        break;
      }
      case 'taxonomy':
      case 'component': {
        sections.push(
          [menuOptions.edit, menuOptions.view],
          [menuOptions.delete, menuOptions.changeTemplate]
        );
        sections.push(
          menuState.hasClipboard
            ? [menuOptions.cut, menuOptions.copy, menuOptions.paste, menuOptions.duplicate]
            : [menuOptions.cut, menuOptions.copy, menuOptions.duplicate]
        );
        sections.push(
          [menuOptions.publish, menuOptions.dependencies],
          [menuOptions.history]
        );
        break;
      }
      case 'template':
      case 'script': {
        sections.push(
          [menuOptions.delete, menuOptions.edit, menuOptions.publish, menuOptions.history, menuOptions.dependencies]
        );
        sections.push(
          menuState.hasClipboard
            ? [menuOptions.cut, menuOptions.copy, menuOptions.paste, menuOptions.duplicate]
            : [menuOptions.cut, menuOptions.copy, menuOptions.duplicate]
        );
        break;
      }
      case 'asset': {
        sections.push(
          [menuOptions.delete, menuOptions.publish, menuOptions.history, menuOptions.dependencies]
        );
        sections.push(
          menuState.hasClipboard
            ? [menuOptions.cut, menuOptions.copy, menuOptions.paste, menuOptions.duplicate]
            : [menuOptions.cut, menuOptions.copy, menuOptions.duplicate]
        );
        break;
      }
      default:
        break;
    }
    if (isRoot && !menuState.selectMode) {
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
  classes?: Partial<Record<'root' | 'body', string>>;
}

interface MenuState {
  selectMode: boolean;
  hasClipboard: boolean;
}

interface Menu {
  sections: SectionItem[][];
  anchorEl: Element;
  activeItem: SandboxItem;
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
      let checked = [...state.selectedItems];
      checked.splice(checked.indexOf(payload.path), 1);
      return { ...state, selectedItems: checked };
    case setLocaleCode.type:
      return state;
    case itemChecked.type:
      let selectedItems = [...state.selectedItems];
      selectedItems.push(payload.path);
      return { ...state, selectedItems };
    case clearChecked.type:
      return { ...state, selectedItems: [] };
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
export default function (props: WidgetProps) {
  const { title, icon, path } = props;
  const [state, _dispatch] = useReducer(reducer, props, init);

  const classes = useStyles({});
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  //new
  const defaultSrc = `${authoringBase}/studio/legacy/form?`;
  const contentTypes = useContentTypes();
  const options = {
    upload: '/templates,/static-assets,/scripts'.includes(path),
    createTemplate: path === '/templates',
    createController: path === '/scripts',
    translation: path.includes('site/website/')
  };

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
  const [menu, setMenu] = useSpreadState<Menu>({
    sections: [],
    anchorEl: null,
    activeItem: null
  });
  const [copyDialog, setCopyDialog] = useState(null);
  const [translationDialog, setTranslationDialog] = useState(null);
  const [newFolderDialog, setNewFolderDialog] = useState(null);
  const [newFileDialog, setNewFileDialog] = useState(null);
  const [uploadDialog, setUploadDialog] = useState(null);

  useMount(() => {
    exec(fetchPath(path));
  });

  const siteLocales = useSiteLocales();

  const itemsResource: Resource<SandboxItem[]> = useLogicResource(state.itemsInPath, {
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

  const translationDialogItemChange = (item: SandboxItem) => {
    getTargetLocales(site, item.path).subscribe(
      (response) => {
        setTranslationDialog({
          item,
          locales: response.items
        });
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

  const openItemLegacyForm = (item: SandboxItem, type: 'controller' | 'template' | 'form', readonly: boolean = false) => {
    getContentInstance(site, item.path, contentTypes).subscribe(
      (response) => {
        let src = `${defaultSrc}site=${site}&path=${item.path}&type=${type}&${readonly && 'readonly=true'}`;
        const editProps = {
          src,
          type: type,
          inProgress: true,
          showController: !readonly && item.contentTypeId.includes('/page/'),
          showTabs: !readonly,
          itemModel: response
        };
        fetchWorkflowAffectedItems(site, item.path).subscribe(
          (items) => {
            if (items?.length > 0) {
              dispatch(showWorkflowCancellationDialog({
                items,
                onContinue: showEditDialog(editProps)
              }));
            } else {
              dispatch(
                showEditDialog(editProps)
              );
            }
          }
        );
      }
    );
  };

  const openFileLegacyForm = (path: string, type: 'controller' | 'template', readonly: boolean = false) => {
    let src = `${defaultSrc}site=${site}&path=${path}&type=${type}&${readonly && 'readonly=true'}`;
    const editProps = {
      src,
      type: type,
      inProgress: true,
      showTabs: false
    };
    fetchWorkflowAffectedItems(site, path).subscribe(
      (items) => {
        if (items?.length > 0) {
          dispatch(showWorkflowCancellationDialog({
            items,
            onContinue: showEditDialog(editProps)
          }));
        } else {
          dispatch(
            showEditDialog(editProps)
          );
        }
      }
    );
  };

  const terminateSelection = () => {
    setMenuState({ selectMode: false });
    exec(clearChecked());
  };

  const closeContextMenu = () => {
    setMenu({
      activeItem: null,
      anchorEl: null
    });
  };

  const onMenuItemClicked = (section: SectionItem) => {
    switch (section.id) {
      case 'view':
      case 'edit': {
        let type = menu.activeItem.systemType;
        if (type === 'template' || type === 'script') {
          openFileLegacyForm(menu.activeItem.path, type === 'script' ? 'controller' : 'template', true);
        } else {
          openItemLegacyForm(menu.activeItem, 'form', section.id === 'view');
        }
        closeContextMenu();
        break;
      }
      case 'newContent': {
        dispatch(showNewContentDialog({
          open: true,
          item: menu.activeItem,
          rootPath: menu.activeItem.path,
          compact: true
        }));
        closeContextMenu();
        break;
      }
      case 'newFolder': {
        setNewFolderDialog({
          path: withoutIndex(menu.activeItem.path)
        });
        closeContextMenu();
        break;
      }
      case 'renameFolder': {
        setNewFolderDialog({
          path: withoutIndex(menu.activeItem.path),
          rename: true,
          value: menu.activeItem.label
        });
        closeContextMenu();
        break;
      }
      case 'select': {
        setMenuState({ selectMode: true });
        closeContextMenu();
        break;
      }
      case 'terminateSelection': {
        terminateSelection();
        closeContextMenu();
        break;
      }
      case 'copy': {
        if (menuState.selectMode) return closeContextMenu();
        getPages(site, menu.activeItem).subscribe(
          (legacyItem: LegacyItem) => {
            if (legacyItem.children.length) {
              closeContextMenu();
              setCopyDialog(legacyItem);
            } else {
              copy(site, menu.activeItem).subscribe(
                (response) => {
                  if (response.success) {
                    closeContextMenu();
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
        paste(site, menu.activeItem).subscribe(
          () => {
            closeContextMenu();
            setMenuState({ hasClipboard: false });
            exec(fetchPath(state.currentPath));
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
        if (menuState.selectMode) return closeContextMenu();
        // TODO: review
        const activeItem = menu.activeItem;
        const parentItem = state.items[withIndex(state.currentPath)] ?? state.items[withoutIndex(state.currentPath)];
        dispatch(showConfirmDialog({
          title: formatMessage(translations.duplicate),
          body: formatMessage(translations.duplicateDialogBody),
          onCancel: closeConfirmDialog(),
          onOk: {
            type: 'DISPATCH_DOM_EVENT',
            payload: { id: section.id }
          }
        }));

        const callback = (e) => {
          duplicate(site, activeItem, parentItem).subscribe(
            (item: SandboxItem) => {
              exec(fetchPath(state.currentPath));
              openItemLegacyForm(item, 'form');
            }
          );
          dispatch(closeConfirmDialog());
          document.removeEventListener(section.id, callback, false);
        };
        document.addEventListener(section.id, callback, true);

        closeContextMenu();
        break;
      }
      case 'publish': {
        getDetailedItem(site, menu.activeItem.path).subscribe(
          (item) => {
            dispatch(showPublishDialog({
              items: [item],
              rootPath: path
            }));
          },
          (response) => {
            dispatch(showErrorDialog(response));
          }
        );
        closeContextMenu();
        break;
      }
      case 'cut': {
        if (menuState.selectMode) return closeContextMenu();
        cut(site, menu.activeItem).subscribe(
          (response) => {
            if (response.success) {
              closeContextMenu();
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
      case 'delete': {
        let items = [menu.activeItem];
        if (menuState.selectMode) {
          items = state.selectedItems.map((path: string) => state.items[path]);
          terminateSelection();
        }
        dispatch(showDeleteDialog({
          items,
          onSuccess: {
            type: 'DISPATCH_DOM_EVENT',
            payload: { id: section.id }
          }
        }));
        // TODO: review
        const callback = (e) => {
          dispatch(closeDeleteDialog());
          exec(fetchPath(state.currentPath));
          document.removeEventListener(section.id, callback, false);
        };
        document.addEventListener(section.id, callback, true);

        closeContextMenu();
        break;
      }
      case 'translation': {
        if (menuState.selectMode) return;
        translationDialogItemChange(menu.activeItem);
        closeContextMenu();
        break;
      }
      case 'dependencies': {
        dispatch(showDependenciesDialog({
          item: menu.activeItem,
          rootPath: path
        }));
        closeContextMenu();
        break;
      }
      case 'history': {
        dispatch(batchActions(
          [
            fetchItemVersions({ rootPath: path, item: menu.activeItem }),
            showHistoryDialog({})
          ]
        ));
        closeContextMenu();
        break;
      }
      case 'changeTemplate': {
        const confirm = 'changeTemplateConfirm';
        const newContent = 'contentTypeSelected';
        const activeItem = menu.activeItem;

        const newContentDialogCallback = (e) => {
          const contentType = queryString.parse(e.detail.output.src).contentTypeId as string;
          if (activeItem.contentTypeId !== contentType) {
            dispatch(closeNewContentDialog());
            changeContentType(site, activeItem.path, contentType).subscribe(
              (response) => {
                if (contentTypes) {
                  getContentInstance(site, activeItem.path, contentTypes).subscribe(
                    (response) => {
                      let src = `${defaultSrc}site=${site}&path=${activeItem.path}&type=form&changeTemplate=${contentType}`;
                      const editProps = {
                        src,
                        type: 'form',
                        inProgress: true,
                        showController: false,
                        showTabs: false,
                        itemModel: response
                      };
                      fetchWorkflowAffectedItems(site, activeItem.path).subscribe(
                        (items) => {
                          if (items?.length > 0) {
                            dispatch(showWorkflowCancellationDialog({
                              items,
                              onContinue: showEditDialog(editProps)
                            }));
                          } else {
                            dispatch(
                              showEditDialog(editProps)
                            );
                          }
                        }
                      );
                    }
                  );
                }
              }
            );
          }

          document.removeEventListener(newContent, newContentDialogCallback, false);
        };

        const confirmDialogCallback = (e) => {
          dispatch(batchActions([
            closeConfirmDialog(),
            showNewContentDialog({
              open: true,
              rootPath: path,
              item: activeItem,
              type: 'change',
              selectedContentType: activeItem.contentTypeId,
              onContentTypeSelected: {
                type: 'DISPATCH_DOM_EVENT',
                payload: { id: newContent }
              }
            })
          ]));

          document.removeEventListener(confirm, confirmDialogCallback, false);
        };

        document.addEventListener(newContent, newContentDialogCallback, true);
        document.addEventListener(confirm, confirmDialogCallback, true);

        dispatch(showConfirmDialog({
          title: formatMessage(translations.changeContentType),
          body: formatMessage(translations.changeContentTypeBody),
          onCancel: closeConfirmDialog(),
          onOk: {
            type: 'DISPATCH_DOM_EVENT',
            payload: { id: confirm }
          }
        }));
        closeContextMenu();
        break;
      }
      case 'createTemplate':
      case 'createController': {
        setNewFileDialog({
          path: withoutIndex(menu.activeItem.path),
          type: (section.id === 'createController') ? 'controller' : 'template'
        });
        closeContextMenu();
        break;
      }
      case 'upload': {
        setUploadDialog({
          path: menu.activeItem.path
        });
        closeContextMenu();
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
    const item = state.items[withIndex(state.currentPath)] ?? state.items[withoutIndex(state.currentPath)];
    setMenu({
      sections: generateMenuSections(item, menuState, options, true, count),
      anchorEl: element,
      activeItem: item
    });
  };

  const onOpenItemMenu = (element: Element, item: SandboxItem) => {
    setMenu({
      sections: generateMenuSections(item, menuState, options),
      anchorEl: element,
      activeItem: item
    });
  };

  const onHeaderButtonClick = (anchorEl: Element, type: string) => {
    const locales = siteLocales.localeCodes?.map(code => ({
      id: `locale.${code}`,
      label: {
        id: `locale.${code}`,
        defaultMessage: formatMessage(languages[code])
      }
    }));

    if (type === 'language') {
      setMenu({
        sections: [locales],
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
    copy(site, item).subscribe(
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

  const onNewFolderDialogClose = () => setNewFolderDialog(null);

  const onNewFileDialogClose = () => setNewFileDialog(null);

  const onUploadDialogClose = (status: DropZoneStatus, path: string) => {
    if (status.uploadedFiles > 0 && withoutIndex(state.currentPath) === path) {
      exec(fetchPath(path));
    }
    setUploadDialog(null);
  };

  const onNewFolderCreated = (path: string, name: string, rename: boolean) => {
    if (rename) {
      exec(fetchPath(state.currentPath));
    } else if (withoutIndex(state.currentPath) === path) {
      exec(fetchPath(path));
    }
  };

  const onNewFileCreated = (path: string, fileName: string, type: 'controller' | 'template') => {
    if (withoutIndex(state.currentPath) === path) {
      exec(fetchPath(path));
    }
    openFileLegacyForm(`${path}/${fileName}`, type);
  };

  const onItemClicked = (item: SandboxItem) => {
    if (item.previewUrl) {
      window.location.href = `${authoringBase}/preview/#/?page=${item.previewUrl}&site=${site}`;
    }
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
      <div {...collapsed ? { hidden: true } : {}} className={clsx(props.classes?.body)}>
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
          suspenseProps={{
            fallback: <MyLoader />
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
          item={translationDialog.item}
          rootPath={state.rootPath}
          locales={translationDialog.locales}
          open={Boolean(translationDialog)}
          onItemChange={translationDialogItemChange}
          onClose={onTranslationDialogClose}
        />
      )}
      <CreateNewFolderDialog
        open={Boolean(newFolderDialog)}
        {...newFolderDialog}
        onClose={onNewFolderDialogClose}
        onCreated={onNewFolderCreated}
      />
      <CreateNewFileDialog
        open={Boolean(newFileDialog)}
        {...newFileDialog}
        onClose={onNewFileDialogClose}
        onCreated={onNewFileCreated}
      />
      {
        uploadDialog &&
        <BulkUploadDialog
          open={Boolean(uploadDialog)}
          site={site}
          path={uploadDialog.path}
          onDismiss={onUploadDialogClose}
        />
      }
    </section>
  );
}
