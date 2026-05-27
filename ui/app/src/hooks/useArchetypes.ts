/*
 * Copyright (C) 2007-2026 Crafter Software Corporation. All Rights Reserved.
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

import useSelection from './useSelection';
import { deserialize, fromString } from '../utils/xml';
import { ContentType, LookupTable } from '../models';
import { asArray } from '../utils/array';
import { extendArchetypeDescriptor } from '../utils/object';
import { useEffect, useState } from 'react';
import { Archetype } from '../components/ContentTypeManagement/descriptors/archetypes';

export function useArchetypes() {
	const [archetypes, setArchetypes] = useState<LookupTable<Archetype>>({});
	const uiConfigXml = useSelection((state) => state.uiConfig.xml);

	useEffect(() => {
		if (uiConfigXml) {
			const configDOM = fromString(uiConfigXml);
			const archetypes = {};

			configDOM
				.querySelectorAll(
					'[id="craftercms.components.ContentTypeManagement"] > configuration > objectTypes > objectType'
				)
				.forEach((tag) => {
					const descriptor = tag.querySelector('descriptor');
					// Parent archetypes must be defined before children so that they can be extended properly
					const extendsFrom = tag.getAttribute('extends');
					let parentArchetype = null;
					if (extendsFrom) {
						parentArchetype = archetypes[extendsFrom] ?? {};
					}
					archetypes[tag.id] = {
						...parentArchetype,
						id: tag.id
					};
					if (descriptor) {
						let deserializedDescriptor: ContentType = deserialize(descriptor.innerHTML);
						deserializedDescriptor = {
							...deserializedDescriptor,
							id: tag.id,
							sections: asArray(deserializedDescriptor.sections).map((section) => ({
								...section,
								fields: asArray(section.fields)
							})),
							dataSources: asArray(deserializedDescriptor.dataSources)
						};

						archetypes[tag.id] = {
							...archetypes[tag.id],
							name: deserializedDescriptor.name,
							descriptor: extendArchetypeDescriptor(parentArchetype?.descriptor, deserializedDescriptor)
						};
					}
				});
			setArchetypes(archetypes);
		}
	}, [uiConfigXml]);

	return archetypes;
}

export default useArchetypes;
