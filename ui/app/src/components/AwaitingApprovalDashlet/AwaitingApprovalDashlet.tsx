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
import useStyles from './styles';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchLegacyGetGoLiveItems } from '../../services/dashboard';
import { AllItemActions, DetailedItem } from '../../models/Item';
import AwaitingApprovalDashletGridUI from '../AwaitingApprovalDashletGrid';
import { SuspenseWithEmptyState } from '../Suspencified';
import LookupTable from '../../models/LookupTable';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath, parseLegacyItemToDetailedItem } from '../../utils/content';
import Dashlet from '../Dashlet';
import ApiResponse from '../../models/ApiResponse';
import AwaitingApprovalDashletSkeletonTable from '../AwaitingApprovalDashletGrid/AwaitingApprovalDashletSkeletonTable';
import Button from '@mui/material/Button';
import { itemsApproved, itemsDeleted, itemsRejected, itemsScheduled } from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { filter } from 'rxjs/operators';
import { useLogicResource } from '../../hooks/useLogicResource';
import { useSpreadState } from '../../hooks/useSpreadState';
import { DashboardPreferences } from '../../models/Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import GlobalState from '../../models/GlobalState';
import { getStoredDashboardPreferences, setStoredDashboardPreferences } from '../../utils/state';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import ActionsBar from '../ActionsBar';
import translations from './translations';
import { createPresenceTable } from '../../utils/array';
import { itemActionDispatcher } from '../../utils/itemActions';
import { useEnv } from '../../hooks/useEnv';
import { batchActions } from '../../state/actions/misc';
import { getEmptyStateStyleSet } from '../EmptyState';
import { useActiveSite } from '../../hooks/useActiveSite';

export interface AwaitingApprovalDashletDashboardItem {
  label: string;
  path: string;
  children: string[];
}

const dashletInitialPreferences: DashboardPreferences = {
  expanded: true,
  showUnpublished: false
};

export default function AwaitingApprovalDashlet() {
  const { id: siteId, uuid } = useActiveSite();
  const classes = useStyles();
  const [state, setState] = useState<{
    itemsLookup: LookupTable<DetailedItem>;
    publishingTargetLookup: LookupTable<string>;
    parentItems: AwaitingApprovalDashletDashboardItem[];
    total: number;
  }>({
    publishingTargetLookup: {},
    itemsLookup: {},
    parentItems: null,
    total: null
  });
  const [selectedLookup, setSelectedLookup] = useState<LookupTable<boolean>>({});
  const [expandedLookup, setExpandedLookup] = useSpreadState<LookupTable<boolean>>({});
  const [error, setError] = useState<ApiResponse>();
  const currentUser = useSelector<GlobalState, string>((state) => state.user.username);
  const dashletPreferencesId = 'awaitingApprovalDashlet';
  const [preferences, setPreferences] = useSpreadState(
    getStoredDashboardPreferences(currentUser, uuid, dashletPreferencesId) ?? dashletInitialPreferences
  );
  const [isFetching, setIsFetching] = useState(false);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();

  const showExpanded = useMemo(() => Object.values(expandedLookup).some((value) => !value), [expandedLookup]);
  const isAllChecked = useMemo(
    () => !Object.keys(state.itemsLookup).some((path) => !selectedLookup[path]),
    [selectedLookup, state.itemsLookup]
  );
  const selectedItemsLength = useMemo(() => Object.values(selectedLookup).filter(Boolean).length, [selectedLookup]);
  const isIndeterminate = useMemo(
    () => Object.keys(state.itemsLookup).some((path) => selectedLookup[path]) && !isAllChecked,
    [isAllChecked, selectedLookup, state.itemsLookup]
  );

  const refresh = useCallback(() => {
    setIsFetching(true);
    fetchLegacyGetGoLiveItems(siteId, 'eventDate', null, preferences.showUnpublished, null).subscribe(
      (response) => {
        const parentItems: AwaitingApprovalDashletDashboardItem[] = [];
        const itemsLookup = {};
        const publishingTargetLookup = {};
        const expandedLookup = {};
        response.documents.forEach((item) => {
          if (item.children.length) {
            expandedLookup[item.uri] = true;
            parentItems.push({
              label: item.name,
              path: item.uri,
              children: item.children.map((item) => {
                publishingTargetLookup[item.uri] = item.submittedToEnvironment;
                itemsLookup[item.uri] = parseLegacyItemToDetailedItem(item);
                return item.uri;
              })
            });
          }
        });
        setExpandedLookup(expandedLookup);
        setState({
          publishingTargetLookup,
          itemsLookup,
          parentItems,
          total: response.total
        });
        setIsFetching(false);
      },
      ({ response }) => {
        setError(response);
      }
    );
  }, [setExpandedLookup, siteId, preferences.showUnpublished]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [itemsDeleted.type, itemsRejected.type, itemsApproved.type, itemsScheduled.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        case itemsApproved.type:
        case itemsScheduled.type:
        case itemsDeleted.type:
        case itemsRejected.type: {
          if (payload.targets.some((path) => state.itemsLookup[path])) {
            refresh();
            setSelectedLookup({ ...selectedLookup, ...createPresenceTable(payload.targets, false) });
          }
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [refresh, selectedLookup, state.itemsLookup]);
  // endregion

  useEffect(() => {
    setStoredDashboardPreferences(preferences, currentUser, uuid, dashletPreferencesId);
  }, [preferences, currentUser, uuid]);

  const resource = useLogicResource<
    AwaitingApprovalDashletDashboardItem[],
    {
      items: AwaitingApprovalDashletDashboardItem[];
      error: ApiResponse;
      isFetching: boolean;
    }
  >(
    useMemo(() => ({ items: state.parentItems, error, isFetching }), [state.parentItems, error, isFetching]),
    {
      shouldResolve: (source) => Boolean(source.items) && !isFetching,
      shouldReject: (source) => Boolean(source.error),
      shouldRenew: (source, resource) => source.isFetching && resource.complete,
      resultSelector: (source) => source.items,
      errorSelector: (source) => source.error
    }
  );

  const onToggleCollapse = (e) => {
    e.stopPropagation();
    const lookup = {};
    Object.keys(expandedLookup).forEach((path) => {
      lookup[path] = showExpanded;
    });
    setExpandedLookup(lookup);
  };

  const onShowInProgress = (e) => {
    e.stopPropagation();
    setPreferences({ showUnpublished: !preferences.showUnpublished });
  };

  const onExpandedRow = (path: string, value: boolean) => {
    setExpandedLookup({ [path]: value });
  };

  const onToggleCheckedAll = () => {
    if (isAllChecked) {
      setSelectedLookup({});
    } else {
      setSelectedLookup({ ...selectedLookup, ...createPresenceTable(Object.keys(state.itemsLookup), true) });
    }
  };

  const handleItemChecked = (path: string) => {
    setSelectedLookup({ ...selectedLookup, [path]: !selectedLookup[path] });
  };

  const onItemMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem) => {
    const path = item.path;
    dispatch(
      batchActions([
        completeDetailedItem({ path }),
        showItemMegaMenu({
          path,
          anchorReference: 'anchorPosition',
          anchorPosition: { top: event.clientY, left: event.clientX },
          numOfLoaderItems: getNumOfMenuOptionsForItem({
            path: item.path,
            systemType: getSystemTypeFromPath(item.path)
          } as DetailedItem)
        })
      ])
    );
  };

  const onActionBarOptionClicked = (option: string) => {
    if (option === 'clear') {
      setSelectedLookup({});
    } else {
      const selected = Object.keys(selectedLookup)
        .filter((path) => selectedLookup[path])
        .map((path) => state.itemsLookup[path]);
      itemActionDispatcher({
        site: siteId,
        item: selected.length > 1 ? selected : selected[0],
        option: option as AllItemActions,
        authoringBase,
        dispatch,
        formatMessage
      });
    }
  };

  return (
    <Dashlet
      title={
        <FormattedMessage
          id="awaitingApprovalDashlet.dashletTitle"
          defaultMessage="Items Waiting For Approval ({count})"
          values={{ count: state.total }}
        />
      }
      expanded={preferences.expanded}
      onToggleExpanded={() => setPreferences({ expanded: !preferences.expanded })}
      refreshDisabled={isFetching}
      onRefresh={refresh}
      headerRightSection={
        <>
          <Button disabled={isFetching} onClick={onToggleCollapse} className={classes.collapseAll}>
            {showExpanded ? (
              <FormattedMessage id="awaitingApprovalDashlet.expandedAll" defaultMessage="Expand All" />
            ) : (
              <FormattedMessage id="awaitingApprovalDashlet.collapseAll" defaultMessage="Collapse All" />
            )}
          </Button>
          <Button disabled={isFetching} onClick={onShowInProgress}>
            {preferences.showUnpublished ? (
              <FormattedMessage id="awaitingApprovalDashlet.hideUnpublished" defaultMessage="Hide Unpublished" />
            ) : (
              <FormattedMessage id="awaitingApprovalDashlet.showUnpublished" defaultMessage="Show Unpublished" />
            )}
          </Button>
        </>
      }
    >
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <AwaitingApprovalDashletSkeletonTable items={state.parentItems} expandedLookup={expandedLookup} />
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: (
              <FormattedMessage
                id="awaitingApprovalDashlet.emptyMessage"
                defaultMessage="No items are awaiting approval"
              />
            ),
            styles: {
              ...getEmptyStateStyleSet('horizontal'),
              ...getEmptyStateStyleSet('image-sm')
            }
          }
        }}
      >
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
            toggleSelectAll={onToggleCheckedAll}
          />
        )}
        <AwaitingApprovalDashletGridUI
          resource={resource}
          expandedLookup={expandedLookup}
          publishingTargetLookup={state.publishingTargetLookup}
          itemsLookup={state.itemsLookup}
          selectedLookup={selectedLookup}
          onToggleCheckedAll={onToggleCheckedAll}
          isAllChecked={isAllChecked}
          isIndeterminate={isIndeterminate}
          onExpandedRow={onExpandedRow}
          onItemMenuClick={onItemMenuClick}
          onItemChecked={handleItemChecked}
        />
      </SuspenseWithEmptyState>
    </Dashlet>
  );
}
