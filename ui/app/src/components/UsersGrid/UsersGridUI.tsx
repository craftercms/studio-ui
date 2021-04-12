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
import Checkbox from '@material-ui/core/Checkbox';
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

const styles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column'
    },
    tableCell: {
      padding: '6px',
      borderBottom: 0,
      '&.bordered': {
        borderBottom: `1px solid ${theme.palette.divider}`
      },
      '&.paddedLeft': {
        paddingLeft: '20px'
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
      }
    }
  })
)(TableRow);

interface UsersGridUIProps {
  resource: Resource<PagedArray<User>>;
  onRowClicked(user: User): void;
  onChangePage(page: number): void;
}

export default function UsersGridUI(props: UsersGridUIProps) {
  const { resource, onRowClicked, onChangePage } = props;
  const classes = styles();
  const users = resource.read();
  return (
    <section className={classes.root}>
      <TableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <TableCell padding="checkbox" className={clsx(classes.tableCell, 'bordered')}>
                <Checkbox checked={false} color="primary" />
              </TableCell>
              <TableCell align="left" className={clsx(classes.tableCell, 'bordered', 'paddedLeft')}>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.name" defaultMessage="Name" />
                </Typography>
              </TableCell>
              <TableCell align="left" className={clsx(classes.tableCell, 'bordered')}>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.username" defaultMessage="Username" />
                </Typography>
              </TableCell>
              <TableCell align="left" className={clsx(classes.tableCell, 'bordered')}>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.email" defaultMessage="E-mail" />
                </Typography>
              </TableCell>
              <TableCell align="left" className={clsx(classes.tableCell, 'bordered')}>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.organization" defaultMessage="Organization" />
                </Typography>
              </TableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {users?.map((user, i) => (
              <StyledTableRow key={user.id} onClick={() => onRowClicked(user)}>
                <TableCell align="left" className={classes.tableCell}>
                  <Avatar>{user.firstName.charAt(0)}</Avatar>
                </TableCell>
                <TableCell align="left" className={clsx(classes.tableCell, 'paddedLeft')}>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell align="left" className={classes.tableCell}>
                  {user.username}
                </TableCell>
                <TableCell align="left" className={classes.tableCell}>
                  {user.email}
                </TableCell>
                <TableCell align="left" className={classes.tableCell}>
                  Organization?
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
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox checked={false} color="primary" />
            </TableCell>
            <TableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.name" defaultMessage="Name" />
              </Typography>
            </TableCell>
            <TableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.username" defaultMessage="Username" />
              </Typography>
            </TableCell>
            <TableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.email" defaultMessage="E-mail" />
              </Typography>
            </TableCell>
            <TableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.organization" defaultMessage="Organization" />
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items?.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton variant="circle" width={35} height={35} />
              </TableCell>
              <TableCell component="th" scope="row">
                <Skeleton />
              </TableCell>
              <TableCell align="left">
                <Skeleton />
              </TableCell>
              <TableCell align="left">
                <Skeleton />
              </TableCell>
              <TableCell align="left">
                <Skeleton />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
