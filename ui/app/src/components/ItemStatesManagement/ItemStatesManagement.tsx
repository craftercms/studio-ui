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
import ApiResponse from '../../models/ApiResponse';
import { useActiveSiteId, useLogicResource } from '../../utils/hooks';
import { fetchItemStates } from '../../services/workflowStates';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import { ItemStates } from '../../models/WorkflowState';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import ItemStatesGridUI, { ItemStatesGridSkeletonTable } from '../WorkflowStatesGrid';
import SetWorkflowStateDialog from '../SetWorkflowStateDialog';
import Button from '@material-ui/core/Button';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';

export default function ItemStatesManagement() {
  const [fetching, setFetching] = useState(false);
  const [states, setStates] = useState(null); // TODO: type
  const [error, setError] = useState<ApiResponse>();
  const siteId = useActiveSiteId();
  const [openSetStateDialog, setOpenSetStateDialog] = useState(false);

  const fetchStates = useCallback(() => {
    setFetching(true);
    fetchItemStates(siteId).subscribe(
      (states) => {
        console.log('states');
        setStates(states);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  }, [siteId]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  const resource = useLogicResource<ItemStates, { states: ItemStates; error: ApiResponse; fetching: boolean }>(
    useMemo(() => ({ states, error, fetching }), [states, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.states) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.states,
      errorSelector: () => error
    }
  );

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="siteTools.itemStates" defaultMessage="Item States" />}
        rightContent={
          <Button endIcon={<FilterListRoundedIcon />} variant="outlined" color="primary" onClick={null}>
            <FormattedMessage id="words.filters" defaultMessage="Filters" />
          </Button>
        }
      />
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <ItemStatesGridSkeletonTable />
        }}
      >
        <ItemStatesGridUI resource={resource} />
      </SuspenseWithEmptyState>

      <SetWorkflowStateDialog open={openSetStateDialog} onClose={() => setOpenSetStateDialog(false)} />
    </section>
  );
}
