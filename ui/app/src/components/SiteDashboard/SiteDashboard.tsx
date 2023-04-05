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
// import { useEffect, Suspense } from 'react';
// import useSiteUIConfig from '../../hooks/useSiteUIConfig';
// import useDashboardState from '../../hooks/useDashboardState';
// import useActiveUser from '../../hooks/useActiveUser';
// import useActiveSiteId from '../../hooks/useActiveSiteId';
// import { useDispatch } from 'react-redux';
// import { initDashboardConfig } from '../../state/actions/dashboard';
// import { renderWidgets } from '../Widget';
// import EmptyState from '../EmptyState';
// import { FormattedMessage } from 'react-intl';
// import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import ActivityDashlet from '../ActivityDashlet/ActivityDashlet';
import PendingApprovalDashlet from '../PendingApprovalDashlet/PendingApprovalDashlet';
import ExpiringDashlet from '../ExpiringDashlet/ExpiringDashlet';
import UnpublishedDashlet from '../UnpublishedDashlet/UnpublishedDashlet';
import ScheduledDashlet from '../ScheduledDashlet/ScheduledDashlet';
import RecentlyPublishedDashlet from '../RecentlyPublishedDashlet/RecentlyPublishedDashlet';
import DevContentOpsDashlet from '../DevContentOpsDashlet/DevContentOpsDashlet';
import { MyRecentActivityDashlet } from '../MyRecentActivityDashlet';
import useMediaQuery from '@mui/material/useMediaQuery';

export interface DashboardProps {
  mountMode?: string;
  onMinimize?(): void;
}

// TODO: Uncomment below when dashboard apis are ready and we can go back to making these the primary dashboards.
export function Dashboard(props: DashboardProps) {
  const { mountMode, onMinimize } = props;

  const {
    palette: { mode }
  } = useTheme();
  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  // const site = useActiveSiteId();
  // const user = useActiveUser();
  // const userRoles = user.rolesBySite[site];
  // const uiConfig = useSiteUIConfig();
  // const dashboard = useDashboardState();
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   if (uiConfig.xml && !dashboard) {
  //     dispatch(initDashboardConfig({ configXml: uiConfig.xml }));
  //   }
  // }, [uiConfig.xml, dashboard, dispatch]);
  const height = 380;
  return (
    <Box
      sx={{
        position: 'relative',
        p: 2,
        bgcolor: `grey.${mode === 'light' ? 100 : 800}`,
        ...(desktopScreen
          ? {
              height: mountMode === 'dialog' ? '100%' : 'calc(100% - 65px)',
              overflow: 'hidden'
            }
          : {})
      }}
    >
      <Grid
        container
        spacing={2}
        sx={
          desktopScreen
            ? {
                width: '66.66%',
                height: '100%',
                position: 'absolute',
                overflowY: 'auto',
                pb: 2,
                pr: 2
              }
            : {}
        }
      >
        <Grid
          item
          xs={12}
          md={12}
          sx={{
            display: 'flex',
            flexWrap: 'wrap'
          }}
        >
          <DevContentOpsDashlet
            sxs={{
              card: {
                width: '100%'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MyRecentActivityDashlet contentHeight={height} onMinimize={onMinimize} />
        </Grid>
        <Grid item xs={12} md={6}>
          <UnpublishedDashlet contentHeight={height} onMinimize={onMinimize} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PendingApprovalDashlet contentHeight={height} onMinimize={onMinimize} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ScheduledDashlet contentHeight={height} onMinimize={onMinimize} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecentlyPublishedDashlet contentHeight={height} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ExpiringDashlet contentHeight={height} onMinimize={onMinimize} />
        </Grid>
      </Grid>
      <ActivityDashlet
        sxs={{
          card: {
            display: 'flex',
            flexDirection: 'column',
            ...(desktopScreen
              ? {
                  width: '33.33%',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 0
                }
              : {
                  mt: 2
                })
          }
        }}
        contentHeight={desktopScreen ? null : height}
        onMinimize={onMinimize}
      />
      {/*
      <Suspense fallback={<DashboardSkeleton />}>
        {dashboard ? (
          Boolean(dashboard?.widgets?.length) ? (
            renderWidgets(dashboard.widgets, { userRoles })
          ) : (
            <EmptyState
              title={
                <FormattedMessage id="siteDashboard.emptyStateMessageTitle" defaultMessage="No widgets to display" />
              }
              subtitle={
                <FormattedMessage
                  id="siteDashboard.emptyStateMessageSubtitle"
                  defaultMessage="Add widgets at your project's User Interface Configuration"
                />
              }
            />
          )
        ) : (
          <DashboardSkeleton />
        )}
      </Suspense>
      */}
    </Box>
  );
}

// function DashboardSkeleton() {
//   return (
//     <Grid container spacing={2}>
//       {new Array(3).fill(null).map((nothing, index) => (
//         <Grid item md={4} key={index}>
//           <Skeleton variant="rectangular" sx={{ height: 350 }} />
//         </Grid>
//       ))}
//     </Grid>
//   );
// }

export default Dashboard;
