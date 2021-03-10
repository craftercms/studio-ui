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
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import Avatar from '@material-ui/core/Avatar';
import User from '../../models/User';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '5px'
    }
  })
)(TableCell);

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
  resource: Resource<any>;
  onRowClicked(user: User): void;
}

export default function UsersGridUI(props: UsersGridUIProps) {
  const { resource, onRowClicked } = props;
  const users = resource.read();
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell padding="checkbox">
              <Checkbox checked={false} color="primary" />
            </StyledTableCell>
            <StyledTableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.name" defaultMessage="Name" />
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.username" defaultMessage="Username" />
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.email" defaultMessage="E-mail" />
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.organization" defaultMessage="Organization" />
              </Typography>
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {users?.map((user, i) => (
            <StyledTableRow key={user.id} onClick={() => onRowClicked(user)}>
              <StyledTableCell>
                <Avatar>{user.firstName.charAt(0)}</Avatar>
              </StyledTableCell>
              <StyledTableCell align="left">{user.firstName}</StyledTableCell>
              <StyledTableCell align="left">{user.username}</StyledTableCell>
              <StyledTableCell align="left">{user.email}</StyledTableCell>
              <StyledTableCell align="left">Organization?</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
            <StyledTableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.name" defaultMessage="Name" />
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.username" defaultMessage="Username" />
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.email" defaultMessage="E-mail" />
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="left">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.organization" defaultMessage="Organization" />
              </Typography>
            </StyledTableCell>
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
              <StyledTableCell align="left">
                <Skeleton />
              </StyledTableCell>
              <StyledTableCell align="left">
                <Skeleton />
              </StyledTableCell>
              <StyledTableCell align="left">
                <Skeleton />
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
