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
import type LookupTable from '../../../models/LookupTable';
import type { AllowedContentTypesDataWithDestinations, AllowedPathsData } from '../controls/NodeSelector';
import { ComponentsDatasource, DataSource } from '../../../models';
import { parseComponentsDataSourceContentTypesProperty } from '../../../services/contentTypes';

export interface ConsolidatedItemPickerData {
	allowedCreateTypes: LookupTable<AllowedContentTypesDataWithDestinations>;
	allowedCreatePaths: string[];
	allowedBrowsePaths: AllowedPathsData[];
	allowedSearchPaths: AllowedPathsData[];
}

export function useConsolidatedItemPickerData(dataSources: DataSource[]): ConsolidatedItemPickerData {
	return useMemo(() => {
		const allowedCreateTypes: LookupTable<AllowedContentTypesDataWithDestinations> = {};
		const allowedCreatePaths = new Set<string>();
		const allowedBrowsePaths: AllowedPathsData[] = [];
		const allowedSearchPaths: AllowedPathsData[] = [];

		dataSources.forEach((ds) => {
			switch (ds.type) {
				case 'components': {
					// TODO: Handle '*' from components DS
					const allowedContentTypesData =
						parseComponentsDataSourceContentTypesProperty(ds as ComponentsDatasource, ds.properties.contentTypes)
							.allowedContentTypes.value ?? {};
					const allowedContentTypes: string[] = Object.keys(allowedContentTypesData);
					const allowedSharedExisingTypes: string[] = [];
					allowedContentTypes.forEach((contentTypeId) => {
						if (allowedContentTypesData[contentTypeId].embedded) {
							allowedCreateTypes[contentTypeId] = allowedCreateTypes[contentTypeId] ?? {};
							allowedCreateTypes[contentTypeId].embedded = true;
						}
						if (allowedContentTypesData[contentTypeId].shared) {
							allowedCreateTypes[contentTypeId] = allowedCreateTypes[contentTypeId] ?? {};
							allowedCreateTypes[contentTypeId].shared = true;
							const brp = ds.properties.baseRepoPath?.trim();
							if (brp) {
								allowedCreateTypes[contentTypeId].createPaths = allowedCreateTypes[contentTypeId].createPaths ?? [];
								allowedCreateTypes[contentTypeId].createPaths.push(brp);
							}
						}
						if (allowedContentTypesData[contentTypeId].sharedExisting) {
							allowedSharedExisingTypes.push(contentTypeId);
						}
					});
					if (ds.properties.enableBrowse) {
						allowedBrowsePaths.push({
							title: ds.title,
							path: ds.properties.baseBrowsePath,
							allowedContentTypes: allowedSharedExisingTypes
						});
					}
					if (ds.properties.enableSearch) {
						allowedSearchPaths.push({
							title: ds.title,
							path: ds.properties.baseBrowsePath,
							allowedContentTypes: allowedSharedExisingTypes
						});
					}
					break;
				}
				case 'shared-content': {
					// TODO: For some reason, in editorial, the home type doesn't have any of the "enable" properties: enableCreateNew, enableBrowseExisting, enableSearchExisting
					//   Unsure if this is a BP issue or something that comes from legacy which loads of other old client sites could have.
					// Shared content DS properties:
					// - enableBrowseExisting
					// - enableCreateNew
					// - enableSearchExisting
					// - browsePath
					// - repoPath
					// - type ("Default Type" property, refers to a content type)
					const contentTypeId = ds.properties.type?.trim();
					if (ds.properties.enableBrowseExisting) {
						allowedBrowsePaths.push({
							title: ds.title,
							path: ds.properties.browsePath || ds.properties.repoPath,
							allowedContentTypes: contentTypeId ? [contentTypeId] : []
						});
					}
					if (ds.properties.enableSearchExisting) {
						allowedSearchPaths.push({
							title: ds.title,
							path: ds.properties.browsePath,
							allowedContentTypes: contentTypeId ? [contentTypeId] : []
						});
					}
					if (ds.properties.enableCreateNew) {
						// If the datasource has a specific type, add as an allowed, if not, add the repoPath so later on
						// the system can calculate the types allowed on that path.
						if (contentTypeId) {
							allowedCreateTypes[contentTypeId] = allowedCreateTypes[contentTypeId] ?? {};
							allowedCreateTypes[contentTypeId].shared = true;
							const brp = ds.properties.repoPath?.trim();
							if (brp) {
								allowedCreateTypes[contentTypeId].createPaths = allowedCreateTypes[contentTypeId].createPaths ?? [];
								allowedCreateTypes[contentTypeId].createPaths.push(brp);
							}
						} else {
							allowedCreatePaths.add(ds.properties.repoPath);
						}
					}
					break;
				}
				case 'embedded-content': {
					// Embedded content DS properties: contentType
					const contentTypeId = ds.properties.contentType.trim();
					allowedCreateTypes[contentTypeId] = allowedCreateTypes[contentTypeId] ?? {};
					allowedCreateTypes[contentTypeId].embedded = true;
					break;
				}
				default:
					console.warn(`Unknown item picker data source type "${ds.type}"`, ds);
					return;
			}
		});

		return {
			allowedCreateTypes,
			allowedCreatePaths: Array.from(allowedCreatePaths),
			allowedBrowsePaths,
			allowedSearchPaths
		};
	}, [dataSources]);
}

export default useConsolidatedItemPickerData;
