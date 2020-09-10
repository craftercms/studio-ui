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
import { InputBase, Typography } from '@material-ui/core';
import palette from '../../styles/palette';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { LegacyItem } from '../../models/Item';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';
import { FormattedMessage } from 'react-intl';
import LoadingState from '../SystemStatus/LoadingState';

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  fetched?: boolean;
}

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column'
    },
    loadingState: {
      flexGrow: 1,
      flexDirection: 'unset'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      padding: '2px',
      marginLeft: '5px',
      '& p': {
        marginRight: '10px'
      }
    },
    treeItemRoot: {
      '&:focus > $treeItemContent, &$treeItemSelected > $treeItemContent': {
        color: `${palette.blue.main}`
      }
    },
    treeItemContent: {},
    treeItemSelected: {},
    treeItemLabel: {
      width: 'auto',
      padding: '0 4px',
      borderRadius: '5px'
    }
  })
);

export function legacyItemsToTreeNodes(items: LegacyItem[]) {
  return items
    .filter((item) => item.contentType === 'folder')
    .map((item) => ({
      id: item.path,
      name: item.name,
      children: [
        {
          id: 'loading',
          name: 'loading'
        }
      ]
    }));
}

interface FolderBrowserTreeViewProps {
  rootPath: string;
  defaultExpanded: string[];
  currentPath: string;
  classes: any;
  setCurrentPath(currentPath: string): void;
}

export default function FolderBrowserTreeView(props: any) {
  const classes = useStyles({});
  const {
    rootPath,
    defaultExpanded,
    currentPath,
    expanded,
    selected,
    onNodeToggle,
    onNodeSelected,
    treeNodes
  } = props;

  return (
    <section className={classes.wrapper}>
      <PathSelected rootPath={rootPath} currentPath={currentPath.replace(rootPath, '')} />
      {
        treeNodes ? (
          <TreeView
            classes={{ root: props.classes?.treeViewRoot }}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpanded={defaultExpanded}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={expanded}
            selected={selected}
            onNodeToggle={onNodeToggle}
            onNodeSelect={onNodeSelected}
          >
            <RenderTreeNode node={treeNodes} />
          </TreeView>
        ) : (
          <LoadingState classes={{ root: classes.loadingState }} />
        )
      }
    </section>
  );
}

interface RenderTreeNode {
  node: TreeNode;
}

function RenderTreeNode({ node }: RenderTreeNode) {
  const classes = useStyles({});
  return node.id === 'loading' ? (
    <div className={classes.loading}>
      <Typography>Loading...</Typography>
      <CircularProgress size={16} />
    </div>
  ) : (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={node.name}
      classes={{
        root: classes.treeItemRoot,
        content: classes.treeItemContent,
        selected: classes.treeItemSelected,
        label: classes.treeItemLabel
      }}
    >
      {Array.isArray(node.children)
        ? node.children.map((childNode) => <RenderTreeNode key={childNode.id} node={childNode} />)
        : null}
    </TreeItem>
  );
}

const PathSelectedStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      display: 'flex',
      background: palette.white,
      padding: '10px 12px',
      border: `1px solid  ${palette.gray.light1}`,
      borderRadius: '5px'
    },
    selected: {
      fontWeight: 600,
      marginRight: '10px'
    },
    invisibleInput: {
      padding: 0,
      border: 0,
      background: 'none',
      height: '100%',
      '&:focus': {
        borderColor: 'none',
        boxShadow: 'inherit'
      }
    }
  })
);

interface PathSelectedProps {
  rootPath: string;
  currentPath: string;
}

function PathSelected(props: PathSelectedProps) {
  const { rootPath, currentPath } = props;
  const classes = PathSelectedStyles({});
  return (
    <section className={classes.wrapper}>
      <Typography className={classes.selected} display="inline">
        <FormattedMessage id="words.selected" defaultMessage="Selected" />
      </Typography>
      <Typography color="textSecondary" display="inline">
        {rootPath}
      </Typography>
      <InputBase fullWidth classes={{ input: classes.invisibleInput }} value={currentPath} />
    </section>
  );
}
