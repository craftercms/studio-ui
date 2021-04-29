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

import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import Skeleton from '@material-ui/lab/Skeleton';
import { rand } from '../PathNavigator/utils';
import React from 'react';
import { styles } from './styles';
import GlobalAppGridCell from '../GlobalAppGridCell/GlobalAppGridCell';
import GlobalAppGridRow from '../GlobalAppGridRow';

export interface GroupsGridSkeletonTableProps {
  numOfItems?: number;
}

export const GroupsGridSkeletonTable = React.memo((props: GroupsGridSkeletonTableProps) => {
  const { numOfItems = 5 } = props;
  const items = new Array(numOfItems).fill(null);
  const classes = styles();
  return (
    <TableContainer>
      <Table className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell align="left" className="bordered width25">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.name" defaultMessage="Name" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="bordered">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.username" defaultMessage="Description" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items?.map((width, index) => (
            <GlobalAppGridRow key={index}>
              <GlobalAppGridCell align="left" className="width25">
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left">
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
