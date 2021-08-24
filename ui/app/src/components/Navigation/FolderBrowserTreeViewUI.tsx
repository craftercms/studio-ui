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

import React, { useEffect, useState } from 'react';
import { FormHelperText, InputBase, Typography } from '@material-ui/core';
import palette from '../../styles/palette';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { LegacyItem } from '../../models/Item';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import LoadingState from '../SystemStatus/LoadingState';
import { Resource } from '../../models/Resource';
import clsx from 'clsx';

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  fetched?: boolean;
}

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
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
        marginLeft: '10px'
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
          id: 'loading'
        }
      ]
    }));
}

interface FolderBrowserTreeViewUIProps {
  rootPath: string;
  currentPath: string;
  expanded: string[];
  selected: string;
  invalidPath?: boolean;
  isFetching?: boolean;
  resource: Resource<TreeNode>;
  classes?: Partial<Record<'root' | 'treeViewRoot', string>>;
  showPathTextBox?: boolean;
  onNodeSelected(event: React.ChangeEvent<{}>, nodeId: string): void;
  onNodeToggle(event: React.ChangeEvent<{}>, nodeIds: string[]): void;
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
    showPathTextBox = true
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
          onNodeToggle={onNodeToggle}
          onNodeSelect={onNodeSelected}
        >
          <RenderTreeNode node={treeNodes} />
        </TreeView>
      ) : (
        <LoadingState classes={{ root: classes.loadingState }} />
      )}
    </section>
  );
}

interface RenderTreeNodeProps {
  node: TreeNode;
}

function RenderTreeNode({ node }: RenderTreeNodeProps) {
  const classes = useStyles({});
  return node.id === 'loading' ? (
    <div className={classes.loading}>
      <CircularProgress size={16} />
      <Typography>
        <FormattedMessage id="words.loading" defaultMessage="Loading" />
      </Typography>
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

const getPathSelectedStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      display: 'flex',
      padding: '10px 12px',
      border: `1px solid  ${palette.gray.light1}`,
      borderRadius: '5px',
      '&.invalid': {
        borderColor: palette.red.main
      }
    },
    selected: {
      fontWeight: 600,
      marginRight: '10px'
    },
    root: {
      flexGrow: 1
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
    },
    invalid: {
      '& $invisibleInput': {
        color: palette.red.main
      }
    }
  })
);

interface PathSelectedProps {
  rootPath: string;
  currentPath: string;
  invalidPath: boolean;
  isFetching: boolean;
  onPathChanged(path: string): void;
  onKeyPress?(event: React.KeyboardEvent): void;
}

function PathSelected(props: PathSelectedProps) {
  const { rootPath, currentPath, onPathChanged, invalidPath, isFetching, onKeyPress: onInputChanges } = props;
  const classes = getPathSelectedStyles({});
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState(null);

  useEffect(() => {
    setValue(currentPath);
  }, [currentPath]);

  const onBlur = () => {
    setFocus(false);
    let path = rootPath + value;
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    onPathChanged(path);
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.charCode === 13) {
      let path = rootPath + value;
      if (path !== '/' && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      onPathChanged(path);
    } else {
      onInputChanges?.(event);
    }
  };

  return (
    <>
      <section className={clsx(classes.wrapper, invalidPath && 'invalid')}>
        <Typography className={classes.selected} display="inline" color="textSecondary">
          <FormattedMessage id="words.selected" defaultMessage="Selected" />
        </Typography>
        <Typography color="textSecondary" display="inline">
          {rootPath}
        </Typography>
        <InputBase
          className={invalidPath ? classes.invalid : null}
          onFocus={() => setFocus(true)}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          onChange={(e) => setValue(e.currentTarget.value)}
          classes={{ root: classes.root, input: classes.invisibleInput }}
          value={focus ? value : currentPath}
          endAdornment={isFetching ? <CircularProgress size={16} /> : null}
        />
      </section>
      {invalidPath && (
        <FormHelperText error>
          <FormattedMessage id="folderBrowserTreeView.invalidPath" defaultMessage="The entered path doesn’t exist." />
        </FormHelperText>
      )}
    </>
  );
}
