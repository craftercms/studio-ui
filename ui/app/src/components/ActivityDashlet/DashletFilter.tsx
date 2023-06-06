/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { LookupTable } from '../../models';
import SystemType from '../../models/SystemType';
import { FormattedMessage } from 'react-intl';
import { DropDownMenu } from '../DropDownMenuButton';
import React, { ReactElement, useEffect, useMemo } from 'react';
import { useSelectionLookupState } from './utils';

const filterOptionsLookup: LookupTable<{
  name: ReactElement;
  types: Array<SystemType>;
}> = {
  all: {
    name: <FormattedMessage defaultMessage="All" />,
    types: []
  },
  item: {
    name: <FormattedMessage defaultMessage="Item" />,
    types: ['page', 'component', 'levelDescriptor', 'taxonomy']
  },
  asset: {
    name: <FormattedMessage defaultMessage="Asset" />,
    types: ['asset']
  },
  contentType: {
    name: <FormattedMessage defaultMessage="Content Type" />,
    types: [] // TODO: see what's the one in here
  },
  template: {
    name: <FormattedMessage defaultMessage="Template" />,
    types: ['renderingTemplate']
  },
  script: {
    name: <FormattedMessage defaultMessage="Script" />,
    types: ['script']
  },
  other: {
    name: <FormattedMessage defaultMessage="Other" />,
    types: ['file', 'folder', 'unknown'] // TODO: should unknown be here?
  }
};

export interface DashletFilterProps {
  onSelectFilter: (types: Array<SystemType>) => void;
}

export function DashletFilter(props: DashletFilterProps) {
  const { onSelectFilter } = props;
  const [selectedFilters, setSelectedFilters, filters] = useSelectionLookupState({ all: true }, 'all');

  const options = useMemo(
    () =>
      Object.keys(filterOptionsLookup).map((key) => ({
        id: key,
        primaryText: filterOptionsLookup[key].name,
        selected: selectedFilters[key]
      })),
    [selectedFilters]
  );

  useEffect(() => {
    const types = [];
    filters.forEach((filter) => {
      types.push(...filterOptionsLookup[filter].types);
    });
    onSelectFilter?.(types);
  }, [filters, onSelectFilter]);

  return (
    <DropDownMenu
      size="small"
      variant="text"
      onMenuItemClick={(e, id) => setSelectedFilters(id)}
      options={options}
      closeOnSelection={false}
      menuProps={{ sx: { minWidth: 180 } }}
      listItemProps={{ dense: true }}
    >
      {selectedFilters.all ? (
        <FormattedMessage defaultMessage="Filter By..." />
      ) : (
        <FormattedMessage defaultMessage="Filter Active ({count})" values={{ count: filters.length }} />
      )}
    </DropDownMenu>
  );
}

export default DashletFilter;
