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
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { CrafterCMSEpic } from '../store';
import { pathNavigatorTreeFetchItemComplete, pathNavigatorTreeInit } from '../actions/pathNavigatorTree';
import { fetchItemByPath } from '../../services/content';
import { pathNavigatorFetchPathFailed } from '../actions/pathNavigator';
import { catchAjaxError } from '../../utils/ajax';

export default [
  // region pathNavigatorTreeInit
  (action$, state$) =>
    action$.pipe(
      ofType(pathNavigatorTreeInit.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) => {
        const { id, path } = payload;
        return fetchItemByPath(state.sites.active, path, { castAsDetailedItem: true }).pipe(
          map((item) => pathNavigatorTreeFetchItemComplete({ id, item })),
          catchAjaxError((error) => pathNavigatorFetchPathFailed({ error, id }))
        );
      })
    )
  // endregion
] as CrafterCMSEpic[];
