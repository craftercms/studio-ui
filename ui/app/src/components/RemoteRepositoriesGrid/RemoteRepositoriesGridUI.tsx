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
import { Repository } from '../../models/Repository';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import React from 'react';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import ConfirmDropdown from '../Controls/ConfirmDropdown';

export interface RemoteRepositoriesGridUIProps {
  resource: Resource<Array<Repository>>;
  onClickPull(remoteName: string, branches: string[]): void;
  onClickPush(remoteName: string, branches: string[]): void;
  onDeleteRemote(remoteName: string): void;
}

export default function RemoteRepositoriesGridUI(props: RemoteRepositoriesGridUIProps) {
  const { resource, onDeleteRemote, onClickPull, onClickPush } = props;
  const repositories = resource.read();

  return (
    <TableContainer>
      <Table>
        <RepositoriesGridTableHead />
        <TableBody>
          {repositories.map((repository) => (
            <GlobalAppGridRow key={repository.name} className="hoverDisabled">
              <GlobalAppGridCell align="left">{repository.name}</GlobalAppGridCell>
              <GlobalAppGridCell align="left">{repository.url}</GlobalAppGridCell>
              <GlobalAppGridCell align="left">{repository.fetch}</GlobalAppGridCell>
              <GlobalAppGridCell align="left">{repository.pushUrl}</GlobalAppGridCell>
              <GlobalAppGridCell>
                <Tooltip title={<FormattedMessage id="words.pull" defaultMessage="Pull" />}>
                  <IconButton onClick={() => onClickPull(repository.name, repository.branches)}>
                    <ArrowDownwardRoundedIcon />
                  </IconButton>
                </Tooltip>
              </GlobalAppGridCell>
              <GlobalAppGridCell>
                <Tooltip title={<FormattedMessage id="words.pull" defaultMessage="Push" />}>
                  <IconButton onClick={() => onClickPush(repository.name, repository.branches)}>
                    <ArrowUpwardRoundedIcon />
                  </IconButton>
                </Tooltip>
              </GlobalAppGridCell>
              <GlobalAppGridCell>
                <ConfirmDropdown
                  cancelText={<FormattedMessage id="words.no" defaultMessage="No" />}
                  confirmText={<FormattedMessage id="words.yes" defaultMessage="Yes" />}
                  confirmHelperText={
                    <FormattedMessage id="repositories.deleteConfirmation" defaultMessage="Delete remote repository?" />
                  }
                  iconTooltip={<FormattedMessage id="words.delete" defaultMessage="Delete" />}
                  icon={DeleteRoundedIcon}
                  iconColor="action"
                  onConfirm={() => {
                    onDeleteRemote(repository.name);
                  }}
                />
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function RepositoriesGridTableHead() {
  return (
    <TableHead>
      <GlobalAppGridRow className="hoverDisabled">
        <GlobalAppGridCell className="bordered">
          <Typography variant="subtitle2">
            <FormattedMessage id="words.name" defaultMessage="Name" />
          </Typography>
        </GlobalAppGridCell>
        <GlobalAppGridCell className="bordered">
          <Typography variant="subtitle2">
            <FormattedMessage id="words.url" defaultMessage="URL" />
          </Typography>
        </GlobalAppGridCell>
        <GlobalAppGridCell className="bordered">
          <Typography variant="subtitle2">
            <FormattedMessage id="words.fetch" defaultMessage="Fetch" />
          </Typography>
        </GlobalAppGridCell>
        <GlobalAppGridCell className="bordered">
          <Typography variant="subtitle2">
            <FormattedMessage id="repositories.pushUrl" defaultMessage="Push URL" />
          </Typography>
        </GlobalAppGridCell>
        <GlobalAppGridCell className="bordered" />
        <GlobalAppGridCell className="bordered" />
        <GlobalAppGridCell className="bordered" />
      </GlobalAppGridRow>
    </TableHead>
  );
}
