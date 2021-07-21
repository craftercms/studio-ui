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
import TableSortLabel from '@material-ui/core/TableSortLabel';
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
import GlobalState from '../../models/GlobalState';
import { asLocalizedDateTime } from '../../utils/datetime';
import Tooltip from '@material-ui/core/Tooltip';

export interface RecentActivityDashletUiProps {
  resource: Resource<DetailedItem[]>;
  selectedLookup: LookupTable<boolean>;
  isAllChecked: boolean;
  isIndeterminate: boolean;
  locale: GlobalState['uiConfig']['locale'];
  sortType: 'asc' | 'desc';
  sortBy: string;
  toggleSortType(): void;
  setSortBy(by): void;
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
    locale,
    sortType,
    sortBy,
    setSortBy,
    toggleSortType,
    onClickSelectAll
  } = props;
  const items = resource.read();
  const classes = useStyles();

  const comparator = (fieldA, fieldB) => {
    if (sortType === 'asc') {
      return fieldA > fieldB ? 1 : -1;
    } else {
      return fieldA < fieldB ? 1 : -1;
    }
  };
  const sortItems = (a: DetailedItem, b: DetailedItem) => {
    let fieldA, fieldB;
    switch (sortBy) {
      case 'label':
        fieldA = a.label;
        fieldB = b.label;
        break;
      case 'dateModified':
        fieldA = a.sandbox.dateModified;
        fieldB = b.sandbox.dateModified;
        break;
      case 'lastPublishedDate':
        fieldA = a.live.datePublished;
        fieldB = b.live.datePublished;
        break;
    }
    return comparator(fieldA, fieldB);
  };

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered width5">
              <Checkbox indeterminate={isIndeterminate} checked={isAllChecked} onChange={() => onClickSelectAll()} />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width40">
              <TableSortLabel
                active={sortBy === 'label'}
                direction={sortType}
                onClick={() => {
                  setSortBy('label');
                  toggleSortType();
                }}
              >
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.item" defaultMessage="Item" />
                </Typography>
              </TableSortLabel>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20">
              <TableSortLabel
                active={sortBy === 'lastPublishedDate'}
                direction={sortType}
                onClick={() => {
                  setSortBy('lastPublishedDate');
                  toggleSortType();
                }}
              >
                <Typography variant="subtitle2">
                  <FormattedMessage id="recentActivity.publishDate" defaultMessage="Publish Date" />
                </Typography>
              </TableSortLabel>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentActivity.lastEditedBy" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <TableSortLabel
                active={sortBy === 'dateModified'}
                direction={sortType}
                onClick={() => {
                  setSortBy('dateModified');
                  toggleSortType();
                }}
              >
                <Typography variant="subtitle2">
                  <FormattedMessage id="recentlyPublished.myLastEdit" defaultMessage="My Last Edit" />
                </Typography>
              </TableSortLabel>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width5" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.sort(sortItems).map((item) => (
            <GlobalAppGridRow key={item.id} onClick={() => onItemChecked([item.path])}>
              <GlobalAppGridCell className="checkbox width5">
                <Checkbox checked={Boolean(selectedLookup[item.path])} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="ellipsis width40 padded0">
                <ItemDisplay item={item} showNavigableAsLinks={false} />
                <Typography
                  title={item.path}
                  variant="caption"
                  component="p"
                  className={clsx(classes.itemPath, classes.ellipsis)}
                >
                  {item.path}
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                {item.live &&
                  asLocalizedDateTime(item.live.datePublished, locale.localeCode, locale.dateTimeFormatOptions)}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">{item.sandbox.modifier}</GlobalAppGridCell>
              <GlobalAppGridCell className="width10">
                {asLocalizedDateTime(item.sandbox.dateModified, locale.localeCode, locale.dateTimeFormatOptions)}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width5">
                <Tooltip title={<FormattedMessage id="words.options" defaultMessage="Options" />}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onOptionsButtonClick(e, item);
                    }}
                  >
                    <MoreVertRounded />
                  </IconButton>
                </Tooltip>
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
