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

import React, { PropsWithChildren } from 'react';
import { CommonDashletProps, parseDashletContentHeight } from './utils';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';

export function DashletTemplate(
  props: PropsWithChildren<CommonDashletProps & { title: React.ReactNode; actionsBar?: React.ReactNode }>
) {
  const { children, actionsBar, title, borderLeftColor, contentHeight } = props;
  return (
    <Card sx={{ borderLeft: 5, borderLeftColor }}>
      {/* region Header */}
      <CardHeader title={title} titleTypographyProps={{ variant: 'h6', component: 'h2' }} />
      {/* endregion */}
      <Divider />
      {actionsBar}
      {/* region Body */}
      <CardContent sx={{ overflow: 'auto', height: parseDashletContentHeight(contentHeight) }}>{children}</CardContent>
      {/* endregion */}
    </Card>
  );
}
