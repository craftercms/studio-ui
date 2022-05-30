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

import React from 'react';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import { Skeleton } from '@mui/material';
import { useSkeletonStyles } from './styles';
import { rand } from '../PathNavigator/utils';

export interface FolderBrowserTreeViewSkeletonProps {
  data?: RenderTree[];
  expanded?: string[];
}

interface RenderTree {
  id: string;
  children?: RenderTree[];
}

export function FolderBrowserTreeViewSkeleton(props: FolderBrowserTreeViewSkeletonProps) {
  const { classes } = useSkeletonStyles();
  const {
    data = [
      {
        id: '1',
        children: [
          {
            id: 'a'
          },
          {
            id: 'b'
          },
          {
            id: 'c'
          }
        ]
      },
      {
        id: '2'
      }
    ],
    expanded = ['1']
  } = props;

  const renderTree = (nodes: RenderTree) => (
    <TreeItem
      classes={{ iconContainer: classes.iconContainer, label: classes.label }}
      key={nodes.id}
      nodeId={nodes.id}
      label={<Skeleton variant="text" width={`${rand(70, 90)}%`} />}
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  return <TreeView defaultExpanded={expanded}>{data.map((node) => renderTree(node))}</TreeView>;
}

export default FolderBrowserTreeViewSkeleton;
