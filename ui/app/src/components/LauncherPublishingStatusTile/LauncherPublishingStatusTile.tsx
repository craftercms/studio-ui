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
import PublishingStatusTile from '../PublishingStatusTile';
import { closeLauncher, showPublishingStatusDialog, showWidgetDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import { Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';
import { useSelection } from '../../hooks/useSelection';
import { publishingStatusMessages } from '../PublishingStatusDisplay';
import useActiveUser from '../../hooks/useActiveUser';
import useActiveSiteId from '../../hooks/useActiveSiteId';

function LauncherPublishingStatusTile() {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const state = useSelection((state) => state.dialogs.publishingStatus);
  const user = useActiveUser();
  const site = useActiveSiteId();

  const onShowDialog = () => {
    const userRoles = user?.rolesBySite[site] ?? [];
    const userPermissions = user?.permissionsBySite[site] ?? [];
    dispatch(
      // If user has either of these permissions or roles, then he'll see more than one widget, and it's worth showing the
      // Publishing Dashboard. Otherwise, just show the simple status dialog.
      userPermissions.some((permission) => permission === 'get_publishing_queue' || permission === 'publish') ||
        userRoles.some((role) => role === 'developer' || role === 'admin')
        ? showWidgetDialog({
            title: formatMessage({
              id: 'words.publishing',
              defaultMessage: 'Publishing'
            }),
            widget: {
              id: 'craftercms.components.PublishingDashboard',
              configuration: {
                embedded: true
              }
            }
          })
        : showPublishingStatusDialog({})
    );
  };

  return (
    <Tooltip title={formatMessage(publishingStatusMessages.publishingStatus)} disableFocusListener disableTouchListener>
      <PublishingStatusTile
        enabled={state.enabled}
        status={state.status}
        isFetching={state.isFetching}
        onClick={() => {
          dispatch(closeLauncher());
          onShowDialog();
        }}
      />
    </Tooltip>
  );
}

export default LauncherPublishingStatusTile;
