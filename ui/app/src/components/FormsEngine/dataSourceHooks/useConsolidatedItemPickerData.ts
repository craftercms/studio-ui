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
import type ContentType from '../../../models/ContentType';
import useContentTypeList from '../../../hooks/useContentTypeList';
import { parseComponentsDataSourceContentTypesProperty } from '../../../services/contentTypes';

/**
 * Resolves the content types for a given components or pages data source, handling wildcards.
 *
 * This function interprets the `contentTypesProperty` parameter, which may contain a comma-separated list of content
 * type ids or the wildcard character "*". If "*" is provided, it is replaced with a comma-separated list of all
 * content type ids relevant for the given dataSourceType ('components' or 'pages')
 *
 * @param {string | undefined} contentTypesProperty - The raw content types property from the data source configuration. Can be a comma-separated list of ids or "*".
 * @param {'components' | 'pages'} dataSourceType - Indicates if the data source is for components or pages. Used to filter the contentTypes list accordingly.
 * @param {ContentType[] | null} contentTypes - The full list of all content types. Required if `contentTypesProperty` is '*'.
 * @returns {string | undefined} - A comma-separated list of resolved content type ids, the original property when not a wildcard, or undefined.
 */
function resolveComponentsDataSourceContentTypes(
	contentTypesProperty: string | undefined,
	dataSourceType: 'components' | 'pages',
	contentTypes: ContentType[] | null
): string | undefined {
	if (contentTypesProperty?.trim() !== '*') {
		return contentTypesProperty;
	}
	if (!contentTypes) {
		return undefined;
	}
	const expectedType = dataSourceType === 'pages' ? 'page' : 'component';
	return contentTypes
		.filter((contentType) => contentType.type === expectedType)
		.map((contentType) => contentType.id)
		.join(',');
}

export interface ConsolidatedItemPickerData {
	allowedCreateTypes: LookupTable<AllowedContentTypesDataWithDestinations>;
	allowedCreatePaths: string[];
	allowedBrowsePaths: AllowedPathsData[];
	allowedSearchPaths: AllowedPathsData[];
	allowedUploadPaths: AllowedPathsData[];
}

export function useConsolidatedItemPickerData(dataSources: DataSource[]): ConsolidatedItemPickerData {
	const contentTypes = useContentTypeList();
	return useMemo(() => {
		const allowedCreateTypes: LookupTable<AllowedContentTypesDataWithDestinations> = {};
		const allowedCreatePaths = new Set<string>();
		const allowedBrowsePaths: AllowedPathsData[] = [];
		const allowedSearchPaths: AllowedPathsData[] = [];
		const allowedUploadPaths: AllowedPathsData[] = [];

		dataSources.forEach((ds) => {
			switch (ds.type) {
				case 'components':
				case 'pages': {
					const resolvedContentTypes = resolveComponentsDataSourceContentTypes(
						ds.properties.contentTypes,
						ds.type as 'components' | 'pages',
						contentTypes
					);
					const allowedContentTypesData =
						resolvedContentTypes !== undefined
							? (parseComponentsDataSourceContentTypesProperty(
									ds as ComponentsDatasource,
									resolvedContentTypes
								).allowedContentTypes.value ?? {})
							: {};
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
							// Some already saved content has 'baseRepositoryPath' instead of 'baseRepoPath', so we need to check both.
							// Current descriptors and old FE1 controls have 'baseRepoPath'.
							const brp = ds.properties.baseRepositoryPath?.trim() ?? ds.properties.baseRepoPath?.trim();
							if (brp) {
								allowedCreateTypes[contentTypeId].createPaths = allowedCreateTypes[contentTypeId].createPaths ?? [];
								allowedCreateTypes[contentTypeId].createPaths.push(brp);
							}
						}
						if (allowedContentTypesData[contentTypeId].sharedExisting) {
							allowedSharedExisingTypes.push(contentTypeId);
						}
					});
					const sortOptions = {
						sortBy: ds.properties?.['sortBy'] as string | undefined,
						sortOrder: ds.properties?.['sortOrder'] as 'asc' | 'desc' | undefined
					};
					if (ds.properties.enableBrowse) {
						allowedBrowsePaths.push({
							title: ds.title,
							path: ds.properties.baseBrowsePath,
							allowedContentTypes: allowedSharedExisingTypes,
							options: sortOptions
						});
					}
					if (ds.properties.enableSearch) {
						allowedSearchPaths.push({
							title: ds.title,
							path: ds.properties.baseBrowsePath,
							allowedContentTypes: allowedSharedExisingTypes,
							options: sortOptions
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
				case 'file-desktop-upload': {
					allowedUploadPaths.push({
						title: ds.title,
						path: ds.properties.repoPath
					});
					break;
				}
				case 'file-browse-repo': {
					allowedBrowsePaths.push({
						title: ds.title,
						path: ds.properties.repoPath
					});
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
			allowedSearchPaths,
			allowedUploadPaths
		};
	}, [dataSources, contentTypes]);
}

export default useConsolidatedItemPickerData;
