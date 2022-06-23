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

import { Filter as FilterType } from '../../models/Search';
import { defineMessages, useIntl } from 'react-intl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { camelize } from '../../utils/string';
import React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
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
  sortBy?: string;
  filterKeys: string[];
  handleFilterChange(filter: FilterType, isFilter?: boolean): any;
}

export function SiteSearchSortBy(props: SortByProps) {
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const { handleFilterChange, filterKeys, sortBy = '_score' } = props;

  return (
    <Select
      value={sortBy}
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

export default SiteSearchSortBy;
