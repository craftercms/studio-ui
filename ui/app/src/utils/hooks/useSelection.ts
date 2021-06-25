/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import GlobalState from '../../models/GlobalState';
import { useSelector } from 'react-redux';

export const useSelection: <T = any>(
  selectorFn: (state: GlobalState) => T,
  equalityFn?: (left: T, right: T) => boolean
) => T =
  process.env.NODE_ENV === 'production'
    ? useSelector
    : <T = any>(selector, equalityFn) => useSelector<GlobalState, T>(selector, equalityFn);
