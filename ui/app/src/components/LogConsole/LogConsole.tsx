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
import { FormattedMessage } from 'react-intl';
import { ApiResponse } from '../../models/ApiResponse';
import { useDispatch } from 'react-redux';
import { LogEvent } from '../../models/monitoring/LogEvent';
import { fetchLog, fetchPreviewLog } from '../../services/monitoring';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import moment from 'moment-timezone';
import LogConsoleGridUI from '../LogConsoleGrid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { useActiveSiteId, useMount } from '../../utils/hooks';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import LogConsoleDetailsDialog from '../LogConsoleDetailsDialog';
import EmptyState from '../SystemStatus/EmptyState';

interface LogConsoleManagementProps {
  logType?: 'studio' | 'preview';
}

export default function LogConsole(props: LogConsoleManagementProps) {
  const { logType = 'studio' } = props;
  const [logEvents, setLogEvents] = useState<LogEvent[]>();
  const [showLogEventDialog, setShowLogEventDialog] = useState(false);
  const site = useActiveSiteId();
  const [selectedLogEvent, setSelectedLogEvent] = useState(null);
  const [error, setError] = useState<ApiResponse>();
  const [paused, setPaused] = useState(false);
  const dispatch = useDispatch();

  useMount(() => {
    let since = moment()
      .subtract(1, 'hour')
      .valueOf();
    fetchPreviewLog(site, since).subscribe();
  });

  const refresh = useCallback(
    (since?: number) => {
      since =
        since ??
        moment()
          .subtract(1, 'hour')
          .valueOf();

      (logType === 'studio' ? fetchLog(since) : fetchPreviewLog(site, since)).subscribe(
        (newLogEvents) => {
          if (logEvents) {
            setLogEvents([...logEvents, ...newLogEvents]);
          } else {
            setLogEvents(newLogEvents);
          }
        },
        ({ response: { response } }) => {
          setError(response);
          dispatch(showErrorDialog({ error: response }));
        }
      );
    },
    [dispatch, logEvents, logType, site]
  );

  useEffect(() => {
    if (!paused && !error) {
      const timer = setTimeout(() => {
        const since = moment()
          .subtract(5, 'seconds')
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

  const onClear = () => {
    setLogEvents([]);
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
    <Box>
      <GlobalAppToolbar
        title={<FormattedMessage id="globalMenu.logConsoleEntryLabel" defaultMessage="Log Console" />}
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
            <Button variant="text" color="primary" onClick={onClear}>
              <FormattedMessage id="words.clear" defaultMessage="Clear" />
            </Button>
          </>
        }
        showHamburgerMenuButton={logType === 'studio'}
        showAppsButton={logType === 'studio'}
      />
      <ConditionalLoadingState isLoading={!logEvents}>
        <LogConsoleGridUI logEvents={logEvents} onLogEventDetails={onLogEventDetails} />
      </ConditionalLoadingState>
      {logEvents?.length === 0 && (
        <EmptyState title={<FormattedMessage id="logConsoleManagement.noLogs" defaultMessage="No logs found" />} />
      )}
      <LogConsoleDetailsDialog
        open={showLogEventDialog}
        logEvent={selectedLogEvent}
        onClose={onCloseLogEventDetailsDialog}
        onClosed={onLogEventDetailsDialogClosed}
      />
    </Box>
  );
}
