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

import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import Skeleton from '@mui/material/Skeleton';
import { rand } from '../PathNavigator/utils';
import useStyles from './styles';

export interface ClustersGridSkeletonTableProps {
  numOfItems?: number;
}

export const ClustersGridSkeletonTable = React.memo((props: ClustersGridSkeletonTableProps) => {
  const { numOfItems = 5 } = props;
  const classes = useStyles();
  const items = new Array(numOfItems).fill(null);
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
            <GlobalAppGridCell align="left" className="width10"></GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <GlobalAppGridRow key={i} className="hoverDisabled">
              <GlobalAppGridCell align="left" className="width10">
                <Skeleton variant="text" width={`${rand(60, 80)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="center">
                <Skeleton className={classes.marginCenter} variant="circular" width={20} height={20} />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width50">
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width20">
                <Skeleton variant="text" width={`${rand(50, 70)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width10">
                <Skeleton variant="text" width={`${rand(60, 70)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width10">
                <Skeleton variant="circular" width={40} height={40} />
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
