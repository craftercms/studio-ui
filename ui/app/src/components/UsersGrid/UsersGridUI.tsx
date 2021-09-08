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
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import React from 'react';
import Avatar from '@mui/material/Avatar';
import User from '../../models/User';
import { PagedArray } from '../../models/PagedArray';
import Pagination from '../Pagination';
import useStyles from './styles';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Box from '@mui/material/Box';

export interface UsersGridUIProps {
  resource: Resource<PagedArray<User>>;
  onRowClicked(user: User): void;
  onPageChange(page: number): void;
  onRowsPerPageChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export default function UsersGridUI(props: UsersGridUIProps) {
  const { resource, onRowClicked, onPageChange, onRowsPerPageChange } = props;
  const classes = useStyles();
  const users = resource.read();
  return (
    <Box display="flex" flexDirection="column">
      <TableContainer>
        <Table className={classes.tableRoot}>
          <TableHead>
            <GlobalAppGridRow className="hoverDisabled">
              <GlobalAppGridCell align="center" className="avatar">
                <span />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="pl20 width20">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.name" defaultMessage="Name" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width20">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.username" defaultMessage="Username" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="width60">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.email" defaultMessage="E-mail" />
                </Typography>
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          </TableHead>
          <TableBody>
            {users?.map((user, i) => (
              <GlobalAppGridRow key={user.id} onClick={() => onRowClicked(user)}>
                <GlobalAppGridCell align="center" className="avatar">
                  <Avatar className={classes.avatar}>
                    {user.firstName.charAt(0)}
                    {user.lastName?.charAt(0) ?? ''}
                  </Avatar>
                </GlobalAppGridCell>
                <GlobalAppGridCell align="left" className="pl20 width20">
                  {user.firstName} {user.lastName}
                </GlobalAppGridCell>
                <GlobalAppGridCell align="left" className="width20">
                  {user.username}
                </GlobalAppGridCell>
                <GlobalAppGridCell align="left" className="width60">
                  {user.email}
                </GlobalAppGridCell>
              </GlobalAppGridRow>
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
        onPageChange={(page: number) => onPageChange(page)}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Box>
  );
}
