<<<<<<< HEAD
import { Dispatch, SetStateAction, useReducer } from 'react';

=======
>>>>>>> 44748d65ed5f16b14926a99308ca1520f1e479ef
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

import { Dispatch, SetStateAction, useReducer } from 'react';

export function useSpreadState<S>(initialState: S): [S, Dispatch<SetStateAction<Partial<S>>>] {
  return useReducer((state, nextState) => ({ ...state, ...nextState }), initialState);
}
