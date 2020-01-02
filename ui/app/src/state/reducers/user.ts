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

import { createReducer } from '@reduxjs/toolkit';
import { User } from '../../models/User';
import { LOG_OUT_COMPLETE } from '../actions/auth';

const reducer = createReducer<User>(null, {
  // Service doesn't return the "right" user. For now just keeping the one that
  // would have originally come from the FTL pre-loaded state.
  // [LOG_IN_COMPLETE]: (state, action) => {
  //   return {
  //     ...action.payload
  //   };
  // },
  [LOG_OUT_COMPLETE]: () => null
});

export default reducer;
