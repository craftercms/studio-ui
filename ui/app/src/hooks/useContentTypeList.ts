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

import ContentType from '../models/ContentType';
import { useContentTypes } from './useContentTypes';
import { useMemo } from 'react';

export function useContentTypeList(filterFn: (type: ContentType) => boolean): Array<ContentType>;
export function useContentTypeList(): Array<ContentType>;
export function useContentTypeList(filterFn: (type: ContentType) => boolean = null): Array<ContentType> {
  const byId = useContentTypes();
  return useMemo(
    () => {
      if (!byId) {
        return null;
      } else {
        const list = Object.values(byId);
        return Boolean(filterFn) ? list.filter(filterFn) : list;
      }
    },
    // Filter omitted purposely to facilitate use without need
    // to memoize filterFn on the consumer side
    // eslint-disable-next-line
    [byId]
  );
}
