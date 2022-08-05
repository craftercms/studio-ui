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

import { GlobalState } from '../../models/GlobalState';
import { createReducer } from '@reduxjs/toolkit';
import {
  fetchSiteConfig,
  fetchSiteConfigComplete,
  fetchSiteUiConfig,
  fetchSiteUiConfigComplete,
  fetchSiteUiConfigFailed
} from '../actions/configuration';
import { changeSite } from '../actions/sites';
import { fetchSiteLocales, fetchSiteLocalesComplete, fetchSiteLocalesFailed } from '../actions/translation';
import { deserialize, fromString, serialize } from '../../utils/xml';
import { applyDeserializedXMLTransforms } from '../../utils/object';
import { getUserLocaleCode, getUserTimeZone } from '../../utils/datetime';

const initialState: GlobalState['uiConfig'] = {
  error: null,
  isFetching: null,
  currentSite: null,
  siteLocales: {
    error: null,
    isFetching: false,
    localeCodes: null,
    defaultLocaleCode: null
  },
  upload: {
    timeout: 30000,
    maxActiveUploads: 1000,
    maxSimultaneousUploads: 1
  },
  locale: {
    localeCode: getUserLocaleCode(),
    dateTimeFormatOptions: {
      timeZone: getUserTimeZone(),
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }
  },
  references: null,
  xml: null,
  publishing: {
    deleteCommentRequired: false,
    bulkPublishCommentRequired: false,
    publishByCommitCommentRequired: false,
    publishCommentRequired: false,
    publishEverythingCommentRequired: false,
    submissionCommentMaxLength: 250
  },
  cdataEscapedFieldPatterns: []
};

const reducer = createReducer<GlobalState['uiConfig']>(initialState, {
  [changeSite.type]: () => ({ ...initialState }),
  [fetchSiteUiConfig.type]: (state, { payload: { site } }) => ({
    ...state,
    isFetching: true,
    currentSite: site,
    xml: null
  }),
  [fetchSiteUiConfigComplete.type]: (state, { payload }) => {
    let config = payload.config;
    const references = {};
    if (config) {
      const configDOM = fromString(config);
      const site = payload.site;
      const arrays = ['tools'];

      configDOM.querySelectorAll('plugin').forEach((tag) => {
        const siteAttr = tag.getAttribute('site');
        if (siteAttr === '{site}' || siteAttr === null) {
          tag.setAttribute('site', site);
        }
      });

      configDOM.querySelectorAll(':scope > references > reference').forEach((tag) => {
        references[tag.id] = applyDeserializedXMLTransforms(deserialize(tag.innerHTML), {
          arrays
        });
      });

      configDOM.querySelectorAll('configuration > reference').forEach((tag) => {
        tag.outerHTML = references[tag.id];
      });

      configDOM.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));

      config = serialize(configDOM);
    }

    return {
      ...state,
      isFetching: false,
      xml: config,
      references: references
    };
  },
  [fetchSiteUiConfigFailed.type]: (state, { payload }) => ({
    ...state,
    error: payload,
    isFetching: false,
    currentSite: null
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
  [fetchSiteConfig.type]: (state) => ({ ...state }),
  [fetchSiteConfigComplete.type]: (state, { payload }) => {
    const { cdataEscapedFieldPatterns, locale, publishing, upload } = payload;
    return {
      ...state,
      upload: {
        ...state.upload,
        ...upload
      },
      cdataEscapedFieldPatterns,
      locale: {
        ...state.locale,
        // If localization config is not present in the config, use the browser's resolved options.
        localeCode: locale?.localeCode || initialState.locale.localeCode,
        dateTimeFormatOptions: locale?.dateTimeFormatOptions || initialState.locale.dateTimeFormatOptions
      },
      publishing: {
        ...state.publishing,
        ...publishing
      }
    };
  }
});

export default reducer;
