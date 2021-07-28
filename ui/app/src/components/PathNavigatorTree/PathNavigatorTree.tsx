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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import PathNavigatorTreeUI, { TreeNode } from './PathNavigatorTreeUI';
import { useDispatch } from 'react-redux';
import {
  pathNavigatorTreeBackgroundRefresh,
  pathNavigatorTreeCollapsePath,
  pathNavigatorTreeExpandPath,
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeFetchPathPage,
  pathNavigatorTreeInit,
  pathNavigatorTreeRefresh,
  pathNavigatorTreeToggleExpanded
} from '../../state/actions/pathNavigatorTree';
import { StateStylingProps } from '../../models/UiConfig';
import LookupTable from '../../models/LookupTable';
import { getEditorMode, isEditableViaFormEditor, isImage, isNavigable, isPreviewable } from '../PathNavigator/utils';
import ContextMenu, { ContextMenuOption } from '../ContextMenu';
import { getNumOfMenuOptionsForItem, lookupItemByPath } from '../../utils/content';
import { ContextMenuOptionDescriptor, toContextMenuOptionsLookup } from '../../utils/itemActions';
import { defineMessages, useIntl } from 'react-intl';
import { previewItem } from '../../state/actions/preview';
// @ts-ignore
import { getOffsetLeft, getOffsetTop } from '@material-ui/core/Popover/Popover';
import { showEditDialog, showItemMegaMenu, showPreviewDialog, updatePreviewDialog } from '../../state/actions/dialogs';
import { getStoredPathNavigatorTree } from '../../utils/state';
import GlobalState from '../../models/GlobalState';
import { nnou } from '../../utils/object';
import PathNavigatorSkeletonTree from './PathNavigatorTreeSkeleton';
import { withIndex, withoutIndex } from '../../utils/path';
import { DetailedItem } from '../../models/Item';
import { fetchContentXML } from '../../services/content';
import { SystemIconDescriptor } from '../SystemIcon';
import { completeDetailedItem } from '../../state/actions/content';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useEnv } from '../../utils/hooks/useEnv';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useItemsByPath } from '../../utils/hooks/useItemsByPath';
import { useSubject } from '../../utils/hooks/useSubject';

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
  const site = useActiveSiteId();
  const user = useActiveUser();
  const itemsByPath = useItemsByPath();
  const keywordByPath = state?.keywordByPath;
  const totalByPath = state?.totalByPath;
  const childrenByParentPath = useMemo(() => state?.childrenByParentPath ?? {}, [state?.childrenByParentPath]);
  const fetchingByPath = useMemo(() => state?.fetchingByPath ?? {}, [state?.fetchingByPath]);
  const rootItem = lookupItemByPath(props.rootPath, itemsByPath);
  const rootPath = rootItem?.path ?? props.rootPath;

  const [rootNode, setRootNode] = useState(null);
  const [widgetMenu, setWidgetMenu] = useState<Menu>({
    anchorEl: null,
    sections: []
  });
  const { formatMessage } = useIntl();
  const nodesByPathRef = useRef<LookupTable<TreeNode>>({});
  const onSearch$ = useSubject<{ keyword: string; path: string }>();
  const uiConfig = useSelection<GlobalState['uiConfig']>((state) => state.uiConfig);
  const storedState = useMemo(() => {
    return getStoredPathNavigatorTree(site, user.username, id) ?? {};
  }, [id, site, user.username]);
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();

  const hasActiveSession = useSelection((state) => state.auth.active);

  useEffect(() => {
    if (backgroundRefreshTimeoutMs && hasActiveSession) {
      let interval = setInterval(() => {
        // dispatch(pathNavigatorTreeBackgroundRefresh({ id }));
      }, backgroundRefreshTimeoutMs);
      return () => {
        clearInterval(interval);
      };
    }
  }, [backgroundRefreshTimeoutMs, dispatch, id, hasActiveSession]);

  useEffect(() => {
    // Adding uiConfig as means to stop navigator from trying to
    // initialize with previous state information when switching sites
    if (!state && uiConfig.currentSite === site) {
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
  }, [site, user.username, id, dispatch, rootPath, excludes, limit, state, uiConfig.currentSite, storedState]);

  useEffect(() => {
    if (rootItem) {
      const rootNode = {
        id: rootItem.path,
        name: rootItem.label,
        children: nodesByPathRef.current[rootItem.path]?.children ?? [{ id: 'loading' }]
      };
      nodesByPathRef.current[rootItem.path] = rootNode;
      setRootNode(rootNode);
    }
  }, [rootItem]);

  useEffect(() => {
    Object.keys(fetchingByPath).forEach((path) => {
      if (itemsByPath[path]) {
        if (fetchingByPath[path]) {
          // If the items is being fetched, adding loading to the children
          nodesByPathRef.current[path] = {
            id: path,
            name: itemsByPath[path].label,
            children: [{ id: 'loading' }]
          };
        } else {
          // Checking and setting children for the path
          if (childrenByParentPath[path]) {
            nodesByPathRef.current[path].children = [];
            childrenByParentPath[path]?.forEach((childPath) => {
              const node = {
                id: childPath,
                name: itemsByPath[childPath].label,
                children: [{ id: 'loading' }]
              };
              nodesByPathRef.current[path].children.push(node);
              nodesByPathRef.current[childPath] = node;
            });

            // Checking node children total is less than the total items for the children we will add a more node
            if (nodesByPathRef.current[path].children.length < totalByPath[path]) {
              nodesByPathRef.current[path].children.push({ id: 'more', parentPath: path });
            }
          }
        }
      }
    });
    if (nodesByPathRef.current[rootPath]) {
      setRootNode({ ...nodesByPathRef.current[rootPath] });
    }
  }, [childrenByParentPath, fetchingByPath, itemsByPath, rootPath, totalByPath]);

  if (!rootItem || !Boolean(state) || !rootNode) {
    return (
      <PathNavigatorSkeletonTree
        numOfItems={
          storedState.expanded?.includes(withIndex(rootPath)) || storedState.expanded?.includes(withoutIndex(rootPath))
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
          id,
          rootPath
        })
      );
    }
  };

  const onFilterChange = (keyword: string, path: string) => {
    nodesByPathRef.current[path].children = [{ id: 'loading' }];
    setRootNode({ ...nodesByPathRef.current[rootPath] });
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
    dispatch(
      pathNavigatorTreeFetchPathPage({
        id,
        path
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
