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

import React, { ElementType, useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { DetailedItem } from '../../models/Item';
import ContextMenu, { ContextMenuOption } from '../ContextMenu';
import {
  useActiveSiteId,
  useEnv,
  useItemsByPath,
  usePreviewState,
  useSelection,
  useSiteLocales,
  useSpreadState,
  useSubject
} from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { getParentPath, withIndex, withoutIndex } from '../../utils/path';
import { translations } from './translations';
import { languages } from '../../utils/i18n-legacy';
import {
  pathNavigatorChangePage,
  pathNavigatorConditionallySetPath,
  pathNavigatorInit,
  pathNavigatorItemChecked,
  pathNavigatorItemUnchecked,
  pathNavigatorRefresh,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath,
  pathNavigatorSetKeyword,
  pathNavigatorSetLocaleCode,
  pathNavigatorUpdate
} from '../../state/actions/pathNavigator';
import ItemActionsMenu from '../ItemActionsMenu';
import { completeDetailedItem } from '../../state/actions/content';
import { showEditDialog, showPreviewDialog, updatePreviewDialog } from '../../state/actions/dialogs';
import { fetchContentXML } from '../../services/content';
import { getEditorMode, isEditableViaFormEditor, isFolder, isImage, isNavigable, isPreviewable } from './utils';
import { StateStylingProps } from '../../models/UiConfig';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { debounceTime, filter } from 'rxjs/operators';
import {
  folderCreated,
  folderRenamed,
  itemCreated,
  itemDuplicated,
  itemsDeleted,
  itemsPasted,
  itemUpdated
} from '../../state/actions/system';
import { getNumOfMenuOptionsForItem } from '../../utils/content';
import PathNavigatorUI from './PathNavigatorUI';
import LookupTable from '../../models/LookupTable';
import { ContextMenuOptionDescriptor, toContextMenuOptionsLookup } from '../../utils/itemActions';
import PathNavigatorSkeleton from './PathNavigatorSkeleton';
import GlobalState from '../../models/GlobalState';
import { getSystemLink } from '../LauncherSection';
import { SystemIconDescriptor } from '../SystemIcon';

interface Menu {
  path?: string;
  sections?: ContextMenuOption[][];
  anchorEl: Element;
  loaderItems?: number;
  emptyState?: {
    icon?: ElementType;
    message: string;
  };
}

export interface PathNavigatorProps {
  id: string;
  label: string;
  rootPath: string;
  excludes?: string[];
  locale?: string;
  limit?: number;
  icon?: SystemIconDescriptor;
  expandedIcon?: SystemIconDescriptor;
  collapsedIcon?: SystemIconDescriptor;
  container?: Partial<StateStylingProps>;
  classes?: Partial<Record<'root' | 'body' | 'searchRoot', string>>;
  onItemClicked?(item: DetailedItem, event?: React.MouseEvent): void;
  computeActiveItems?: (items: DetailedItem[]) => string[];
  createItemClickedHandler?: (
    defaultHandler: (item: DetailedItem, event?: React.MouseEvent) => void
  ) => (item: DetailedItem) => void;
}

export interface PathNavigatorStateProps {
  rootPath: string;
  currentPath: string;
  localeCode: string;
  keyword: '';
  isSelectMode: boolean;
  hasClipboard: boolean;
  levelDescriptor: string;
  itemsInPath: string[];
  breadcrumb: string[];
  selectedItems: string[];
  leaves: string[];
  total: number; // Number of items in the current path
  limit: number;
  offset: number;
  collapsed?: boolean;
  isFetching: boolean;
}

const menuOptions: LookupTable<ContextMenuOptionDescriptor> = {
  refresh: {
    id: 'refresh',
    label: translations.refresh
  }
};

export default function PathNavigator(props: PathNavigatorProps) {
  const {
    label = '(No name)',
    icon,
    expandedIcon,
    collapsedIcon,
    container,
    rootPath: path,
    id = label.replace(/\s/g, ''),
    limit = 10,
    locale,
    excludes,
    onItemClicked: onItemClickedProp,
    createItemClickedHandler = (defaultHandler) => defaultHandler,
    computeActiveItems: computeActiveItemsProp
  } = props;
  const state = useSelection((state) => state.pathNavigator)[id];
  const itemsByPath = useItemsByPath();
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const { previewChoice } = usePreviewState();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [widgetMenu, setWidgetMenu] = useState<Menu>({
    anchorEl: null,
    sections: [],
    emptyState: null
  });
  const [itemMenu, setItemMenu] = useSpreadState<Menu>({
    path,
    anchorEl: null,
    loaderItems: null
  });
  const [keyword, setKeyword] = useState('');
  const onSearch$ = useSubject<string>();
  const uiConfig = useSelection<GlobalState['uiConfig']>((state) => state.uiConfig);
  const siteLocales = useSiteLocales();

  useEffect(() => {
    // Adding uiConfig as means to stop navigator from trying to
    // initialize with previous state information when switching sites
    if (!state && uiConfig.currentSite === site) {
      dispatch(pathNavigatorInit({ id, path, locale, excludes, limit }));
    }
  }, [dispatch, excludes, id, limit, locale, path, site, state, uiConfig.currentSite]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400)).subscribe((keyword) => {
      dispatch(pathNavigatorSetKeyword({ id, keyword }));
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, id, onSearch$]);

  useEffect(() => {
    if (siteLocales.defaultLocaleCode && state?.localeCode !== siteLocales.defaultLocaleCode) {
      dispatch(
        pathNavigatorSetLocaleCode({
          id,
          locale: siteLocales.defaultLocaleCode
        })
      );
    }
  }, [dispatch, id, siteLocales.defaultLocaleCode, state?.localeCode]);

  // Item Updates Propagation
  useEffect(() => {
    const events = [
      itemsPasted.type,
      itemUpdated.type,
      folderCreated.type,
      folderRenamed.type,
      itemsDeleted.type,
      itemDuplicated.type,
      itemCreated.type
    ];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        case itemCreated.type:
        case itemUpdated.type:
        case folderRenamed.type:
        case itemDuplicated.type: {
          const parentPath = getParentPath(payload.target);
          if (parentPath === withoutIndex(state.currentPath)) {
            dispatch(pathNavigatorRefresh({ id }));
          }
          if (state.leaves.some((path) => withoutIndex(path) === parentPath)) {
            dispatch(
              pathNavigatorUpdate({
                id,
                leaves: state.leaves.filter((path) => withoutIndex(path) !== parentPath)
              })
            );
          }
          break;
        }
        case folderCreated.type: {
          if (withoutIndex(payload.target) === withoutIndex(state.currentPath)) {
            dispatch(pathNavigatorRefresh({ id }));
          }
          if (state.leaves.some((path) => withoutIndex(path) === withoutIndex(payload.target))) {
            dispatch(
              pathNavigatorUpdate({
                id,
                leaves: state.leaves.filter((path) => withoutIndex(path) !== withoutIndex(payload.target))
              })
            );
          }
          break;
        }
        case itemsPasted.type: {
          if (payload.clipboard.type === 'COPY') {
            if (withoutIndex(payload.target) === withoutIndex(state.currentPath)) {
              dispatch(pathNavigatorRefresh({ id }));
            }
            if (state.leaves.some((path) => withoutIndex(path) === withoutIndex(payload.target))) {
              dispatch(
                pathNavigatorUpdate({
                  id,
                  leaves: state.leaves.filter((path) => withoutIndex(path) !== withoutIndex(payload.target))
                })
              );
            }
          } else {
            // payload.clipboard.type === 'CUT
            const parentPath = getParentPath(payload.target);
            if (parentPath === withoutIndex(state.currentPath)) {
              dispatch(pathNavigatorRefresh({ id }));
            }
          }
          break;
        }
        case itemsDeleted.type: {
          payload.targets.forEach((path) => {
            if (withoutIndex(path) === withoutIndex(state.currentPath)) {
              dispatch(
                pathNavigatorSetCurrentPath({
                  id,
                  path: getParentPath(withoutIndex(path))
                })
              );
            } else if (state.itemsInPath.includes(path)) {
              dispatch(pathNavigatorRefresh({ id }));
            }
          });
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [state, id, dispatch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const computeActiveItems = useCallback(computeActiveItemsProp ?? (() => []), [computeActiveItemsProp]);

  if (!state) {
    return <PathNavigatorSkeleton />;
  }

  const onPathSelected = (item: DetailedItem) => {
    dispatch(
      pathNavigatorConditionallySetPath({
        id,
        path: item.path
      })
    );
  };

  const onPreview = (item: DetailedItem) => {
    if (isEditableViaFormEditor(item)) {
      dispatch(showEditDialog({ path: item.path, authoringBase, site, readonly: true }));
    } else if (isImage(item)) {
      dispatch(
        showPreviewDialog({
          type: 'image',
          title: item.label,
          url: item.path
        })
      );
    } else {
      const mode = getEditorMode(item);
      dispatch(
        showPreviewDialog({
          type: 'editor',
          title: item.label,
          url: item.path,
          mode
        })
      );
      fetchContentXML(site, item.path).subscribe((content) => {
        dispatch(
          updatePreviewDialog({
            content
          })
        );
      });
    }
  };

  // TODO: Implement pagination when get_children api is ready.
  const onPageChanged = (page: number) => {
    const offset = page * state.limit;
    dispatch(
      pathNavigatorChangePage({
        id,
        offset
      })
    );
  };

  const onSelectItem = (item: DetailedItem, checked: boolean) => {
    dispatch(
      checked
        ? pathNavigatorItemChecked({ id, item })
        : pathNavigatorItemUnchecked({
            id,
            item
          })
    );
  };

  const onCurrentParentMenu = (element: Element) => {
    let path = state.currentPath;
    if (path === '/site/website') {
      path = withIndex(state.currentPath);
    }
    dispatch(completeDetailedItem({ path }));
    setItemMenu({
      path,
      anchorEl: element,
      loaderItems: getNumOfMenuOptionsForItem(itemsByPath[path])
    });
  };

  const onOpenItemMenu = (element: Element, item: DetailedItem) => {
    dispatch(completeDetailedItem({ path: item.path }));
    setItemMenu({
      path: item.path,
      anchorEl: element,
      loaderItems: getNumOfMenuOptionsForItem(item)
    });
  };

  const onHeaderButtonClick = (anchorEl: Element, type: string) => {
    if (type === 'language') {
      const locales = siteLocales.localeCodes?.map((code) => ({
        id: `locale.${code}`,
        label: formatMessage(languages[code.toLowerCase()])
      }));
      setWidgetMenu({
        sections: locales.length ? [locales] : [],
        anchorEl,
        emptyState: { message: formatMessage(translations.noLocales) }
      });
    } else {
      setWidgetMenu({
        sections: [[toContextMenuOptionsLookup(menuOptions, formatMessage).refresh]],
        anchorEl
      });
    }
  };

  const onCloseWidgetMenu = () => setWidgetMenu({ ...widgetMenu, anchorEl: null });

  const onCloseItemMenu = () => setItemMenu({ ...itemMenu, path: null, anchorEl: null });

  const onItemClicked = onItemClickedProp
    ? onItemClickedProp
    : createItemClickedHandler((item: DetailedItem, e) => {
        if (isNavigable(item)) {
          const url = getSystemLink({
            site,
            systemLinkId: 'preview',
            previewChoice,
            authoringBase,
            page: item.previewUrl
          });
          if (e.ctrlKey || e.metaKey) {
            window.open(url);
          } else {
            window.location.href = url;
          }
        } else if (isFolder(item)) {
          onPathSelected(item);
        } else if (isPreviewable(item)) {
          onPreview?.(item);
        }
      });

  const onBreadcrumbSelected = (item: DetailedItem) => {
    if (withoutIndex(item.path) !== withoutIndex(state.currentPath)) {
      dispatch(pathNavigatorConditionallySetPath({ id, path: item.path }));
    }
  };

  const onSimpleMenuClick = (option: string) => {
    onCloseWidgetMenu();
    if (option === 'refresh') {
      dispatch(
        pathNavigatorRefresh({
          id
        })
      );
    }
  };

  const onChangeCollapsed = (collapsed: boolean) => {
    dispatch(pathNavigatorSetCollapsed({ id, collapsed }));
  };

  const onSearch = (keyword: string) => {
    setKeyword(keyword);
    onSearch$.next(keyword);
  };

  return (
    <>
      <PathNavigatorUI
        state={state}
        classes={props.classes}
        itemsByPath={itemsByPath}
        icon={expandedIcon && collapsedIcon ? (state.collapsed ? collapsedIcon : expandedIcon) : icon}
        container={container}
        title={label}
        onChangeCollapsed={onChangeCollapsed}
        onHeaderButtonClick={onHeaderButtonClick}
        onCurrentParentMenu={onCurrentParentMenu}
        siteLocales={siteLocales}
        keyword={keyword}
        onSearch={onSearch}
        onBreadcrumbSelected={onBreadcrumbSelected}
        onSelectItem={onSelectItem}
        onPathSelected={onPathSelected}
        onPreview={onPreview}
        onOpenItemMenu={onOpenItemMenu}
        onItemClicked={onItemClicked}
        onPageChanged={onPageChanged}
        computeActiveItems={computeActiveItems}
      />
      <ItemActionsMenu
        open={Boolean(itemMenu.anchorEl)}
        path={itemMenu.path}
        numOfLoaderItems={itemMenu.loaderItems}
        anchorEl={itemMenu.anchorEl}
        onClose={onCloseItemMenu}
      />
      <ContextMenu
        anchorEl={widgetMenu.anchorEl}
        options={widgetMenu.sections}
        emptyState={widgetMenu.emptyState}
        open={Boolean(widgetMenu.anchorEl)}
        onClose={onCloseWidgetMenu}
        onMenuItemClicked={onSimpleMenuClick}
      />
    </>
  );
}
