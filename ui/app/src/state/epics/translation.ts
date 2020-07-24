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

import { Epic, ofType } from 'redux-observable';
import { Observable } from 'rxjs';
import GlobalState from '../../models/GlobalState';

import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { getSupportedLocales } from '../../services/translation';
import { catchAjaxError } from '../../utils/ajax';
import {
  FETCH_SUPPORTED_LOCALES,
  fetchSupportedLocalesComplete,
  fetchSupportedLocalesFailed
} from '../actions/translation';

const fetchSupportedLocales: Epic = (action$, state$: Observable<GlobalState>) => action$.pipe(
  ofType(FETCH_SUPPORTED_LOCALES),
  withLatestFrom(state$),
  switchMap(([, state]) => getSupportedLocales(state.sites.active).pipe(
    map(fetchSupportedLocalesComplete),
    catchAjaxError(fetchSupportedLocalesFailed)
  ))
);

export default [
  fetchSupportedLocales
] as Epic[];
