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

import React, { useMemo, useState } from 'react';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@material-ui/core/Tooltip';
import { IconButton } from '@material-ui/core';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';
import { ErrorBoundary } from '../SystemStatus/ErrorBoundary';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { useLogicResource, useMount } from '../../utils/hooks';
import { ApiResponse } from '../../models/ApiResponse';
import { fetchMembers } from '../../services/clusters';
import { ClusterMember } from '../../models/Clusters';
import ClusterGrid from '../ClusterGrid';

export default function ClusterManagement() {
  const [clusters, setClusters] = useState<ClusterMember[]>();
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<ApiResponse>();

  useMount(() => {
    refresh();
  });

  const refresh = () => {
    setFetching(true);
    fetchMembers().subscribe(
      (clusters) => {
        setClusters(clusters);
        setFetching(false);
        // setClusters([
        //   {
        //     id: 1,
        //     localAddress: '172.31.70.118',
        //     state: 'ACTIVE',
        //     heartbeat: '2021-04-27T16:43:30Z',
        //     gitUrl: 'ssh://172.31.70.118/opt/crafter/cluster/crafter/data/repos/sites/{siteId}',
        //     gitRemoteName: 'cluster_node_172.31.70.118',
        //     gitAuthType: 'none'
        //   },
        //   {
        //     id: 2,
        //     localAddress: '172.31.70.118',
        //     state: 'INACTIVE',
        //     heartbeat: '2021-04-27T16:43:30Z',
        //     gitUrl: 'ssh://172.31.70.118/opt/crafter/cluster/crafter/data/repos/sites/{siteId}',
        //     gitRemoteName: 'cluster_node_172.31.70.118',
        //     gitAuthType: 'none'
        //   }
        // ]);
      },
      ({ response }) => {
        setError(response);
      }
    );
  };

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

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="GlobalMenu.Cluster" defaultMessage="Cluster" />}
        rightContent={
          <Tooltip title={<FormattedMessage id="words.refresh" defaultMessage="Refresh" />}>
            <IconButton onClick={refresh}>
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <ErrorBoundary>
        <SuspenseWithEmptyState
          resource={resource}
          suspenseProps={{
            fallback: <>loading</>
          }}
          withEmptyStateProps={{
            emptyStateProps: {
              title: <FormattedMessage id="clusterGrid.emptyStateMessage" defaultMessage="No Clusters Found" />
            }
          }}
        >
          <ClusterGrid resource={resource} />
        </SuspenseWithEmptyState>
      </ErrorBoundary>
    </section>
  );
}
