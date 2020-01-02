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
import { LOG_IN, LOG_OUT, loginComplete, loginFailed, logoutComplete, logoutFailed } from '../actions/auth';
import { map, switchMap } from 'rxjs/operators';
import { StandardAction } from '../../models/StandardAction';
import GlobalState from '../../models/GlobalState';
import auth from '../../services/auth';
import { catchAjaxError } from '../../utils/ajax';

const login: Epic<StandardAction, StandardAction, GlobalState> = (action$, state$) => action$.pipe(
  ofType(LOG_IN),
  switchMap((action) => auth.login(action.payload).pipe(
    map(loginComplete),
    catchAjaxError(loginFailed)
  ))
);

const logout: Epic = (action$, state$) => action$.pipe(
  ofType(LOG_OUT),
  switchMap((action) => auth.logout().pipe(
    // @ts-ignore
    map(logoutComplete),
    catchAjaxError(logoutFailed)
  ))
);

export default [
  login,
  logout
] as Epic[];
