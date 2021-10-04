/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PathNavigatorTreeUI, { TreeNode } from './PathNavigatorTreeUI';
import { useDispatch } from 'react-redux';
import {
  pathNavigatorTreeBackgroundRefresh,
  pathNavigatorTreeCollapsePath,
  pathNavigatorTreeExpandPath,
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeFetchPathPage,
  pathNavigatorTreeFetchPathsChildren,
  pathNavigatorTreeInit,
  pathNavigatorTreeRefresh,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleExpanded
} from '../../state/actions/pathNavigatorTree';
import { StateStylingProps } from '../../models/UiConfig';
import LookupTable from '../../models/LookupTable';
import { getEditorMode, isEditableViaFormEditor, isImage, isNavigable, isPreviewable } from '../PathNavigator/utils';
import ContextMenu, { ContextMenuOption } from '../ContextMenu/ContextMenu';
import { getNumOfMenuOptionsForItem, lookupItemByPath } from '../../utils/content';
import { ContextMenuOptionDescriptor, toContextMenuOptionsLookup } from '../../utils/itemActions';
import { defineMessages, useIntl } from 'react-intl';
import { previewItem } from '../../state/actions/preview';
// @ts-ignore
import { getOffsetLeft, getOffsetTop } from '@mui/material/Popover/Popover';
import { showEditDialog, showItemMegaMenu, showPreviewDialog, updatePreviewDialog } from '../../state/actions/dialogs';
import { getStoredPathNavigatorTree } from '../../utils/state';
import GlobalState from '../../models/GlobalState';
import { nnou } from '../../utils/object';
import PathNavigatorSkeletonTree from './PathNavigatorTreeSkeleton';
import { getParentPath, withIndex, withoutIndex } from '../../utils/path';
import { DetailedItem } from '../../models/Item';
import { fetchContentXML } from '../../services/content';
import { SystemIconDescriptor } from '../SystemIcon';
import { completeDetailedItem } from '../../state/actions/content';
import { useSelection } from '../../utils/hooks/useSelection';
import { useEnv } from '../../utils/hooks/useEnv';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useItemsByPath } from '../../utils/hooks/useItemsByPath';
import { useSubject } from '../../utils/hooks/useSubject';
import { useDetailedItem } from '../../utils/hooks/useDetailedItem';
import { debounceTime, filter } from 'rxjs/operators';
import {
  folderCreated,
  folderRenamed,
  itemCreated,
  itemDuplicated,
  itemsDeleted,
  itemsPasted,
  itemsUploaded,
  itemUnlocked,
  itemUpdated,
  pluginInstalled
} from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { useActiveSite } from '../../utils/hooks/useActiveSite';

interface PathNavigatorTreeProps {
  id: string;
  label: string;
  rootPath: string;
  excludes?: string[];
  limit?: number;
  backgroundRefreshTimeoutMs?: number;
  icon?: SystemIconDescriptor;
  expandedIcon?: SystemIconDescriptor;
  collapsedIcon?: SystemIconDescriptor;
  container?: Partial<StateStylingProps>;
}

export interface PathNavigatorTreeStateProps {
  rootPath: string;
  collapsed: boolean;
  limit: number;
  expanded: string[];
  childrenByParentPath: LookupTable<string[]>;
  keywordByPath: LookupTable<string>;
  fetchingByPath: LookupTable<boolean>;
  totalByPath: LookupTable<number>;
  offsetByPath: LookupTable<number>;
  excludes?: string[];
}

interface Menu {
  path?: string;
  sections?: ContextMenuOption[][];
  anchorEl: Element;
  loaderItems?: number;
}

const translations = defineMessages({
  refresh: {
    id: 'words.refresh',
    defaultMessage: 'Refresh'
  }
});

const menuOptions: LookupTable<ContextMenuOptionDescriptor> = {
  refresh: {
    id: 'refresh',
    label: translations.refresh
  }
};

export default function PathNavigatorTree(props: PathNavigatorTreeProps) {
  const {
    label,
    id = props.label.replace(/\s/g, ''),
    excludes,
    limit = 10,
    backgroundRefreshTimeoutMs = 60000,
    icon,
    expandedIcon,
    collapsedIcon,
    container
  } = props;
  const state = useSelection((state) => state.pathNavigatorTree)[id];
  const { id: siteId, uuid } = useActiveSite();
  const user = useActiveUser();
  const nodesByPathRef = useRef<LookupTable<TreeNode>>({});
  const onSearch$ = useSubject<{ keyword: string; path: string }>();
  const uiConfig = useSelection<GlobalState['uiConfig']>((state) => state.uiConfig);
  const storedState = useMemo(() => {
    return getStoredPathNavigatorTree(uuid, user.username, id) ?? {};
  }, [id, uuid, user.username]);
  const [widgetMenu, setWidgetMenu] = useState<Menu>({
    anchorEl: null,
    sections: []
  });
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const itemsByPath = useItemsByPath();
  const keywordByPath = useMemo(() => state?.keywordByPath ?? {}, [state?.keywordByPath]);
  const totalByPath = useMemo(() => state?.totalByPath ?? {}, [state?.totalByPath]);
  const childrenByParentPath = useMemo(() => state?.childrenByParentPath ?? {}, [state?.childrenByParentPath]);
  const fetchingByPath = useMemo(() => state?.fetchingByPath ?? {}, [state?.fetchingByPath]);
  const rootItem = useDetailedItem(props.rootPath);
  const rootPath = rootItem?.path;
  const [rootNode, setRootNode] = useState(null);

  const hasActiveSession = useSelection((state) => state.auth.active);
  const intervalRef = useRef<any>();

  const resetBackgroundRefreshInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      dispatch(pathNavigatorTreeBackgroundRefresh({ id }));
    }, backgroundRefreshTimeoutMs);
  }, [backgroundRefreshTimeoutMs, dispatch, id]);

  useEffect(() => {
    if (hasActiveSession) {
      resetBackgroundRefreshInterval();
      return () => {
        clearInterval(intervalRef.current);
      };
    }
  }, [hasActiveSession, resetBackgroundRefreshInterval]);

  useEffect(() => {
    // Adding uiConfig as means to stop navigator from trying to
    // initialize with previous state information when switching sites
    if (!state && uiConfig.currentSite === siteId && rootPath) {
      const { expanded, collapsed, keywordByPath } = storedState;
      dispatch(
        pathNavigatorTreeInit({
          id,
          path: rootPath,
          excludes,
          limit,
          ...(expanded && { expanded }),
          ...(keywordByPath && { keywordByPath }),
          ...(nnou(collapsed) && { collapsed })
        })
      );
    }
  }, [siteId, user.username, id, dispatch, rootPath, excludes, limit, state, uiConfig.currentSite, storedState]);

  useEffect(() => {
    if (rootItem && nodesByPathRef.current[rootItem.path] === undefined) {
      const rootNode = {
        id: rootItem.path,
        children: [{ id: 'loading' }]
      };
      nodesByPathRef.current[rootItem.path] = rootNode;
      setRootNode(rootNode);
    }
  }, [rootItem]);

  useEffect(() => {
    // This effect will update the expanded nodes on the tree
    if (rootPath) {
      Object.keys(fetchingByPath).forEach((path) => {
        if (fetchingByPath[path]) {
          // if the node doest exist, we will create it, otherwise will add loading to the children
          if (!nodesByPathRef.current[path]) {
            nodesByPathRef.current[path] = {
              id: path,
              children: [{ id: 'loading' }]
            };
          } else {
            nodesByPathRef.current[path].children = [{ id: 'loading' }];
          }
        } else {
          // Checking and setting children for the path
          if (childrenByParentPath[path]) {
            // If the children are empty and there are filtered search, we will add a empty node
            if (Boolean(keywordByPath[path]) && totalByPath[path] === 0) {
              nodesByPathRef.current[path].children = [
                {
                  id: 'empty'
                }
              ];
              return;
            }

            lookupItemByPath(path, nodesByPathRef.current).children = [];
            lookupItemByPath(path, childrenByParentPath)?.forEach((childPath) => {
              // if the node doest exist, we will create it, otherwise will add loading to the children
              if (!nodesByPathRef.current[childPath]) {
                nodesByPathRef.current[childPath] = {
                  id: childPath,
                  children: totalByPath[childPath] === 0 ? [] : [{ id: 'loading' }]
                };
              }
              nodesByPathRef.current[path].children.push(nodesByPathRef.current[childPath]);
            });

            // Checking node children total is less than the total items for the children we will add a more node
            if (nodesByPathRef.current[path].children.length < totalByPath[path]) {
              nodesByPathRef.current[path].children.push({ id: 'more', parentPath: path });
            }
          }
        }
      });
      if (nodesByPathRef.current[rootPath]) {
        setRootNode({ ...nodesByPathRef.current[rootPath] });
      }
    }
  }, [childrenByParentPath, fetchingByPath, keywordByPath, rootPath, totalByPath]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400)).subscribe(({ keyword, path }) => {
      dispatch(
        pathNavigatorTreeSetKeyword({
          id,
          path,
          keyword
        })
      );
      resetBackgroundRefreshInterval();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [resetBackgroundRefreshInterval, dispatch, id, onSearch$, rootPath]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [
      itemsPasted.type,
      itemUnlocked.type,
      itemUpdated.type,
      folderCreated.type,
      folderRenamed.type,
      itemsDeleted.type,
      itemDuplicated.type,
      itemCreated.type,
      pluginInstalled.type,
      itemsUploaded.type
    ];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        case itemsPasted.type:
        case folderCreated.type: {
          if (payload.clipboard?.type === 'CUT') {
            const parentPath = getParentPath(payload.clipboard.sourcePath);
            const sourceNode = lookupItemByPath(parentPath, nodesByPathRef.current);
            const targetNode = lookupItemByPath(payload.target, nodesByPathRef.current);

            const paths = {};
            if (sourceNode) {
              paths[sourceNode.id] = {
                limit: childrenByParentPath[sourceNode.id]?.length ?? limit
              };
            }
            if (targetNode) {
              paths[targetNode.id] = {
                limit: childrenByParentPath[targetNode.id] ? childrenByParentPath[targetNode.id].length + 1 : limit
              };
            }
            if (sourceNode || targetNode) {
              dispatch(
                pathNavigatorTreeFetchPathsChildren({
                  id,
                  paths
                })
              );
            }
          } else {
            const node = lookupItemByPath(payload.target, nodesByPathRef.current);
            const path = node?.id;
            if (path) {
              dispatch(
                pathNavigatorTreeFetchPathChildren({
                  id,
                  path
                })
              );
            }
          }
          break;
        }
        case folderRenamed.type:
        case itemDuplicated.type:
        case itemUnlocked.type:
        case itemUpdated.type:
        case itemCreated.type: {
          const parentPath = getParentPath(payload.target);
          const node = lookupItemByPath(parentPath, nodesByPathRef.current);
          const path = node?.id;
          if (path) {
            dispatch(
              pathNavigatorTreeFetchPathChildren({
                id,
                path
              })
            );
          }
          break;
        }
        case itemsDeleted.type: {
          const paths = {};
          payload.targets.forEach((target) => {
            const parentPath = getParentPath(target);
            const node = lookupItemByPath(parentPath, nodesByPathRef.current);
            const path = node?.id;
            if (path) {
              paths[path] = {
                limit: childrenByParentPath[path]?.length ?? limit
              };
            }
          });
          if (Object.keys(paths).length) {
            dispatch(
              pathNavigatorTreeFetchPathsChildren({
                id,
                paths
              })
            );
          }
          break;
        }
        case pluginInstalled.type: {
          dispatch(pathNavigatorTreeBackgroundRefresh({ id }));
          break;
        }
        case itemsUploaded.type: {
          const parentPath = payload.target;
          const node = lookupItemByPath(parentPath, nodesByPathRef.current);
          const path = node?.id;
          if (path) {
            dispatch(
              pathNavigatorTreeFetchPathChildren({
                id,
                path
              })
            );
          }
          break;
        }
        default: {
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [id, rootPath, dispatch, totalByPath, limit, childrenByParentPath, state?.expanded]);
  // endregion

  if (!rootItem || !Boolean(state) || !rootNode) {
    return (
      <PathNavigatorSkeletonTree
        numOfItems={
          storedState.expanded?.includes(withIndex(props.rootPath)) ||
          storedState.expanded?.includes(withoutIndex(props.rootPath))
            ? 5
            : 1
        }
      />
    );
  }

  // region Handlers
  const onChangeCollapsed = (collapsed) => {
    dispatch(pathNavigatorTreeToggleExpanded({ id, collapsed }));
  };

  const onNodeLabelClick = (event: React.MouseEvent<Element, MouseEvent>, path: string) => {
    if (isNavigable(itemsByPath[path])) {
      dispatch(
        previewItem({
          item: itemsByPath[path],
          newTab: event.ctrlKey || event.metaKey
        })
      );
    } else if (isPreviewable(itemsByPath[path])) {
      onPreview(itemsByPath[path]);
    } else {
      onToggleNodeClick(path);
    }
  };

  const onToggleNodeClick = (path: string) => {
    // If the path is already expanded should be collapsed
    if (state.expanded.includes(path)) {
      dispatch(
        pathNavigatorTreeCollapsePath({
          id,
          path
        })
      );
    } else {
      // If the item have children should be expanded
      if (childrenByParentPath[path]) {
        dispatch(
          pathNavigatorTreeExpandPath({
            id,
            path
          })
        );
      } else {
        // Otherwise the item doesn't have children and should be fetched
        dispatch(
          pathNavigatorTreeFetchPathChildren({
            id,
            path
          })
        );
      }
    }
    resetBackgroundRefreshInterval();
  };

  const onHeaderButtonClick = (element: Element) => {
    setWidgetMenu({
      sections: [[toContextMenuOptionsLookup(menuOptions, formatMessage).refresh]],
      anchorEl: element
    });
  };

  const onOpenItemMenu = (element: Element, path: string) => {
    const anchorRect = element.getBoundingClientRect();
    const top = anchorRect.top + getOffsetTop(anchorRect, 'top');
    const left = anchorRect.left + getOffsetLeft(anchorRect, 'left');
    dispatch(completeDetailedItem({ path }));
    dispatch(
      showItemMegaMenu({
        path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top, left },
        loaderItems: getNumOfMenuOptionsForItem(itemsByPath[path])
      })
    );
  };

  const onCloseWidgetOptions = () => setWidgetMenu({ ...widgetMenu, anchorEl: null });

  const onWidgetOptionsClick = (option: string) => {
    onCloseWidgetOptions();
    if (option === 'refresh') {
      dispatch(
        pathNavigatorTreeRefresh({
          id
        })
      );
      resetBackgroundRefreshInterval();
    }
  };

  const onFilterChange = (keyword: string, path: string) => {
    if (!state.expanded.includes(path)) {
      dispatch(
        pathNavigatorTreeExpandPath({
          id,
          path
        })
      );
    }

    onSearch$.next({ keyword, path });
  };

  const onMoreClick = (path: string) => {
    nodesByPathRef.current[path].children.pop();
    nodesByPathRef.current[path].children.push({ id: 'loading' });
    dispatch(
      pathNavigatorTreeFetchPathPage({
        id,
        path
      })
    );
    resetBackgroundRefreshInterval();
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
      fetchContentXML(siteId, item.path).subscribe((content) => {
        dispatch(
          updatePreviewDialog({
            content
          })
        );
      });
    }
  };

  // endregion

  return (
    <>
      <PathNavigatorTreeUI
        title={label}
        icon={expandedIcon && collapsedIcon ? (state.collapsed ? collapsedIcon : expandedIcon) : icon}
        container={container}
        isCollapsed={state?.collapsed}
        rootNode={rootNode}
        itemsByPath={itemsByPath}
        keywordByPath={keywordByPath}
        totalByPath={totalByPath}
        childrenByParentPath={childrenByParentPath}
        expandedNodes={state?.expanded}
        onIconClick={onToggleNodeClick}
        onLabelClick={onNodeLabelClick}
        onChangeCollapsed={onChangeCollapsed}
        onOpenItemMenu={onOpenItemMenu}
        onHeaderButtonClick={onHeaderButtonClick}
        onFilterChange={onFilterChange}
        onMoreClick={onMoreClick}
      />
      <ContextMenu
        anchorEl={widgetMenu.anchorEl}
        options={widgetMenu.sections}
        open={Boolean(widgetMenu.anchorEl)}
        onClose={onCloseWidgetOptions}
        onMenuItemClicked={onWidgetOptionsClick}
      />
    </>
  );
}
