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

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import reducer from './reducers/root';
import { nou } from '../utils/object';
import Cookies from 'js-cookie';
import GlobalState from '../models/GlobalState';
import { createEpicMiddleware } from 'redux-observable';
import { StandardAction } from '../models/StandardAction';
import epic from './epics/root';
import createMockInitialState from '../utils/createMockInitialState';

const epicMiddleware = createEpicMiddleware();
const middleware = [...getDefaultMiddleware<GlobalState>({ thunk: false }), epicMiddleware];

const store = configureStore<GlobalState, StandardAction>({
  reducer,
  middleware,
  preloadedState: process.env.NODE_ENV === 'production'
    ? retrieveInitialStateScript()
    : createMockInitialState()
});

epicMiddleware.run(epic);

function retrieveInitialStateScript(): GlobalState {
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
      console.error('[GlobalContext] Malformed initial global state.');
    }
  } else {
    console.error('[GlobalContext] Initial global state not found.');
  }
  const writer = document.querySelector('#initialStateWriter');
  script.parentNode.removeChild(script);
  writer.parentNode.removeChild(writer);
  return state;
}

export default store;
