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
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import React from 'react';
import { PagedArray } from '../../models/PagedArray';
import Pagination from '../Pagination';
import { styles } from './styles';
import Group from '../../models/Group';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Box from '@material-ui/core/Box';

export interface GroupsGridUIProps {
  resource: Resource<PagedArray<Group>>;
  onRowClicked(user: Group): void;
  onPageChange(page: number): void;
  onRowsPerPageChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export default function GroupsGridUI(props: GroupsGridUIProps) {
  const { resource, onRowClicked, onPageChange, onRowsPerPageChange } = props;
  const classes = styles();
  const groups = resource.read();

  return (
    <Box display="flex" flexDirection="column">
      <TableContainer>
        <Table className={classes.tableRoot}>
          <TableHead>
            <GlobalAppGridRow className="hoverDisabled">
              <GlobalAppGridCell align="left" className="width25">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.name" defaultMessage="Name" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.description" defaultMessage="Description" />
                </Typography>
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          </TableHead>
          <TableBody>
            {groups.map((group, i) => (
              <GlobalAppGridRow key={group.id} onClick={() => onRowClicked(group)}>
                <GlobalAppGridCell align="left" className="width25">
                  {group.name}
                </GlobalAppGridCell>
                <GlobalAppGridCell align="left">{group.desc}</GlobalAppGridCell>
              </GlobalAppGridRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        rowsPerPageOptions={[5, 10, 15]}
        classes={{ root: classes.paginationRoot }}
        count={groups.total}
        rowsPerPage={groups.limit}
        page={groups && Math.ceil(groups.offset / groups.limit)}
        onPageChange={(page: number) => onPageChange(page)}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Box>
  );
}
