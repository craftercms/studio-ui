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

import { Resource } from '../../models/Resource';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import React from 'react';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import Avatar from '@material-ui/core/Avatar';
import User from '../../models/User';
import clsx from 'clsx';
import { PagedArray } from '../../models/PagedArray';
import Pagination from '../Pagination';
import { rand } from '../PathNavigator/utils';

const styles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column'
    },
    avatar: {
      margin: '0 auto'
    },
    tableRoot: {
      tableLayout: 'fixed'
    },
    tableHeadRow: {
      '&:hover': {
        background: 'none'
      }
    },
    tableCell: {
      padding: '4px',
      borderBottom: 0,
      height: '50px',
      '&.avatar': {
        padding: 0,
        width: '50px'
      },
      '&.bordered': {
        borderBottom: `1px solid ${theme.palette.divider}`
      },
      '&.paddedLeft': {
        paddingLeft: '20px'
      },
      '&.width30': {
        width: '30%'
      },
      '&.width60': {
        width: '60%'
      }
    },
    paginationRoot: {
      marginLeft: 'auto'
    }
  })
);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      },
      '&.hoverDisabled': {
        cursor: 'inherit',
        background: 'none'
      }
    }
  })
)(TableRow);

interface UsersGridUIProps {
  resource: Resource<PagedArray<User>>;
  onRowClicked(user: User): void;
  onChangePage(page: number): void;
  onChangeRowsPerPage?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export default function UsersGridUI(props: UsersGridUIProps) {
  const { resource, onRowClicked, onChangePage, onChangeRowsPerPage } = props;
  const classes = styles();
  const users = resource.read();
  return (
    <section className={classes.root}>
      <TableContainer>
        <Table className={classes.tableRoot}>
          <TableHead>
            <StyledTableRow className={'hoverDisabled'}>
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
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {users?.map((user, i) => (
              <StyledTableRow key={user.id} onClick={() => onRowClicked(user)}>
                <TableCell align="center" className={clsx(classes.tableCell, 'avatar')}>
                  <Avatar className={classes.avatar}>
                    {user.firstName.charAt(0)}
                    {user.lastName?.charAt(0) ?? ''}
                  </Avatar>
                </TableCell>
                <TableCell align="left" className={clsx(classes.tableCell, 'paddedLeft', 'width30')}>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell align="left" className={clsx(classes.tableCell, 'width30')}>
                  {user.username}
                </TableCell>
                <TableCell align="left" className={clsx(classes.tableCell, 'width60')}>
                  {user.email}
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        rowsPerPageOptions={[5, 10, 15]}
        classes={{ root: classes.paginationRoot }}
        count={users.total}
        rowsPerPage={users.limit}
        page={users && Math.ceil(users.offset / users.limit)}
        onChangePage={(page: number) => onChangePage(page)}
        onChangeRowsPerPage={onChangeRowsPerPage}
      />
    </section>
  );
}

interface UsersGridSkeletonTableProps {
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
