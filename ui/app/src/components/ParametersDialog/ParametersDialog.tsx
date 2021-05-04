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

import Dialog from '@material-ui/core/Dialog';
import React from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import DialogBody from '../Dialogs/DialogBody';
import { LogParameters } from '../../models/Audit';
import { useMount } from '../../utils/hooks';
import DialogHeader from '../Dialogs/DialogHeader';

interface ParametersDialogProps {
  open: boolean;
  onClose(): void;
  onClosed?(): void;
  parameters: LogParameters[];
}

export default function ParametersDialog(props: ParametersDialogProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <ParametersDialogUI {...props} />
    </Dialog>
  );
}

function ParametersDialogUI(props: ParametersDialogProps) {
  const { parameters = [], onClose, onClosed } = props;

  useMount(() => {
    return () => {
      onClosed?.();
    };
  });

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="words.parameters" defaultMessage="Parameters" />}
        onDismiss={onClose}
      />
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
    </>
  );
}
