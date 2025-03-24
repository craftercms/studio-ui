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

import { ContentType } from '../models';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import useUpdateRefs from './useUpdateRefs';
import { fetchLegacyContentTypes, parseLegacyContentType } from '../services/contentTypes';
import { map } from 'rxjs/operators';
import { showErrorDialog } from '../state/reducers/dialogs/error';
import useActiveSiteId from './useActiveSiteId';

export function useFetchAllowedTypesForPath(path: string, responseFilterFn?: (types: ContentType[]) => ContentType[]) {
	const site = useActiveSiteId();
	const dispatch = useDispatch();
	const [isFetching, setIsFetching] = useState(false);
	const [contentTypes, setContentTypes] = useState<ContentType[]>();
	const effectRefs = useUpdateRefs({ responseFilterFn });
	useEffect(() => {
		if (path) {
			setIsFetching(true);
			const sub = fetchLegacyContentTypes(site, path)
				.pipe(map((legacyTypes) => legacyTypes.map(parseLegacyContentType)))
				.subscribe({
					next(response) {
						const responseFilterFn = effectRefs.current.responseFilterFn;
						setIsFetching(false);
						setContentTypes(responseFilterFn ? responseFilterFn(response) : response);
					},
					error(response) {
						setIsFetching(false);
						dispatch(showErrorDialog({ error: response }));
					}
				});
			return () => {
				sub.unsubscribe();
			};
		}
	}, [path, site, dispatch, effectRefs]);
	return {
		isFetching,
		contentTypes
	};
}

export default useFetchAllowedTypesForPath;
