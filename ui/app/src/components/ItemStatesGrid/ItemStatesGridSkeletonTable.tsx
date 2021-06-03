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
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import Skeleton from '@material-ui/lab/Skeleton';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import { rand } from '../PathNavigator/utils';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';

export interface WorkflowStatesGridSkeletonTableProps {
  numOfItems?: number;
}

export const ItemStatesGridSkeletonTable = React.memo((props: WorkflowStatesGridSkeletonTableProps) => {
  const { numOfItems = 10 } = props;
  const items = new Array(numOfItems).fill(null);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell align="center" className="bordered avatar padded10">
              <Skeleton variant="circle" width={42} height={42} />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width60 padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20 padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.processing" defaultMessage="Processing" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width40 padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="workflowStates.locked" defaultMessage="Locked" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20 padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="workflowStates.live" defaultMessage="Live" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20 padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="workflowStates.staged" defaultMessage="Staged" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <GlobalAppGridRow key={index}>
              <GlobalAppGridCell align="center" className="avatar padded10">
                <Skeleton variant="circle" width={42} height={42} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="padded10 maxWidth300">
                <Skeleton variant="text" width={`${rand(80, 100)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="padded10">
                <Skeleton variant="text" width="30px" />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="padded10">
                <Skeleton variant="text" width={`${rand(40, 60)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="padded10">
                <Skeleton variant="text" width="30px" />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="padded10">
                <Skeleton variant="text" width="30px" />
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
