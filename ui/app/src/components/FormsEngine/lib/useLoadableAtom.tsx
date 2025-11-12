/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import { type Atom, useAtomValue } from 'jotai/index';
import { useMemo } from 'react';
import { loadable } from 'jotai/utils';
import type { Loadable } from 'jotai/vanilla/utils/loadable';

// Hook to wrap an async atom using loadable API https://jotai.org/docs/utilities/async#loadable, and retrieve its value.
export function useLoadableAtom<Value>(atom: Atom<Value>): Loadable<Value> {
	const loadableAtom = useMemo(() => loadable(atom), [atom]);
	return useAtomValue(loadableAtom);
}

export default useLoadableAtom;
