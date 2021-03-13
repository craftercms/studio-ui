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

import TreeItem from '@material-ui/lab/TreeItem';
import React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import clsx from 'clsx';
import Header from '../PathNavigator/PathNavigatorHeader';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { TreeNode } from '../Navigation/FolderBrowserTreeView';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      height: 110,
      flexGrow: 1,
      maxWidth: 400
    },
    accordion: {
      boxShadow: 'none',
      backgroundColor: 'inherit',
      '&.Mui-expanded': {
        margin: 'inherit'
      }
    },
    accordionDetails: {
      padding: 0,
      flexDirection: 'column'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      padding: '2px',
      marginLeft: '5px',
      '& p': {
        marginLeft: '10px'
      }
    }
  })
);

interface RenderTree {
  id: string;
  name: string;
  children?: RenderTree[];
}

export default function PathNavigatorTreeUI(props: any) {
  const classes = useStyles();
  const { icon, container, title, resource, onNodeToggle, onNodeSelect, onChangeCollapsed } = props;
  const state = resource.read();

  return (
    <Accordion
      expanded={!state.collapsed}
      onChange={() => onChangeCollapsed(!state.collapsed)}
      className={clsx(
        classes.accordion,
        props.classes?.root,
        container?.baseClass,
        container ? (state.collapsed ? container.collapsedClass : container.expandedClass) : void 0
      )}
      style={{
        ...container?.baseStyle,
        ...(container ? (state.collapsed ? container.collapsedStyle : container.expandedStyle) : void 0)
      }}
    >
      <Header
        iconClassName={clsx(
          icon?.baseClass,
          icon ? (state.collapsed ? icon.collapsedClass : icon.expandedClass) : null
        )}
        iconStyle={{
          ...icon?.baseStyle,
          ...(icon ? (state.collapsed ? icon.collapsedStyle : icon.expandedStyle) : null)
        }}
        title={title}
        locale={state.localeCode}
        onContextMenu={() => {}}
      />
      <AccordionDetails className={clsx(classes.accordionDetails, props.classes?.body)}>
        <TreeView
          className={classes.root}
          defaultCollapseIcon={<ExpandMoreIcon />}
          onNodeSelect={onNodeSelect}
          onNodeToggle={onNodeToggle}
          expanded={state.expanded}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <RenderTreeNode nodes={state.data} />
        </TreeView>
      </AccordionDetails>
    </Accordion>
  );
}

interface RenderTreeNodeProps {
  nodes: TreeNode;
}

function RenderTreeNode({ nodes }: RenderTreeNodeProps) {
  const classes = useStyles();
  return nodes.id === 'loading' ? (
    <div className={classes.loading}>
      <CircularProgress size={16} />
      <Typography>
        <FormattedMessage id="words.loading" defaultMessage="Loading" />
      </Typography>
    </div>
  ) : (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => <RenderTreeNode key={node.id} nodes={node} />)
        : null}
    </TreeItem>
  );
}
