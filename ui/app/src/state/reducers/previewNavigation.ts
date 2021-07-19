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
import { changeCurrentUrl, checkInGuest, goToLastPage, goToNextPage } from '../actions/preview';
import { changeSite } from './sites';

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
    historyBackStack: [],
    historyForwardStack: [],
    historyNavigationType: null
  },
  {
    // A page is being visited or reloaded
    // - Push the url into the back stack (if not already pushed)
    // - Clear the forward stack (if not already pushed)
    // - Update the current url
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
    // - A request navigation
    // - Update the current url
    [changeCurrentUrl.type]: (state, { payload }) => {
      return state.currentUrlPath === cleanseUrl(payload)
        ? state
        : {
            ...state,
            currentUrlPath: cleanseUrl(payload)
          };
    },
    // - Previous button clicked
    // - Pop last item on back stack (this is the current path)
    // - Get the new last item from back stack (next_path)
    // - Push next_path to forward stack
    // - Update the current url with the next_path
    // - Set navigation type to 'back'
    [goToLastPage.type]: (state) => {
      const stack = [...state.historyBackStack];
      stack.pop();
      const path = stack[stack.length - 1];
      return {
        ...state,
        historyBackStack: stack,
        historyForwardStack: [...state.historyForwardStack, state.currentUrlPath],
        historyNavigationType: 'back',
        currentUrlPath: cleanseUrl(path)
      };
    },
    // - Forward button clicked
    // - Pop last item on forward stack (this is the current path)
    // - Push next_path to back stack
    // - Update the current url with the next_path
    // - Set navigation type to 'forward'
    [goToNextPage.type]: (state) => {
      const stack = [...state.historyForwardStack];
      const path = stack.pop();
      return {
        ...state,
        historyForwardStack: stack,
        historyBackStack: [...state.historyBackStack, path],
        historyNavigationType: 'forward',
        currentUrlPath: cleanseUrl(path)
      };
    },
    // A change site is being requested
    // - Clear the back and forward stacks
    // - Clear the navigation type
    // - Update the current url
    [changeSite.type]: (state, { payload }) => ({
      ...state,
      historyBackStack: [],
      historyForwardStack: [],
      historyNavigationType: null,
      currentUrlPath: payload.nextUrl ?? state.currentUrlPath
    })
  }
);

export default reducer;
