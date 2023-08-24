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

import { useDispatch } from 'react-redux';
import { useCallback, useEffect, useRef } from 'react';
import { parse, stringify } from 'query-string';
import { LookupTable } from '../models/LookupTable';
import { changeCurrentUrl } from '../state/actions/preview';
import { changeSite, popSite } from '../state/actions/sites';
import { useActiveSiteId } from './useActiveSiteId';
import { useEnv } from './useEnv';
import { usePreviewNavigation } from './usePreviewNavigation';
import useSiteLookup from './useSiteLookup';
import { defineMessages, useIntl } from 'react-intl';
import { getHostToHostBus } from '../utils/subjects';
import { filter } from 'rxjs/operators';
import { projectBeingDeleted } from '../state/actions/system';

const messages = defineMessages({
  siteNotFound: {
    defaultMessage: 'Project not found. Redirecting to projects list.'
  },
  siteNotReady: {
    defaultMessage: 'Project not initialized yet. Redirecting to projects list.'
  },
  siteDeleted: {
    defaultMessage: "This project has been deleted, you'll be redirected to projects list."
  }
});

const notValidSiteRedirect = (message: string, url: string) => {
  alert(message);
  window.location.href = url;
};

export function usePreviewUrlControl(history) {
  const {
    location: { search },
    push
  } = history;

  const { currentUrlPath } = usePreviewNavigation();
  const { previewLandingBase } = useEnv();
  const { authoringBase } = useEnv();
  const sites = useSiteLookup();
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const priorState = useRef({
    qs: undefined,
    site,
    currentUrlPath,
    qsSite: undefined,
    qsPage: undefined,
    search: search,
    mounted: false
  });
  const { formatMessage } = useIntl();

  const validateSite = useCallback(
    (siteId: string) => {
      if (siteId) {
        const siteExists = sites[siteId];

        // If site doesn't exist, or its state is not 'READY', alert and navigate to sites page.
        if (!siteExists) {
          notValidSiteRedirect(formatMessage(messages.siteNotFound), `${authoringBase}#/sites`);
        } else if (sites[siteId].state !== 'READY') {
          notValidSiteRedirect(formatMessage(messages.siteNotReady), `${authoringBase}#/sites`);
        }
      }
    },
    [sites, authoringBase, formatMessage]
  );

  useEffect(() => {
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$
      .pipe(filter((e) => e.type === projectBeingDeleted.type))
      .subscribe(({ payload }) => {
        if (payload.siteId === site) {
          notValidSiteRedirect(formatMessage(messages.siteDeleted), `${authoringBase}#/sites`);
          dispatch(popSite({ siteId: payload.siteId }));
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [authoringBase, formatMessage, site, dispatch]);

  useEffect(() => {
    const prev = priorState.current;

    // Retrieve the stored query string (QS)
    let qs = prev.qs;
    // If nothing is stored or the search portion has changed...
    if (!qs || prev.search !== search) {
      // Parse the current QS
      qs = parse(search) as LookupTable<string>;
      // In case somehow 2 site or page arguments ended on the
      // URL, only use the first one and issue a warning on the console
      if (Array.isArray(qs.site)) {
        console.warn('Multiple site params detected on the URL. Excess ignored.');
        qs.site = qs.site[0];
      }
      if (Array.isArray(qs.page)) {
        console.warn('Multiple page params detected on the URL. Excess ignored.');
        qs.page = qs.page[0];
      }
      // Store the newly parsed search string and parsed QS
      prev.search = search;
      prev.qs = qs;
    }

    if (!prev.mounted) {
      // If this is the very first render...

      // If there is a site or page on the URL, sync the state to the URL.
      if (qs.site || qs.page) {
        validateSite(qs.site);
        // Check if QS site differs from the one stored in the
        // state (e.g. state may have been restored from a previous session)
        if (qs.site && qs.site !== site) {
          // At this point, there's a site on the QS for sure
          if (qs.page) {
            // If there is a also a page, change site and send to QS page
            dispatch(changeSite(qs.site, qs.page));
          } else {
            // If there's no page, send to the homepage of the QS site
            dispatch(changeSite(qs.site, '/'));
          }
        } else if (qs.page && qs.page !== currentUrlPath) {
          // Change the current page to match the QS site
          dispatch(changeCurrentUrl(qs.page));
        }
      }

      prev.mounted = true;
    } else {
      // Not the first render. Something changed and we're updating.

      // Check if either the QS or the state has changed
      const qsSiteChanged = qs.site !== prev.qsSite && qs.site !== site;
      const siteChanged = site !== prev.site;
      const qsUrlChanged = qs.page !== prev.qsPage && qs.page !== currentUrlPath;
      const urlChanged = currentUrlPath !== prev.currentUrlPath;
      const somethingDidChanged = qsSiteChanged || siteChanged || qsUrlChanged || urlChanged;

      validateSite(qs.site);
      // If nothing changed, skip...
      if (somethingDidChanged) {
        if ((siteChanged || urlChanged) && (currentUrlPath !== qs.page || site !== qs.site)) {
          const page = currentUrlPath;
          if (page !== previewLandingBase) {
            push({ search: stringify({ site, page }, { encode: false }) });
          }
        } else if (qsSiteChanged && qsUrlChanged) {
          dispatch(changeSite(qs.site, qs.page));
        } else if (qsUrlChanged) {
          dispatch(changeCurrentUrl(qs.page));
        } else if (qsSiteChanged) {
          dispatch(changeSite(qs.site, '/'));
        }

        prev.currentUrlPath = currentUrlPath;
        prev.site = site;
      }

      // The above conditions related to these are compound so safer to
      // always update to avoid stale prev props
      prev.qsPage = qs.page;
      prev.qsSite = qs.site;
    }
  }, [currentUrlPath, dispatch, previewLandingBase, push, search, site, sites, validateSite]);
}

export default usePreviewUrlControl;
