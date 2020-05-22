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
import { createLookupTable, nou } from '../utils/object';
import Cookies from 'js-cookie';
import GlobalState from '../models/GlobalState';
import { createEpicMiddleware } from 'redux-observable';
import { StandardAction } from '../models/StandardAction';
import epic from './epics/root';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { fetchRolesInSite, me } from '../services/users';
import { fetchSites } from '../services/sites';
import LookupTable from '../models/LookupTable';
import { initialState as sitesInitialState } from './reducers/sites';
import { initialState as authInitialState } from './reducers/auth';
import { Middleware } from 'redux';

export type CrafterCMSStore = EnhancedStore<GlobalState, StandardAction>;

let store: CrafterCMSStore;

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

export function createStoreSync(preloadedState: Partial<GlobalState>): CrafterCMSStore {
  const epicMiddleware = createEpicMiddleware<StandardAction, StandardAction, GlobalState>();
  const middleware = [
    ...getDefaultMiddleware<GlobalState, { thunk: boolean }>({ thunk: false }),
    epicMiddleware
  ];
  const store = configureStore<GlobalState, StandardAction, Middleware[]>({
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
        const cookie = Cookies.get(state.env.siteCookieName);
        cookie && (state.sites.active = Cookies.get(state.env.siteCookieName));
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

export function createMockInitialState(): Partial<GlobalState> {
  return {
    auth: { ...authInitialState, active: true },
    user: {
      firstName: 'Mr.',
      lastName: 'Admin',
      email: 'admin@craftercms.org',
      username: 'admin',
      authType: 'DB',
      rolesBySite: {
        editorial: ['author', 'admin', 'developer', 'reviewer', 'publisher'],
        headless: ['author', 'admin', 'developer', 'reviewer', 'publisher'],
        empty: ['author', 'admin', 'developer', 'reviewer', 'publisher']
      },
      sites: ['editorial', 'headless', 'empty'],
      preferences: {
        'global.lang': 'en',
        'global.theme': 'light',
        'preview.theme': 'dark'
      }
    },
    sites: {
      ...sitesInitialState,
      byId: {
        editorial: {
          id: 'editorial',
          name: 'editorial',
          description: ''
        },
        headless: {
          id: 'headless',
          name: 'headless',
          description: ''
        },
        empty: {
          id: 'empty',
          name: 'empty',
          description: ''
        }
      }
    }
  };
}

export function fetchInitialState(): Observable<Partial<GlobalState>> {
  return forkJoin({
    user: me(),
    sites: fetchSites()
  }).pipe(
    switchMap(({ user, sites }) =>
      forkJoin<LookupTable<Observable<string[]>>, ''>(
        sites.reduce((lookup, site) => {
          lookup[site.id] = fetchRolesInSite(user.username, site.id);
          return lookup;
        }, {})
      ).pipe(
        map((rolesBySite) => {
          user.rolesBySite = rolesBySite;
          user.sites = sites.map(({ id }) => id);
          return {
            user,
            sites: { ...sitesInitialState, byId: createLookupTable(sites) },
            auth: { ...authInitialState, active: true }
          };
        })
      )
    )
  );
}

export default createStore;



