/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { shallowEqual, useSelector } from 'react-redux';
import GlobalState, { GuestData } from '../models/GlobalState';
import { Dispatch, EffectCallback, SetStateAction, useEffect, useReducer, useRef, useState } from 'react';
import { nnou } from './object';
import { Resource } from '../models/Resource';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export function useShallowEqualSelector<T = any>(selector: (state: GlobalState) => T): T {
  return useSelector<GlobalState, T>(selector, shallowEqual);
}

export const useSelection: (<T = any>(
  selectorFn: (state: GlobalState) => T,
  equalityFn?: (left: T, right: T) => boolean
) => T) = (process.env.NODE_ENV === 'production') ? useSelector : <T = any>(
  selector, equalityFn
) => useSelector<GlobalState, T>(selector, equalityFn);

export function useActiveSiteId(): string {
  return useSelector<GlobalState, string>(state => state.sites.active);
}

export function usePreviewGuest(): GuestData {
  return useSelector<GlobalState, GuestData>(state => state.preview.guest);
}

export function usePreviewState(): GlobalState['preview'] {
  return useSelector<GlobalState, GlobalState['preview']>(state => state.preview);
}

export function useEnv(): GlobalState['env'] {
  return useSelector<GlobalState, GlobalState['env']>(state => state.env);
}

export function useActiveUser(): GlobalState['user'] {
  return useSelector<GlobalState, GlobalState['user']>(state => state.user);
}

export function createResource<T>(factoryFn: () => Promise<T>): Resource<T> {
  let result, promise, resource, status = 'pending';
  promise = factoryFn().then(
    (response) => {
      status = 'success';
      result = response;
    },
    (error) => {
      status = 'error';
      result = error;
    }
  );
  resource = {
    complete: false,
    read() {
      if (status === 'pending') {
        throw promise;
      } else if (status === 'error') {
        resource.complete = true;
        throw result;
      } else if (status === 'success') {
        resource.complete = true;
        return result;
      }
    }
  };
  return resource;
}

export function createResourceBundle<T>(): [Resource<T>, (value?: unknown) => void, (reason?: any) => void] {
  let resolve, reject;
  let promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return [
    createResource(() => promise),
    resolve,
    reject
  ];
}

export function useResolveWhenNotNullResource(source) {

  const [bundle, setBundle] = useState(createResourceBundle);
  const [resource, resolve] = bundle;
  const effect = () => {
    if (resource.complete) {
      setBundle(createResourceBundle);
    } else if (nnou(source)) {
      resolve(source);
    }
  };

  useEffect(effect, [source, bundle]);

  return resource;

}

export function useStateResourceSelection<ReturnType = any, SourceType = GlobalState, ErrorType = any>(
  sourceSelector: (state: GlobalState) => SourceType,
  checkers: {
    shouldResolve: (source: SourceType, resource: Resource<ReturnType>) => boolean,
    shouldReject: (source: SourceType, resource: Resource<ReturnType>) => boolean,
    shouldRenew: (source: SourceType, resource: Resource<ReturnType>) => boolean,
    resultSelector: (source: SourceType, resource: Resource<ReturnType>) => ReturnType,
    errorSelector: (source: SourceType, resource: Resource<ReturnType>) => ErrorType
  }
): Resource<ReturnType> {
  const state = useSelection<SourceType>(sourceSelector);
  return useStateResource(state, checkers);
}

export function useStateResource<ReturnType = any, SourceType = GlobalState>(
  source: SourceType,
  checkers: {
    shouldResolve: (source: SourceType, resource: Resource<ReturnType>) => boolean,
    shouldReject: (source: SourceType, resource: Resource<ReturnType>) => boolean,
    shouldRenew: (source: SourceType, resource: Resource<ReturnType>) => boolean,
    resultSelector: (source: SourceType, resource: Resource<ReturnType>) => ReturnType,
    errorSelector: (source: SourceType, resource: Resource<ReturnType>) => any
  }
): Resource<ReturnType> {

  const [bundle, setBundle] = useState(() => createResourceBundle<ReturnType>());
  const [resource, resolve, reject] = bundle;
  const effectFn = () => {
    const { shouldRenew, shouldReject, shouldResolve, errorSelector, resultSelector } = checkers;
    if (shouldRenew(source, resource)) {
      setBundle(createResourceBundle);
    } else if (shouldReject(source, resource)) {
      reject(errorSelector(source, resource));
    } else if (shouldResolve(source, resource)) {
      resolve(resultSelector(source, resource));
    }
  };

  // Purposely not adding checkers on to the effect dependencies to avoid
  // consumer re-renders to trigger the effect. `checkers` should be taken
  // as a "initialValue" sort of param. The functions should not mutate
  // throughout the component lifecycle.
  useEffect(effectFn, [source, bundle]);

  return resource;

}

export function useOnMount(componentDidMount: EffectCallback): void {
  useEffect(componentDidMount, []);
}

export function useDebouncedInput(observer: (keywords: string) => any, time: number = 250): Subject<string> {
  const subject$Ref = useRef(new Subject<string>());
  useEffect(() => {
    const subscription = subject$Ref.current.pipe(
      debounceTime(time),
      distinctUntilChanged()
    ).subscribe(observer);
    return () => subscription.unsubscribe();
  }, [observer, time]);
  return subject$Ref.current;
}

export function useSpreadState<S>(initialState: S): [S, Dispatch<SetStateAction<Partial<S>>>] {
  return useReducer((state, nextState) => ({ ...state, ...nextState }), initialState);
}
