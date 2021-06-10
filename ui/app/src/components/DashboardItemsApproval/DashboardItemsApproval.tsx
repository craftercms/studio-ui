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
import useStyles from './styles';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import { fetchLegacyGetGoLiveItems } from '../../services/dashboard';
import { useActiveSiteId, useLogicResource, useSpreadState } from '../../utils/hooks';
import { DetailedItem } from '../../models/Item';
import DashboardItemsApprovalGridUI from '../DashboardItemsApprovalGrid';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import LookupTable from '../../models/LookupTable';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath, parseLegacyItemToDetailedItem } from '../../utils/content';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import Dashlet from '../Dashlet';
import { createPresenceTable } from '../../utils/array';

export interface DashboardItem {
  label: string;
  path: string;
}

export default function DashboardItemsApproval() {
  const site = useActiveSiteId();
  const classes = useStyles();
  const [parentItems, setParentItems] = useState<DashboardItem[]>();
  const [expanded, setExpanded] = useState(true);
  const [expandedLookup, setExpandedLookup] = useSpreadState<LookupTable<boolean>>({});
  const [itemsLookup, setItemsLookup] = useState<LookupTable<DetailedItem[]>>({});
  const [publishingTargetLookup, setPublishingTargetLookup] = useState<LookupTable<string>>({});
  const dispatch = useDispatch();

  const showExpanded = useMemo(() => Object.values(expandedLookup).some((value) => !value), [expandedLookup]);

  useEffect(() => {
    fetchLegacyGetGoLiveItems(site, 'eventDate', null, false, null).subscribe((response) => {
      const items: DashboardItem[] = [];
      const lookup = {};
      const targetLookup = {};
      response.documents.forEach((item) => {
        if (item.children.length) {
          items.push({ label: item.name, path: item.uri });
          lookup[item.uri] = item.children.map((item) => {
            targetLookup[item.uri] = item.submittedToEnvironment;
            return parseLegacyItemToDetailedItem(item);
          });
        }
      });
      setExpandedLookup(createPresenceTable(Object.keys(lookup)));
      setPublishingTargetLookup(targetLookup);
      setParentItems(items);
      setItemsLookup(lookup);
    });
  }, [setExpandedLookup, site]);

  const resource = useLogicResource<DashboardItem[], DashboardItem[]>(parentItems, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

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
  };

  const onExpandedRow = (path: string, value: boolean) => {
    setExpandedLookup({ [path]: value });
  };

  const onItemMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem) => {
    const path = item.path;
    dispatch(completeDetailedItem({ path }));
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

  console.log(publishingTargetLookup);

  return (
    <Dashlet
      title={
        <FormattedMessage
          id="dashboardItemsApproval.itemsWaitingForApproval"
          defaultMessage="Items Waiting For Approval"
        />
      }
      expanded={expanded}
      onToggleExpanded={() => setExpanded(!expanded)}
      headerRightSection={
        <>
          <SecondaryButton onClick={onToggleCollapse} className={classes.collapseAll}>
            {showExpanded ? (
              <FormattedMessage id="dashboardItemsApproval.expandedAll" defaultMessage="Expand All" />
            ) : (
              <FormattedMessage id="dashboardItemsApproval.collapseAll" defaultMessage="Collapse All" />
            )}
          </SecondaryButton>
          <SecondaryButton onClick={onShowInProgress}>
            <FormattedMessage id="dashboardItemsApproval.showInProgress" defaultMessage='Show "In-Progress" items' />
          </SecondaryButton>
        </>
      }
    >
      <SuspenseWithEmptyState resource={resource}>
        <DashboardItemsApprovalGridUI
          resource={resource}
          expandedLookup={expandedLookup}
          publishingTargetLookup={publishingTargetLookup}
          itemsLookup={itemsLookup}
          onExpandedRow={onExpandedRow}
          onItemMenuClick={onItemMenuClick}
        />
      </SuspenseWithEmptyState>
    </Dashlet>
  );
}
