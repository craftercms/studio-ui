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
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import React from 'react';
import { messages } from './utils';
import { SimpleTreeView } from '@mui/x-tree-view';
import Box from '@mui/material/Box';

interface ItemSelectorTreeProps {
  item: LegacyItem;
  paths: string[];
  selected: string[];
  handleSelect(checked: boolean, item: LegacyItem): void;
  toggleSelectAll(): void;
}

export function ItemSelectorTree(props: ItemSelectorTreeProps) {
  const { formatMessage } = useIntl();
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
              sx={{ padding: '4px' }}
              onChange={(event) => handleSelect(event.currentTarget.checked, nodes)}
            />
          }
          label={nodes.internalName || nodes.uri}
        />
      }
      sx={{
        [`& .${treeItemClasses.iconContainer}`]: {
          display: 'none'
        },
        [`& .${treeItemClasses.label}`]: {
          background: 'none !important',
          display: 'flex',
          alignItems: 'center'
        }
      }}
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  return (
    <Box
      component="section"
      sx={{
        border: '1px solid rgba(0, 0, 0, .125)',
        background: (theme) => theme.palette.background.paper,
        flexGrow: 1
      }}
    >
      <Box component="header" sx={{ padding: '10px 10px 0 10px' }}>
        <Link component="button" variant="body2" onClick={toggleSelectAll}>
          {paths.length === selected.length ? formatMessage(messages.deselectAll) : formatMessage(messages.selectAll)}
        </Link>
      </Box>
      <SimpleTreeView
        sx={{ padding: '10px 14px' }}
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
    </Box>
  );
}
