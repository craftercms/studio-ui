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

import { useStore } from 'react-redux';
import { useEffect, useRef } from 'react';
import { UNDEFINED } from '../utils/constants';
import { fetchSandboxItems } from '../state/actions/content';
import { Store } from 'redux';

export function useFetchSandboxItems(paths: string[]): void {
  const store: Store = useStore();
  const storeRef = useRef(store);
  useEffect(
    () => {
      const store = storeRef.current;
      const state = store.getState();
      const { itemsByPath, itemsBeingFetchedByPath } = state.content;
      const pathsToFetch = paths.filter((path) => !itemsByPath[path] && itemsBeingFetchedByPath[path] === UNDEFINED);
      pathsToFetch.length && store.dispatch(fetchSandboxItems({ paths: pathsToFetch }));
    },
    // Interested in renewing the effect when paths change, not when the paths array instance changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paths.join('')]
  );
}

export default useFetchSandboxItems;
