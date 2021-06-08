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

import React, { useEffect, useMemo, useState } from 'react';
import RecentlyPublishedWidgetUI from './RecentlyPublishedWidgetUI';
import ApiResponse from '../../models/ApiResponse';
import { LegacyDeploymentHistoryResponse, LegacyDeploymentHistoryType } from '../../models/Dashboard';
import { useActiveSiteId, useLogicResource } from '../../utils/hooks';
import { fetchLegacyDeploymentHistory } from '../../services/dashboard';
import Paper from '@material-ui/core/Paper';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FormattedMessage } from 'react-intl';

export interface RecentlyPublishedWidgetProps {}

export default function RecentlyPublishedWidget(props: RecentlyPublishedWidgetProps) {
  const [expandedWidget, setExpandedWidget] = useState(true);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<ApiResponse>();
  const [history, setHistory] = useState<LegacyDeploymentHistoryResponse>();
  const [filterBy, setFilterBy] = useState<LegacyDeploymentHistoryType>('page');
  const [numItems, setNumItems] = useState(20);
  const siteId = useActiveSiteId();

  useEffect(() => {
    setFetchingHistory(true);
    fetchLegacyDeploymentHistory(siteId, 'eventDate', false, 30, numItems, filterBy).subscribe(
      (history) => {
        setFetchingHistory(false);
        setHistory(history);
      },
      (e) => {
        setErrorHistory(e);
        setFetchingHistory(false);
      }
    );
  }, [siteId, filterBy, numItems]); // TODO: pagination pending

  const resource = useLogicResource<
    LegacyDeploymentHistoryResponse,
    { history: LegacyDeploymentHistoryResponse; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ history, error: errorHistory, fetching: fetchingHistory }), [
      history,
      errorHistory,
      fetchingHistory
    ]),
    {
      shouldResolve: (source) => Boolean(source.history) && !fetchingHistory,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetchingHistory && resource.complete,
      resultSelector: (source) => source.history,
      errorSelector: () => errorHistory
    }
  );

  return (
    <Paper elevation={2}>
      <Accordion expanded={expandedWidget} onChange={() => setExpandedWidget(!expandedWidget)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography variant="body1">
            <FormattedMessage id="recentlyPublished.title" defaultMessage="Recently Published" />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SuspenseWithEmptyState
            resource={resource}
            suspenseProps={{
              fallback: <></> // TODO: skeleton
            }}
          >
            <RecentlyPublishedWidgetUI resource={resource} />
          </SuspenseWithEmptyState>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
