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

import { WidgetDescriptor } from '../Widget';
import React from 'react';
import TranslationOrText from '../../models/TranslationOrText';
import LauncherSectionUI from './LauncherSectionUI';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useSiteLookup } from '../../utils/hooks/useSiteLookup';

export interface LauncherSectionProps {
  title: TranslationOrText;
  widgets: WidgetDescriptor[];
}

function LauncherSection(props: LauncherSectionProps) {
  const site = useActiveSiteId();
  const sites = useSiteLookup();
  const user = useActiveUser();
  return (
    <LauncherSectionUI
      {...props}
      site={site}
      user={user}
      translationValues={{
        siteName: sites[site]?.name ?? '',
        muted: (value) => (
          <span className="muted" key={value}>
            {value}
          </span>
        )
      }}
    />
  );
}

export default LauncherSection;
