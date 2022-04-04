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

import Box from '@mui/material/Box';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import ActivityDashlet from '../ActivityDashlet/ActivityDashlet';
import PendingApprovalDashlet from '../PendingApprovalDashlet/PendingApprovalDashlet';
import ExpiringDashlet from '../ExpiringDashlet/ExpiringDashlet';
import UnpublishedDashlet from '../UnpublishedDashlet/UnpublishedDashlet';
import ScheduledDashlet from '../ScheduledDashlet/ScheduledDashlet';
import RecentlyPublishedDashlet from '../RecentlyPublishedDashlet/RecentlyPublishedDashlet';
import DevContentOpsDashlet from '../DevContentOpsDashlet/DevContentOpsDashlet';

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const height = 300;
  const {
    palette: { mode }
  } = useTheme();
  return (
    <Box sx={{ p: 2, bgcolor: `grey.${mode === 'light' ? 100 : 800}` }}>
      <Grid container spacing={2}>
        <Grid item md={4}>
          <ActivityDashlet contentHeight={height} />
        </Grid>
        <Grid item md={4}>
          <PendingApprovalDashlet contentHeight={height} />
        </Grid>
        <Grid item md={4}>
          <ExpiringDashlet contentHeight={height} />
        </Grid>
        <Grid item md={4}>
          <UnpublishedDashlet contentHeight={height} />
        </Grid>
        <Grid item md={4}>
          <ScheduledDashlet contentHeight={height} />
        </Grid>
        <Grid item md={4}>
          <RecentlyPublishedDashlet contentHeight={height} />
        </Grid>
        <Grid item md={4}>
          <DevContentOpsDashlet contentHeight={height} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
