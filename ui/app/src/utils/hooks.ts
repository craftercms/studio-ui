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

import { useSelector } from 'react-redux';
import GlobalState from '../models/GlobalState';
import { shallowEqual } from 'react-redux';

export function useShallowEqualSelector<T = any>(selector: (state: GlobalState) => T): T {
  return useSelector<GlobalState, T>(selector, shallowEqual);
}

export function useSelection<T = any>(
  selector: (state: GlobalState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  return useSelector<GlobalState, T>(selector, equalityFn);
}

export function useActiveSiteId(): string {
  return useSelector<GlobalState, string>(state => state.sites.active);
}

export function usePreviewState(): GlobalState['preview'] {
  return useSelector<GlobalState, GlobalState['preview']>(state => state.preview);
}

export function useEnv(): GlobalState['env'] {
  return useSelector<GlobalState, GlobalState['env']>(state => state.env);
}
