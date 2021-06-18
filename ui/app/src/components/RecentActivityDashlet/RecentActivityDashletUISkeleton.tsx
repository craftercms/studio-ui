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
import TableContainer from '@material-ui/core/TableContainer';
import useStyles from './styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Skeleton from '@material-ui/lab/Skeleton';
import { rand } from '../PathNavigator/utils';
import Typography from '@material-ui/core/Typography';

export interface RecentActivityDashletUiSkeletonProps {
  numOfItems?: number;
}

export default function RecentActivityDashletUiSkeleton(props: RecentActivityDashletUiSkeletonProps) {
  const classes = useStyles();
  const { numOfItems = 2 } = props;
  const items = new Array(numOfItems).fill(null);

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered width5">
              <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width40">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentActivity.publishDate" defaultMessage="Publish Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentActivity.lastEditedBy" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.myLastEdit" defaultMessage="My Last Edit" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width5" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <GlobalAppGridRow key={i}>
              <GlobalAppGridCell className="checkbox">
                <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="ellipsis width40 padded0">
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                <Skeleton variant="text" width="50px" />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                <Skeleton variant="text" width={`${rand(50, 60)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width10">
                <Skeleton variant="text" width={`${rand(50, 60)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width5">
                <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
