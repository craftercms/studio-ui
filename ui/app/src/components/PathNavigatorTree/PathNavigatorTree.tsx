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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PathNavigatorTreeUI, { PathNavigatorTreeNode } from './PathNavigatorTreeUI';
import { useDispatch } from 'react-redux';
import {
  pathNavigatorTreeBackgroundRefresh,
  pathNavigatorTreeCollapsePath,
  pathNavigatorTreeExpandPath,
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeFetchPathPage,
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
import { previewItem } from '../../state/actions/preview';
// @ts-ignore
import { getOffsetLeft, getOffsetTop } from '@mui/material/Popover/Popover';
import { showEditDialog, showItemMegaMenu, showPreviewDialog } from '../../state/actions/dialogs';
import { getStoredPathNavigatorTree } from '../../utils/state';
import GlobalState from '../../models/GlobalState';
import { nnou } from '../../utils/object';
import PathNavigatorSkeletonTree from './PathNavigatorTreeSkeleton';
import { getParentPath, withIndex, withoutIndex } from '../../utils/path';
import { DetailedItem } from '../../models/Item';
import { SystemIconDescriptor } from '../SystemIcon';
import { useSelection } from '../../hooks/useSelection';
import { useEnv } from '../../hooks/useEnv';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useItemsByPath } from '../../hooks/useItemsByPath';
import { useSubject } from '../../hooks/useSubject';
import { useDetailedItem } from '../../hooks/useDetailedItem';
import { debounceTime } from 'rxjs/operators';
import {
  contentEvent,
  deleteContentEvent,
  folderRenamed,
  pluginInstalled,
  publishEvent,
  workflowEvent
} from '../../state/actions/system';
import { getHostToHostBus } from '../../utils/subjects';
import { useActiveSite } from '../../hooks/useActiveSite';
import { fetchSandboxItem } from '../../services/content';
import { ApiResponse } from '../../models';
import { batchActions } from '../../state/actions/misc';

export interface PathNavigatorTreeProps {
  id: string;
  label: string;
  rootPath: string;
  excludes?: string[];
  limit?: number;
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
  error: ApiResponse;
}

interface Menu {
  path?: string;
  sections?: ContextMenuOption[][];
  anchorEl: Element;
  loaderItems?: number;
}

// @see https://github.com/craftercms/craftercms/issues/5360
// const translations = defineMessages({
//   refresh: {
//     id: 'words.refresh',
//     defaultMessage: 'Refresh'
//   }
// });
//
// const menuOptions: LookupTable<ContextMenuOptionDescriptor> = {
//   refresh: {
//     id: 'refresh',
//     label: translations.refresh
//   }
// };

export function PathNavigatorTree(props: PathNavigatorTreeProps) {
  const {
    label,
    id = props.label.replace(/\s/g, ''),
    excludes,
    limit = 10,
    icon,
    expandedIcon,
    collapsedIcon,
    container,
    rootPath
  } = props;
  const state = useSelection((state) => state.pathNavigatorTree)[id];
  const { id: siteId, uuid } = useActiveSite();
  const user = useActiveUser();
  const nodesByPathRef = useRef<LookupTable<PathNavigatorTreeNode>>({});
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
  const itemsByPath = useItemsByPath();
  const keywordByPath = useMemo(() => state?.keywordByPath ?? {}, [state?.keywordByPath]);
  const totalByPath = useMemo(() => state?.totalByPath ?? {}, [state?.totalByPath]);
  const childrenByParentPath = useMemo<LookupTable<string[]>>(
    () => state?.childrenByParentPath ?? {},
    [state?.childrenByParentPath]
  );
  const fetchingByPath = useMemo(() => state?.fetchingByPath ?? {}, [state?.fetchingByPath]);
  const rootItem = useDetailedItem(props.rootPath);
  const [rootNode, setRootNode] = useState(null);
  const [error, setError] = useState<ApiResponse>();

  const rootPathExists = useCallback(() => {
    fetchSandboxItem(siteId, rootPath).subscribe({
      next() {},
      error({ response }) {
        setError(response.response);
      }
    });
  }, [siteId, rootPath]);

  useEffect(() => {
    // setting nodeByPathRef to undefined when the siteId changes
    // Adding uiConfig as means to stop navigator from trying to
    // initialize with previous state information when switching sites
    if (!state && uiConfig.currentSite === siteId && rootPath) {
      nodesByPathRef.current = {};
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
    rootPathExists();
  }, [rootPathExists]);

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
        batchActions([
          pathNavigatorTreeSetKeyword({
            id,
            path,
            keyword
          }),
          pathNavigatorTreeBackgroundRefresh({ id })
        ])
      );
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, id, onSearch$, rootPath]);

  // region Item Updates Propagation
  useEffect(() => {
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.subscribe(({ type, payload }) => {
      switch (type) {
        case contentEvent.type: {
          const targetPath = payload.targetPath ?? payload.target;
          const parentPath = getParentPath(targetPath);
          if (withoutIndex(targetPath) === rootPath) {
            // If item is root
            dispatch(pathNavigatorTreeRefresh({ id }));
          } else if (
            // The target path is rooted in this navigator's root
            targetPath.startsWith(withoutIndex(rootPath))
          ) {
            // TODO: Research improving the reloads here; consider targetPath and opened paths?
            if (user.username === payload.user.username) {
              // if it's current user then reload and expand folder (for example pasting in another folder)
              dispatch(pathNavigatorTreeFetchPathChildren({ id, path: parentPath, expand: false }));
            } else {
              // if content editor is not current user do a silent refresh
              dispatch(pathNavigatorTreeBackgroundRefresh({ id }));
            }
          }
          break;
        }
        case deleteContentEvent.type: {
          const targetPath = payload.targetPath;
          const parentPath = getParentPath(targetPath);
          const node = lookupItemByPath(parentPath, nodesByPathRef.current);
          const path = node?.id;
          if (path) {
            dispatch(
              state.expanded.includes(targetPath)
                ? batchActions([
                    pathNavigatorTreeCollapsePath({ id, path: targetPath }),
                    pathNavigatorTreeFetchPathChildren({ id, path })
                  ])
                : pathNavigatorTreeFetchPathChildren({ id, path })
            );
          }
          if (targetPath === rootPath) {
            rootPathExists();
          }
          break;
        }
        case folderRenamed.type: {
          const targetPath = payload.target;
          if (state.expanded.includes(targetPath)) {
            dispatch(
              pathNavigatorTreeCollapsePath({
                id,
                path: targetPath
              })
            );
          }
          if (targetPath === rootPath) {
            rootPathExists();
          }
          break;
        }
        case pluginInstalled.type: {
          dispatch(pathNavigatorTreeBackgroundRefresh({ id }));
          break;
        }
        case workflowEvent.type:
        case publishEvent.type: {
          dispatch(pathNavigatorTreeBackgroundRefresh({ id }));
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [id, rootPath, dispatch, state?.expanded, user, rootPathExists]);
  // endregion

  if ((!rootItem || !Boolean(state) || !rootNode) && !error) {
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
    // If the path is already expanded, should be collapsed
    if (state.expanded.includes(path)) {
      dispatch(pathNavigatorTreeCollapsePath({ id, path }));
    } else {
      // If the item's children have been loaded, should simply be expanded
      if (childrenByParentPath[path]) {
        dispatch(pathNavigatorTreeExpandPath({ id, path }));
      } else {
        // Children not fetched yet, should be fetched
        dispatch(pathNavigatorTreeFetchPathChildren({ id, path }));
      }
    }
  };

  const onHeaderButtonClick = (element: Element) => {
    // @see https://github.com/craftercms/craftercms/issues/5360
    onWidgetOptionsClick('refresh');
    // setWidgetMenu({
    //   sections: [[toContextMenuOptionsLookup(menuOptions, formatMessage).refresh]],
    //   anchorEl: element
    // });
  };

  const onOpenItemMenu = (element: Element, path: string) => {
    const anchorRect = element.getBoundingClientRect();
    const top = anchorRect.top + getOffsetTop(anchorRect, 'top');
    const left = anchorRect.left + getOffsetLeft(anchorRect, 'left');
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

  // endregion

  return (
    <>
      <PathNavigatorTreeUI
        title={label}
        icon={expandedIcon && collapsedIcon ? (state.collapsed ? collapsedIcon : expandedIcon) : icon}
        container={container}
        isCollapsed={state?.collapsed}
        rootNode={rootNode}
        error={error}
        itemsByPath={itemsByPath}
        keywordByPath={keywordByPath}
        totalByPath={totalByPath}
        childrenByParentPath={childrenByParentPath}
        expandedNodes={state?.expanded}
        onIconClick={onToggleNodeClick}
        onLabelClick={onNodeLabelClick}
        onChangeCollapsed={onChangeCollapsed}
        onOpenItemMenu={onOpenItemMenu}
        onHeaderButtonClick={state.collapsed ? void 0 : onHeaderButtonClick}
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

export default PathNavigatorTree;

