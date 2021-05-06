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
import useStyles from './styles';
import { useSelection } from '../../utils/hooks';

interface LogConsoleGridUIProps {
  logEvents: LogEvent[];
}

export default function LogConsoleGridUI(props: LogConsoleGridUIProps) {
  const { logEvents } = props;
  const classes = useStyles();
  const localeBranch = useSelection((state) => state.uiConfig.locale);

  // const date = new Intl.DateTimeFormat(localeBranch.localeCode, localeBranch.dateTimeFormatOptions).format(
  //   new Date(params.value as Date)
  // );

  return (
    <TableContainer>
      <Table className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell align="left" className="bordered padded10 width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="clusterGrid.localAddress" defaultMessage="Level" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="bordered padded10 width25">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.state" defaultMessage="Timestamp" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="bordered padded10 width25">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.url" defaultMessage="Thread" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="bordered padded10 width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="clusterGrid.remoteName" defaultMessage="Site" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="bordered width60 padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="clusterGrid.authType" defaultMessage="Message" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell align="left" className="bordered padded10 width10">
              <FormattedMessage id="clusterGrid.authType" defaultMessage="Details" />
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {logEvents.map((logEvent, i) => (
            <GlobalAppGridRow key={i} className="hoverDisabled">
              <GlobalAppGridCell align="left" className="padded10 ellipsis">
                {logEvent.level}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="padded10 ellipsis">
                {new Intl.DateTimeFormat(localeBranch.localeCode, localeBranch.dateTimeFormatOptions).format(
                  new Date(logEvent.timestamp)
                )}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="padded10 ellipsis">
                {logEvent.thread}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="padded10 ellipsis">
                {logEvent.site}
              </GlobalAppGridCell>
              <GlobalAppGridCell title={logEvent.message} align="left" className="padded10 ellipsis">
                {logEvent.message}
              </GlobalAppGridCell>
              <GlobalAppGridCell align="left" className="padded10 ellipsis">
                <IconButton>
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
