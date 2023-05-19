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

import { MutableRefObject, RefObject, useRef } from 'react';

export function useUpdateRefs<T>(initialValue: T): MutableRefObject<T>;
export function useUpdateRefs<T>(initialValue: T | null): RefObject<T>;
export function useUpdateRefs<T>(latestValues: T): RefObject<T> | MutableRefObject<T> {
  const ref = useRef(latestValues);
  ref.current = latestValues;
  return ref;
}

export default useUpdateRefs;
