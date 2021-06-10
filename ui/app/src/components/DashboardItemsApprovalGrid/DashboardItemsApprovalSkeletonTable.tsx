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

import React, { Fragment } from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import useStyles from './styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Skeleton from '@material-ui/lab/Skeleton';
import { DetailedItem } from '../../models/Item';
import LookupTable from '../../models/LookupTable';
import { rand } from '../PathNavigator/utils';

interface DashboardItemsApprovalGridUIProps {
  numOfItems?: number;
  items?: { label: string; path: string }[];
  itemsLookup?: LookupTable<DetailedItem[]>;
  expandedLookup?: LookupTable<boolean>;
}

export default function DashboardItemsApprovalSkeletonTable(props: DashboardItemsApprovalGridUIProps) {
  const classes = useStyles();
  const { numOfItems = 4 } = props;

  const items = props.items
    ? props.items
    : new Array(numOfItems).fill(null).map((x, i) => ({
        label: i.toString(),
        path: i.toString()
      }));
  const expandedLookup = props.expandedLookup ?? {};
  const itemsLookup = props.itemsLookup ?? {};

  return (
    <TableContainer>
      <Table className={classes.tableRoot} size="small">
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered">
              <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width40 padded0">
              <FormattedMessage id="dashboardItemsApproval.itemName" defaultMessage="Item Name" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.publishingTarget" defaultMessage="Publishing Target" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.publishingDate" defaultMessage="Publishing Date" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.lastEditedBy" defaultMessage="Last Edited By" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.lastEdited" defaultMessage="Last Edited" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered checkbox"></GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <Fragment key={i}>
              <GlobalAppGridRow>
                <GlobalAppGridCell colSpan={7} className="expandableCell">
                  <Box display="flex">
                    <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
                    <Skeleton variant="text" width="100%" />
                  </Box>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell colSpan={7} className="padded0">
                  <Collapse in={expandedLookup[item.path]}>
                    <Table size="small" className={classes.tableRoot}>
                      <TableBody>
                        {itemsLookup[item.path]?.map((item, i) => (
                          <GlobalAppGridRow key={i}>
                            <GlobalAppGridCell className="checkbox">
                              <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="ellipsis width40 padded0">
                              <Skeleton variant="text" width={`${rand(70, 90)}%`} />
                              <Skeleton variant="text" width={`${rand(70, 90)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width15">
                              <Skeleton variant="text" width="50px" />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width15">
                              <Skeleton variant="text" width={`${rand(50, 60)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width15 ellipsis">
                              <Skeleton variant="text" width={`${rand(50, 60)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width15 ellipsis">
                              <Skeleton variant="text" width={`${rand(50, 60)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="checkbox">
                              <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
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
