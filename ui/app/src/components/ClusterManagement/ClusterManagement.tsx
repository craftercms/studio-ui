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

import React, { useMemo, useState } from 'react';
import GlobalAppToolbar from '../GlobalAppToolbar/GlobalAppToolbar';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import { ApiResponse } from '../../models/ApiResponse';
import { deleteMember, fetchMembers } from '../../services/clusters';
import { ClusterMember } from '../../models/Clusters';
import ClusterGridUI from '../ClusterGrid/ClusterGridUI';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { ClustersGridSkeletonTable } from '../ClusterGrid/ClustersGridSkeletonTable';
import { useLogicResource } from '../../hooks/useLogicResource';
import { useMount } from '../../hooks/useMount';
import Paper from '@mui/material/Paper';

const translations = defineMessages({
  clusterDeleted: {
    id: 'clusterManagement.clusterDeleted',
    defaultMessage: 'Cluster deleted successfully'
  }
});

export function ClusterManagement() {
  const [clusters, setClusters] = useState<ClusterMember[]>();
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<ApiResponse>();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const refresh = () => {
    setFetching(true);
    fetchMembers().subscribe(
      (clusters) => {
        setClusters(clusters);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  };

  useMount(() => {
    refresh();
  });

  const resource = useLogicResource<
    ClusterMember[],
    { clusters: ClusterMember[]; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ clusters, error, fetching }), [clusters, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.clusters) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.clusters,
      errorSelector: () => error
    }
  );

  const onDeleteCluster = (cluster: ClusterMember) => {
    deleteMember(cluster.id).subscribe(
      () => {
        refresh();
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.clusterDeleted)
          })
        );
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar
        title={<FormattedMessage id="words.cluster" defaultMessage="Cluster" />}
        rightContent={
          <Tooltip title={<FormattedMessage id="words.refresh" defaultMessage="Refresh" />}>
            <IconButton onClick={refresh} size="large">
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <ClustersGridSkeletonTable />
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: <FormattedMessage id="clusterGrid.emptyStateMessage" defaultMessage="No Clusters Found" />
          }
        }}
      >
        <ClusterGridUI resource={resource} onDeleteCluster={onDeleteCluster} />
      </SuspenseWithEmptyState>
    </Paper>
  );
}

export default ClusterManagement;
