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

import { LookupTable } from '../../models/LookupTable';
import { Filter as FilterType } from '../../models/Search';
import { defineMessages, useIntl } from 'react-intl';
import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  rangePicker: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px'
  },
  space: {
    margin: '0 5px'
  },
  rangeTextField: {
    width: '60px',
    margin: '0',
    flexGrow: 1
  },
  rangeButton: {
    marginLeft: '10px'
  }
}));

const messages = defineMessages({
  go: {
    id: 'words.go',
    defaultMessage: 'Go'
  },
  min: {
    id: 'words.min',
    defaultMessage: 'Min'
  },
  max: {
    id: 'words.max',
    defaultMessage: 'Max'
  }
});

interface RangeSelectorProps {
  facet: string;
  checkedFilters: LookupTable;

  handleFilterChange(filter: FilterType, isFilter: boolean): any;
}

export default function SiteSearchRangeSelector(props: RangeSelectorProps) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { facet, handleFilterChange, checkedFilters } = props;
  const [range, setRange] = useState({ min: '', max: '' });

  useEffect(
    function() {
      let minMax = { min: '', max: '' };
      if (checkedFilters && checkedFilters[facet]) {
        let range = checkedFilters[facet].split('TO');
        minMax = {
          min: range[0],
          max: range[1]
        };
      }
      setRange(minMax);
    },
    [checkedFilters, facet]
  );

  const handleRangeSelector = (facet: string) => {
    let value = `${range.min}TO${range.max}`;
    if (range.min === '' && range.max === '') {
      value = undefined;
    }
    handleFilterChange({ name: facet, value: value }, true);
  };

  const handleOnChange = (value: string, type: string) => {
    setRange({ ...range, [type]: value });
  };

  return (
    <div className={classes.rangePicker}>
      <TextField
        name={`${facet}min`}
        value={range.min}
        onChange={(e) => handleOnChange(e.target.value, 'min')}
        placeholder={formatMessage(messages.min)}
        margin="normal"
        className={classes.rangeTextField}
      />
      <span className={classes.space}>-</span>
      <TextField
        name={`${facet}max`}
        value={range.max}
        onChange={(e) => handleOnChange(e.target.value, 'max')}
        placeholder={formatMessage(messages.max)}
        margin="normal"
        className={classes.rangeTextField}
      />
      <Button
        variant="contained"
        color="primary"
        className={classes.rangeButton}
        onClick={() => handleRangeSelector(facet)}
      >
        {formatMessage(messages.go)}
      </Button>
    </div>
  );
}
