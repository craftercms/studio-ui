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

import { Subject } from 'rxjs';
import { useEffect, useRef } from 'react';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export function useDebouncedInput(observer: (keywords: string) => any, time: number = 250): Subject<string> {
  const subject$Ref = useRef(new Subject<string>());
  useEffect(() => {
    const subscription = subject$Ref.current.pipe(debounceTime(time), distinctUntilChanged()).subscribe(observer);
    return () => subscription.unsubscribe();
  }, [observer, time]);
  return subject$Ref.current;
}
