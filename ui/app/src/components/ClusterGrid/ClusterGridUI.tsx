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

import { ClusterMember } from '../../models/Clusters';
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
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';

export interface ClusterGridProps {
  clusters: ClusterMember[];
}

export function ClusterGridUI(props: ClusterGridProps) {
  const { clusters } = props;
  const { classes } = useStyles();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell align="center">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.state" defaultMessage="State" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.role" defaultMessage="Role" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width10 minWidth100">
              <Typography variant="subtitle2">
                <FormattedMessage id="clusterGrid.localAddress" defaultMessage="Local Address" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="clusterGrid.remoteName" defaultMessage="Remote Name" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width50">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.url" defaultMessage="Url" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {clusters.map((cluster, i) => (
            <GlobalAppGridRow key={i} className="hoverDisabled">
              <GlobalAppGridCell align="center">
                <FiberManualRecordRoundedIcon
                  className={cluster.state === 'ACTIVE' ? classes.active : classes.inactive}
                />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width10">
                {cluster.primary ? (
                  <FormattedMessage id="words.primary" defaultMessage="Primary" />
                ) : (
                  <FormattedMessage id="words.replica" defaultMessage="Replica" />
                )}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width10">
                {cluster.localAddress}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width20">
                {cluster.gitRemoteName}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width50">
                {cluster.gitUrl}
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ClusterGridUI;
