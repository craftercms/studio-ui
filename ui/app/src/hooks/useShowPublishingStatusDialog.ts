/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import useActiveUser from './useActiveUser';
import useActiveSiteId from './useActiveSiteId';
import { showPublishingStatusDialog, showWidgetDialog } from '../state/actions/dialogs';

export function useShowPublishingStatusDialog() {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const user = useActiveUser();
  const site = useActiveSiteId();
  const userRoles = user?.rolesBySite[site] ?? [];
  const userPermissions = user?.permissionsBySite[site] ?? [];

  return () => {
    dispatch(
      // If user has either of these permissions or roles, then he'll see more than one widget, and it's worth showing the
      // Publishing Dashboard. Otherwise, just show the simple status dialog.
      userPermissions.some((permission) => permission === 'get_publishing_queue' || permission === 'publish') ||
        userRoles.some((role) => role === 'developer' || role === 'admin')
        ? showWidgetDialog({
            title: formatMessage({ defaultMessage: 'Publishing' }),
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
}

export default useShowPublishingStatusDialog;
