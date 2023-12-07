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

import { FilterSystemTypeGroups } from '../models';
import SystemType from '../models/SystemType';
import { useMemo, useState } from 'react';
import { getDashletFilterSystemTypeGroups, setDashletFilterSystemTypeGroups } from '../utils/state';
import { filterOptionsLookup } from '../components/ActivityDashlet/DashletFilter';
import useActiveSite from './useActiveSite';

export function useDashletFilterState(storageKey: string): {
  selectedKeys: FilterSystemTypeGroups[];
  onChange(e: Event, key: FilterSystemTypeGroups): void;
  selectedTypes: SystemType[];
} {
  const { uuid } = useActiveSite();
  const [selectedKeys, setSelectedKeys] = useState<FilterSystemTypeGroups[]>(
    () => getDashletFilterSystemTypeGroups(uuid, storageKey) ?? ['all']
  );
  const getUpdatedKeys = (key: FilterSystemTypeGroups) => {
    let updatedKeys =
      key === 'all'
        ? [key]
        : selectedKeys.includes(key)
          ? selectedKeys.filter((k) => k !== key)
          : [...selectedKeys.filter((k) => k !== 'all'), key];
    if (updatedKeys.length === 0) {
      updatedKeys = ['all'];
    }
    return updatedKeys;
  };

  const selectedTypes = useMemo(() => {
    const types = [];
    selectedKeys.forEach((key) => {
      key && types.push(...filterOptionsLookup[key].types);
    });
    return types;
  }, [selectedKeys]);

  const onChange = (e: Event, key: FilterSystemTypeGroups) => {
    const newKeys = getUpdatedKeys(key);
    setSelectedKeys(newKeys);
    setDashletFilterSystemTypeGroups(uuid, storageKey, newKeys);
  };

  return {
    selectedKeys,
    onChange,
    selectedTypes
  };
}

export default useDashletFilterState;
