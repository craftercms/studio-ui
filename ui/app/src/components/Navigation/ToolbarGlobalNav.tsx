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

import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import AppsRounded from '@material-ui/icons/AppsRounded';
import Avatar from '@material-ui/core/Avatar';
import GlobalNav from './GlobalNav';

interface ToolBarGlobalNavProps {
  // TODO: Remove line 👇🏻 once props are defined.
  [prop: string]: any;
}

export default function ToolbarGlobalNav(props: ToolBarGlobalNavProps) {
  const [anchor, setAnchor] = useState<Element>();
  const onMenuClick = (e) => setAnchor(e.target);
  const onMenuClose = () => setAnchor(null);
  return (
    <>
      <IconButton
        aria-label="Open drawer"
        onClick={onMenuClick}
      >
        <AppsRounded/>
      </IconButton>
      <Avatar>RA</Avatar>
      <GlobalNav anchor={anchor} onMenuClose={onMenuClose} />
    </>
  )
}
