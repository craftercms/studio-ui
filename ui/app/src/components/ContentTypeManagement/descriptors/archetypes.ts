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

type OutOfTheBoxArchetype = 'page' | 'component';

// TODO: In the future, we may allow extending OOTB archetypes and defining custom ones through config.

// In the future, it could receive a "template" coming from config to extend OOTB archetypes or start from a custom one
// initializeTypeForCreate(archetype: string, template: ContentType): ContentType
export function initializeTypeForCreate(
	mixin: Partial<ContentType>,
	archetype: OutOfTheBoxArchetype | string,
	archetypeMap?: LookupTable<ContentType>
): ContentType {
	const fileNameDescriptor = controlDescriptors['auto-filename'];
	const fileNameProps = getPropertiesAndValidationsFromDescriptor(fileNameDescriptor);
	const inputDescriptor = controlDescriptors['input'];
	const inputProps = getPropertiesAndValidationsFromDescriptor(inputDescriptor);
	switch (archetype) {
		case 'component':
			return createEmptyTypeStructure({
				mergeStrategy: 'inherit-levels',
				type: 'component',
				...mixin,
				fields: {
					// - Component ID (file-name) - auto-filename
					// - Internal Name (internal-name) - input
					[XmlKeys.fileName]: {
						id: XmlKeys.fileName,
						type: 'auto-filename',
						name: 'Component ID',
						description: '',
						helpText: '',
						defaultValue: '',
						...fileNameProps
					},
					[XmlKeys.internalName]: {
						id: XmlKeys.internalName,
						type: 'input',
						name: 'Internal Name',
						description: '',
						helpText: '',
						defaultValue: '',
						...inputProps
					},
					...mixin?.fields
				},
				sections: [
					{
						id: 'defaultSection',
						color: 'rgba(255,0,0,.7)',
						title: 'System Properties',
						fields: [XmlKeys.fileName, XmlKeys.internalName],
						description: '',
						expandByDefault: true
					},
					...(mixin?.sections ?? [])
				]
			});
		case 'page': {
			const pageNavOrderDescriptor = controlDescriptors['page-nav-order'];
			const pageNavOrderProps = getPropertiesAndValidationsFromDescriptor(pageNavOrderDescriptor);
			return createEmptyTypeStructure({
				mergeStrategy: 'inherit-levels',
				type: 'page',
				...mixin,
				fields: {
					[XmlKeys.fileName]: {
						id: XmlKeys.fileName,
						type: 'file-name',
						name: 'Component ID',
						description: '',
						helpText: '',
						defaultValue: '',
						...fileNameProps
					},
					[XmlKeys.internalName]: {
						id: XmlKeys.internalName,
						type: 'input',
						name: 'Internal Name',
						description: '',
						helpText: '',
						defaultValue: '',
						...inputProps
					},
					[XmlKeys.placeInNav]: {
						id: XmlKeys.placeInNav,
						type: 'page-nav-order',
						name: 'Place in Nav',
						description: '',
						helpText: '',
						defaultValue: '',
						validations: immutableEmptyObject,
						...pageNavOrderProps
					},
					navLabel: {
						id: 'navLabel',
						type: 'input',
						name: 'Nav Label',
						description: '',
						helpText: '',
						defaultValue: '',
						validations: immutableEmptyObject,
						...inputProps
					},
					...mixin?.fields
				},
				sections: [
					{
						id: 'defaultSection',
						color: 'rgba(255,0,0,.7)',
						title: 'System Properties',
						fields: [XmlKeys.fileName, XmlKeys.internalName, XmlKeys.placeInNav, 'navLabel'],
						description: '',
						expandByDefault: true
					},
					...(mixin?.sections ?? [])
				]
			});
		}
		default:
			return createEmptyTypeStructure({
				mergeStrategy: 'inherit-levels',
				...archetypeMap?.[archetype],
				fields: {
					...archetypeMap?.[archetype]?.fields,
					...mixin?.fields
				},
				sections: [...(archetypeMap?.[archetype]?.sections ?? []), ...(mixin?.sections ?? [])]
			});
	}
}
