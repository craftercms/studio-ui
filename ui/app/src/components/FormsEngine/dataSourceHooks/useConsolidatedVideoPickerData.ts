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
import type { ConsolidatedMediaPickerData } from './useConsolidatedImagePickerData';

export function useConsolidatedVideoPickerData(dataSources: DataSource[]): ConsolidatedMediaPickerData {
	return useMemo(() => {
		const allowedBrowsePaths: AllowedPathsData[] = [];
		const allowedUploadPaths: AllowedPathsData[] = [];
		const allowedSearchPaths: AllowedPathsData[] = [];

		dataSources.forEach((ds) => {
			switch (ds.type) {
				case 'video-browse-repo': {
					if (ds.properties.useSearch) {
						allowedSearchPaths.push({
							title: ds.title,
							path: ds.properties.repoPath || ds.properties.path
						});
					} else {
						allowedBrowsePaths.push({
							title: ds.title,
							path: ds.properties.repoPath
						});
					}
					break;
				}
				case 'video-desktop-upload': {
					allowedUploadPaths.push({
						title: ds.title,
						path: ds.properties.repoPath
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
