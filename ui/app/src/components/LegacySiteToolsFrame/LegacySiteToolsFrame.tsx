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
import LegacyIFrame, { LegacyIFrameProps } from '../LegacyIFrame/LegacyIFrame';

interface LegacySiteToolsFrameProps {
  tool?: string;
  workAreaOnly?: boolean;
  iframeProps?: LegacyIFrameProps['iframeProps'];
}

function LegacySiteToolsFrame(props: LegacySiteToolsFrameProps) {
  const { tool, workAreaOnly = true, iframeProps } = props;
  const path = `/legacy-site-config${[workAreaOnly && '?mode=embedded', tool && `#tool/${tool}`]
    .filter(Boolean)
    .join('')}`;
  return <LegacyIFrame path={path} title="Project Tools" iframeProps={iframeProps} />;
}

export default LegacySiteToolsFrame;
