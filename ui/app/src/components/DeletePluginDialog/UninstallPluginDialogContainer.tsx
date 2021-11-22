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
import { UninstallPluginDialogContainerProps } from './utils';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useMemo } from 'react';
import { createResource } from '../../utils/resource';
import { uninstallMarketplacePlugin, fetchMarketplacePluginUsage } from '../../services/marketplace';
import Suspencified from '../Suspencified/Suspencified';
import { UninstallPluginDialogBody } from './UninstallPluginDialogBody';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { defineMessages, useIntl } from 'react-intl';
import useUpdateRefs from '../../hooks/useUpdateRefs';

const messages = defineMessages({
  pluginUninstalled: {
    id: 'pluginManagement.pluginUninstalled',
    defaultMessage: 'Plugin uninstalled'
  }
});

export function UninstallPluginDialogContainer(props: UninstallPluginDialogContainerProps) {
  const { onClose, pluginId, onComplete, isSubmitting, onSubmittingAndOrPendingChange } = props;
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const callbacksRef = useUpdateRefs({ onSubmittingAndOrPendingChange });

  const resource = useMemo(() => {
    return createResource(() => fetchMarketplacePluginUsage(site, pluginId).toPromise());
  }, [site, pluginId]);

  const onSubmit = (id: string) => {
    onSubmittingAndOrPendingChange({
      isSubmitting: true
    });

    uninstallMarketplacePlugin(site, id, true).subscribe({
      next: () => {
        callbacksRef.current.onSubmittingAndOrPendingChange({
          isSubmitting: false
        });
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.pluginUninstalled)
          })
        );
        onComplete?.();
      },
      error: (response) => {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <Suspencified loadingStateProps={{ styles: { root: { width: 300, height: 250 } } }}>
      <UninstallPluginDialogBody
        isSubmitting={isSubmitting}
        onCloseButtonClick={onCloseButtonClick}
        pluginId={pluginId}
        resource={resource}
        onSubmit={() => onSubmit(pluginId)}
      />
    </Suspencified>
  );
}
