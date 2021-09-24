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

import { VersionViewProps } from './utils';
import { useSelection } from '../../utils/hooks/useSelection';
import React from 'react';
import { getLegacyDialogStyles } from './ViewVersionDialog';

export default function LegacyVersionDialog(props: VersionViewProps) {
  const { version } = props.resource.read();
  const classes = getLegacyDialogStyles();
  const authoringUrl = useSelection<string>((state) => state.env.authoringBase);
  return (
    <iframe
      title="View version"
      className={classes.iframe}
      src={`${authoringUrl}/diff?site=${version.site}&path=${encodeURIComponent(version.path)}&version=${
        version.versionNumber
      }&versionTO=${version.versionNumber}&mode=iframe&ui=next`}
    />
  );
}
