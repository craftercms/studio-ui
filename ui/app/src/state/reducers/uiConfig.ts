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

import { GlobalState } from '../../models/GlobalState';
import { createReducer } from '@reduxjs/toolkit';
import { fetchSiteUiConfig, fetchSiteUiConfigComplete, fetchSiteUiConfigFailed } from '../actions/configuration';
import { changeSite } from './sites';
import {
  fetchGlobalMenuComplete,
  fetchGlobalMenuFailed,
  fetchSiteLocale,
  fetchSiteLocaleComplete,
  fetchSiteLocaleFailed,
  fetchSiteTools,
  fetchSiteToolsComplete,
  fetchSiteToolsFailed
} from '../actions/system';
import { fetchSiteLocales, fetchSiteLocalesComplete, fetchSiteLocalesFailed } from '../actions/translation';

const initialState: GlobalState['uiConfig'] = {
  error: null,
  isFetching: null,
  currentSite: null,
  preview: {
    toolsPanel: {
      widgets: null
    },
    pageBuilderPanel: {
      widgets: null
    }
  },
  launcher: null,
  globalNavigation: {
    error: null,
    items: null,
    isFetching: false
  },
  siteLocales: {
    error: null,
    isFetching: false,
    localeCodes: null,
    defaultLocaleCode: null
  },
  locale: {
    error: null,
    isFetching: false,
    localeCode: 'en-US',
    dateTimeFormatOptions: {
      timeZone: 'EST5EDT',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }
  },
  publishing: {
    submissionCommentMaxLength: 250
  },
  siteTools: {
    error: null,
    tools: null,
    isFetching: false
  }
};

const reducer = createReducer<GlobalState['uiConfig']>(initialState, {
  [changeSite.type]: (state) => ({ ...initialState, globalNavigation: state.globalNavigation }),
  [fetchSiteUiConfig.type]: (state, { payload: { site } }) => ({
    ...state,
    isFetching: true,
    currentSite: site
  }),
  [fetchSiteUiConfigComplete.type]: (state, { payload }) => ({
    ...state,
    isFetching: false,
    ...payload
  }),
  [fetchSiteUiConfigFailed.type]: (state, { payload }) => ({
    ...state,
    error: payload,
    isFetching: false,
    currentSite: null
  }),
  [fetchGlobalMenuComplete.type]: (state, { payload }) => ({
    ...state,
    globalNavigation: {
      ...state.globalNavigation,
      isFetching: true
    }
  }),
  [fetchGlobalMenuComplete.type]: (state, { payload }) => ({
    ...state,
    globalNavigation: {
      error: null,
      items: payload,
      isFetching: false
    }
  }),
  [fetchGlobalMenuFailed.type]: (state, { payload }) => ({
    ...state,
    globalNavigation: {
      error: payload,
      items: state.globalNavigation.items,
      isFetching: false
    }
  }),
  [fetchSiteLocales.type]: (state) => ({
    ...state,
    siteLocales: {
      ...state.siteLocales,
      isFetching: true
    }
  }),
  [fetchSiteLocalesComplete.type]: (state, { payload }) => ({
    ...state,
    siteLocales: {
      ...state.siteLocales,
      isFetching: false,
      localeCodes: payload.localeCodes ?? [],
      defaultLocaleCode: payload.defaultLocaleCode
    }
  }),
  [fetchSiteLocalesFailed.type]: (state, { payload }) => ({
    ...state,
    siteLocales: {
      ...state.siteLocales,
      isFetching: false,
      error: payload
    }
  }),
  [changeSite.type]: () => initialState,
  [fetchSiteLocale.type]: (state) => ({
    ...state,
    locale: {
      ...state.locale,
      isFetching: true
    }
  }),
  [fetchSiteLocaleComplete.type]: (state, { payload }) => ({
    ...state,
    locale: {
      ...state.locale,
      isFetching: false,
      localeCode: payload.localeCode ?? state.locale.localeCode,
      dateTimeFormatOptions: payload.dateTimeFormatOptions ?? state.locale.dateTimeFormatOptions
    }
  }),
  [fetchSiteLocaleFailed.type]: (state, { payload }) => ({
    ...state,
    locale: {
      ...state.locale,
      isFetching: false,
      error: payload
    }
  }),
  [fetchSiteTools.type]: (state) => ({
    ...state,
    siteTools: {
      ...state.siteTools,
      isFetching: true
    }
  }),
  [fetchSiteToolsComplete.type]: (state, { payload }) => ({
    ...state,
    siteTools: {
      ...state.siteTools,
      isFetching: false,
      tools: payload
    }
  }),
  [fetchSiteToolsFailed.type]: (state, { payload }) => ({
    ...state,
    siteTools: {
      ...state.siteTools,
      isFetching: false,
      error: payload
    }
  })
});

export default reducer;
