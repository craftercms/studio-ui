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

import ContentType from '../../../models/ContentType';
import { XmlKeys } from '../../FormsEngine/lib/formConsts';
import { immutableEmptyObject } from '../../../utils/object';
import { createEmptyTypeStructure, getPropertiesAndValidationsFromDescriptor } from '../utils';
import LookupTable from '../../../models/LookupTable';
import controlDescriptors from './controls';

export type Archetype = {
	id: string;
	name: string;
	descriptor: ContentType;
};

type OutOfTheBoxArchetype = 'page' | 'component';

// TODO: In the future, we may allow extending OOTB archetypes and defining custom ones through config.

// In the future, it could receive a "template" coming from config to extend OOTB archetypes or start from a custom one
// initializeTypeForCreate(archetype: string, template: ContentType): ContentType
export function initializeTypeForCreate(
	mixin: Partial<ContentType>,
	archetype: OutOfTheBoxArchetype | string,
	archetypeMap?: LookupTable<Archetype>
): ContentType {
	const descriptor = archetypeMap?.[archetype]?.descriptor ?? { fields: null, sections: null };
	return createEmptyTypeStructure({
		mergeStrategy: 'inherit-levels',
		...descriptor,
		...mixin,
		previewable: archetype === 'page',
		fields: {
			...(descriptor?.fields ?? {}),
			...mixin?.fields
		},
		sections: [...(descriptor?.sections ?? []), ...(mixin?.sections ?? [])]
	});
}
