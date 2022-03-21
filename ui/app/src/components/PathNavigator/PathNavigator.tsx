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

import React, { ChangeEvent, ElementType, useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { DetailedItem } from '../../models/Item';
import ContextMenu, { ContextMenuOption } from '../ContextMenu/ContextMenu';
import { useDispatch } from 'react-redux';
import { getParentPath, withIndex, withoutIndex } from '../../utils/path';
import { translations } from './translations';
import { languages } from '../../utils/i18n-legacy';
import {
  pathNavigatorBackgroundRefresh,
  pathNavigatorChangeLimit,
  pathNavigatorChangePage,
  pathNavigatorConditionallySetPath,
  pathNavigatorFetchPath,
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
import { completeDetailedItem, fetchSandboxItem } from '../../state/actions/content';
import { showEditDialog, showItemMegaMenu, showPreviewDialog } from '../../state/actions/dialogs';
import { getEditorMode, isEditableViaFormEditor, isFolder, isImage, isNavigable, isPreviewable } from './utils';
import { StateStylingProps } from '../../models/UiConfig';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { debounceTime, filter } from 'rxjs/operators';
import {
  contentEvent,
  folderCreated,
  itemDuplicated,
  itemsDeleted,
  itemsPasted,
  itemsUploaded,
  itemUnlocked,
  pluginInstalled
} from '../../state/actions/system';
import PathNavigatorUI from './PathNavigatorUI';
import { ContextMenuOptionDescriptor, toContextMenuOptionsLookup } from '../../utils/itemActions';
import PathNavigatorSkeleton from './PathNavigatorSkeleton';
import GlobalState from '../../models/GlobalState';
import { SystemIconDescriptor } from '../SystemIcon';
// @ts-ignore
import { getOffsetLeft, getOffsetTop } from '@mui/material/Popover/Popover';
import { getNumOfMenuOptionsForItem } from '../../utils/content';
import { batchActions } from '../../state/actions/misc';
import { useSelection } from '../../hooks/useSelection';
import { useEnv } from '../../hooks/useEnv';
import { useItemsByPath } from '../../hooks/useItemsByPath';
import { useSubject } from '../../hooks/useSubject';
import { useSiteLocales } from '../../hooks/useSiteLocales';
import { useMount } from '../../hooks/useMount';
import { getSystemLink } from '../../utils/system';
import { useLegacyPreviewPreference } from '../../hooks/useLegacyPreviewPreference';
import { getStoredPathNavigator } from '../../utils/state';
import { useActiveSite } from '../../hooks/useActiveSite';
import { useActiveUser } from '../../hooks/useActiveUser';

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
  initialCollapsed?: boolean;
  backgroundRefreshTimeoutMs?: number;
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
  total: number; // Number of items in the current path
  limit: number;
  offset: number;
  collapsed?: boolean;
  excludes?: string[];
  isFetching: boolean;
  error: any;
}

const menuOptions: Record<'refresh', ContextMenuOptionDescriptor> = {
  refresh: {
    id: 'refresh',
    label: translations.refresh
  }
};

export function PathNavigator(props: PathNavigatorProps) {
  const {
    label = '(No name)',
    icon,
    expandedIcon,
    collapsedIcon,
    container,
    rootPath: path,
    id = label.replace(/\s/g, ''),
    limit = 10,
    backgroundRefreshTimeoutMs = 60000,
    locale,
    excludes,
    initialCollapsed,
    onItemClicked: onItemClickedProp,
    createItemClickedHandler = (defaultHandler) => defaultHandler,
    computeActiveItems: computeActiveItemsProp
  } = props;
  const state = useSelection((state) => state.pathNavigator)[id];
  const itemsByPath = useItemsByPath();
  const { id: siteId, uuid } = useActiveSite();
  const user = useActiveUser();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [widgetMenu, setWidgetMenu] = useState<Menu>({
    anchorEl: null,
    sections: [],
    emptyState: null
  });
  const [keyword, setKeyword] = useState('');
  const onSearch$ = useSubject<string>();
  const uiConfig = useSelection<GlobalState['uiConfig']>((state) => state.uiConfig);
  const siteLocales = useSiteLocales();
  const hasActiveSession = useSelection((state) => state.auth.active);
  const useLegacy = useLegacyPreviewPreference();

  useEffect(() => {
    if (backgroundRefreshTimeoutMs && hasActiveSession) {
      let interval = setInterval(() => {
        dispatch(pathNavigatorBackgroundRefresh({ id }));
      }, backgroundRefreshTimeoutMs);
      return () => {
        clearInterval(interval);
      };
    }
  }, [backgroundRefreshTimeoutMs, dispatch, id, hasActiveSession]);

  useEffect(() => {
    // Adding uiConfig as means to stop navigator from trying to
    // initialize with previous state information when switching sites
    if (!state && uiConfig.currentSite === siteId) {
      const storedState = getStoredPathNavigator(uuid, user.username, id);
      if (storedState?.keyword) {
        setKeyword(storedState.keyword);
      }
      dispatch(pathNavigatorInit({ id, path, locale, excludes, limit, collapsed: initialCollapsed, ...storedState }));
    }
  }, [
    dispatch,
    excludes,
    id,
    limit,
    locale,
    path,
    siteId,
    state,
    initialCollapsed,
    uiConfig.currentSite,
    user.username,
    uuid
  ]);

  useMount(() => {
    if (state) {
      dispatch(pathNavigatorBackgroundRefresh({ id }));
    }
  });

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
      contentEvent.type,
      itemsPasted.type,
      itemUnlocked.type,
      folderCreated.type,
      itemsDeleted.type,
      itemDuplicated.type,
      pluginInstalled.type,
      itemsUploaded.type
    ];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        // itemCreated, itemUpdated, folderRenamed, itemDuplicated (not coming as contentEvent)
        case itemDuplicated.type:
        case contentEvent.type: {
          console.log('contentEvent', type, payload);
          const parentPath = getParentPath(payload.targetPath);
          if (parentPath === withoutIndex(state.currentPath)) {
            // If item is direct children of root (in current pathNavigator view)
            dispatch(pathNavigatorRefresh({ id }));
          } else if (withoutIndex(payload.targetPath) === withoutIndex(state.currentPath)) {
            // If item is root (in current pathNavigator view)
            // If the action is a deletion (targetPath doesn't exist, then this case would require to set parentPath
            // as the currentPath
            // TODO: how to determine that item doesn't exist

            dispatch(pathNavigatorRefresh({ id }));
          } else if (getParentPath(parentPath) === withoutIndex(state.currentPath)) {
            // if item just belongs to parent item
            dispatch(fetchSandboxItem({ path: parentPath, force: true }));
          }
          break;
        }
        // TODO: not coming from contentEvent, but it seems like it can be added in the same case
        case folderCreated.type: {
          if (type === folderCreated.type || payload.clipboard.type === 'COPY') {
            if (withoutIndex(payload.target) === withoutIndex(state.currentPath)) {
              dispatch(pathNavigatorRefresh({ id }));
            } else if (getParentPath(payload.target) === withoutIndex(state.currentPath)) {
              dispatch(fetchSandboxItem({ path: withoutIndex(payload.target), force: true }));
            }
          }
          if (type === itemsPasted.type && payload.clipboard.type === 'CUT') {
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
        case pluginInstalled.type: {
          dispatch(pathNavigatorBackgroundRefresh({ id }));
          break;
        }
        case itemsUploaded.type: {
          // TODO: I see no upload in pathNavigator, is this still valid?
          if (withoutIndex(payload.target) === withoutIndex(state.currentPath)) {
            dispatch(pathNavigatorRefresh({ id }));
          }
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
      pathNavigatorFetchPath({
        id,
        path: item.path
      })
    );
  };

  const onPreview = (item: DetailedItem) => {
    if (isEditableViaFormEditor(item)) {
      dispatch(showEditDialog({ path: item.path, authoringBase, site: siteId, readonly: true }));
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

  const onRowsPerPageChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const limit = Number(e.target.value);
    dispatch(
      pathNavigatorChangeLimit({
        id,
        limit,
        offset: 0
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
    const anchorRect = element.getBoundingClientRect();
    const top = anchorRect.top + getOffsetTop(anchorRect, 'top');
    const left = anchorRect.left + getOffsetLeft(anchorRect, 'left');
    let path = state.currentPath;
    if (path === '/site/website') {
      path = withIndex(state.currentPath);
    }
    dispatch(
      batchActions([
        completeDetailedItem({ path }),
        showItemMegaMenu({
          path: path,
          anchorReference: 'anchorPosition',
          anchorPosition: { top, left },
          loaderItems: getNumOfMenuOptionsForItem(itemsByPath[path])
        })
      ])
    );
  };

  const onOpenItemMenu = (element: Element, item: DetailedItem) => {
    const anchorRect = element.getBoundingClientRect();
    const top = anchorRect.top + getOffsetTop(anchorRect, 'top');
    const left = anchorRect.left + getOffsetLeft(anchorRect, 'left');

    dispatch(completeDetailedItem({ path: item.path }));
    dispatch(
      showItemMegaMenu({
        path: item.path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top, left },
        loaderItems: getNumOfMenuOptionsForItem(item)
      })
    );
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

  const onItemClicked = onItemClickedProp
    ? onItemClickedProp
    : createItemClickedHandler((item: DetailedItem, e) => {
        if (isNavigable(item)) {
          const url = getSystemLink({
            site: siteId,
            useLegacy,
            systemLinkId: 'preview',
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
        onRowsPerPageChange={onRowsPerPageChange}
        computeActiveItems={computeActiveItems}
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

export default PathNavigator;
