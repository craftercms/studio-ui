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

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { ContextMenuOptionDescriptor, toContextMenuOptionsLookup } from '../../utils/itemActions';
import { defineMessages, useIntl } from 'react-intl';
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
import { completeDetailedItem } from '../../state/actions/content';
import { useSelection } from '../../hooks/useSelection';
import { useEnv } from '../../hooks/useEnv';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useItemsByPath } from '../../hooks/useItemsByPath';
import { useSubject } from '../../hooks/useSubject';
import { useDetailedItem } from '../../hooks/useDetailedItem';
import { debounceTime, filter } from 'rxjs/operators';
import {
  contentEvent,
  deleteContentEvent,
  pluginInstalled,
  publishEvent,
  workflowEvent
} from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
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
  const { formatMessage } = useIntl();
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

  useEffect(() => {
    // setting nodeByPathRef to undefined when the siteId changes
    // Adding uiConfig as means to stop navigator from trying to
    // initialize with previous state information when switching sites
    if (!state && uiConfig.currentSite === siteId && rootPath) {
      nodesByPathRef.current[rootPath] = undefined;
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
    fetchSandboxItem(siteId, rootPath).subscribe({
      next() {},
      error({ response }) {
        setError(response.response);
      }
    });
  }, [rootPath, siteId]);

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
    const events = [
      contentEvent.type,
      deleteContentEvent.type,
      pluginInstalled.type,
      workflowEvent.type,
      publishEvent.type
    ];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        case contentEvent.type: {
          const targetPath = payload.targetPath ?? payload.target;
          const parentPath = getParentPath(targetPath);

          let node = lookupItemByPath(targetPath, nodesByPathRef.current);
          if (!node || node.children.length === 0) {
            node = lookupItemByPath(parentPath, nodesByPathRef.current);
          }
          const path = node?.id;
          if (path) {
            dispatch(
              pathNavigatorTreeFetchPathChildren({
                id,
                path,
                expand: user.username === payload.user.username
              })
            );
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
              pathNavigatorTreeFetchPathChildren({
                id,
                path
              })
            );
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
        default: {
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [id, rootPath, dispatch, totalByPath, limit, childrenByParentPath, state?.expanded, user]);
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
    dispatch(pathNavigatorTreeBackgroundRefresh({ id }));
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
        batchActions([
          pathNavigatorTreeRefresh({
            id
          }),
          pathNavigatorTreeBackgroundRefresh({ id })
        ])
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
