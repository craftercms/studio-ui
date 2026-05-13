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
import { fetchAllowedTypes } from '../services/contentTypes';
import useActiveSiteId from './useActiveSiteId';
import { pushErrorDialog } from '../utils/system';
import { extractErrorPayload } from '../utils/ajax';
import useContentTypeList from './useContentTypeList';

export function useFetchAllowedTypesForPath(path: string, responseFilterFn?: (types: ContentType[]) => ContentType[]) {
	const site = useActiveSiteId();
	const dispatch = useDispatch();
	const [isFetching, setIsFetching] = useState(false);
	const fullContentTypesList = useContentTypeList() ?? [];
	const [contentTypes, setContentTypes] = useState<ContentType[]>();
	const effectRefs = useUpdateRefs({ responseFilterFn, fullContentTypesList });
	useEffect(() => {
		if (path) {
			setIsFetching(true);
			const sub = fetchAllowedTypes(site, path).subscribe({
				next(typesIds) {
					const { fullContentTypesList, responseFilterFn } = effectRefs.current;
					const contentTypes = fullContentTypesList.filter((contentType) => typesIds.includes(contentType.id));
					setIsFetching(false);
					setContentTypes(responseFilterFn ? responseFilterFn(contentTypes) : contentTypes);
				},
				error(error) {
					setIsFetching(false);
					dispatch(pushErrorDialog({ props: { error: extractErrorPayload(error) } }));
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
