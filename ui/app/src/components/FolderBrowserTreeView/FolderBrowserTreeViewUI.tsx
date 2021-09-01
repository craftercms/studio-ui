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

import React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LoadingState from '../SystemStatus/LoadingState';
import { Resource } from '../../models/Resource';
import clsx from 'clsx';
import { RenderTreeNode } from './RenderTreeNode';
import useStyles from './styles';
import { PathSelected } from './PathSelected';

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  fetched?: boolean;
}

interface FolderBrowserTreeViewUIProps {
  rootPath: string;
  currentPath: string;
  expanded: string[];
  selected: string;
  invalidPath?: boolean;
  isFetching?: boolean;
  resource: Resource<TreeNode>;
  classes?: Partial<Record<'root' | 'treeViewRoot' | 'treeItemLabel', string>>;
  showPathTextBox?: boolean;
  disableSelection?: boolean;
  onNodeSelected?(event: React.ChangeEvent<{}>, nodeId: string): void;
  onNodeToggle?(event: React.ChangeEvent<{}>, nodeIds: string[]): void;
  onIconClick?(event: React.ChangeEvent<{}>, node: TreeNode): void;
  onLabelClick?(event: React.ChangeEvent<{}>, node: TreeNode): void;
  onPathChanged?(path: string): void;
  onKeyPress?(event: React.KeyboardEvent): void;
}

export default function FolderBrowserTreeViewUI(props: FolderBrowserTreeViewUIProps) {
  const classes = useStyles({});
  const {
    rootPath,
    currentPath,
    expanded,
    selected,
    onNodeToggle,
    onNodeSelected,
    resource,
    onPathChanged,
    invalidPath,
    isFetching,
    onKeyPress,
    showPathTextBox = true,
    disableSelection = false,
    onIconClick,
    onLabelClick
  } = props;

  const treeNodes = resource.read();

  return (
    <section className={clsx(classes.wrapper, props.classes?.root)}>
      {showPathTextBox && (
        <PathSelected
          rootPath={rootPath}
          currentPath={currentPath.replace(rootPath, '')}
          onPathChanged={onPathChanged}
          invalidPath={invalidPath}
          isFetching={isFetching}
          onKeyPress={onKeyPress}
        />
      )}
      {treeNodes ? (
        <TreeView
          classes={{ root: props.classes?.treeViewRoot }}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expanded}
          selected={selected}
          disableSelection={disableSelection}
          onNodeToggle={onNodeToggle}
          onNodeSelect={onNodeSelected}
        >
          <RenderTreeNode
            classes={{ treeItemLabel: props.classes?.treeItemLabel }}
            node={treeNodes}
            onIconClick={onIconClick}
            onLabelClick={onLabelClick}
          />
        </TreeView>
      ) : (
        <LoadingState classes={{ root: classes.loadingState }} />
      )}
    </section>
  );
}
