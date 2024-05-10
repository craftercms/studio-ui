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
import { ProjectToolsRoutes } from '../../env/routes';

interface LegacyDashboardFrameProps {
  dashboardOnly?: boolean;
  iframeProps?: LegacyIFrameProps['iframeProps'];
}

function LegacyDashboardFrame(props: LegacyDashboardFrameProps) {
  const { dashboardOnly = true, iframeProps } = props;
  const path = `${ProjectToolsRoutes.SiteDashboard}${[dashboardOnly && '?mode=embedded'].filter(Boolean).join('')}`;
  return <LegacyIFrame path={path} title="Site Dashboard" iframeProps={iframeProps} />;
}

export default LegacyDashboardFrame;
