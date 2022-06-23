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

import { ofType } from 'redux-observable';
import {
  FETCH_ASSETS_PANEL_ITEMS,
  fetchAssetsPanelItemsComplete,
  fetchAssetsPanelItemsFailed
} from '../actions/preview';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import { search } from '../../services/search';
import { Observable } from 'rxjs';
import GlobalState from '../../models/GlobalState';
import { CrafterCMSEpic } from '../store';

export default [
  (action$, state$: Observable<GlobalState>) =>
    action$.pipe(
      ofType(FETCH_ASSETS_PANEL_ITEMS),
      withLatestFrom(state$),
      switchMap(([, state]) =>
        search(state.sites.active, state.preview.assets.query).pipe(
          map(fetchAssetsPanelItemsComplete),
          catchAjaxError(fetchAssetsPanelItemsFailed)
        )
      )
    )
] as CrafterCMSEpic[];
