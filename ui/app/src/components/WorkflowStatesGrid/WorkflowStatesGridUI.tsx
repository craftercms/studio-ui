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

import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import React from 'react';
import { WorkflowState } from '../../models/WorkflowState';
import { Resource } from '../../models/Resource';
import Checkbox from '@material-ui/core/Checkbox';

export interface WorkflowStatesGridUIProps {
  resource: Resource<Array<WorkflowState>>;
}

export default function WorkflowStatesGridUI(props: WorkflowStatesGridUIProps) {
  const { resource } = props;
  const states = resource.read();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="bordered">
              <Typography variant="subtitle2">
                <FormattedMessage id="workflowStates.selectAll" defaultMessage="Select All" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.id" defaultMessage="ID" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.state" defaultMessage="State" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered">
              <Typography variant="subtitle2">
                <FormattedMessage id="workflowStates.systemProcessing" defaultMessage="System Processing" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {states.map((state) => (
            <GlobalAppGridRow key={state.objectId}>
              <GlobalAppGridCell align="left">
                <Checkbox />
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left">{state.objectId}</GlobalAppGridCell>
              <GlobalAppGridCell align="left">{state.state}</GlobalAppGridCell>
              <GlobalAppGridCell align="left">{state.systemProcessing}</GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
