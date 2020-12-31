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
import { createEpicMiddleware, Epic } from 'redux-observable';
import { StandardAction } from '../models/StandardAction';
import epic from './epics/root';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { fetchMyRolesInSite, me } from '../services/users';
import { fetchSites } from '../services/sites';
import LookupTable from '../models/LookupTable';
import { initialState as sitesInitialState } from './reducers/sites';
import { initialState as authInitialState } from './reducers/auth';
import { Middleware } from 'redux';
import { getCurrentIntl } from '../utils/i18n';
import { IntlShape } from 'react-intl';
import { refreshSession } from '../services/auth';
import { setJwt } from '../utils/auth';
import { storeInitialized } from './actions/system';

export type EpicMiddlewareDependencies = { getIntl: () => IntlShape; systemBroadcastChannel: BroadcastChannel };

export type CrafterCMSStore = EnhancedStore<GlobalState, StandardAction>;

export type CrafterCMSEpic = Epic<StandardAction, StandardAction, GlobalState, EpicMiddlewareDependencies>;

let store$: BehaviorSubject<CrafterCMSStore>;

// TODO: Re-assess the location of this object.
const systemBroadcastChannel =
  window.BroadcastChannel !== undefined ? new BroadcastChannel('org.craftercms.systemChannel') : null;

export function createStore(useMock = false): Observable<CrafterCMSStore> {
  if (store$) {
    return store$.pipe(
      filter((store) => store !== null),
      take(1)
    );
  } else {
    store$ = new BehaviorSubject(null);
    return refreshSession().pipe(
      tap(({ token }) => setJwt(token)),
      switchMap((auth) => {
        const preloadState = useMock ? createMockInitialState() : retrieveInitialStateScript();
        return (preloadState
          ? of(createStoreSync(preloadState))
          : fetchInitialState().pipe(map((initialState) => createStoreSync(initialState)))
        ).pipe(
          tap((store) => {
            store.dispatch(storeInitialized({ auth }));
            store$.next(store);
          })
        );
      }),
      switchMap(() => store$.pipe(take(1)))
    );
  }
}

export function getStore(): CrafterCMSStore {
  return store$?.value;
}

export function getSystemBroadcastChannel() {
  return systemBroadcastChannel;
}

export function createStoreSync(preloadedState: Partial<GlobalState>): CrafterCMSStore {
  const epicMiddleware = createEpicMiddleware<StandardAction, StandardAction, GlobalState, EpicMiddlewareDependencies>({
    dependencies: { getIntl: getCurrentIntl, systemBroadcastChannel }
  });
  const middleware = [...getDefaultMiddleware<GlobalState, { thunk: boolean }>({ thunk: false }), epicMiddleware];
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
      !window.location.href.includes('/login') && console.error('[GlobalContext] Malformed initial global state.');
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
      id: 1,
      enabled: true,
      externallyManaged: false,
      firstName: 'Mr.',
      lastName: 'Admin',
      email: 'admin@craftercms.org',
      username: 'admin',
      authenticationType: 'DB',
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
      sites.length
        ? forkJoin<LookupTable<Observable<string[]>>, ''>(
            sites.reduce((lookup, site) => {
              lookup[site.id] = fetchMyRolesInSite(site.id);
              return lookup;
            }, {})
          ).pipe(
            map((rolesBySite) => {
              return {
                user: {
                  ...user,
                  rolesBySite: rolesBySite,
                  sites: sites.map(({ id }) => id),
                  preferences: {}
                },
                sites: { ...sitesInitialState, byId: createLookupTable(sites) },
                auth: { ...authInitialState, active: true }
              };
            })
          )
        : of({
            user: {
              ...user,
              sites: [],
              rolesBySite: {},
              preferences: {}
            },
            sites: { ...sitesInitialState, byId: {} },
            auth: { ...authInitialState, active: true }
          })
    )
  );
}

export default createStore;
