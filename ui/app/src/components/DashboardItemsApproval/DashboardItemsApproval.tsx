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
import { useActiveSiteId, useLogicResource } from '../../utils/hooks';
import { LegacyItem } from '../../models/Item';
import DashboardItemsApprovalGridUI from '../DashboardItemsApprovalGrid';

export default function DashboardItemsApproval() {
  const classes = useStyles();
  const site = useActiveSiteId();
  const [items, setItems] = useState<LegacyItem[]>();

  useEffect(() => {
    fetchLegacyGetGoLiveItems(site, 'eventDate').subscribe((response) => {
      setItems(response.documents);
    });
  }, [site]);

  const onCollapseAll = (e) => {
    e.stopPropagation();
  };

  const onShowInProgress = (e) => {
    e.stopPropagation();
  };

  const resource = useLogicResource<LegacyItem[], LegacyItem[]>(items, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  return (
    <Accordion expanded={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} classes={{ content: classes.summary }}>
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
        <DashboardItemsApprovalGridUI resource={resource} />
      </AccordionDetails>
    </Accordion>
  );
}
