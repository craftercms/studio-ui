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

import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Skeleton from '@mui/material/Skeleton';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import { rand } from '../PathNavigator/utils';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';

export interface WorkflowStatesGridSkeletonTableProps {
  numOfItems?: number;
}

export const ItemStatesGridSkeletonTable = React.memo((props: WorkflowStatesGridSkeletonTableProps) => {
  const { numOfItems = 10 } = props;
  const items = new Array(numOfItems).fill(null);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell align="center">
              <Skeleton variant="circular" width={42} height={42} />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width60 pl0">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.processing" defaultMessage="Processing" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width40">
              <Typography variant="subtitle2">
                <FormattedMessage id="workflowStates.locked" defaultMessage="Locked" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.live" defaultMessage="Live" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.staged" defaultMessage="Staged" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <GlobalAppGridRow key={index}>
              <GlobalAppGridCell align="center">
                <Skeleton variant="circular" width={42} height={42} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="maxWidth300 pl0">
                <Skeleton variant="text" width={`${rand(80, 100)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell>
                <Skeleton variant="text" width="30px" />
              </GlobalAppGridCell>
              <GlobalAppGridCell>
                <Skeleton variant="text" width={`${rand(40, 60)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell>
                <Skeleton variant="text" width="30px" />
              </GlobalAppGridCell>
              <GlobalAppGridCell>
                <Skeleton variant="text" width="30px" />
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
