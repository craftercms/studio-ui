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
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import moment from 'moment-timezone';
import LogConsoleGridUI from '../LogConsoleGrid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ConditionalLoadingState } from '../LoadingState/LoadingState';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import LogConsoleDetailsDialog from '../LogConsoleDetailsDialog';
import EmptyState from '../EmptyState/EmptyState';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useMount } from '../../hooks/useMount';

interface LogConsoleManagementProps {
  logType?: 'studio' | 'preview';
  embedded?: boolean;
  showAppsButton?: boolean;
}

export function LogConsole(props: LogConsoleManagementProps) {
  const { logType = 'studio', embedded, showAppsButton = !embedded } = props;
  const [logEvents, setLogEvents] = useState<LogEvent[]>();
  const [showLogEventDialog, setShowLogEventDialog] = useState(false);
  const site = useActiveSiteId();
  const [selectedLogEvent, setSelectedLogEvent] = useState(null);
  const [error, setError] = useState<ApiResponse>();
  const [paused, setPaused] = useState(false);
  const dispatch = useDispatch();

  const refresh = useCallback(
    (since?: number) => {
      since = since ?? moment().subtract(1, 'hour').valueOf();

      (logType === 'studio' ? fetchLog(since) : fetchPreviewLog(site, since)).subscribe(
        (newLogEvents) => {
          if (logEvents) {
            setLogEvents([...logEvents, ...newLogEvents]);
          } else {
            setLogEvents(newLogEvents);
          }
        },
        (response) => {
          response = response.response ? response.response.response : response;
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
        const since = moment().subtract(5, 'seconds').valueOf();
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
        title={!embedded && <FormattedMessage id="globalMenu.logConsoleEntryLabel" defaultMessage="Log Console" />}
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
        showHamburgerMenuButton={!embedded}
        showAppsButton={showAppsButton}
      />
      <ConditionalLoadingState isLoading={!logEvents}>
        <LogConsoleGridUI
          showSiteColumn={logType !== 'studio'}
          logEvents={logEvents}
          onLogEventDetails={onLogEventDetails}
        />
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

export default LogConsole;
