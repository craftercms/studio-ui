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

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import TreeItem from '@mui/lab/TreeItem';
import clsx from 'clsx';
import { useTreeNodeStyles } from './styles';
import { FolderBrowserTreeViewNode } from './FolderBrowserTreeViewUI';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface RenderTreeNodeProps {
  node: FolderBrowserTreeViewNode;
  classes?: Partial<Record<'treeItemLabel', string>>;
  onIconClick?(event: React.ChangeEvent<{}>, node: FolderBrowserTreeViewNode): void;
  onLabelClick?(event: React.ChangeEvent<{}>, node: FolderBrowserTreeViewNode): void;
}

const translations = defineMessages({
  expand: {
    id: 'words.expand',
    defaultMessage: 'Expand'
  },
  collapse: {
    id: 'words.collapse',
    defaultMessage: 'Collapse'
  }
});

export function RenderTreeNode(props: RenderTreeNodeProps) {
  const { node, onIconClick, onLabelClick } = props;
  const classes = useTreeNodeStyles();
  const { formatMessage } = useIntl();

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
      label={
        <div role="button" onClick={(e) => onLabelClick?.(e, node)}>
          {node.name}
        </div>
      }
      classes={{
        root: classes.treeItemRoot,
        content: classes.treeItemContent,
        selected: classes.treeItemSelected,
        label: clsx(classes.treeItemLabel, props.classes?.treeItemLabel)
      }}
      expandIcon={
        <ExpandMoreIcon
          role="button"
          aria-label={formatMessage(translations.expand)}
          aria-hidden="false"
          onClick={(e) => onIconClick?.(e, node)}
        />
      }
      collapseIcon={
        <ChevronRightIcon
          role="button"
          aria-label={formatMessage(translations.collapse)}
          aria-hidden="false"
          onClick={(e) => onIconClick?.(e, node)}
        />
      }
    >
      {Array.isArray(node.children)
        ? node.children.map((childNode) => (
            <RenderTreeNode
              classes={{ treeItemLabel: props.classes?.treeItemLabel }}
              key={childNode.id}
              node={childNode}
              onIconClick={onIconClick}
              onLabelClick={onLabelClick}
            />
          ))
        : null}
    </TreeItem>
  );
}
