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
import MenuItem from '@material-ui/core/MenuItem';
import { camelize } from '../../utils/string';
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
  relevance: {
    id: 'words.relevance',
    defaultMessage: 'Relevance'
  },
  internalName: {
    id: 'searchFilter.internalName',
    defaultMessage: 'Name'
  },
  width: {
    id: 'words.width',
    defaultMessage: 'Width'
  },
  contentType: {
    id: 'searchFilter.contentType',
    defaultMessage: 'Content Type'
  },
  mimeType: {
    id: 'searchFilter.mimeType',
    defaultMessage: 'MIME Type'
  },
  size: {
    id: 'searchFilter.size',
    defaultMessage: 'Content Size'
  },
  lastEditDate: {
    id: 'searchFilter.lastEditDate',
    defaultMessage: 'Last Edit Date'
  },
  height: {
    id: 'words.height',
    defaultMessage: 'Height'
  }
});

interface SortByProps {
  queryParams: Partial<ElasticParams>;
  filterKeys: string[];

  handleFilterChange(filter: FilterType, isFilter?: boolean): any;
}

export default function SiteSearchSortBy(props: SortByProps) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { queryParams, handleFilterChange, filterKeys } = props;

  return (
    <Select
      value={queryParams['sortBy'] ?? '_score'}
      className={classes.select}
      onChange={(event) => handleFilterChange({ name: 'sortBy', value: event.target.value })}
    >
      <MenuItem value="_score">{formatMessage(messages.relevance)}</MenuItem>
      <MenuItem value="internalName">{formatMessage(messages.internalName)}</MenuItem>
      {filterKeys.map((name: string, i: number) => {
        return (
          <MenuItem value={name} key={i}>
            {formatMessage(messages[camelize(name)])}
          </MenuItem>
        );
      })}
    </Select>
  );
}
