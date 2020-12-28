/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { ElasticParams, Filter as FilterType } from '../../models/Search';
import { defineMessages, useIntl } from 'react-intl';
import Select from '@material-ui/core/Select';
import clsx from 'clsx';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  select: {
    width: '100%',
    '&.last': {
      marginTop: '10px'
    }
  }
}));

const messages = defineMessages({
  asc: {
    id: 'searchFilter.asc',
    defaultMessage: 'Ascending'
  },
  desc: {
    id: 'searchFilter.desc',
    defaultMessage: 'Descending'
  },
  moreRelevantFirst: {
    id: 'searchFilter.byRelevanceDescMessage',
    defaultMessage: 'Most relevant first'
  },
  lessRelevantFirst: {
    id: 'searchFilter.byRelevanceAscMessage',
    defaultMessage: 'Less relevant first'
  }
});

interface SortOrderProps {
  queryParams: Partial<ElasticParams>;

  handleFilterChange(filter: FilterType, isFilter?: boolean): any;
}

export default function SiteSearchSortOrder(props: SortOrderProps) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { queryParams, handleFilterChange } = props;
  // queryParams['sortBy'] === undefined: this means the current filter is the default === _score
  const isRelevance = queryParams['sortBy'] === '_score' || queryParams['sortBy'] === undefined;
  const options = isRelevance
    ? [
        {
          name: formatMessage(messages.moreRelevantFirst),
          value: 'desc'
        },
        {
          name: formatMessage(messages.lessRelevantFirst),
          value: 'asc'
        }
      ]
    : [
        {
          name: formatMessage(messages.asc),
          value: 'asc'
        },
        {
          name: formatMessage(messages.desc),
          value: 'desc'
        }
      ];
  return (
    <Select
      value={queryParams['sortOrder'] || 'desc'}
      className={clsx(classes.select, 'last')}
      onChange={(event) => handleFilterChange({ name: 'sortOrder', value: event.target.value })}
    >
      <MenuItem value={options[0].value}>{options[0].name}</MenuItem>
      <MenuItem value={options[1].value}>{options[1].name}</MenuItem>
    </Select>
  );
}
