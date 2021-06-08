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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import RecentlyPublishedWidgetUI from './RecentlyPublishedWidgetUI';
import ApiResponse from '../../models/ApiResponse';
import { LegacyDeploymentHistoryResponse, LegacyDeploymentHistoryType } from '../../models/Dashboard';
import { useActiveSiteId, useLocale, useLogicResource, useSpreadState } from '../../utils/hooks';
import { fetchLegacyDeploymentHistory } from '../../services/dashboard';
import Paper from '@material-ui/core/Paper';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FormattedMessage } from 'react-intl';
import SecondaryButton from '../SecondaryButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';

export interface RecentlyPublishedWidgetProps {}

export const useStyles = makeStyles((theme) =>
  createStyles({
    summary: {
      alignItems: 'center'
    },
    options: {
      marginLeft: 'auto',
      '& > button:first-child': {
        marginRight: '10px'
      }
    },
    collapseCell: {
      padding: '0 !important'
    }
  })
);

export default function RecentlyPublishedWidget(props: RecentlyPublishedWidgetProps) {
  const [expandedWidget, setExpandedWidget] = useState(true);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<ApiResponse>();
  const [history, setHistory] = useState<LegacyDeploymentHistoryResponse>();
  const [filterBy, setFilterBy] = useState<LegacyDeploymentHistoryType>('page');
  const [numItems, setNumItems] = useState(20);
  const [expandedItems, setExpandedItems] = useSpreadState({});
  const siteId = useActiveSiteId();
  const localeBranch = useLocale();
  const classes = useStyles();

  const toggleCollapseAllItems = useCallback(
    (documents, expanded) => {
      documents.forEach((document) => {
        setExpandedItems({
          [document.internalName]: expanded
        });
      });
    },
    [setExpandedItems]
  );

  useEffect(() => {
    setFetchingHistory(true);
    fetchLegacyDeploymentHistory(siteId, 'eventDate', false, 30, numItems, filterBy).subscribe(
      (history) => {
        setHistory(history);
        toggleCollapseAllItems(history.documents, true);
        setFetchingHistory(false);
      },
      (e) => {
        setErrorHistory(e);
        setFetchingHistory(false);
      }
    );
  }, [siteId, filterBy, numItems, toggleCollapseAllItems]); // TODO: pagination pending

  const onCollapseAll = (e) => {
    e.stopPropagation();
    toggleCollapseAllItems(history.documents, false);
  };

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
        <AccordionSummary expandIcon={<ExpandMoreIcon />} classes={{ content: classes.summary }}>
          <Typography variant="body1">
            <FormattedMessage id="recentlyPublished.title" defaultMessage="Recently Published" />
          </Typography>
          <section className={classes.options}>
            <SecondaryButton onClick={onCollapseAll}>
              <FormattedMessage id="recentlyPublished.collapseAll" defaultMessage="Collapse All" />
            </SecondaryButton>
          </section>
        </AccordionSummary>
        <AccordionDetails>
          <SuspenseWithEmptyState
            resource={resource}
            suspenseProps={{
              fallback: <></> // TODO: skeleton
            }}
          >
            <RecentlyPublishedWidgetUI
              resource={resource}
              localeBranch={localeBranch}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
            />
          </SuspenseWithEmptyState>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
