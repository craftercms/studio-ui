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
import { Repository, RepositoryStatus } from '../../models/Repository';
import ApiResponse from '../../models/ApiResponse';
import { fetchRepositories as fetchRepositoriesService, fetchStatus } from '../../services/repositories';
import { useActiveSiteId, useLogicResource } from '../../utils/hooks';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import RemoteRepositoriesGridSkeletonTable from '../RemoteRepositoriesGrid/RemoteRepositoriesGridSkeletonTable';
import RemoteRepositoriesGrid from '../RemoteRepositoriesGrid';
import RemoteRepositoriesStatus from '../RemoteRepositoriesStatus/RemoteRepositoriesStatus';
import RemoteRepositoriesStatusSkeleton from '../RemoteRepositoriesStatus/RemoteRepositoriesStatusSkeleton';
import NewRemoteRepositoryDialog from '../NewRemoteRepositoryDialog';
import { showSystemNotification } from '../../state/actions/system';
import { useDispatch } from 'react-redux';
import Alert from '@material-ui/lab/Alert';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2)
    },
    statusAlert: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    statusNote: {
      display: 'flex',
      justifyContent: 'center',
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(2)
    }
  })
);

const messages = defineMessages({
  remoteCreateSuccessMessage: {
    id: 'repositories.remoteCreateSuccessMessage',
    defaultMessage: 'Remote repository created successfully.'
  },
  noConflicts: {
    id: 'repositories.noConflicts',
    defaultMessage: 'Local repository is free of conflicts.'
  },
  conflictsExist: {
    id: 'repositories.conflictsExist',
    defaultMessage: 'Repository operations are disabled while conflicts exist. Please resolve conflicts.'
  },
  pendingCommit: {
    id: 'repositories.pendingCommit',
    defaultMessage: 'Repo contains files pending commit. See Repository status below for details.'
  },
  unstagedFiles: {
    id: 'repositories.unstagedFiles',
    defaultMessage: 'There are unstaged files in your repository.'
  }
});

export default function RemoteRepositoriesManagement() {
  const [fetchingRepositories, setFetchingRepositories] = useState(false);
  const [errorRepositories, setErrorRepositories] = useState<ApiResponse>();
  const [repositories, setRepositories] = useState<Array<Repository>>(null);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [errorStatus, setErrorStatus] = useState<ApiResponse>();
  const [repositoriesStatus, setRepositoriesStatus] = useState<RepositoryStatus>(null);
  const [currentStatusValue, setCurrentStatusValue] = useState(null);
  const [openNewRemoteDialog, setOpenNewRemoteDialog] = useState(false);
  const siteId = useActiveSiteId();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const classes = useStyles();

  const setCurrentStatus = (status) => {
    if (status.clean) {
      setCurrentStatusValue('noConflicts');
    } else if (status.conflicting.length > 0) {
      setCurrentStatusValue('conflictsExist');
    } else if (status.uncommittedChanges.length > 0 && status.conflicting.length < 1) {
      setCurrentStatusValue('pendingCommit');
    } else if (status.uncommittedChanges.length < 1 && status.conflicting.length < 1) {
      setCurrentStatusValue('unstagedFiles');
    } else {
      setCurrentStatusValue(null);
    }
  };

  const fetchRepositories = useCallback(() => {
    setFetchingRepositories(true);
    fetchRepositoriesService(siteId).subscribe(
      (repositories) => {
        setRepositories(repositories);
        setFetchingRepositories(false);
      },
      ({ response }) => {
        setErrorRepositories(response);
        setFetchingRepositories(false);
      }
    );
  }, [siteId]);

  const fetchRepositoriesStatus = useCallback(() => {
    setFetchingStatus(true);
    fetchStatus(siteId).subscribe(
      (status) => {
        setRepositoriesStatus(status);
        setCurrentStatus(status);
        setFetchingStatus(false);
      },
      ({ response }) => {
        setErrorStatus(response);
        setFetchingStatus(false);
      }
    );
  }, [siteId]);

  const updateRepositoriesStatus = (status) => {
    setRepositoriesStatus(status);
    setCurrentStatus(status);
  };

  const onCreateSuccess = () => {
    fetchRepositories();
    dispatch(
      showSystemNotification({
        message: formatMessage(messages.remoteCreateSuccessMessage)
      })
    );
  };

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  useEffect(() => {
    fetchRepositoriesStatus();
  }, [fetchRepositoriesStatus]);

  const resource = useLogicResource<
    Array<Repository>,
    { repositories: Array<Repository>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ repositories, error: errorRepositories, fetching: fetchingRepositories }), [
      repositories,
      errorRepositories,
      fetchingRepositories
    ]),
    {
      shouldResolve: (source) => Boolean(source.repositories) && !fetchingRepositories,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetchingRepositories && resource.complete,
      resultSelector: (source) => source.repositories,
      errorSelector: () => errorRepositories
    }
  );

  const statusResource = useLogicResource<
    RepositoryStatus,
    { status: RepositoryStatus; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ status: repositoriesStatus, error: errorStatus, fetching: fetchingStatus }), [
      repositoriesStatus,
      errorStatus,
      fetchingStatus
    ]),
    {
      shouldResolve: (source) => Boolean(source.status) && !fetchingStatus,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetchingStatus && resource.complete,
      resultSelector: (source) => source.status,
      errorSelector: () => errorRepositories
    }
  );

  return (
    <section className={classes.root}>
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
        showHamburgerMenuButton={false}
        showAppsButton={false}
      />

      {currentStatusValue && (
        <Alert severity={currentStatusValue === 'noConflicts' ? 'success' : 'warning'} className={classes.statusAlert}>
          {formatMessage(messages[currentStatusValue])}
        </Alert>
      )}

      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <RemoteRepositoriesGridSkeletonTable />
        }}
      >
        <RemoteRepositoriesGrid
          resource={resource}
          fetchStatus={fetchRepositoriesStatus}
          fetchRepositories={fetchRepositories}
        />
      </SuspenseWithEmptyState>

      {repositoriesStatus &&
        repositoriesStatus.conflicting.length < 1 &&
        repositoriesStatus.uncommittedChanges.length < 1 && (
          <Typography variant="caption" className={classes.statusNote}>
            <FormattedMessage
              id="repository.statusNote"
              defaultMessage="Do not use Studio as a git merge and conflict resolution platform. All merge conflicts should be resolved upstream before getting pulled into Studio."
            />
          </Typography>
        )}

      <SuspenseWithEmptyState
        resource={statusResource}
        suspenseProps={{
          fallback: <RemoteRepositoriesStatusSkeleton />
        }}
      >
        <RemoteRepositoriesStatus
          resource={statusResource}
          setFetching={setFetchingStatus}
          onActionSuccess={updateRepositoriesStatus}
        />
      </SuspenseWithEmptyState>

      <NewRemoteRepositoryDialog
        open={openNewRemoteDialog}
        onClose={() => setOpenNewRemoteDialog(false)}
        onCreateSuccess={onCreateSuccess}
      />
    </section>
  );
}
