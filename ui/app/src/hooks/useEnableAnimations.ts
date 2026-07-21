/*
 * Copyright (C) 2007-2026 Crafter Software Corporation. All Rights Reserved.
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

import { getStoredEnableAnimations, subscribeEnableAnimations } from '../utils/state';
import { useSyncExternalStore } from 'react';

export function useEnableAnimations(): boolean {
  // useEnableAnimations is used outside of the StoreProvider, so we need to get the enableAnimations from localStorage.
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
  return useSyncExternalStore(
    subscribeEnableAnimations,
    () => (username ? (getStoredEnableAnimations(username) ?? true) : true),
    () => true
  );
}

export default useEnableAnimations;
