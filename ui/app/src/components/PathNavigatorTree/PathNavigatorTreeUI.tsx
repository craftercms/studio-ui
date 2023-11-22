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
import { TreeView } from '@mui/x-tree-view/TreeView';
import { makeStyles } from 'tss-react/mui';
import Accordion from '@mui/material/Accordion';
import Header from '../PathNavigator/PathNavigatorHeader';
import AccordionDetails from '@mui/material/AccordionDetails';
import { StateStylingProps } from '../../models/UiConfig';
import PathNavigatorTreeItem, { PathNavigatorTreeItemProps } from './PathNavigatorTreeItem';
import LookupTable from '../../models/LookupTable';
import { DetailedItem } from '../../models/Item';
import { SystemIconDescriptor } from '../SystemIcon';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import { FormattedMessage } from 'react-intl';
import { ErrorState } from '../ErrorState';

export interface PathNavigatorTreeUIProps
  extends Pick<
    PathNavigatorTreeItemProps,
    'showNavigableAsLinks' | 'showPublishingTarget' | 'showWorkflowState' | 'showItemMenu'
  > {
  title: string;
  icon?: SystemIconDescriptor;
  container?: Partial<StateStylingProps>;
  rootPath: string;
  isRootPathMissing: boolean;
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
  classes?: Partial<Record<'root' | 'body' | 'header', string>>;
  active?: PathNavigatorTreeItemProps['active'];
}

const useStyles = makeStyles()(() => ({
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
}));

export function PathNavigatorTreeUI(props: PathNavigatorTreeUIProps) {
  const { classes, cx } = useStyles();
  // region const { ... } = props
  const {
    icon,
    container,
    title,
    rootPath,
    isRootPathMissing,
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
    expandedNodes,
    active,
    showNavigableAsLinks,
    showPublishingTarget,
    showWorkflowState,
    showItemMenu
  } = props;
  // endregion
  return (
    <Accordion
      square
      disableGutters
      elevation={0}
      TransitionProps={{ unmountOnExit: true }}
      expanded={!isCollapsed}
      onChange={() => onChangeCollapsed(!isCollapsed)}
      className={cx(
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
        // @see https://github.com/craftercms/craftercms/issues/5360
        menuButtonIcon={<RefreshRounded />}
        collapsed={isCollapsed}
        onMenuButtonClick={onHeaderButtonClick}
        className={props.classes?.header}
      />
      {isRootPathMissing ? (
        <ErrorState
          styles={{ image: { display: 'none' } }}
          title={
            <FormattedMessage
              id="pathNavigatorTree.missingRootPath"
              defaultMessage={`The path "{path}" doesn't exist`}
              values={{ path: rootPath }}
            />
          }
        />
      ) : (
        <AccordionDetails className={cx(classes.accordionDetails, props.classes?.body)}>
          <TreeView className={classes.root} expanded={expandedNodes} disableSelection>
            <PathNavigatorTreeItem
              path={rootPath}
              active={active}
              itemsByPath={itemsByPath}
              keywordByPath={keywordByPath}
              totalByPath={totalByPath}
              childrenByParentPath={childrenByParentPath}
              onIconClick={onIconClick}
              onLabelClick={onLabelClick}
              onFilterChange={onFilterChange}
              onOpenItemMenu={onOpenItemMenu}
              onMoreClick={onMoreClick}
              showNavigableAsLinks={showNavigableAsLinks}
              showPublishingTarget={showPublishingTarget}
              showWorkflowState={showWorkflowState}
              showItemMenu={showItemMenu}
            />
          </TreeView>
        </AccordionDetails>
      )}
    </Accordion>
  );
}

export default PathNavigatorTreeUI;
