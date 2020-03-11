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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

export interface SectionItem {
  id: string;
  label: string;
  type?: string;
}

interface CustomMenuProps {
  anchorEl?: null | Element | ((element: Element) => Element);
  open: boolean;
  classes: {
    paper?: any;
    helperText?: any;
  }
  sections: SectionItem[][];

  onClose(): void;

  onMenuItemClicked(section: SectionItem): void;
}

export default function CustomMenu(props: CustomMenuProps) {
  const { sections, classes, onClose, open, anchorEl, onMenuItemClicked } = props;
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      classes={{ paper: classes?.paper }}
      onClose={onClose}
    >
      {
        sections.map((section: any, i: number) =>
          section.map((sectionItem: SectionItem, y: number) =>
            (sectionItem.type === 'text') ? (
              <div>
                <Typography variant="body1" className={classes.helperText}>
                  {sectionItem.label}
                </Typography>
                <Divider/>
              </div>
            ) : (
              <MenuItem
                divider={(i !== sections.length - 1) && (y === section.length - 1)}
                onClick={() => onMenuItemClicked(sectionItem)}
              >
                {sectionItem.label}
              </MenuItem>
            )
          )
        )
      }
    </Menu>
  )
}
