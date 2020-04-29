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

import { Epic, ofType, StateObservable } from 'redux-observable';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import GlobalState from '../../models/GlobalState';
import { getChildrenByPath } from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import {
  fetchChildrenByPath,
  fetchChildrenByPathComplete,
  fetchChildrenByPathFailed
} from '../reducers/items';

export default [
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(fetchChildrenByPath.type),
      withLatestFrom(state$),
      switchMap(([{ payload }, state]) =>
        getChildrenByPath(state.sites.active, state.items.consumers[payload.id].path).pipe(
          map((response) => fetchChildrenByPathComplete({id: payload.id, childrenResponse: response })),
          catchAjaxError(fetchChildrenByPathFailed)
        )
      )
    )
] as Epic[];
