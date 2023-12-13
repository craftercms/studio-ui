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

import { createEpicMiddleware } from 'redux-observable';
import { configureStore, Tuple } from '@reduxjs/toolkit';
import { GuestStandardAction } from './models/GuestStandardAction';
import epic from './epics/root';
import reducer from './reducers/root';
import { Middleware } from 'redux';
import { GuestState, GuestStore } from './models/GuestStore';
import { Observable } from 'rxjs';
import { distinctUntilChanged, pluck, share } from 'rxjs/operators';
import { Middlewares } from '@reduxjs/toolkit/dist/configureStore';

let store: GuestStore;

export function createGuestStore(): GuestStore {
  if (store) {
    return store;
  }
  const epicMiddleware = createEpicMiddleware<GuestStandardAction, GuestStandardAction, GuestState>();
  store = configureStore<GuestState, GuestStandardAction, Tuple<Middlewares<GuestState>>>({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        // serializable is not good companion while we have
        // non-serializable values on the state (elements).
        serializableCheck: false,
        // immutable is causing max stack issues, probably also due
        // to the non-serializable values on the state.
        immutableCheck: false
      }).concat(epicMiddleware as Middleware),
    devTools: { name: 'Guest Store' }
    // devTools: process.env.NODE_ENV === 'production' ? false : { name: 'Guest Store' }
  });
  epicMiddleware.run(epic);
  return store;
}

export default createGuestStore;

export const state$ = new Observable((subscriber) => {
  const store = createGuestStore();
  return store.subscribe(() => {
    const state = store.getState();
    subscriber.next(state.models);
  });
}).pipe(share());

export const models$ = state$.pipe(pluck('content'), distinctUntilChanged());

export const contentTypes$ = state$.pipe(pluck('contentTypes'), distinctUntilChanged());
