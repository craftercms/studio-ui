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

import { Subject } from 'rxjs';
import React, { useEffect } from 'react';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import useRef from './useUpdateRefs';

export function useDebouncedInput<T = string>(observer: (keywords: T) => any, time: number = 250): Subject<T> {
  const subject$Ref = React.useRef(new Subject<T>());
  const observerRef = useRef(observer);
  useEffect(() => {
    const subscription = subject$Ref.current.pipe(debounceTime(time), distinctUntilChanged()).subscribe((value) => {
      observerRef.current(value);
    });
    return () => subscription.unsubscribe();
  }, [time]);
  return subject$Ref.current;
}
