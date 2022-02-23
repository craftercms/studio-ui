/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.useGlobalAppState
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
import EncryptTool from '../EncryptTool';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';

interface SiteEncryptToolProps {
  embedded?: boolean;
  showAppsButton?: boolean;
}

export function SiteEncryptTool(props: SiteEncryptToolProps) {
  const site = useActiveSiteId();
  return <EncryptTool site={site} embedded={props.embedded} showAppsButton={props.showAppsButton} />;
}

export default SiteEncryptTool;
