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
import { BehaviorSubject, forkJoin, fromEvent, Observable, of } from 'rxjs';
import { filter, map, pluck, switchMap, take, tap } from 'rxjs/operators';
import { fetchMyRolesInSite, me } from '../services/users';
import { fetchAll } from '../services/sites';
import LookupTable from '../models/LookupTable';
import { initialState as sitesInitialState } from './reducers/sites';
import { initialState as authInitialState } from './reducers/auth';
import { Middleware } from 'redux';
import { getCurrentIntl } from '../utils/i18n';
import { IntlShape } from 'react-intl';
import { RefreshSessionResponse } from '../services/auth';
import { setJwt } from '../utils/auth';
import { storeInitialized } from './actions/system';
import { fromPromise } from 'rxjs/internal-compatibility';
import { refreshAuthTokenComplete } from './actions/auth';

export type EpicMiddlewareDependencies = { getIntl: () => IntlShape };

export type CrafterCMSStore = EnhancedStore<GlobalState, StandardAction>;

export type CrafterCMSEpic = Epic<StandardAction, StandardAction, GlobalState, EpicMiddlewareDependencies>;

let store$: BehaviorSubject<CrafterCMSStore>;

export function getStore(): Observable<CrafterCMSStore> {
  if (store$) {
    return store$.pipe(
      filter((store) => store !== null),
      take(1)
    );
  } else {
    store$ = new BehaviorSubject(null);
    return registerServiceWorker().pipe(
      tap(({ token }) => setJwt(token)),
      switchMap((auth) => {
        const preloadState = retrieveInitialStateScript();
        return (preloadState
          ? of(createStoreSync(preloadState))
          : fetchInitialState().pipe(map((initialState) => createStoreSync(initialState)))
        ).pipe(
          tap((store) => {
            store.dispatch(storeInitialized({ auth }));
            navigator.serviceWorker.onmessage = (e) => {
              store.dispatch(refreshAuthTokenComplete(e.data));
            };
            store$.next(store);
          })
        );
      }),
      switchMap(() => store$.pipe(take(1)))
    );
  }
}

export function registerServiceWorker(): Observable<RefreshSessionResponse> {
  return fromPromise(navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`)).pipe(
    switchMap((registration) => registration.update().then(() => registration)),
    switchMap((registration) => {
      const begin = () => {
        navigator.serviceWorker.startMessages();
        registration.active.postMessage({ type: 'CONNECT' });
      };
      if (registration.active) {
        begin();
      } else {
        registration.onupdatefound = () => {
          if (registration.installing) {
            registration.installing.onstatechange = () => {
              if (registration.active?.state === 'activated') {
                begin();
              }
            };
          }
        };
      }
      return fromEvent<MessageEvent>(navigator.serviceWorker, 'message').pipe(
        tap((e) => {
          console.log('%c[page] Message received from worker', 'color: blue', e.data);
          if (e.data?.type === 'SW_UNAUTHENTICATED') {
            throw new Error('User not authenticated.');
          }
        }),
        filter((e) => e.data?.type === 'SW_TOKEN'),
        take(1),
        pluck('data', 'payload')
      );
    })
  );
}

export function getStoreSync(): CrafterCMSStore {
  return store$?.value;
}

export function createStoreSync(preloadedState: Partial<GlobalState>): CrafterCMSStore {
  const epicMiddleware = createEpicMiddleware<StandardAction, StandardAction, GlobalState, EpicMiddlewareDependencies>({
    dependencies: { getIntl: getCurrentIntl }
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

export function fetchInitialState(): Observable<Partial<GlobalState>> {
  return forkJoin({
    user: me(),
    sites: fetchAll()
  }).pipe(
    switchMap(({ user, sites }) =>
      sites.length
        ? forkJoin<LookupTable<Observable<string[]>>, ''>(
            // creates an object like `{ [siteId]: Observable<roleName[]> }`
            sites.reduce((lookup, site) => {
              lookup[site.id] = fetchMyRolesInSite(site.id);
              return lookup;
            }, {})
          ).pipe(
            map((rolesBySite) => ({
              user: {
                ...user,
                rolesBySite: rolesBySite,
                sites: sites.map(({ id }) => id),
                preferences: {}
              },
              sites: { ...sitesInitialState, byId: createLookupTable(sites) },
              auth: { ...authInitialState, active: true }
            }))
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

export default getStore;
