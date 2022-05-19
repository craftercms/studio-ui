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

import useSpreadState from '../../hooks/useSpreadState';
import LookupTable from '../../models/LookupTable';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ApiResponse } from '../../models';
import PathNavigatorSkeletonTree from '../PathNavigatorTree/PathNavigatorTreeSkeleton';
import { fetchChildrenByPath, fetchItemByPath } from '../../services/content';
import useActiveSite from '../../hooks/useActiveSite';
import { PathNavigatorTreeItem, PathNavigatorTreeNode } from '../PathNavigatorTree';
import { lookupItemByPath, parseSandBoxItemToDetailedItem } from '../../utils/content';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import TreeView from '@mui/lab/TreeView';
import { createLookupTable, nnou } from '../../utils/object';
import { isFolder } from '../PathNavigator/utils';

export interface FolderBrowserTreeViewProps {
  rootPath: string;
  selectedPath?: string;
  onPathSelected?(path: string): void;
}

export function FolderBrowserTreeView(props: FolderBrowserTreeViewProps) {
  const { rootPath, selectedPath, onPathSelected } = props;
  const { id: siteId } = useActiveSite();
  const nodesByPathRef = useRef<LookupTable<PathNavigatorTreeNode>>({});
  const [keywordByPath, setKeywordByPath] = useSpreadState<LookupTable<string>>({});
  const [totalByPath, setTotalByPath] = useSpreadState<LookupTable<number>>({});
  const [childrenByParentPath, setChildrenByParentPath] = useSpreadState<LookupTable<string[]>>({});
  const [fetchingByPath, setFetchingByPath] = useSpreadState<LookupTable<boolean>>({});
  const [itemsByPath, setItemsByPath] = useSpreadState({});
  const [offsetByPath, setOffsetByPath] = useSpreadState({});
  const [rootItem, setRootItem] = useState(null);
  const [rootNode, setRootNode] = useState(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [error, setError] = useState<ApiResponse>();
  const limit = 5;
  const fetchChildren = useCallback(
    (path: string, options = {}) => {
      setFetchingByPath({
        [path]: true
      });
      fetchChildrenByPath(siteId, path, {
        systemTypes: ['folder'],
        ...(nnou(options.keyword)
          ? { keyword: options.keyword }
          : keywordByPath[path]
          ? { keyword: keywordByPath[path] }
          : {}),
        limit,
        ...(nnou(options.offset)
          ? { offset: options.offset }
          : offsetByPath[path]
          ? { offset: offsetByPath[path] }
          : {})
      }).subscribe((children) => {
        const newTotalByPath = { ...totalByPath };
        newTotalByPath[path] = children.total;
        setItemsByPath(createLookupTable(parseSandBoxItemToDetailedItem(children), 'path'));
        const nextChildren = childrenByParentPath[path] && options.mergeResults ? childrenByParentPath[path] : [];
        children.forEach((item) => {
          nextChildren.push(item.path);
          newTotalByPath[item.path] = item.childrenCount;
        });
        setTotalByPath({ ...newTotalByPath });
        setChildrenByParentPath({
          [path]: nextChildren
        });
        setOffsetByPath({
          [path]: nnou(offsetByPath[path]) && options.mergeResults ? offsetByPath[path] + limit : 0
        });
        setFetchingByPath({
          [path]: false
        });
      });
    },
    [
      setItemsByPath,
      setChildrenByParentPath,
      setFetchingByPath,
      setTotalByPath,
      setOffsetByPath,
      siteId,
      totalByPath,
      keywordByPath,
      childrenByParentPath,
      offsetByPath
    ]
  );

  // region useEffects
  useEffect(() => {
    if (!rootItem || rootItem?.id === rootPath) {
      fetchItemByPath(siteId, rootPath, { castAsDetailedItem: true }).subscribe({
        next(item) {
          setRootItem(item);
          setItemsByPath({
            [rootPath]: item
          });
          // This expands the first level
          setExpanded([rootPath]);
          fetchChildren(rootPath);
        },
        error({ response }) {
          setError(response.response);
        }
      });
    }
  }, [rootPath, rootItem, siteId, fetchChildren, setItemsByPath]);

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
  // endregion

  if ((!rootItem || !rootNode) && !error) {
    return <PathNavigatorSkeletonTree numOfItems={1} />;
  }

  // region Handlers
  const onToggleNodeClick = (path: string) => {
    if (expanded.includes(path)) {
      setExpanded(expanded.filter((expPath) => expPath !== path));
    } else {
      if (!childrenByParentPath[path]) {
        fetchChildren(path);
      }
      setExpanded([...expanded, path]);
    }
  };

  const onItemClicked = (event: React.MouseEvent<Element, MouseEvent>, path: string) => {
    if (isFolder(itemsByPath[path])) {
      onPathSelected?.(path);
    }
  };

  const onFilterChange = (keyword: string, path: string) => {
    setKeywordByPath({
      [path]: keyword
    });
    fetchChildren(path, { keyword });
    if (!expanded.includes(path)) {
      setExpanded([...expanded, path]);
    }
  };

  const onMoreClick = (path: string) => {
    nodesByPathRef.current[path].children.pop();
    nodesByPathRef.current[path].children.push({ id: 'loading' });
    const offset = offsetByPath[path] ? offsetByPath[path] + limit : limit;
    fetchChildren(path, { offset, mergeResults: true });
  };
  // endregion

  return (
    <>
      {error ? (
        <ApiResponseErrorState error={error} imageUrl={null} />
      ) : (
        <TreeView disableSelection expanded={expanded}>
          <PathNavigatorTreeItem
            node={rootNode}
            itemsByPath={itemsByPath}
            keywordByPath={keywordByPath}
            totalByPath={totalByPath}
            childrenByParentPath={childrenByParentPath}
            active={selectedPath}
            onLabelClick={onItemClicked}
            onIconClick={onToggleNodeClick}
            onFilterChange={onFilterChange}
            onMoreClick={onMoreClick}
          />
        </TreeView>
      )}
    </>
  );
}

export default FolderBrowserTreeView;
