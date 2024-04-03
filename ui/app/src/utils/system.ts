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

import { PREVIEW_URL_PATH } from './constants';
import { ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import Monaco from '../models/Monaco';

export type SystemLinkId =
  | 'preview'
  | 'siteTools'
  | 'siteSearch'
  | 'siteDashboard'
  | 'siteToolsDialog'
  | 'siteSearchDialog'
  | 'siteDashboardDialog';

export function getSystemLink({
  systemLinkId,
  authoringBase,
  site,
  page = '/'
}: {
  systemLinkId: SystemLinkId;
  authoringBase: string;
  site: string;
  page?: string;
}) {
  return {
    preview: `${authoringBase}${PREVIEW_URL_PATH}#/?page=${page}&site=${site}`,
    siteTools: `${authoringBase}/site-config`,
    siteSearch: `${authoringBase}/search`,
    siteDashboard: `${authoringBase}/site-dashboard`
  }[systemLinkId];
}

export function copyToClipboard(textToCopy: string): Promise<void> {
  // Clipboard is only available on user-initiated callbacks over non-secure contexts (e.g. not https).
  return (
    navigator.clipboard?.writeText(textToCopy) ??
    new Promise((resolve, reject) =>
      reject('Copying to clipboard is only available in secure contexts or user-initiated callbacks.')
    )
  );
}

let monaco$: ReplaySubject<Monaco>;
export function withMonaco(onReady: (api: Monaco) => void): void {
  if (!monaco$) {
    monaco$ = new ReplaySubject(1);
    const script = document.createElement('script');
    script.src = '/studio/static-assets/libs/monaco/monaco.0.44.0.js';
    script.onload = () => {
      // @ts-ignore
      monaco$.next(window.monaco);
    };
    script.onerror = () => {
      console.error('Monaco editor could not be loaded');
    };
    document.head.appendChild(script);
  }
  monaco$.asObservable().pipe(take(1)).subscribe(onReady);
}

export function isPreviewAppUrl(pathname = window.location.pathname): boolean {
  return pathname.includes(`/preview`);
}

export function isDashboardAppUrl(pathname = window.location.pathname): boolean {
  return pathname.includes(`/site-dashboard`);
}

export function isProjectToolsAppUrl(pathname = window.location.pathname): boolean {
  return pathname.includes(`/site-config`);
}
