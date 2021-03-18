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

import React, { useEffect, useRef, useState } from 'react';
import PathNavigatorTreeUI from './PathNavigatorTreeUI';
import { useItemsByPath, useMount, useSelection, useSubject } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import {
  pathNavigatorTreeCollapsePath,
  pathNavigatorTreeExpandPath,
  pathNavigatorTreeFetchNextPathChildren,
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeInit,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleExpanded
} from '../../state/actions/pathNavigatorTree';
import { StateStylingProps } from '../../models/UiConfig';
import LookupTable from '../../models/LookupTable';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import { isNavigable } from '../PathNavigator/utils';
import ContextMenu, { ContextMenuOption } from '../ContextMenu';
import { getNumOfMenuOptionsForItem } from '../../utils/content';
import ItemActionsMenu from '../ItemActionsMenu';
import { ContextMenuOptionDescriptor, toContextMenuOptionsLookup } from '../../utils/itemActions';
import { defineMessages, useIntl } from 'react-intl';
import { previewItem } from '../../state/actions/preview';
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
import { getHostToHostBus } from '../../modules/Preview/previewContext';

interface PathNavigatorTreeProps {
  id: string;
  label: string;
  rootPath: string;
  excludes?: string[];
  limit?: number;
  icon?: Partial<StateStylingProps>;
  container?: Partial<StateStylingProps>;
}

export interface PathNavigatorTreeStateProps {
  rootPath: string;
  levelDescriptor: string;
  collapsed: boolean;
  limit: number;
  expanded: string[];
  childrenByParentPath: LookupTable<string[]>;
  keywordByPath: LookupTable<string>;
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
  const { label, id = props.label.replace(/\s/g, ''), rootPath, excludes, limit = 10, icon, container } = props;
  const state = useSelection((state) => state.pathNavigatorTree)[id];
  const itemsByPath = useItemsByPath();
  const childrenByParentPath = state?.childrenByParentPath;
  const keywordByPath = state?.keywordByPath;
  const totalByPath = state?.totalByPath;
  const rootItem = itemsByPath?.[rootPath];
  const [rootNode, setRootNode] = useState(null);
  const [itemMenu, setItemMenu] = useState<Menu>({
    path: null,
    anchorEl: null,
    loaderItems: null
  });
  const [widgetMenu, setWidgetMenu] = useState<Menu>({
    anchorEl: null,
    sections: []
  });
  const { formatMessage } = useIntl();
  const nodesByPathRef = useRef({});
  const keywordByPathRef = useRef({});
  const fetchingPathsRef = useRef([]);
  const onSearch$ = useSubject<{ keyword: string; path: string }>();

  const dispatch = useDispatch();
  useMount(() => {
    dispatch(
      pathNavigatorTreeInit({
        id,
        path: rootPath,
        excludes,
        limit
      })
    );
  });

  useEffect(() => {
    if (rootItem) {
      const rootNode = {
        id: rootItem.path,
        name: rootItem.label,
        children: [{ id: 'loading' }]
      };
      nodesByPathRef.current[rootItem.path] = rootNode;
      setRootNode(rootNode);
    }
  }, [rootItem]);

  useEffect(() => {
    const nextFetching = [];
    fetchingPathsRef.current.forEach((path) => {
      if (childrenByParentPath[path]) {
        nodesByPathRef.current[path].children = [];
        // If the children are empty and there are filtered search, we will add a empty node
        if (Boolean(keywordByPathRef.current[path]) && childrenByParentPath[path].length === 0) {
          nodesByPathRef.current[path].children = [
            {
              id: 'empty'
            }
          ];
        }
        childrenByParentPath[path].forEach((childPath) => {
          const node = {
            id: childPath,
            name: itemsByPath[childPath].label,
            children: nodesByPathRef.current[childPath]?.children
              ? nodesByPathRef.current[childPath].children
              : [{ id: 'loading' }]
          };
          nodesByPathRef.current[path].children.push(node);
          nodesByPathRef.current[childPath] = node;
        });

        // If the node children total is less than the total items for the children we will add a more node
        if (nodesByPathRef.current[path].children.length < totalByPath[path]) {
          nodesByPathRef.current[path].children.push({ id: 'more', parentPath: path });
        }
        setRootNode({ ...nodesByPathRef.current[rootPath] });
      } else {
        nextFetching.push(path);
      }
    });
    fetchingPathsRef.current = nextFetching;
  }, [rootPath, childrenByParentPath, itemsByPath, totalByPath]);

  useEffect(() => {
    keywordByPathRef.current = keywordByPath;
  }, [keywordByPath]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400)).subscribe(({ keyword, path }) => {
      if (!fetchingPathsRef.current.includes(path)) {
        fetchingPathsRef.current.push(path);
      }
      dispatch(
        pathNavigatorTreeSetKeyword({
          id,
          path,
          keyword
        })
      );
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, id, onSearch$, rootPath]);

  // TODO: Item Updates Propagation
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
        default: {
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [id, dispatch]);

  const onChangeCollapsed = (collapsed) => {
    dispatch(pathNavigatorTreeToggleExpanded({ id, collapsed }));
  };

  const onLabelClick = (event: React.MouseEvent<Element, MouseEvent>, path: string) => {
    if (isNavigable(itemsByPath[path])) {
      dispatch(
        previewItem({
          item: itemsByPath[path],
          newTab: event.ctrlKey || event.metaKey
        })
      );
    } else {
      onIconClick(path);
    }
  };

  const onIconClick = (path: string) => {
    if (state.expanded.includes(path)) {
      dispatch(
        pathNavigatorTreeCollapsePath({
          id,
          path
        })
      );
    } else {
      if (childrenByParentPath[path]) {
        dispatch(
          pathNavigatorTreeExpandPath({
            id,
            path
          })
        );
      } else {
        fetchingPathsRef.current.push(path);
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
    setItemMenu({
      path,
      anchorEl: element,
      loaderItems: getNumOfMenuOptionsForItem(itemsByPath[path])
    });
  };

  const onCloseItemMenu = () => setItemMenu({ ...itemMenu, path: null, anchorEl: null });

  const onCloseWidgetMenu = () => setWidgetMenu({ ...widgetMenu, anchorEl: null });

  const onSimpleMenuClick = (option: string) => {
    onCloseWidgetMenu();
    if (option === 'refresh') {
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
    // nodesByPathRef.current[path].children.push({ id: 'loading' });
    fetchingPathsRef.current.push(path);
    // setData({ ...nodesByPathRef.current[rootPath] });
    dispatch(
      pathNavigatorTreeFetchNextPathChildren({
        id,
        path
      })
    );
  };

  return (
    <ConditionalLoadingState isLoading={!rootItem || !Boolean(state) || !rootNode}>
      <PathNavigatorTreeUI
        title={label}
        icon={icon}
        container={container}
        isCollapsed={state?.collapsed}
        rootNode={rootNode}
        itemsByPath={itemsByPath}
        keywordByPath={keywordByPath}
        totalByPath={totalByPath}
        childrenByParentPath={childrenByParentPath}
        expandedNodes={state?.expanded}
        onIconClick={onIconClick}
        onLabelClick={onLabelClick}
        onChangeCollapsed={onChangeCollapsed}
        onOpenItemMenu={onOpenItemMenu}
        onHeaderButtonClick={onHeaderButtonClick}
        onFilterChange={onFilterChange}
        onMoreClick={onMoreClick}
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
        open={Boolean(widgetMenu.anchorEl)}
        onClose={onCloseWidgetMenu}
        onMenuItemClicked={onSimpleMenuClick}
      />
    </ConditionalLoadingState>
  );
}
