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
import Button from '@material-ui/core/Button';
import SiteSearchFilterCheckboxes from '../SiteSearchFilterCheckboxes';
import SiteSearchFilterRadios from '../SiteSearchFilterRadios';
import SiteSearchRangeSelector from '../SiteSearchRangeSelector';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  filterActions: {
    textAlign: 'right'
  },
  button: {
    margin: theme.spacing(1)
  }
}));

const messages = defineMessages({
  apply: {
    id: 'words.apply',
    defaultMessage: 'Apply'
  },
  clear: {
    id: 'words.clear',
    defaultMessage: 'Clear'
  }
});

interface FilterProps {
  facet: string;
  facetsLookupTable: LookupTable;
  checkedFilters: LookupTable;

  handleFilterChange(filter: FilterType, isFilter: boolean): any;
  handleClearClick(filter: string): void;
  setCheckedFilters(checkedFilters: object): any;
}

export default function SiteSearchFilter(props: FilterProps) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const { facet, handleFilterChange, facetsLookupTable, checkedFilters, setCheckedFilters, handleClearClick } = props;

  const handleCheckboxClick = (key: string, checked: boolean, facet: string) => {
    const facetFilter = checkedFilters[facet] || {};
    facetFilter[key] = checked;
    setCheckedFilters({ ...checkedFilters, [facet]: facetFilter });
  };

  const handleRadioClick = (value: string, facet: string) => {
    if (value === '') {
      value = undefined;
    }
    handleFilterChange({ name: facet, value: value }, true);
  };

  const handleApplyClick = (facet: string) => {
    if (checkedFilters[facet]) {
      let values = Object.keys(checkedFilters[facet]).filter((name) => checkedFilters[facet][name]);
      if (values.length === 0) {
        values = undefined;
      }
      handleFilterChange({ name: facet, value: values }, true);
    }
  };

  return (
    <div>
      <div className={classes.filterActions}>
        <Button variant="outlined" className={classes.button} onClick={() => handleClearClick(facet)}>
          {formatMessage(messages.clear)}
        </Button>
        {facetsLookupTable[facet].multiple && (
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => handleApplyClick(facet)}
          >
            {formatMessage(messages.apply)}
          </Button>
        )}
      </div>
      <div className={'filterBody'}>
        {facetsLookupTable[facet].multiple ? (
          <SiteSearchFilterCheckboxes
            facetData={facetsLookupTable[facet]}
            facet={facet}
            handleCheckboxClick={handleCheckboxClick}
            checkedFilters={checkedFilters}
          />
        ) : (
          <>
            <SiteSearchFilterRadios
              facetData={facetsLookupTable[facet]}
              facet={facet}
              handleRadioClick={handleRadioClick}
              checkedFilters={checkedFilters}
            />
            {facetsLookupTable[facet].range && !facetsLookupTable[facet].date && (
              <SiteSearchRangeSelector
                facet={facet}
                handleFilterChange={handleFilterChange}
                checkedFilters={checkedFilters}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
