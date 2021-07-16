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
import { LogEvent } from '../../models/monitoring/LogEvent';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
import { IconButton } from '@material-ui/core';
import { useSelection } from '../../utils/hooks/useSelection';

interface LogConsoleGridUIProps {
  logEvents: LogEvent[];
  onLogEventDetails(logEvent: LogEvent): void;
}

export default function LogConsoleGridUI(props: LogConsoleGridUIProps) {
  const { logEvents, onLogEventDetails } = props;
  const localeBranch = useSelection((state) => state.uiConfig.locale);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell align="left" className="width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.level" defaultMessage="Level" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width25">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.timestamp" defaultMessage="Timestamp" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width25">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.thread" defaultMessage="Thread" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.site" defaultMessage="Site" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width60">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.message" defaultMessage="Message" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="width10">
              <FormattedMessage id="words.details" defaultMessage="Details" />
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {logEvents.map((logEvent, i) => (
            <GlobalAppGridRow key={i} className="hoverDisabled">
              <GlobalAppGridCell align="left" className="ellipsis">
                {logEvent.level}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="ellipsis">
                {new Intl.DateTimeFormat(localeBranch.localeCode, localeBranch.dateTimeFormatOptions).format(
                  new Date(logEvent.timestamp)
                )}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="ellipsis">
                {logEvent.thread}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="ellipsis">
                {logEvent.site}
              </GlobalAppGridCell>
              <GlobalAppGridCell title={logEvent.message} align="left" className="ellipsis maxWidth300">
                {logEvent.message}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="action">
                <IconButton onClick={() => onLogEventDetails(logEvent)}>
                  <VisibilityRoundedIcon />
                </IconButton>
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
