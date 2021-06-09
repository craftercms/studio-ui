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

import React, { useEffect, useState } from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import Typography from '@material-ui/core/Typography';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import useStyles from './styles';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import { fetchLegacyGetGoLiveItems } from '../../services/dashboard';
import { useActiveSiteId, useLogicResource, useSpreadState } from '../../utils/hooks';
import { DetailedItem, SandboxItem } from '../../models/Item';
import DashboardItemsApprovalGridUI from '../DashboardItemsApprovalGrid';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import LookupTable from '../../models/LookupTable';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath, parseLegacyItemToSandBoxItem } from '../../utils/content';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';

export interface DashboardItem {
  label: string;
  path: string;
}

export default function DashboardItemsApproval() {
  const classes = useStyles();
  const site = useActiveSiteId();
  const [parentItems, setParentItems] = useState<DashboardItem[]>();
  const [expanded, setExpanded] = useState(true);
  const [expandedLookup, setExpandedLookup] = useSpreadState<LookupTable<boolean>>({});
  const [itemsLookup, setItemsLookup] = useState<LookupTable<SandboxItem[]>>({});
  const dispatch = useDispatch();

  useEffect(() => {
    fetchLegacyGetGoLiveItems(site, 'eventDate').subscribe((response) => {
      const items: DashboardItem[] = [];
      const lookup = {};
      response.documents.forEach((item) => {
        items.push({ label: item.name, path: item.uri });
        lookup[item.uri] = item.children.map((item) => parseLegacyItemToSandBoxItem(item));
      });
      setParentItems(items);
      setItemsLookup(lookup);
    });
  }, [site]);

  const resource = useLogicResource<DashboardItem[], DashboardItem[]>(parentItems, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  const onCollapseAll = (e) => {
    e.stopPropagation();
  };

  const onShowInProgress = (e) => {
    e.stopPropagation();
  };

  const onExpandedRow = (path: string, value: boolean) => {
    setExpandedLookup({ [path]: value });
  };

  const onItemMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: SandboxItem) => {
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

  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        classes={{ content: classes.summary }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography>
          <FormattedMessage
            id="dashboardItemsApproval.itemsWaitingForApproval"
            defaultMessage="Items Waiting For Approval"
          />
        </Typography>
        <section className={classes.options}>
          <SecondaryButton onClick={onCollapseAll}>
            <FormattedMessage id="dashboardItemsApproval.collapseAll" defaultMessage="Collapse All" />
          </SecondaryButton>
          <SecondaryButton onClick={onShowInProgress}>
            <FormattedMessage id="dashboardItemsApproval.showInProgress" defaultMessage='Show "In-Progress" items' />
          </SecondaryButton>
        </section>
      </AccordionSummary>
      <AccordionDetails>
        <SuspenseWithEmptyState resource={resource}>
          <DashboardItemsApprovalGridUI
            resource={resource}
            expandedLookup={expandedLookup}
            itemsLookup={itemsLookup}
            onExpandedRow={onExpandedRow}
            onItemMenuClick={onItemMenuClick}
          />
        </SuspenseWithEmptyState>
      </AccordionDetails>
    </Accordion>
  );
}
