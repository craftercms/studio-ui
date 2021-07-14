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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../models/GlobalState';
import { envInitialState } from './env';
import {
  changeCurrentUrl,
  checkInGuest,
  goToLastPage,
  goToNextPage,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT
} from '../actions/preview';
import { changeSite } from './sites';

const guestBase = envInitialState.guestBase;
const previewLanding = envInitialState.previewLandingBase;

function cleanseUrl(url: string) {
  const clean = url || '/';
  if (!clean.startsWith('/')) {
    return `/${clean}`;
  }
  return clean;
}

const reducer = createReducer<GlobalState['previewNavigation']>(
  {
    // What's shown to the user across the board (url, address bar, etc)
    currentUrlPath: '',
    // The src of the iframe
    currentFullUrl: previewLanding,
    historyBackStack: [],
    historyForwardStack: [],
    historyNavigationType: null
  },
  {
    [checkInGuest.type]: (state, { payload }) => {
      const { location } = payload;
      const href = location.href;
      const url = href.replace(location.origin, '');
      const historyBackLastPath = state.historyBackStack[state.historyBackStack.length - 1];
      const historyForwardLastPath = state.historyForwardStack[state.historyForwardStack.length - 1];

      return {
        ...state,
        currentUrlPath: payload.__CRAFTERCMS_GUEST_LANDING__ ? '' : url,
        historyBackStack:
          // Preview landing page...
          state.currentUrlPath === '' || historyBackLastPath === url
            ? state.historyBackStack
            : [...state.historyBackStack, url],
        historyForwardStack:
          historyForwardLastPath && historyForwardLastPath !== url && state.historyNavigationType === null
            ? []
            : state.historyForwardStack,
        historyNavigationType: null
      };
    },
    [changeCurrentUrl.type]: (state, { payload }) => {
      return state.currentFullUrl === payload
        ? state
        : {
            ...state,
            currentUrlPath: cleanseUrl(payload),
            currentFullUrl: `${guestBase}${cleanseUrl(payload)}`
          };
    },
    [goToLastPage.type]: (state) => {
      const stack = [...state.historyBackStack];
      stack.pop();
      const path = stack[stack.length - 1];
      return {
        ...state,
        historyBackStack: stack,
        historyForwardStack: [...state.historyForwardStack, state.currentUrlPath],
        historyNavigationType: 'back',
        currentUrlPath: cleanseUrl(path),
        currentFullUrl: `${guestBase}${cleanseUrl(path)}`
      };
    },
    [goToNextPage.type]: (state) => {
      const stack = [...state.historyForwardStack];
      const path = stack.pop();
      return {
        ...state,
        historyForwardStack: stack,
        historyBackStack: [...state.historyBackStack, path],
        historyNavigationType: 'forward',
        currentUrlPath: cleanseUrl(path),
        currentFullUrl: `${guestBase}${cleanseUrl(path)}`
      };
    },
    [changeSite.type]: (state, { payload }) => {
      let nextState = {
        ...state,
        historyBackStack: [],
        historyForwardStack: [],
        historyNavigationType: null
      };

      if (payload.nextUrl !== nextState.currentUrlPath) {
        nextState = {
          ...nextState,
          currentUrlPath: payload.nextUrl,
          currentFullUrl: `${guestBase}${payload.nextUrl}`
        };
      }

      return nextState;
    }
  }
);

export default reducer;
