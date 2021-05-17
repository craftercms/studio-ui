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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { Repository } from '../../models/Repository';
import ApiResponse from '../../models/ApiResponse';
import {
  fetchRepositories as fetchRepositoriesService,
  deleteRemote as deleteRemoteService
} from '../../services/repositories';
import { useActiveSiteId, useLogicResource } from '../../utils/hooks';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import RemoteRepositoriesGridSkeletonTable from '../RemoteRepositoriesGrid/RemoteRepositoriesGridSkeletonTable';
import RemoteRepositoriesGridUI from '../RemoteRepositoriesGrid';
import NewRemoteRepositoryDialog from '../NewRemoteRepositoryDialog';
import { showSystemNotification } from '../../state/actions/system';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';

const messages = defineMessages({
  remoteCreateSuccessMessage: {
    id: 'repositories.remoteCreateSuccessMessage',
    defaultMessage: 'Remote repository created successfully.'
  },
  remoteDeleteSuccessMessage: {
    id: 'repositories.remoteDeleteSuccessMessage',
    defaultMessage: 'Remote repository deleted successfully.'
  }
});

export default function RemoteRepositoriesManagement() {
  const [fetching, setFetching] = useState(false);
  const [repositories, setRepositories] = useState<Array<Repository>>(null);
  const [error, setError] = useState<ApiResponse>();
  const siteId = useActiveSiteId();
  const [openNewRemoteDialog, setOpenNewRemoteDialog] = useState(false);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const fetchRepositories = useCallback(() => {
    setFetching(true);
    fetchRepositoriesService(siteId).subscribe(
      (repositories) => {
        setRepositories(repositories);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  }, [siteId]);

  const deleteRemote = (remoteName: string) => {
    deleteRemoteService(siteId, remoteName).subscribe(
      () => {
        fetchRepositories();
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.remoteDeleteSuccessMessage),
            options: { variant: 'success' }
          })
        );
      },
      ({ response }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCreateSuccess = () => {
    fetchRepositories();
    dispatch(
      showSystemNotification({
        message: formatMessage(messages.remoteCreateSuccessMessage),
        options: { variant: 'success' }
      })
    );
  };

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  const resource = useLogicResource<
    Array<Repository>,
    { repositories: Array<Repository>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ repositories, error, fetching }), [repositories, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.repositories) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.repositories,
      errorSelector: () => error
    }
  );

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="repositories.title" defaultMessage="Remote Repositories" />}
        leftContent={
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            color="primary"
            onClick={() => setOpenNewRemoteDialog(true)}
          >
            <FormattedMessage id="repositories.newRepository" defaultMessage="New Remote" />
          </Button>
        }
      />
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <RemoteRepositoriesGridSkeletonTable />
        }}
      >
        <RemoteRepositoriesGridUI resource={resource} onDeleteRemote={deleteRemote} />
      </SuspenseWithEmptyState>

      <NewRemoteRepositoryDialog
        open={openNewRemoteDialog}
        onClose={() => setOpenNewRemoteDialog(false)}
        onCreateSuccess={onCreateSuccess}
      />
    </section>
  );
}
