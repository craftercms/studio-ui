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

import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import GlobalAppGridRow from '../../GlobalAppGridRow';
import GlobalAppGridCell from '../../GlobalAppGridCell';
import Skeleton from '@mui/material/Skeleton';
import { rand } from '../../PathNavigator/utils';
import Typography from '@mui/material/Typography';
import useStyles from './styles';

export interface RecentActivityDashletUiSkeletonProps {
  numOfItems?: number;
}

export function RecentActivityDashletUiSkeleton(props: RecentActivityDashletUiSkeletonProps) {
  const { classes } = useStyles();
  const { numOfItems = 2 } = props;
  const items = new Array(numOfItems).fill(null);

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox">
              <Skeleton variant="circular" width={30} height={30} className={classes.skeletonCheckbox} />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width40 pl0">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentActivity.publishDate" defaultMessage="Publishing Target" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentActivity.lastEditedBy" defaultMessage="Publishing Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.myLastEdit" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.myLastEdit" defaultMessage="Last Edited" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="checkbox" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <GlobalAppGridRow key={i}>
              <GlobalAppGridCell className="checkbox">
                <Skeleton variant="circular" width={30} height={30} className={classes.skeletonCheckbox} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width40 pl0">
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
                <Skeleton variant="text" width={`${rand(70, 90)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                <Skeleton variant="text" width="50px" />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width15">
                <Skeleton variant="text" width={`${rand(50, 60)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                <Skeleton variant="text" width={`${rand(60, 90)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                <Skeleton variant="text" width={`${rand(60, 90)}%`} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="checkbox">
                <Skeleton variant="circular" width={30} height={30} className={classes.skeletonCheckbox} />
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default RecentActivityDashletUiSkeleton;
