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
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import Skeleton from '@mui/material/Skeleton';
import useStyles from './styles';
import GlobalAppGridRow from '../../GlobalAppGridRow';
import GlobalAppGridCell from '../../GlobalAppGridCell';
import { rand } from '../../PathNavigator/utils';

export interface LoggingLevelsGridSkeletonTableProps {
  numOfItems?: number;
}

export const LogLevelGridSkeleton = React.memo((props: LoggingLevelsGridSkeletonTableProps) => {
  const { numOfItems = 10 } = props;
  const items = new Array(numOfItems).fill(null);
  const classes = useStyles();

  return (
    <TableContainer>
      <Table className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell>
              <Typography variant="subtitle2">
                <FormattedMessage id="words.logger" defaultMessage="Logger" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="loggingLevels.currentLevel" defaultMessage="Current Level" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <GlobalAppGridRow key={index}>
              <GlobalAppGridCell align="left">
                <Skeleton variant="text" width={`${rand(40, 60)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left">
                <Skeleton variant="text" width="30%" />
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
