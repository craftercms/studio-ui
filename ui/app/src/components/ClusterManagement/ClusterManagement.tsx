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

import React, { useState } from 'react';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { ApiResponse } from '../../models/ApiResponse';
import { fetchMembers } from '../../services/clusters';
import { ClusterMember } from '../../models/Clusters';
import ClusterGridUI from '../ClusterGrid';
import { useMount } from '../../hooks/useMount';
import Paper from '@mui/material/Paper';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import LoadingState from '../LoadingState';
import EmptyState from '../EmptyState';

export function ClusterManagement() {
  const [clusters, setClusters] = useState<ClusterMember[]>();
  const [error, setError] = useState<ApiResponse>();

  const refresh = () => {
    fetchMembers().subscribe(
      (clusters) => {
        setClusters(clusters);
      },
      ({ response }) => {
        setError(response);
      }
    );
  };

  useMount(() => {
    refresh();
  });

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
      {error ? (
        <ApiResponseErrorState error={error} />
      ) : clusters ? (
        clusters.length ? (
          <ClusterGridUI clusters={clusters} />
        ) : (
          <EmptyState
            title={<FormattedMessage id="clusterGrid.emptyStateMessage" defaultMessage="No Clusters Found" />}
          />
        )
      ) : (
        <LoadingState />
      )}
    </Paper>
  );
}

export default ClusterManagement;
