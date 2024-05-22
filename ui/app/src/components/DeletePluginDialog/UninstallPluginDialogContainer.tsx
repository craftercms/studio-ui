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
import { Suspense, useEffect } from 'react';
import { UninstallPluginDialogContainerProps } from './utils';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { fetchMarketplacePluginUsage, uninstallMarketplacePlugin } from '../../services/marketplace';
import { UninstallPluginDialogBody } from './UninstallPluginDialogBody';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import useSpreadState from '../../hooks/useSpreadState';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';

export function UninstallPluginDialogContainer(props: UninstallPluginDialogContainerProps) {
  const { onClose, pluginId, onComplete, isSubmitting, onSubmittingAndOrPendingChange } = props;
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const callbacksRef = useUpdateRefs({ onSubmittingAndOrPendingChange });
  const [{ data, isFetching, error }, setState] = useSpreadState({
    data: null,
    isFetching: false,
    error: null
  });

  useEffect(() => {
    setState({ isFetching: true });
    fetchMarketplacePluginUsage(site, pluginId).subscribe({
      next(response) {
        setState({
          data: response,
          isFetching: false
        });
      },
      error: ({ response: { response } }) => {
        setState({
          error: response,
          isFetching: false
        });
      }
    });
  }, [site, pluginId, setState]);

  const onSubmit = (id: string) => {
    onSubmittingAndOrPendingChange({
      isSubmitting: true
    });

    uninstallMarketplacePlugin(site, id, true).subscribe({
      next: () => {
        callbacksRef.current.onSubmittingAndOrPendingChange({
          isSubmitting: false
        });
        onComplete?.();
      },
      error: ({ response: { response } }) => {
        callbacksRef.current.onSubmittingAndOrPendingChange({
          isSubmitting: false
        });
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return error ? (
    <ApiResponseErrorState error={error} />
  ) : isFetching ? (
    <LoadingState styles={{ root: { width: 300, height: 250 } }} />
  ) : data ? (
    <Suspense fallback="">
      <UninstallPluginDialogBody
        isSubmitting={isSubmitting}
        onCloseButtonClick={onCloseButtonClick}
        pluginId={pluginId}
        data={data}
        onSubmit={() => onSubmit(pluginId)}
      />
    </Suspense>
  ) : null;
}
