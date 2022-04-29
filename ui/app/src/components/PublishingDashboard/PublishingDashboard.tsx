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

import * as React from 'react';
import PublishingStatusWidget from '../PublishingStatusWidget';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import { PublishingQueueWidget } from '../PublishingQueue';
import PublishOnDemandWidget from '../PublishOnDemandWidget';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import clsx from 'clsx';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {},
    grid: {
      padding: '20px'
    },
    gridNoEmbedded: {
      height: 'calc(100vh - 65px)', // full viewport height - toolbar height
      overflowY: 'auto'
    },
    warningText: {
      display: 'block'
    },
    rowSpacing: {
      marginBottom: theme.spacing(3)
    }
  })
);

interface PublishingDashboardProps {
  embedded?: boolean;
  showAppsButton?: boolean;
}

export function PublishingDashboard(props: PublishingDashboardProps) {
  const { embedded, showAppsButton } = props;
  const classes = useStyles();
  const site = useActiveSiteId();

  return (
    <section className={classes.root}>
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="publishingDashboard.title" defaultMessage="Publishing Dashboard" />}
          showAppsButton={showAppsButton}
        />
      )}
      <Grid container className={clsx(classes.grid, !embedded && classes.gridNoEmbedded)}>
        <Grid className={classes.rowSpacing} item xs={12}>
          <PublishingStatusWidget siteId={site} />
        </Grid>
        <Grid className={classes.rowSpacing} item xs={12}>
          <PublishOnDemandWidget siteId={site} />
        </Grid>
        <Grid item xs={12}>
          <PublishingQueueWidget siteId={site} />
        </Grid>
      </Grid>
    </section>
  );
}

export default PublishingDashboard;

