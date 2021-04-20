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
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import Skeleton from '@material-ui/lab/Skeleton';
import { rand } from '../PathNavigator/utils';
import React from 'react';
import { styles } from './styles';

export interface UsersGridSkeletonTableProps {
  numOfItems?: number;
}

export function UsersGridSkeletonTable(props: UsersGridSkeletonTableProps) {
  const { numOfItems = 5 } = props;
  const items = new Array(numOfItems).fill(null);
  const classes = styles();
  return (
    <TableContainer>
      <Table className={classes.tableRoot}>
        <TableHead>
          <TableRow>
            <TableCell align="center" className={clsx(classes.tableCell, 'bordered', 'avatar')}>
              <span />
            </TableCell>
            <TableCell align="left" className={clsx(classes.tableCell, 'bordered', 'paddedLeft', 'width30')}>
              <Typography variant="subtitle2">
                <FormattedMessage id="words.name" defaultMessage="Name" />
              </Typography>
            </TableCell>
            <TableCell align="left" className={clsx(classes.tableCell, 'bordered', 'width30')}>
              <Typography variant="subtitle2">
                <FormattedMessage id="words.username" defaultMessage="Username" />
              </Typography>
            </TableCell>
            <TableCell align="left" className={clsx(classes.tableCell, 'bordered', 'width60')}>
              <Typography variant="subtitle2">
                <FormattedMessage id="words.email" defaultMessage="E-mail" />
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items?.map((width, index) => (
            <TableRow key={index}>
              <TableCell align="center" className={clsx(classes.tableCell, 'avatar')}>
                <Skeleton className={classes.avatar} variant="circle" width={40} height={40} />
              </TableCell>
              <TableCell component="th" scope="row" className={clsx(classes.tableCell, 'paddedLeft', 'width30')}>
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
              </TableCell>
              <TableCell align="left" className={clsx(classes.tableCell, 'width30')}>
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
              </TableCell>
              <TableCell align="left" className={clsx(classes.tableCell, 'width60')}>
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
