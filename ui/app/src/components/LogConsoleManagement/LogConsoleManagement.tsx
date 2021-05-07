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

import React, { useCallback, useEffect, useState } from 'react';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { defineMessages, FormattedMessage } from 'react-intl';
import { ApiResponse } from '../../models/ApiResponse';
import { useDispatch } from 'react-redux';
import { LogEvent } from '../../models/monitoring/LogEvent';
import { fetchLog } from '../../services/monitoring';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import moment from 'moment-timezone';
import LogConsoleGridUI from '../LogConsoleGrid';
import { Button } from '@material-ui/core';
import { useMount } from '../../utils/hooks';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import LogConsoleDetailsDialog from '../LogConsoleDetailsDialog';

const translations = defineMessages({});

export default function LogConsoleManagement() {
  const [logEvents, setLogEvents] = useState<LogEvent[]>();
  const [showLogEventDialog, setShowLogEventDialog] = useState(false);
  const [selectedLogEvent, setSelectedLogEvent] = useState(null);
  const [error, setError] = useState<ApiResponse>();
  const [paused, setPaused] = useState(false);
  const dispatch = useDispatch();

  const refresh = useCallback(
    (since?: number) => {
      since =
        since ??
        moment()
          .subtract(1, 'hour')
          .valueOf();

      fetchLog(since).subscribe(
        (logEvents) => {
          setLogEvents(logEvents);
        },
        ({ response: { response } }) => {
          setError(response);
          dispatch(showErrorDialog({ error: response }));
        }
      );
    },
    [dispatch]
  );

  useEffect(() => {
    if (!paused && !error) {
      const timer = setTimeout(() => {
        const since = moment()
          .subtract(1, 'hour')
          .valueOf();
        refresh(since);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paused, logEvents, error, refresh]);

  useMount(() => {
    refresh();
  });

  const togglePause = () => {
    setPaused(!paused);
  };

  const onLogEventDetails = (logEvent: LogEvent) => {
    setShowLogEventDialog(true);
    setSelectedLogEvent(logEvent);
  };

  const onCloseLogEventDetailsDialog = () => {
    setShowLogEventDialog(false);
  };

  const onLogEventDetailsDialogClosed = () => {
    setSelectedLogEvent(null);
  };

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="globalMenu.logConsole" defaultMessage="Log Console" />}
        rightContent={
          <>
            <Button
              onClick={togglePause}
              variant="text"
              color="primary"
              endIcon={paused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
            >
              {paused ? (
                <FormattedMessage id="words.continue" defaultMessage="Continue" />
              ) : (
                <FormattedMessage id="words.pause" defaultMessage="Pause" />
              )}
            </Button>
            <Button variant="text" color="primary">
              <FormattedMessage id="words.clear" defaultMessage="Clear" />
            </Button>
          </>
        }
      />
      <ConditionalLoadingState isLoading={!logEvents}>
        <LogConsoleGridUI logEvents={logEvents} onLogEventDetails={onLogEventDetails} />
      </ConditionalLoadingState>
      <LogConsoleDetailsDialog
        open={showLogEventDialog}
        logEvent={selectedLogEvent}
        onClose={onCloseLogEventDetailsDialog}
        onClosed={onLogEventDetailsDialogClosed}
      />
    </section>
  );
}
