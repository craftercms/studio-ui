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

import React from 'react';
import { Resource } from '../../models/Resource';
import TableContainer from '@material-ui/core/TableContainer';
import useStyles from './styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@material-ui/core/Typography/Typography';
import { FormattedMessage } from 'react-intl';
import { Box, IconButton, TableBody } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import { LegacyItem } from '../../models/Item';

interface DashboardItemsApprovalGridUIProps {
  resource: Resource<LegacyItem[]>;
}

export default function DashboardItemsApprovalGridUI(props: DashboardItemsApprovalGridUIProps) {
  const { resource } = props;
  const items = resource.read();
  const classes = useStyles();

  return (
    <TableContainer>
      <Table className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="bordered padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.itemName" defaultMessage="Item Name" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.view" defaultMessage="View" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.url" defaultMessage="Url" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.publishingTarget" defaultMessage="Publishing Target" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.publishingDate" defaultMessage="Publishing Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.lastEditedBy" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered padded10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.lastEdited" defaultMessage="Last Edited" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <GlobalAppGridRow key={i} onClick={() => {}}>
              <GlobalAppGridCell colSpan={7}>
                <Box display="flex">
                  <IconButton size="small">
                    <ExpandMoreIcon />
                  </IconButton>
                  <Typography>{item.name}</Typography>
                </Box>
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
