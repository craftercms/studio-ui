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

import { useMemo } from 'react';
import type { AllowedPathsData } from '../controls/NodeSelector';
import type { DataSource } from '../../../models';

export interface ConsolidatedMediaPickerData {
	allowedBrowsePaths: AllowedPathsData[];
	allowedUploadPaths: AllowedPathsData[];
	allowedSearchPaths: AllowedPathsData[];
}

// TODO: Handle custom data sources (plugins).
/** Gets a list of data sources and categorizes them into browse, upload and search paths.
 *
 * @param dataSources List of data sources to consolidate.
 * @return An object containing categorized paths for browsing, uploading, and searching.
 * */
export function useConsolidatedImagePickerData(dataSources: DataSource[]): ConsolidatedMediaPickerData {
	return useMemo(() => {
		const allowedBrowsePaths: AllowedPathsData[] = [];
		const allowedUploadPaths: AllowedPathsData[] = [];
		const allowedSearchPaths: AllowedPathsData[] = [];
		dataSources.forEach((ds) => {
			switch (ds.type) {
				case 'img-repository-upload': {
					const path = ds.properties.repoPath || ds.properties.path;
					if (!path) break;
					const sortOptions = {
						sortBy: ds.properties?.['sortBy'] as string | undefined,
						sortOrder: ds.properties?.['sortOrder'] as 'asc' | 'desc' | undefined
					};
					if (ds.properties.useSearch) {
						allowedSearchPaths.push({
							title: ds.title,
							path,
							options: sortOptions
						});
					} else {
						allowedBrowsePaths.push({
							title: ds.title,
							path,
							options: sortOptions
						});
					}
					break;
				}
				case 'img-desktop-upload': {
					const path = ds.properties.repoPath || ds.properties.path;
					if (!path) break;
					allowedUploadPaths.push({
						title: ds.title,
						path
					});
					break;
				}
			}
		});

		return {
			allowedBrowsePaths,
			allowedUploadPaths,
			allowedSearchPaths
		};
	}, [dataSources]);
}
