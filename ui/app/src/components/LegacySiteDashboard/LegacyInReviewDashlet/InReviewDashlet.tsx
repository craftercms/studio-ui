/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import React, { useCallback, useEffect } from 'react';
import { LegacyDashboardPreferences } from '../../../models';
import useSpreadState from '../../../hooks/useSpreadState';
import { useSelector } from 'react-redux';
import GlobalState from '../../../models/GlobalState';
import { getStoredDashboardPreferences, setStoredDashboardPreferences } from '../../../utils/state';
import useActiveSite from '../../../hooks/useActiveSite';
import { fetchPendingApproval as fetchPendingApprovalService } from '../../../services/dashboard';
import { LegacyDashletCard } from '../LegacyDashletCard';
import { FormattedMessage } from 'react-intl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { ApiResponseErrorState } from '../../ApiResponseErrorState';
import { EmptyState, getEmptyStateStyleSet } from '../../EmptyState';
import InReviewDashletGridUISkeleton from './InReviewDashletGridUISkeleton';
import InReviewDashletGridUI from './InReviewDashletGridUI';

const dashletInitialPreferences: LegacyDashboardPreferences = {
  numItems: 10,
  expanded: true
};

export function InReviewDashlet() {
  const [state, setState] = useSpreadState({
    items: null,
    total: 0,
    fetching: false,
    error: null
  });
  const { id: siteId, uuid } = useActiveSite();
  const currentUser = useSelector<GlobalState, string>((state) => state.user.username);
  const dashletPreferencesId = 'inReviewDashlet';
  const [preferences, setPreferences] = useSpreadState(
    getStoredDashboardPreferences(currentUser, uuid, dashletPreferencesId) ?? dashletInitialPreferences
  );

  useEffect(() => {
    setStoredDashboardPreferences(preferences, currentUser, uuid, dashletPreferencesId);
  }, [preferences, currentUser, uuid]);

  const fetchPendingApproval = useCallback(
    (backgroundRefresh?: boolean) => {
      if (!backgroundRefresh) {
        setState({ fetching: true });
      }
      fetchPendingApprovalService(siteId, {
        limit: preferences.numItems,
        offset: 0
      }).subscribe({
        next(items) {
          console.log('items', items);
          setState({
            items,
            total: items.total,
            error: null,
            ...(!backgroundRefresh && { fetching: false })
          });
        },
        error(e) {
          setState({
            error: e,
            ...(!backgroundRefresh && { fetching: false })
          });
        }
      });
    },
    [siteId, preferences.numItems, setState]
  );

  const onNumItemsChange = (e) => {
    setPreferences({
      numItems: e.target.value
    });
  };

  useEffect(() => {
    fetchPendingApproval();
  }, [fetchPendingApproval]);

  // region Item Updates Propagation

  // endregion

  return (
    <LegacyDashletCard
      title={
        <>
          <FormattedMessage id="inReviewDashlet.dashletTitle" defaultMessage="In Review" /> ({state.total})
        </>
      }
      onToggleExpanded={() => setPreferences({ expanded: !preferences.expanded })}
      expanded={preferences.expanded}
      refreshDisabled={state.fetching}
      onRefresh={fetchPendingApproval}
      headerRightSection={
        <>
          <TextField
            label={<FormattedMessage id="words.show" defaultMessage="Show" />}
            select
            size="small"
            value={preferences.numItems}
            disabled={state.fetching}
            onChange={onNumItemsChange}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            {state.total > 0 && (
              <MenuItem value={state.total}>
                <FormattedMessage id="words.all" defaultMessage="All" /> ({state.total})
              </MenuItem>
            )}
          </TextField>
        </>
      }
    >
      {state.error ? (
        <ApiResponseErrorState error={state.error} />
      ) : state.fetching ? (
        <InReviewDashletGridUISkeleton numOfItems={state.items?.length} />
      ) : state.items ? (
        state.items.length ? (
          <InReviewDashletGridUI items={state.items} />
        ) : (
          <EmptyState
            title={<FormattedMessage id="inReviewDashlet.emptyMessage" defaultMessage="No items in review" />}
            styles={{
              ...getEmptyStateStyleSet('horizontal'),
              ...getEmptyStateStyleSet('image-sm')
            }}
          />
        )
      ) : (
        <></>
      )}
    </LegacyDashletCard>
  );
}

export default InReviewDashlet;
