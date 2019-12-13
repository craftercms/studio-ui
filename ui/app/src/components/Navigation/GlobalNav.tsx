/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { nnou } from '../../utils/object';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import React from 'react';

interface GlobalNavProps {
  anchor: Element;
  onMenuClose: (e: React.MouseEvent<any>) => void;
}

export default function GlobalNav(props: GlobalNavProps) {
  const { anchor, onMenuClose } = props;
  return (
    <>
      <Menu
        open={nnou(anchor)}
        onClose={onMenuClose}
        anchorEl={anchor}
      >
        <MenuItem onClick={(e) => onItemClick(e, '/#/globalMenu/sites')}>Sites</MenuItem>
        <MenuItem onClick={(e) => onItemClick(e, '/site-config')}>Site Config</MenuItem>
        <MenuItem onClick={(e) => onItemClick(e, '/preview')}>Preview</MenuItem>
        <MenuItem onClick={(e) => onItemClick(e, '/legacy/preview')}>Preview (Legacy)</MenuItem>
        <MenuItem onClick={(e) => onItemClick(e, '/search')}>Search</MenuItem>
      </Menu>
    </>
  );
}

function onItemClick(e: React.MouseEvent<any>, url: string) {
  const base = window.location.host.replace('3000', '8080');
  window.location.href = `//${base}/studio${url}`;
}
