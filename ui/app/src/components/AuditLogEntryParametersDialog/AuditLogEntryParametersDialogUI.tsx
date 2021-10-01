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

import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import React from 'react';
import { AuditLogEntryParametersDialogUIProps } from './utils';

export function AuditLogEntryParametersDialogUI(props: AuditLogEntryParametersDialogUIProps) {
  const { parameters = [] } = props;

  return (
    <DialogBody>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage id="words.id" defaultMessage="Id" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="words.type" defaultMessage="Type" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="words.value" defaultMessage="Value" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parameters.map((logParameters) => (
            <TableRow key={logParameters.targetId}>
              <TableCell component="th" scope="row">
                {logParameters.targetId}
              </TableCell>
              <TableCell align="right">{logParameters.targetType}</TableCell>
              <TableCell align="right">{logParameters.targetValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DialogBody>
  );
}

export default AuditLogEntryParametersDialogUI;
