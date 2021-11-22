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

import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import useStyles from './styles';
import { renderWidgets } from '../Widget';
import EmptyState from '../EmptyState/EmptyState';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useSiteUIConfig } from '../../hooks/useSiteUIConfig';
import { initDashboardConfig } from '../../state/actions/dashboard';
import { useDashboardState } from '../../hooks/useDashboardState';
import { useDispatch } from 'react-redux';

interface DashboardAppProps {}

export function Dashboard(props: DashboardAppProps) {
  const site = useActiveSiteId();
  const user = useActiveUser();
  const userRoles = user.rolesBySite[site];
  const classes = useStyles();
  const uiConfig = useSiteUIConfig();
  const dashboard = useDashboardState();
  const dispatch = useDispatch();

  useEffect(() => {
    if (uiConfig.xml && !dashboard) {
      dispatch(initDashboardConfig({ configXml: uiConfig.xml }));
    }
  }, [uiConfig.xml, dashboard, dispatch]);

  return (
    <section className={classes.root}>
      {dashboard && renderWidgets(dashboard.widgets, userRoles)}
      {!Boolean(dashboard?.widgets?.length) && (
        <>
          <EmptyState
            title={<FormattedMessage id="dashboard.emptyStateMessageTitle" defaultMessage="No widgets to display" />}
            subtitle={
              <FormattedMessage
                id="dashboard.emptyStateMessageSubtitle"
                defaultMessage="Add widgets at your site's User Interface Configuration"
              />
            }
          />
        </>
      )}
    </section>
  );
}

export default Dashboard;
