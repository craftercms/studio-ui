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
import { useItemsByPath, useMount, useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import {
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeInit,
  pathNavigatorTreeUpdate
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
  const { label, id = props.label.replace(/\s/g, ''), rootPath, excludes, limit, icon, container } = props;
  const state = useSelection((state) => state.pathNavigatorTree)[id];
  const itemsByPath = useItemsByPath();
  const childrenByParentPath = state?.childrenByParentPath;
  const rootItem = itemsByPath?.[rootPath];
  const [data, setData] = useState(null);
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
  const fetchingPathsRef = useRef([]);

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
      setData(rootNode);
    }
  }, [rootItem]);

  useEffect(() => {
    const nextFetching = [];
    fetchingPathsRef.current.forEach((path) => {
      if (childrenByParentPath[path]) {
        nodesByPathRef.current[path].children = [];
        childrenByParentPath[path].forEach((childPath) => {
          const node = {
            id: childPath,
            name: itemsByPath[childPath].label,
            children: [{ id: 'loading' }]
          };
          nodesByPathRef.current[path].children.push(node);
          nodesByPathRef.current[childPath] = node;
        });

        setData({ ...nodesByPathRef.current[rootPath] });
      } else {
        nextFetching.push(path);
      }
    });
    fetchingPathsRef.current = nextFetching;
  }, [data, rootPath, childrenByParentPath]);

  const onChangeCollapsed = (collapsed) => {};

  const onLabelClick = (event: React.MouseEvent<Element, MouseEvent>, path: string) => {
    if (isNavigable(itemsByPath[path])) {
      if (event.ctrlKey || event.metaKey) {
        dispatch(
          previewItem({
            item: itemsByPath[path],
            newTab: true
          })
        );
      } else {
        dispatch(
          previewItem({
            item: itemsByPath[path]
          })
        );
      }
    } else {
      onIconClick(path);
    }
  };

  const onIconClick = (path: string) => {
    // If the path is already expanded, pathNavigatorTreeUpdate should collapsed it
    if (state.expanded.includes(path)) {
      dispatch(
        pathNavigatorTreeUpdate({
          id,
          expanded: state.expanded.filter((expanded) => expanded !== path)
        })
      );
    } else {
      // if: the path does not exist on childrenByParentPath, the children was not fetched
      // else: the tree should expand the selected node
      if (!childrenByParentPath[path]) {
        fetchingPathsRef.current.push(path);
        dispatch(
          pathNavigatorTreeFetchPathChildren({
            id,
            path
          })
        );
      } else {
        dispatch(
          pathNavigatorTreeUpdate({
            id,
            expanded: [...state.expanded, path]
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

  return (
    <ConditionalLoadingState isLoading={!rootItem || !Boolean(state) || !data}>
      <PathNavigatorTreeUI
        title={label}
        icon={icon}
        container={container}
        isCollapsed={state?.collapsed}
        data={data}
        itemsByPath={itemsByPath}
        expandedNodes={state?.expanded}
        onIconClick={onIconClick}
        onLabelClick={onLabelClick}
        onChangeCollapsed={onChangeCollapsed}
        onOpenItemMenu={onOpenItemMenu}
        onHeaderButtonClick={onHeaderButtonClick}
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
