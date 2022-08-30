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

import { DetailedItem } from '../models';
import { useEffect, useState } from 'react';
import { fetchDetailedItem } from '../services/content';
import useActiveSiteId from './useActiveSiteId';

export function useDetailedItemNoState(path: string): DetailedItem {
  const [item, setItem] = useState(null);
  const siteId = useActiveSiteId();

  useEffect(() => {
    fetchDetailedItem(siteId, path).subscribe(setItem);
  }, [siteId, path]);

  return item;
}
