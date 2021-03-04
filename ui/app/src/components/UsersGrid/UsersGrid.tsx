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

import React, { useEffect, useState } from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import { fetchAll } from '../../services/users';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import TableCell from '@material-ui/core/TableCell';
import Checkbox from '@material-ui/core/Checkbox';
import TableRow from '@material-ui/core/TableRow';
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import User from '../../models/User';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '5px'
    }
  })
)(TableCell);

export default function UsersGrid() {
  const [users, setUsers] = useState<User[]>(null);

  useEffect(() => {
    fetchAll().subscribe((users) => {
      setUsers([...users]);
      console.log([...users]);
    });
  }, []);

  return (
    <ConditionalLoadingState isLoading={users === null}>
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
                  <FormattedMessage id="words.userName" defaultMessage="Username" />
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
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell padding="checkbox"></TableCell>
                <TableCell component="th" id={user.id.toString()} scope="row" padding="none">
                  {user.firstName}
                </TableCell>
                <StyledTableCell align="left">{user.username}</StyledTableCell>
                <StyledTableCell align="left">{user.email}</StyledTableCell>
                <StyledTableCell align="left">Organization?</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ConditionalLoadingState>
  );
}
