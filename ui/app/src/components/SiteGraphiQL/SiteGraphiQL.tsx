/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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
import Graphi from '../GraphiQL';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useEnv } from '../../hooks/useEnv';

interface SiteGraphiQLProps {
  embedded?: boolean;
  showAppsButton?: boolean;
}

export function SiteGraphiQL(props: SiteGraphiQLProps) {
  const site = useActiveSiteId();
  const { guestBase } = useEnv();
  return (
    <Graphi
      storageKey={site}
      url={`${guestBase}/api/1/site/graphql`}
      embedded={props.embedded}
      showAppsButton={props.showAppsButton}
    />
  );
}

export default SiteGraphiQL;
