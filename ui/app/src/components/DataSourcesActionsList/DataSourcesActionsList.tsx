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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export interface DataSourcesActionsListProps {
  show: boolean;
  rect: DOMRect;
  items: {
    label: string;
    path: string;
    action(path: string, type: 'image' | 'media'): void;
    type: 'image' | 'media';
  }[];
  onClose?(): void;
}

export function DataSourcesActionsList(props: DataSourcesActionsListProps) {
  const { show, rect, items, onClose } = props;

  return (
    <>
      {items.length > 0 && (
        <Menu
          open={show}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: rect.top,
            left: rect.left
          }}
          onClose={onClose}
        >
          {items.map((item, index) => (
            <MenuItem key={index} onClick={() => item.action(item.path, item.type)}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
}

export default DataSourcesActionsList;

