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

import Cookies from 'js-cookie';
import { fetchRolesInSite, me } from '../services/users';
import { fetchSites } from '../services/sites';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import LookupTable from '../models/LookupTable';
import { initialState as authInitialState } from '../state/reducers/auth';
import { initialState as envInitialState } from '../state/reducers/env';
import { initialState as sitesInitialState } from '../state/reducers/sites';
import { createLookupTable } from './object';
import GlobalState from '../models/GlobalState';

export function createMockInitialState(): Partial<GlobalState> {
  const origin = window.location.origin.replace(':3000', ':8080');
  const activeSite = Cookies.get('crafterSite') || null;
  return {
    auth: { ...authInitialState, active: true },
    user: {
      firstName: 'Mr.',
      lastName: 'Admin',
      email: 'admin@craftercms.org',
      username: 'admin',
      authType: 'DB',
      rolesBySite: {
        editorial: ['author', 'admin', 'developer', 'reviewer', 'publisher'],
        headless: ['author', 'admin', 'developer', 'reviewer', 'publisher'],
        empty: ['author', 'admin', 'developer', 'reviewer', 'publisher']
      },
      sites: ['editorial', 'headless', 'empty'],
      preferences: {
        'global.lang': 'en',
        'global.theme': 'light',
        'preview.theme': 'dark'
      }
    },
    sites: {
      ...sitesInitialState,
      active: activeSite,
      byId: {
        editorial: {
          id: 'editorial',
          name: 'editorial',
          description: ''
        },
        headless: {
          id: 'headless',
          name: 'headless',
          description: ''
        },
        empty: {
          id: 'empty',
          name: 'empty',
          description: ''
        }
      }
    },
    env: {
      ...envInitialState,
      AUTHORING_BASE: `${origin}/studio`,
      GUEST_BASE: `${origin}`,
      XSRF_CONFIG_HEADER: 'X-XSRF-TOKEN',
      XSRF_CONFIG_ARGUMENT: '_csrf',
      SITE_COOKIE: 'crafterSite',
      PREVIEW_LANDING_BASE: '/studio/preview-landing'
    }
  };
}

export function appendMockInitialState() {
  const script = document.createElement('script');
  script.innerHTML = JSON.stringify(createMockInitialState());
  script.type = 'application/json';
  script.id = 'initialState';
  document.head.appendChild(script);
}

export function fetchInitialState(): Observable<Partial<GlobalState>> {
  return forkJoin({
    user: me(),
    sites: fetchSites()
  }).pipe(
    switchMap(({ user, sites }) =>
      forkJoin<LookupTable<Observable<string[]>>, ''>(
        sites.reduce((lookup, site) => {
          lookup[site.id] = fetchRolesInSite(user.username, site.id);
          return lookup;
        }, {})
      ).pipe(
        map((rolesBySite) => {
          user.rolesBySite = rolesBySite;
          user.sites = sites.map(({ id }) => id);
          return {
            user,
            sites: { ...sitesInitialState, byId: createLookupTable(sites) },
            auth: { ...authInitialState, active: true }
          };
        })
      )
    )
  );
}

export default createMockInitialState;
