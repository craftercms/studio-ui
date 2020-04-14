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

import { useActiveSiteId, useEnv, usePreviewState } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { parse, stringify } from 'query-string';
import { LookupTable } from '../../models/LookupTable';
import { changeCurrentUrl } from '../../state/actions/preview';
import { nou } from '../../utils/object';
import { changeSite } from '../../state/reducers/sites';

export default function usePreviewUrlControl(history) {

  const { location: { search }, push } = history;

  const { guest, currentUrl } = usePreviewState();
  const { PREVIEW_LANDING_BASE } = useEnv();
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const priorState = useRef({
    qs: undefined,
    site,
    currentUrl,
    currentGuestUrl: guest?.url,
    qsSite: undefined,
    qsPage: undefined,
    search: search,
    mounted: false
  });

  useEffect(() => {
    const prev = priorState.current;

    let qs = prev.qs;
    if ((!qs) || (prev.search !== search)) {
      qs = parse(search) as LookupTable<string>;
      prev.search = search;
      prev.qs = qs;
    }

    if (!prev.mounted) {

      if (qs.site || qs.page) {
        if (qs.site && qs.site !== site) {
          if (qs.page) {
            dispatch(changeSite(qs.site, qs.page));
          } else {
            dispatch(changeSite(qs.site, '/'));
          }
        } else if (qs.page && qs.page !== currentUrl) {
          dispatch(changeCurrentUrl(qs.page));
        }
      }

      prev.mounted = true;

    } else {

      const qsSiteChanged = (qs.site !== prev.qsSite) && (qs.site !== site);
      const siteChanged = (site !== prev.site);
      const qsUrlChanged = (qs.page !== prev.qsPage) && (qs.page !== (guest ? guest.url : currentUrl));
      const urlChanged = (currentUrl !== prev.currentUrl);
      const guestUrlChanged = (guest?.url !== prev.currentGuestUrl);
      const somethingDidChanged = (
        qsSiteChanged ||
        siteChanged ||
        qsUrlChanged ||
        urlChanged ||
        guestUrlChanged
      );

      if (somethingDidChanged) {

        if (
          (siteChanged || urlChanged || guestUrlChanged) &&
          (currentUrl !== qs.page || site !== qs.site)
        ) {

          // When navigation occurs within guest, it will check out. For a brief moment whilst the new page
          // checks in, the guest.url will be undefined. The intention of this validation is to hold on to the prior
          // guest URL to avoid a momentary URL flicker between the previousGuestUrl, the stale currentUrl and the
          // new guest URL.
          const page = (guestUrlChanged && nou(guest)) ? prev.currentGuestUrl : (guest?.url ?? currentUrl);
          if (page !== PREVIEW_LANDING_BASE) {
            push({ search: stringify({ site, page }, { encode: false }) });
          }

        } else if (qsSiteChanged && qsUrlChanged) {
          dispatch(changeSite(qs.site, qs.page));
        } else if (qsUrlChanged) {
          dispatch(changeCurrentUrl(qs.page));
        } else if (qsSiteChanged) {
          dispatch(changeSite(qs.site, '/'));
        }

        prev.currentUrl = currentUrl;
        prev.site = site;
        prev.currentGuestUrl = guest?.url;

      }

      // The above conditions related to these are compound so safer to
      // always update to avoid stale prev props
      prev.qsPage = qs.page;
      prev.qsSite = qs.site;

    }

  }, [search, site, currentUrl, guest, dispatch, PREVIEW_LANDING_BASE, push]);

}
