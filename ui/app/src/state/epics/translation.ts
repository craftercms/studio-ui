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

import { ofType } from 'redux-observable';
import { Observable } from 'rxjs';
import GlobalState from '../../models/GlobalState';

import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { getSiteLocales } from '../../services/translation';
import { catchAjaxError } from '../../utils/ajax';
import { fetchSiteLocales, fetchSiteLocalesComplete, fetchSiteLocalesFailed } from '../actions/translation';
import { CrafterCMSEpic } from '../store';

export default [
  (action$, state$: Observable<GlobalState>) =>
    action$.pipe(
      ofType(fetchSiteLocales.type),
      withLatestFrom(state$),
      switchMap(([, state]) =>
        getSiteLocales(state.sites.active).pipe(map(fetchSiteLocalesComplete), catchAjaxError(fetchSiteLocalesFailed))
      )
    )
] as CrafterCMSEpic[];
