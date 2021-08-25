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
import {
  fetchSiteConfig,
  fetchSiteConfigComplete,
  fetchSiteUiConfig,
  fetchSiteUiConfigComplete,
  fetchSiteUiConfigFailed
} from '../actions/configuration';
import { changeSite } from './sites';
import { fetchSiteLocales, fetchSiteLocalesComplete, fetchSiteLocalesFailed } from '../actions/translation';
import { deserialize, fromString, serialize } from '../../utils/xml';
import { applyDeserializedXMLTransforms } from '../../utils/object';

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
  locale: {
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
  useLegacyPreviewLookup: {},
  references: null,
  xml: null,
  publishing: {
    deleteCommentRequired: false,
    bulkPublishRequired: false,
    publishByCommitRequired: false,
    publishingCommentRequired: false,
    submissionCommentMaxLength: 250
  },
  cdataEscapedFieldPatterns: []
};

const reducer = createReducer<GlobalState['uiConfig']>(initialState, {
  [changeSite.type]: (state) => ({ ...initialState, useLegacyPreviewLookup: state.useLegacyPreviewLookup }),
  [fetchSiteUiConfig.type]: (state, { payload: { site } }) => ({
    ...state,
    isFetching: true,
    currentSite: site
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
    const { cdataEscapedFieldPatterns, locale, publishing, site, usePreview3 } = payload;
    return {
      ...state,
      cdataEscapedFieldPatterns,
      locale: {
        ...state.locale,
        localeCode: locale.localeCode ?? state.locale.localeCode,
        dateTimeFormatOptions: locale.dateTimeFormatOptions ?? state.locale.dateTimeFormatOptions
      },
      publishing: {
        ...state.publishing,
        ...publishing
      },
      useLegacyPreviewLookup: {
        ...state.useLegacyPreviewLookup,
        [site]: usePreview3
      }
    };
  }
});

export default reducer;
