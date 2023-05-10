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
import { useEffect, Suspense } from 'react';
import useSiteUIConfig from '../../hooks/useSiteUIConfig';
import useDashboardState from '../../hooks/useDashboardState';
import useActiveUser from '../../hooks/useActiveUser';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import { initDashboardConfig } from '../../state/actions/dashboard';
import { renderWidgets } from '../Widget';
import EmptyState from '../EmptyState';
import { FormattedMessage } from 'react-intl';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import ActivityDashlet from '../ActivityDashlet/ActivityDashlet';
import DevContentOpsDashlet from '../DevContentOpsDashlet/DevContentOpsDashlet';
import useMediaQuery from '@mui/material/useMediaQuery';
import { IconGuideDashlet } from '../IconGuideDashlet';

export interface DashboardProps {
  mountMode?: string;
  onMinimize?(): void;
}

export function Dashboard(props: DashboardProps) {
  const { mountMode, onMinimize } = props;

  const {
    palette: { mode }
  } = useTheme();
  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up('md'));
  const site = useActiveSiteId();
  const user = useActiveUser();
  const userRoles = user.rolesBySite[site];
  const uiConfig = useSiteUIConfig();
  const dashboard = useDashboardState();
  const dispatch = useDispatch();
  useEffect(() => {
    if (uiConfig.xml && !dashboard) {
      dispatch(initDashboardConfig({ configXml: uiConfig.xml }));
    }
  }, [uiConfig.xml, dashboard, dispatch]);
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
        sx={{
          alignItems: 'baseline',
          alignContent: 'baseline',
          ...(desktopScreen
            ? {
                width: '66.66%',
                height: '100%',
                position: 'absolute',
                overflowY: 'auto',
                pb: 2,
                pr: 2
              }
            : {})
        }}
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

        <Suspense fallback={<DashboardSkeleton />}>
          {dashboard ? (
            Boolean(dashboard?.mainSection?.widgets?.length) ? (
              renderWidgets(dashboard.mainSection.widgets, {
                userRoles,
                defaultProps: { contentHeight: height, onMinimize },
                createMapperFn: (mapper) => (widget, index) =>
                  (
                    <Grid item xs={12} md={6} key={index}>
                      {mapper(widget, index)}
                    </Grid>
                  )
              })
            ) : (
              <Grid item xs={12}>
                <EmptyState
                  title={
                    <FormattedMessage
                      id="siteDashboard.emptyStateMessageTitle"
                      defaultMessage="No widgets to display"
                    />
                  }
                  subtitle={
                    <FormattedMessage
                      id="siteDashboard.emptyStateMessageSubtitle"
                      defaultMessage="Add widgets at your project's User Interface Configuration"
                    />
                  }
                />
              </Grid>
            )
          ) : (
            <DashboardSkeleton />
          )}
        </Suspense>
        {/* Displays on desktop - inside grid, below the last rendered dashlet */}
        <Grid
          item
          md={12}
          sx={{
            display: desktopScreen ? 'flex' : 'none',
            flexWrap: 'wrap'
          }}
        >
          <IconGuideDashlet />
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
      {/* Displays on mobile - below Activity Dashlet */}
      <Box sx={{ display: desktopScreen ? 'none' : 'flex', mt: 2 }}>
        <IconGuideDashlet />
      </Box>
    </Box>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {new Array(3).fill(null).map((nothing, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Skeleton variant="rectangular" sx={{ height: 350 }} />
        </Grid>
      ))}
    </>
  );
}

export default Dashboard;
