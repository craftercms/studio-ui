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

import ContentType, { type DataSource } from '../../../models/ContentType';
import { ContentTypeField } from '../../../models';
import { useMemo } from 'react';

// TODO: this is really similar to useExtractItemPickerDataSources, check if can be refactored to a common hook
export function useExtractImagePickerDataSources(contentType: ContentType, field: ContentTypeField): DataSource[] {
	const dataSources = contentType.dataSources;
	const dataSourceIdString = (field.properties.imageManager?.value as string) ?? '';
	return useMemo(() => {
		const dataSourceIds = dataSourceIdString.split(',');
		return dataSources.filter((ds) => dataSourceIds.includes(ds.id));
	}, [dataSources, dataSourceIdString]);
}
