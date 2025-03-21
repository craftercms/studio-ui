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

import { RefObject, useLayoutEffect } from 'react';
import useUpdateRefs from './useUpdateRefs';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export function useResizeObserver(containerRef: RefObject<HTMLElement>, observer: () => void, delay = 300): void {
	const refs = useUpdateRefs({ observer, delay });
	useLayoutEffect(() => {
		if (containerRef.current) {
			const resize$ = new Subject<void>();
			const resizeObserver = new ResizeObserver(() => resize$.next());
			const subscription = resize$.pipe(debounceTime(delay)).subscribe(() => refs.current.observer());
			resizeObserver.observe(containerRef.current);
			return () => {
				resizeObserver.disconnect();
				subscription.unsubscribe();
			};
		}
	}, [delay, containerRef, refs]);
}
