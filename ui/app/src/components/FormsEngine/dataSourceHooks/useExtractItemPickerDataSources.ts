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

import ContentType, { ContentTypeField, DataSource } from '../../../models/ContentType';
import { useMemo } from 'react';

export function useExtractItemPickerDataSources(contentType: ContentType, field: ContentTypeField): DataSource[] {
	const dataSources = contentType.dataSources;
	// TODO: In dropdown, the `itemManager` "property" is called datasource
	const dataSourceIdString = (field.properties.itemManager?.value as string) ?? '';
	return useMemo(() => {
		const dataSourceIds = dataSourceIdString.split(',');
		return dataSources.filter((ds) => dataSourceIds.includes(ds.id));
	}, [dataSources, dataSourceIdString]);
}
