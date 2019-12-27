/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import {
  FETCH_PANEL_ASSETS_ITEMS,
  fetchPanelAssetsItemsComplete,
  fetchPanelAssetsItemsFailed
} from '../actions/preview';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { catchAjaxError } from '../../utils/ajax';
import { search } from "../../services/search";

const fetchAssets: Epic = (action$, state$) => action$.pipe(
  ofType(FETCH_PANEL_ASSETS_ITEMS),
  withLatestFrom(state$),
  switchMap(([{ payload }, { sites: { active: site } }]) => search(site, payload)),
  map(fetchPanelAssetsItemsComplete),
  catchAjaxError(fetchPanelAssetsItemsFailed)
);

export default [
  fetchAssets
] as Epic[];
