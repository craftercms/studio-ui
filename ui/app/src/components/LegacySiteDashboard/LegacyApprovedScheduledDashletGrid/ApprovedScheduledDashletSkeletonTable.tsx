/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { Fragment } from 'react';
import TableContainer from '@mui/material/TableContainer';
import useStyles from './styles';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import GlobalAppGridRow from '../../GlobalAppGridRow';
import GlobalAppGridCell from '../../GlobalAppGridCell';
import Skeleton from '@mui/material/Skeleton';
import LookupTable from '../../../models/LookupTable';
import { rand } from '../../PathNavigator/utils';
import { AwaitingApprovalDashletDashboardItem } from '../LegacyAwaitingApprovalDashlet';

interface ApprovedScheduledDashletSkeletonTableProps {
  numOfItems?: number;
  items?: AwaitingApprovalDashletDashboardItem[];
  expandedLookup?: LookupTable<boolean>;
}

export function ApprovedScheduledDashletSkeletonTable(props: ApprovedScheduledDashletSkeletonTableProps) {
  const classes = useStyles();
  const { numOfItems = 4 } = props;

  const items = props.items?.length
    ? props.items
    : new Array(numOfItems).fill(null).map((x, i) => ({
        label: i.toString(),
        path: i.toString(),
        children: []
      }));
  const expandedLookup = props.expandedLookup ?? {};

  return (
    <TableContainer>
      <Table className={classes.tableRoot} size="small">
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox">
              <Skeleton variant="circular" width={30} height={30} className={classes.skeletonCheckbox} />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width40 padded0">
              <FormattedMessage id="dashboardItemsApproval.item" defaultMessage="Item" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.publishingTarget" defaultMessage="Publishing Target" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width25 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.lastEditedBy" defaultMessage="Package Id" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.lastEdited" defaultMessage="Last Edited" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="checkbox" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((dashboardItem, i) => (
            <Fragment key={i}>
              <GlobalAppGridRow>
                <GlobalAppGridCell colSpan={7} className="padded0">
                  <Box display="flex" alignItems="center">
                    <Skeleton variant="circular" width={30} height={30} className={classes.skeletonCheckbox} />
                    <Skeleton variant="text" height="20px" width={`${rand(20, 50)}%`} />
                  </Box>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell colSpan={7} className="padded0 borderless">
                  <Collapse in={expandedLookup[dashboardItem.path]}>
                    <Table size="small" className={classes.tableRoot}>
                      <TableBody>
                        {dashboardItem.children.map((item, i) => (
                          <GlobalAppGridRow key={i}>
                            <GlobalAppGridCell className="checkbox">
                              <Skeleton
                                variant="circular"
                                width={30}
                                height={30}
                                className={classes.skeletonCheckbox}
                              />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width40 padded0">
                              <Skeleton variant="text" width={`${rand(70, 90)}%`} />
                              <Skeleton variant="text" width={`${rand(70, 90)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width15">
                              <Skeleton variant="text" width="50px" />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width15">
                              <Skeleton variant="text" width={`${rand(50, 60)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width25">
                              <Skeleton variant="text" width={`${rand(60, 90)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="checkbox">
                              <Skeleton
                                variant="circular"
                                width={30}
                                height={30}
                                className={classes.skeletonCheckbox}
                              />
                            </GlobalAppGridCell>
                          </GlobalAppGridRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Collapse>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ApprovedScheduledDashletSkeletonTable;
