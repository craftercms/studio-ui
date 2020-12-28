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

import { Facet } from '../../models/Search';
import { LookupTable } from '../../models/LookupTable';
import { defineMessages, useIntl } from 'react-intl';
import { formatBytes } from '../../utils/string';
import RadioGroup from '@material-ui/core/RadioGroup';
import { nnou } from '../../utils/object';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  checkboxLabel: {
    width: '100%',
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical'
  },
  checkboxRoot: {
    marginRight: '5px'
  }
}));

const messages = defineMessages({
  under: {
    id: 'searchFilter.under',
    defaultMessage: 'Under {value}{unit}'
  },
  above: {
    id: 'searchFilter.above',
    defaultMessage: 'Above {value}{unit}'
  }
});

interface FilterRadiosProps {
  facetData: Facet;
  facet: string;
  checkedFilters: LookupTable;

  handleRadioClick(value: string, facet: string): any;
}

export default function SiteSearchFilterRadios(props: FilterRadiosProps) {
  const { facetData, facet, handleRadioClick, checkedFilters } = props;
  const items = facetData.values;
  const classes = useStyles({});
  const { formatMessage } = useIntl();

  const formatValue = (facet: string, key: string, value: any) => {
    if (facetData.date) {
      return `${value.from}TODATE${value.to}ID${facet}${key}`;
    } else if (facetData.range) {
      return `${value.from !== '-Infinity' ? value.from : ''}TO${value.to !== 'Infinity' ? value.to : ''}`;
    } else {
      return key;
    }
  };

  const formatLabel = (facet: string, key: string, value: any) => {
    if (facet === 'size') {
      if (value.from === '-Infinity') {
        return `${formatMessage(messages.under, { value: formatBytes(value.to), unit: '' })}`;
      } else if (value.to === 'Infinity') {
        return `${formatMessage(messages.above, { value: formatBytes(value.from), unit: '' })}`;
      } else {
        return `${formatBytes(value.from)} - ${formatBytes(value.to)}`;
      }
    } else if (facet === 'width' || facet === 'height') {
      if (value.from === '-Infinity') {
        return `${formatMessage(messages.under, { value: value.to, unit: 'px' })}`;
      } else if (value.to === 'Infinity') {
        return `${formatMessage(messages.above, { value: value.from, unit: 'px' })}`;
      } else {
        return `${value.from}px - ${value.to}px`;
      }
    }
    return key;
  };

  return (
    <RadioGroup>
      {Object.keys(items).map((key) => {
        let count = nnou(items[key].count) ? items[key].count : items[key];
        let label = formatLabel(facet, key, items[key]);
        let value = formatValue(facet, key, items[key]);
        return (
          <FormControlLabel
            key={key}
            name={key}
            onChange={(e: any) => handleRadioClick(e.target.value, facet)}
            control={
              <Radio checked={checkedFilters && checkedFilters[facet] === value} color="primary" value={value} />
            }
            label={`${label} (${count})`}
            labelPlacement="start"
            classes={{ root: classes.checkboxRoot, label: classes.checkboxLabel }}
          />
        );
      })}
    </RadioGroup>
  );
}
