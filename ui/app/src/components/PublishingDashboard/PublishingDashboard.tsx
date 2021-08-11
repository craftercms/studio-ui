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

import * as React from 'react';
import PublishingStatusWidget from '../PublishingStatusWidget';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import PublishingQueueWidget from '../PublishingQueueWidget';
import PublishOnDemandWidget from '../PublishOnDemandWidget';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
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

export default function PublishingDashboard(props: PublishingDashboardProps) {
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
