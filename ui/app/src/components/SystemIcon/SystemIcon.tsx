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
import CoreIcon from '@material-ui/core/Icon';
import SearchIcon from '@material-ui/icons/SearchRounded';
import Asset from '@material-ui/icons/ImageOutlined';
import Component from '@material-ui/icons/ExtensionRounded';
import Audiences from '@material-ui/icons/EmojiPeopleRounded';
import PageExplorer from '../../components/Icons/PageExplorerRounded';
import SiteExplorer from '../../components/Icons/SiteExplorerRounded';
import Simulator from '@material-ui/icons/DevicesRounded';

export interface SystemIconProps {
  icon: { id: string; baseClass: string; baseStyle: object };
}

const iconsMap = {
  'material.icons.search': SearchIcon,
  'material.icons.component': Component,
  'material.icons.asset': Asset,
  'material.icons.audiences': Audiences,
  'material.icons.pageExplorer': PageExplorer,
  'material.icons.simulator': Simulator,
  'material.icons.siteExplorer': SiteExplorer
};

export default function SystemIcon(props: SystemIconProps) {
  const icon = props.icon;
  const Icon = icon.id ? iconsMap[icon.id] : CoreIcon;
  return <Icon fontSize="small" className={icon.baseClass} style={icon.baseStyle} />;
}
