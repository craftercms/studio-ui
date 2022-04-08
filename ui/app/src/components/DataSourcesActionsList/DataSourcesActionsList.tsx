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
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

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

function getStyles() {
  return {
    paper: {
      position: 'fixed'
    },
    backdrop: {
      backgroundColor: 'transparent',
      boxShadow: 'none'
    }
  };
}

export default function DataSourcesActionsList(props: DataSourcesActionsListProps) {
  const { show, rect, items, onClose } = props;
  const sx = getStyles();

  return (
    <>
      {items.length > 0 && (
        <Dialog
          onClose={onClose}
          open={show}
          PaperProps={{
            sx: sx.paper,
            style: {
              top: rect.top,
              left: rect.left
            }
          }}
          BackdropProps={{ sx: sx.backdrop }}
        >
          <List dense={true}>
            {items.map((item, index) => (
              <ListItem key={index} disableGutters>
                <ListItemButton onClick={() => item.action(item.path, item.type)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Dialog>
      )}
    </>
  );
}
