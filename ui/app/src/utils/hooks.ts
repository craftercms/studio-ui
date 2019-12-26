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
import GlobalState, { EntityState } from '../models/GlobalState';
import { useEffect, useState } from 'react';
import { nnou } from './object';

export function useShallowEqualSelector<T = any>(selector: (state: GlobalState) => T): T {
  return useSelector<GlobalState, T>(selector, shallowEqual);
}

export function useSelection<T = any>(
  selector: (state: GlobalState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  return useSelector<GlobalState, T>(selector, equalityFn);
}

export function useActiveSiteId(): string {
  return useSelector<GlobalState, string>(state => state.sites.active);
}

export function usePreviewState(): GlobalState['preview'] {
  return useSelector<GlobalState, GlobalState['preview']>(state => state.preview);
}

export function useEnv(): GlobalState['env'] {
  return useSelector<GlobalState, GlobalState['env']>(state => state.env);
}

export function createResource<T = any>(factoryFn: () => Promise<T>) {
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
      }
      if (status === 'error') {
        resource.complete = true;
        throw result;
      }
      if (status === 'success') {
        resource.complete = true;
        return result;
      }
    }
  };
  return resource;
}

function createResourceMemo() {
  let resolve, reject;
  let promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return [
    createResource(() => promise),
    resolve,
    reject
  ];
}

export function useResource(source) {

  const [bundle, setBundle] = useState(createResourceMemo);
  const [resource, resolve, reject] = bundle;

  useEffect(() => {
    if (resource.complete) {
      setBundle(createResourceMemo);
    } else if (nnou(source)) {
      resolve(source);
    }
  }, [source, resource, resolve, reject]);

  return resource;

}

export function useEntitySelectionResource<T = any>(selector: (state: GlobalState) => EntityState<T>) {
  const state = useSelection<EntityState<T>>(selector);
  return useEntityStateResource(state);
}

export function useEntityStateResource<T = any>(state: EntityState<T>) {

  const [bundle, setBundle] = useState(createResourceMemo);
  const [resource, resolve, reject] = bundle;

  useEffect(() => {
    if (resource.complete) {
      setBundle(createResourceMemo);
    } else if (nnou(state.error)) {
      reject(state.error);
    } else if ((!state.isFetching) && nnou(state.byId)) {
      resolve(Object.values(state.byId));
    }
  }, [state, resource, resolve, reject]);

  return resource;

}
