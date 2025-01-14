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

import { LookupTable } from '../../models/LookupTable';
import { Filter as FilterType } from '../../models/Search';
import { defineMessages, useIntl } from 'react-intl';
import Button from '@mui/material/Button';
import SiteSearchFilterCheckboxes from '../SiteSearchFilterCheckboxes';
import SiteSearchFilterRadios from '../SiteSearchFilterRadios';
import SiteSearchRangeSelector from '../SiteSearchRangeSelector';
import React from 'react';
import Box from '@mui/material/Box';

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
  facetLabelLookup: LookupTable;
  checkedFilters: LookupTable;
  handleFilterChange(filter: FilterType, isFilter: boolean): any;
  handleClearClick(filter: string): void;
  setCheckedFilters(checkedFilters: object): any;
}

export function SiteSearchFilter(props: FilterProps) {
  const { formatMessage } = useIntl();
  const {
    facet,
    handleFilterChange,
    facetsLookupTable,
    facetLabelLookup,
    checkedFilters,
    setCheckedFilters,
    handleClearClick
  } = props;

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
      <Box sx={{ textAlign: 'right' }}>
        <Button variant="outlined" sx={{ m: 1 }} onClick={() => handleClearClick(facet)}>
          {formatMessage(messages.clear)}
        </Button>
        {facetsLookupTable[facet].multiple && (
          <Button variant="contained" color="primary" sx={{ m: 1 }} onClick={() => handleApplyClick(facet)}>
            {formatMessage(messages.apply)}
          </Button>
        )}
      </Box>
      <div className={'filterBody'}>
        {facetsLookupTable[facet].multiple ? (
          <SiteSearchFilterCheckboxes
            facetData={facetsLookupTable[facet]}
            facet={facet}
            facetLabelLookup={facetLabelLookup}
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

export default SiteSearchFilter;
