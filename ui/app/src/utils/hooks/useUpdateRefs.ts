/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { MutableRefObject, useRef } from 'react';

export function useUpdateRefs<T>(latestValues: T): MutableRefObject<T | undefined> {
  const ref = useRef({} as T);
  for (let prop in latestValues) {
    ref.current[prop] = latestValues[prop];
  }
  return ref;
}

export default useUpdateRefs;
