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

import { ActionsObservable, ofType, StateObservable } from 'redux-observable';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  fetchQuickCreateList as fetchQuickCreateListAction,
  fetchQuickCreateListComplete,
  fetchQuickCreateListFailed
} from '../actions/content';
import { catchAjaxError } from '../../utils/ajax';
import { fetchQuickCreateList } from '../../services/content';
import StandardAction from '../../models/StandardAction';
import GlobalState from '../../models/GlobalState';

export default [
  // region Quick Create
  (action$: ActionsObservable<StandardAction>, $state: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(fetchQuickCreateListAction.type),
      withLatestFrom($state),
      switchMap(([, { sites: { active } }]) =>
        fetchQuickCreateList(active).pipe(
          map(fetchQuickCreateListComplete),
          catchAjaxError(fetchQuickCreateListFailed)
        )
      )
    )
  // endregion
];
