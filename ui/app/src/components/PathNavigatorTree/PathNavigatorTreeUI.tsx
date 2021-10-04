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
import TreeView from '@mui/lab/TreeView';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Accordion from '@mui/material/Accordion';
import clsx from 'clsx';
import Header from '../PathNavigator/PathNavigatorHeader';
import AccordionDetails from '@mui/material/AccordionDetails';
import { StateStylingProps } from '../../models/UiConfig';
import PathNavigatorTreeItem from './PathNavigatorTreeItem';
import LookupTable from '../../models/LookupTable';
import { DetailedItem } from '../../models/Item';
import { SystemIconDescriptor } from '../SystemIcon';

export interface TreeNode {
  id: string;
  children?: TreeNode[];
  parentPath?: string;
}

interface PathNavigatorTreeUIProps {
  title: string;
  icon?: SystemIconDescriptor;
  container?: Partial<StateStylingProps>;
  rootNode: TreeNode;
  itemsByPath: LookupTable<DetailedItem>;
  keywordByPath: LookupTable<string>;
  totalByPath: LookupTable<number>;
  childrenByParentPath: LookupTable<string[]>;
  onIconClick(path: string): void;
  onLabelClick(event: React.MouseEvent<Element, MouseEvent>, path: string): void;
  onChangeCollapsed(collapsed: boolean): void;
  onOpenItemMenu(element: Element, path: string): void;
  onHeaderButtonClick(element: Element): void;
  onFilterChange(keyword: string, path: string): void;
  onMoreClick(path: string): void;
  isCollapsed: boolean;
  expandedNodes: string[];
  classes?: Partial<Record<'root' | 'body', string>>;
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
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

export default function PathNavigatorTreeUI(props: PathNavigatorTreeUIProps) {
  const classes = useStyles();
  const {
    icon,
    container,
    title,
    rootNode,
    itemsByPath,
    keywordByPath,
    childrenByParentPath,
    totalByPath,
    onIconClick,
    onLabelClick,
    onChangeCollapsed,
    onOpenItemMenu,
    onHeaderButtonClick,
    onFilterChange,
    onMoreClick,
    isCollapsed,
    expandedNodes
  } = props;

  return (
    <Accordion
      expanded={!isCollapsed}
      onChange={() => onChangeCollapsed(!isCollapsed)}
      className={clsx(
        classes.accordion,
        props.classes?.root,
        container?.baseClass,
        container ? (isCollapsed ? container.collapsedClass : container.expandedClass) : void 0
      )}
      style={{
        ...container?.baseStyle,
        ...(container ? (isCollapsed ? container.collapsedStyle : container.expandedStyle) : void 0)
      }}
    >
      <Header
        icon={icon}
        title={title}
        locale={null}
        collapsed={isCollapsed}
        onContextMenu={(element) => {
          onHeaderButtonClick(element);
        }}
      />
      <AccordionDetails className={clsx(classes.accordionDetails, props.classes?.body)}>
        <TreeView className={classes.root} expanded={expandedNodes} disableSelection>
          <PathNavigatorTreeItem
            node={rootNode}
            itemsByPath={itemsByPath}
            keywordByPath={keywordByPath}
            totalByPath={totalByPath}
            childrenByParentPath={childrenByParentPath}
            onIconClick={onIconClick}
            onLabelClick={onLabelClick}
            onFilterChange={onFilterChange}
            onOpenItemMenu={onOpenItemMenu}
            onMoreClick={onMoreClick}
          />
        </TreeView>
      </AccordionDetails>
    </Accordion>
  );
}
