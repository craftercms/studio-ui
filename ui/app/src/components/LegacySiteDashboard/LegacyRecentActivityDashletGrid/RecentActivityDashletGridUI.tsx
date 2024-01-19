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

import React, { useCallback, useMemo } from 'react';
import { DetailedItem } from '../../../models/Item';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import GlobalAppGridRow from '../../GlobalAppGridRow';
import GlobalAppGridCell from '../../GlobalAppGridCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import useStyles from './styles';
import Checkbox from '@mui/material/Checkbox';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import ItemDisplay from '../../ItemDisplay';
import IconButton from '@mui/material/IconButton';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import LookupTable from '../../../models/LookupTable';
import GlobalState from '../../../models/GlobalState';
import { asLocalizedDateTime } from '../../../utils/datetime';
import Tooltip from '@mui/material/Tooltip';
import { getDatePublished, getDateScheduled } from '../../../utils/content';

export interface RecentActivityDashletGridUIProps {
  items: DetailedItem[];
  selectedLookup: LookupTable<boolean>;
  isAllChecked: boolean;
  isIndeterminate: boolean;
  locale: GlobalState['uiConfig']['locale'];
  sortType: 'asc' | 'desc';
  sortBy: string;
  toggleSortType(): void;
  setSortBy(by): void;
  onItemChecked(path: string): void;
  onOptionsButtonClick?: any;
  onClickSelectAll(): void;
}

export function RecentActivityDashletGridUI(props: RecentActivityDashletGridUIProps) {
  const {
    items,
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
  const { classes, cx: clsx } = useStyles();

  const comparator = useCallback(
    (fieldA, fieldB) => {
      if (sortType === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    },
    [sortType]
  );

  const sortItems = useCallback(
    (a: DetailedItem, b: DetailedItem) => {
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
    },
    [comparator, sortBy]
  );

  const sortedItems = useMemo(() => {
    return [...items].sort(sortItems);
  }, [items, sortItems]);

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox">
              <Checkbox
                disabled={sortedItems?.length === 1 && sortedItems[0].stateMap.deleted}
                indeterminate={isIndeterminate}
                checked={isAllChecked}
                onChange={() => onClickSelectAll()}
              />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width40 pl0">
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
            <GlobalAppGridCell className="width20 ellipsis">
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
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentActivity.lastEditedBy" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
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
            <GlobalAppGridCell className="checkbox" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item) => (
            <GlobalAppGridRow
              key={item.id}
              onClick={
                item.stateMap.deleted
                  ? null
                  : () => {
                      onItemChecked(item.path);
                    }
              }
            >
              <GlobalAppGridCell className="checkbox">
                <Checkbox
                  disabled={item.stateMap.deleted}
                  checked={item.stateMap.deleted ? false : Boolean(selectedLookup[item.path])}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={() => {
                    onItemChecked(item.path);
                  }}
                />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="ellipsis width40 pl0">
                <ItemDisplay item={item} showNavigableAsLinks={false} showPublishingTarget={false} />
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
                {getDateScheduled(item) ? (
                  asLocalizedDateTime(getDateScheduled(item), locale.localeCode, locale.dateTimeFormatOptions)
                ) : getDatePublished(item) ? (
                  asLocalizedDateTime(getDatePublished(item), locale.localeCode, locale.dateTimeFormatOptions)
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    <FormattedMessage id="words.unpublished" defaultMessage="Unpublished" />
                  </Typography>
                )}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width15">{item.sandbox.modifier?.username ?? ''}</GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                {item.sandbox.dateModified &&
                  asLocalizedDateTime(item.sandbox.dateModified, locale.localeCode, locale.dateTimeFormatOptions)}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="checkbox">
                {item.stateMap.deleted ? (
                  <IconButton disabled={true} size="large">
                    <MoreVertRounded />
                  </IconButton>
                ) : (
                  <Tooltip title={<FormattedMessage id="words.options" defaultMessage="Options" />}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onOptionsButtonClick(e, item);
                      }}
                      size="large"
                    >
                      <MoreVertRounded />
                    </IconButton>
                  </Tooltip>
                )}
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default RecentActivityDashletGridUI;
