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

import { configureStore, EnhancedStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import reducer from './reducers/root';
import { nou } from '../utils/object';
import Cookies from 'js-cookie';
import GlobalState from '../models/GlobalState';
import { createEpicMiddleware } from 'redux-observable';
import { StandardAction } from '../models/StandardAction';
import epic from './epics/root';
import createMockInitialState, { fetchInitialState } from '../utils/createMockInitialState';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export type CrafterCMSStore = EnhancedStore<GlobalState, StandardAction>;

let store: CrafterCMSStore;

export function createStoreSync(preloadedState: Partial<GlobalState>): CrafterCMSStore {
  const epicMiddleware = createEpicMiddleware();
  const middleware = [...getDefaultMiddleware<GlobalState>({ thunk: false }), epicMiddleware];
  const store = configureStore<GlobalState, StandardAction>({
    reducer,
    middleware,
    preloadedState
  });
  epicMiddleware.run(epic);
  return store;
}

export function retrieveInitialStateScript(): GlobalState {
  let state = {} as GlobalState;
  const script = document.querySelector('#initialState');
  if (script) {
    try {
      state = JSON.parse(script.innerHTML);
      if (nou(state.sites.active)) {
        const cookie = Cookies.get(state.env.SITE_COOKIE);
        cookie && (state.sites.active = Cookies.get(state.env.SITE_COOKIE));
      }
    } catch {
      // The login screen won't have the preloaded state
      !window.location.href.includes('/login') &&
      console.error('[GlobalContext] Malformed initial global state.');
      // TODO: Login view should be built separately from the main app to avoid this hack and specially to avoid the bulky build
    }
  } else {
    return null;
  }
  const writer = document.querySelector('#initialStateWriter');
  script?.parentNode.removeChild(script);
  writer?.parentNode.removeChild(writer);
  return state;
}

export function createStore(useMock = false): Observable<CrafterCMSStore> {
  if (store) {
    return of(store);
  }
  const preloadState = useMock ? createMockInitialState() : retrieveInitialStateScript();
  if (preloadState) {
    return of(createStoreSync(preloadState)).pipe(
      tap((s) => (store = s))
    );
  } else {
    return fetchInitialState().pipe(
      map((initialState) => createStoreSync(initialState)),
      tap((s) => (store = s))
    );
  }
}

export default createStore;



