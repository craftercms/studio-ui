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
import { DetailedItem } from '../../models/Item';
import { Resource } from '../../models/Resource';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import useStyles from './styles';
import Checkbox from '@material-ui/core/Checkbox';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import ItemDisplay from '../ItemDisplay';
import IconButton from '@material-ui/core/IconButton';
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import clsx from 'clsx';
import LookupTable from '../../models/LookupTable';

export interface RecentActivityDashletUiProps {
  resource: Resource<DetailedItem[]>;
  selectedLookup: LookupTable<boolean>;
  isAllChecked: boolean;
  isIndeterminate: boolean;
  onItemChecked(paths: string[], forceChecked?: boolean): void;
  onOptionsButtonClick?: any;
  onClickSelectAll(): void;
}

export default function RecentActivityDashletUI(props: RecentActivityDashletUiProps) {
  const {
    resource,
    onOptionsButtonClick,
    selectedLookup,
    onItemChecked,
    isAllChecked,
    isIndeterminate,
    onClickSelectAll
  } = props;
  const items = resource.read();
  const classes = useStyles();

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered width5">
              <Checkbox indeterminate={isIndeterminate} checked={isAllChecked} onChange={() => onClickSelectAll()} />
              {/* <Checkbox checked={isAllChecked} /> */}
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
          {items.map((item) => (
            <GlobalAppGridRow key={item.id} onClick={() => onItemChecked([item.path])}>
              <GlobalAppGridCell className="checkbox bordered width5">
                <Checkbox checked={Boolean(selectedLookup[item.path])} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="ellipsis width40 padded0">
                <ItemDisplay item={item} />
                <Typography
                  title={item.path}
                  variant="caption"
                  component="p"
                  className={clsx(classes.itemPath, classes.ellipsis)}
                >
                  {item.path}
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">published date</GlobalAppGridCell>
              <GlobalAppGridCell className="width20">last edited by</GlobalAppGridCell>
              <GlobalAppGridCell className="width10">my last edit</GlobalAppGridCell>
              <GlobalAppGridCell className="width5">
                <IconButton onClick={(e) => onOptionsButtonClick(e, item)}>
                  <MoreVertRounded />
                </IconButton>
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
