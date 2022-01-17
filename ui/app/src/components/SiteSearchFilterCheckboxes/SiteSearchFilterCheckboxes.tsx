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
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';

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

interface FilterCheckboxesProps {
  facetData: Facet;
  facet: string;
  checkedFilters: LookupTable;
  labelsLookupTable: LookupTable;

  handleCheckboxClick(key: string, checked: boolean, facet: string): any;
}

export function SiteSearchFilterCheckboxes(props: FilterCheckboxesProps) {
  const { facetData, facet, handleCheckboxClick, checkedFilters, labelsLookupTable } = props;
  const items = facetData.values;
  const classes = useStyles({});

  return (
    <FormGroup>
      {Object.keys(items).map((key) => {
        return (
          <FormControlLabel
            key={key}
            name={key}
            control={
              <Checkbox
                color="primary"
                checked={(checkedFilters && checkedFilters[facet] && checkedFilters[facet][key]) || false}
                value={key}
                onChange={(e) => handleCheckboxClick(key, e.target.checked, facet)}
              />
            }
            label={`${labelsLookupTable[key]} (${items[key]})`}
            labelPlacement="start"
            classes={{ root: classes.checkboxRoot, label: classes.checkboxLabel }}
          />
        );
      })}
    </FormGroup>
  );
}

export default SiteSearchFilterCheckboxes;
