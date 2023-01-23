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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AllItemActions, ApiResponse, DetailedItem, LegacyDashboardPreferences } from '../../../models';
import useSpreadState from '../../../hooks/useSpreadState';
import { useDispatch, useSelector } from 'react-redux';
import GlobalState from '../../../models/GlobalState';
import { getStoredDashboardPreferences, setStoredDashboardPreferences } from '../../../utils/state';
import useActiveSite from '../../../hooks/useActiveSite';
import { fetchPendingApproval as fetchPendingApprovalService } from '../../../services/dashboard';
import { LegacyDashletCard } from '../LegacyDashletCard';
import { FormattedMessage, useIntl } from 'react-intl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { ApiResponseErrorState } from '../../ApiResponseErrorState';
import { EmptyState, getEmptyStateStyleSet } from '../../EmptyState';
import InReviewDashletGridUISkeleton from './LegacyInReviewDashletGridUISkeleton';
import LegacyInReviewDashletGridUI from './LegacyInReviewDashletGridUI';
import { contentEvent, deleteContentEvent, publishEvent, workflowEvent } from '../../../state/actions/system';
import { getHostToHostBus } from '../../../utils/subjects';
import { filter } from 'rxjs/operators';
import useLocale from '../../../hooks/useLocale';
import LookupTable from '../../../models/LookupTable';
import { createPresenceTable } from '../../../utils/array';
import useEnv from '../../../hooks/useEnv';
import { showItemMegaMenu } from '../../../state/actions/dialogs';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath } from '../../../utils/content';
import { ActionsBar } from '../../ActionsBar';
import { itemActionDispatcher } from '../../../utils/itemActions';
import translations from '../translations';
import useStyles from '../styles';

const dashletInitialPreferences: LegacyDashboardPreferences = {
  numItems: 10,
  expanded: true
};

export function LegacyInReviewDashlet() {
  const [state, setState] = useSpreadState<{
    items: DetailedItem[];
    total: number;
    fetching: boolean;
    error: ApiResponse;
  }>({
    items: null,
    total: 0,
    fetching: false,
    error: null
  });
  const { id: siteId, uuid } = useActiveSite();
  const { classes } = useStyles();
  const currentUser = useSelector<GlobalState, string>((state) => state.user.username);
  const dashletPreferencesId = 'inReviewDashlet';
  const [preferences, setPreferences] = useSpreadState(
    getStoredDashboardPreferences(currentUser, uuid, dashletPreferencesId) ?? dashletInitialPreferences
  );
  const [selectedLookup, setSelectedLookup] = useState<LookupTable<boolean>>({});
  const locale = useLocale();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();

  const isAllChecked = useMemo(() => {
    const nonDeletedItems = state.items?.filter((item) => !item.stateMap.deleted) ?? [];
    if (nonDeletedItems.length) {
      // Is there at least one (non deleted item) that's not checked? If so, they're NOT all checked.
      return !nonDeletedItems.some((item) => !selectedLookup[item.path]);
    } else {
      return false;
    }
  }, [state.items, selectedLookup]);
  const isIndeterminate = useMemo(
    () => state.items?.some((item) => selectedLookup[item.path] && !isAllChecked) ?? false,
    [state.items, selectedLookup, isAllChecked]
  );

  const selectedItemsLength = useMemo(() => Object.values(selectedLookup).filter(Boolean).length, [selectedLookup]);

  const onToggleCheckedAll = () => {
    if (isAllChecked) {
      setSelectedLookup({});
    } else {
      setSelectedLookup({
        ...selectedLookup,
        ...createPresenceTable(
          state.items.filter((item) => !item.stateMap.deleted),
          true,
          (item) => item.path
        )
      });
    }
  };

  const handleItemChecked = (path: string) => {
    setSelectedLookup({ ...selectedLookup, [path]: !selectedLookup[path] });
  };

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

  const onItemMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem) => {
    const path = item.path;
    dispatch(
      showItemMegaMenu({
        path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top: event.clientY, left: event.clientX },
        numOfLoaderItems: getNumOfMenuOptionsForItem({
          path: item.path,
          systemType: getSystemTypeFromPath(item.path)
        } as DetailedItem)
      })
    );
  };

  const onActionBarOptionClicked = (option: string) => {
    if (option === 'clear') {
      setSelectedLookup({});
    } else {
      const selected = Object.keys(selectedLookup).filter((path) => selectedLookup[path]);
      let selectedItems = [];
      selected.forEach((itemPath) => {
        const item = state.items.find((item) => itemPath === item.path);
        if (item) {
          selectedItems.push(item);
        }
      });
      itemActionDispatcher({
        site: siteId,
        item: selected.length > 1 ? selectedItems : selectedItems[0],
        option: option as AllItemActions,
        authoringBase,
        dispatch,
        formatMessage
      });
    }
  };

  // region Effects
  useEffect(() => {
    setStoredDashboardPreferences(preferences, currentUser, uuid, dashletPreferencesId);
  }, [preferences, currentUser, uuid]);

  useEffect(() => {
    fetchPendingApproval();
  }, [fetchPendingApproval]);
  // endregion

  // region Item Updates Propagation
  useEffect(() => {
    const events = [deleteContentEvent.type, workflowEvent.type, publishEvent.type, contentEvent.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      if (type === deleteContentEvent.type) {
        setSelectedLookup({});
      }
      fetchPendingApproval(true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPendingApproval, selectedLookup]);
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
          <>
            {(isIndeterminate || isAllChecked) && (
              <ActionsBar
                classes={{
                  root: classes.actionsBarRoot,
                  checkbox: classes.actionsBarCheckbox
                }}
                options={[
                  { id: 'approvePublish', label: formatMessage(translations.publish) },
                  { id: 'rejectPublish', label: formatMessage(translations.reject) },
                  { id: 'clear', label: formatMessage(translations.clear, { count: selectedItemsLength }) }
                ]}
                isIndeterminate={isIndeterminate}
                isChecked={isAllChecked}
                onOptionClicked={onActionBarOptionClicked}
                onCheckboxChange={onToggleCheckedAll}
              />
            )}
            <LegacyInReviewDashletGridUI
              items={state.items}
              locale={locale}
              onOptionsButtonClick={onItemMenuClick}
              selectedLookup={selectedLookup}
              isAllChecked={isAllChecked}
              isIndeterminate={isIndeterminate}
              onItemChecked={handleItemChecked}
              onClickSelectAll={onToggleCheckedAll}
            />
          </>
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

export default LegacyInReviewDashlet;
