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

import { ClusterMember } from '../../models/Clusters';
import { Resource } from '../../models/Resource';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import React from 'react';
import useStyles from './styles';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ConfirmDropdown from '../ConfirmDropdown';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';

export interface ClusterGridProps {
  resource: Resource<ClusterMember[]>;
  onDeleteCluster(cluster: ClusterMember): void;
}

export default function ClusterGridUI(props: ClusterGridProps) {
  const { resource, onDeleteCluster } = props;
  const classes = useStyles();
  const clusters = resource.read();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell align="left" className="width10 minWidth100">
              <Typography variant="subtitle2">
                <FormattedMessage id="clusterGrid.localAddress" defaultMessage="Local Address" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="center">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.state" defaultMessage="State" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width50">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.url" defaultMessage="Url" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="clusterGrid.remoteName" defaultMessage="Remote Name" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width10 minWidth100">
              <Typography variant="subtitle2">
                <FormattedMessage id="clusterGrid.authType" defaultMessage="Auth Type" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width10" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {clusters.map((cluster, i) => (
            <GlobalAppGridRow key={cluster.id} className="hoverDisabled">
              <GlobalAppGridCell align="left" className="width10">
                {cluster.localAddress}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="center">
                <FiberManualRecordRoundedIcon
                  className={cluster.state === 'ACTIVE' ? classes.active : classes.inactive}
                />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width50">
                {cluster.gitUrl}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width20">
                {cluster.gitRemoteName}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width10">
                {cluster.gitAuthType}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width10">
                {cluster.state === 'INACTIVE' && (
                  <ConfirmDropdown
                    cancelText={<FormattedMessage id="words.no" defaultMessage="No" />}
                    confirmText={<FormattedMessage id="words.yes" defaultMessage="Yes" />}
                    confirmHelperText={
                      <FormattedMessage id="clusterGrid.confirmDeleteCluster" defaultMessage="Delete this cluster?" />
                    }
                    iconTooltip={<FormattedMessage id="clusterGrid.deleteCluster" defaultMessage="Delete cluster" />}
                    icon={DeleteRoundedIcon}
                    iconColor="action"
                    onConfirm={() => {
                      onDeleteCluster(cluster);
                    }}
                  />
                )}
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
