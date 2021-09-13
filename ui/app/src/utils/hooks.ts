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

import { Dispatch, EffectCallback, SetStateAction, useEffect, useMemo, useReducer, useRef } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export function useSpreadState<S>(initialState: S): [S, Dispatch<SetStateAction<Partial<S>>>] {
  return useReducer((state, nextState) => ({ ...state, ...nextState }), initialState);
}

export function useSubject<T = unknown>() {
  return useMemo(() => new Subject<T>(), []);
}

export function useDebouncedInput(observer: (keywords: string) => any, time: number = 250): Subject<string> {
  const subject$Ref = useRef(new Subject<string>());
  useEffect(() => {
    const subscription = subject$Ref.current.pipe(debounceTime(time), distinctUntilChanged()).subscribe(observer);
    return () => subscription.unsubscribe();
  }, [observer, time]);
  return subject$Ref.current;
}

export function useMount(onMount: EffectCallback): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onMount, []);
}
