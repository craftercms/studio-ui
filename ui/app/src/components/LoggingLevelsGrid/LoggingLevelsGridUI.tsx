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

import React from 'react';
import { Resource } from '../../models/Resource';
import { Logger, LoggerLevel } from '../../models/Logger';
import useStyles from './styles';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

export interface LoggingLevelsGridUIProps {
  resource: Resource<Array<Logger>>;
  onChangeLevel(logger: Logger, level: LoggerLevel): void;
}

const levels: LoggerLevel[] = ['debug', 'warn', 'info', 'error'];

export default function LoggingLevelsGridUI(props: LoggingLevelsGridUIProps) {
  const { resource, onChangeLevel } = props;
  const classes = useStyles();
  const loggers = resource.read();

  return (
    <section>
      <TableContainer>
        <Table className={classes.tableRoot}>
          <TableHead>
            <GlobalAppGridRow className="hoverDisabled">
              <GlobalAppGridCell>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.logger" defaultMessage="Logger" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                <Typography variant="subtitle2">
                  <FormattedMessage id="loggingLevels.changeLevelTo" defaultMessage="Current Level" />
                </Typography>
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          </TableHead>
          <TableBody>
            {loggers.map((logger) => (
              <GlobalAppGridRow key={logger.name} className="hoverDisabled">
                <GlobalAppGridCell align="left">{logger.name}</GlobalAppGridCell>
                <GlobalAppGridCell align="left" className="action">
                  <Select
                    value={logger.level}
                    onChange={(event) => {
                      onChangeLevel(logger, event.target.value as LoggerLevel);
                    }}
                    variant="outlined"
                    classes={{
                      root: classes.select
                    }}
                  >
                    {levels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}
