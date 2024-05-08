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

import { LegacyItem } from '../../models';
import { useIntl } from 'react-intl';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { messages } from './utils';
import { SimpleTreeView } from '@mui/x-tree-view';

const simpleItemsSelectionsStyles = makeStyles()((theme: Theme) => ({
  simpleItemsSelectionRoot: {
    border: '1px solid rgba(0, 0, 0, .125)',
    background: theme.palette.background.paper,
    flexGrow: 1
  },
  simpleItemsSelectionHeader: {
    padding: '10px 10px 0 10px'
  },
  treeViewRoot: {
    padding: '10px 14px'
  },
  treeItemRoot: {},
  treeItemContent: {},
  treeItemIconContainer: {
    display: 'none'
  },
  treeItemCheckbox: {
    padding: '4px'
  },
  treeItemLabel: {
    background: 'none !important',
    display: 'flex',
    alignItems: 'center'
  },
  labelText: {}
}));

interface ItemSelectorTreeProps {
  item: LegacyItem;
  paths: string[];
  selected: string[];
  handleSelect(checked: boolean, item: LegacyItem): void;
  toggleSelectAll(): void;
}

export function ItemSelectorTree(props: ItemSelectorTreeProps) {
  const { formatMessage } = useIntl();
  const { classes } = simpleItemsSelectionsStyles();
  const { item, selected, paths, handleSelect, toggleSelectAll } = props;

  const renderTree = (nodes: LegacyItem) => (
    <TreeItem
      key={nodes.uri}
      itemId={nodes.uri}
      label={
        <FormControlLabel
          onFocus={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          control={
            <Checkbox
              color="primary"
              checked={selected.includes(nodes.uri)}
              className={classes.treeItemCheckbox}
              onChange={(event) => handleSelect(event.currentTarget.checked, nodes)}
            />
          }
          label={nodes.internalName || nodes.uri}
        />
      }
      classes={{
        root: classes.treeItemRoot,
        content: classes.treeItemContent,
        iconContainer: classes.treeItemIconContainer,
        label: classes.treeItemLabel
      }}
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  return (
    <section className={classes.simpleItemsSelectionRoot}>
      <header className={classes.simpleItemsSelectionHeader}>
        <Link component="button" variant="body2" onClick={toggleSelectAll}>
          {paths.length === selected.length ? formatMessage(messages.deselectAll) : formatMessage(messages.selectAll)}
        </Link>
      </header>
      <SimpleTreeView
        className={classes.treeViewRoot}
        expandedItems={paths}
        onExpandedItemsChange={null}
        disableSelection={true}
        slots={{
          collapseIcon: null,
          expandIcon: null
        }}
      >
        {renderTree(item)}
      </SimpleTreeView>
    </section>
  );
}
