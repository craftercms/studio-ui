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
import Grid from '@mui/material/Grid2';
import { PublishingQueueWidget } from '../PublishingQueue';
import PublishOnDemandWidget from '../PublishOnDemandWidget';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useActiveUser from '../../hooks/useActiveUser';

interface PublishingDashboardProps {
  embedded?: boolean;
  showAppsButton?: boolean;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

export function PublishingDashboard(props: PublishingDashboardProps) {
  const { embedded, showAppsButton, onSubmittingAndOrPendingChange } = props;
  const user = useActiveUser();
  const site = useActiveSiteId();
  const userRoles = user?.rolesBySite[site] ?? [];
  const userPermissions = user?.permissionsBySite[site] ?? [];
  const allowedRole = userRoles.some((role) => role === 'developer' || role === 'admin');
  const hasPublishPermission = userPermissions?.includes('publish');
  const {
    spacing,
    palette: { mode }
  } = useTheme();
  return (
    <Box component="section" sx={{ bgcolor: `grey.${mode === 'light' ? 100 : 800}`, height: '100%', pb: 3 }}>
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="publishingDashboard.title" defaultMessage="Publishing Dashboard" />}
          showAppsButton={showAppsButton}
        />
      )}
      <Grid
        gap={2}
        container
        sx={{
          padding: spacing(2),
          ...(embedded
            ? {}
            : {
                height: 'calc(100% - 65px)', // full viewport height - toolbar height
                overflowY: 'auto'
              })
        }}
      >
        <Grid size={12}>
          <PublishingStatusWidget siteId={site} />
        </Grid>
        {userPermissions.includes('get_publishing_queue') && (
          <Grid size={12}>
            <PublishingQueueWidget siteId={site} readOnly={!hasPublishPermission} />
          </Grid>
        )}
        {hasPublishPermission && (
          <Grid size={12}>
            <PublishOnDemandWidget
              siteId={site}
              mode={allowedRole ? null : 'everything'}
              onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default PublishingDashboard;
