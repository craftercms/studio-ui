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

import { createVirtualSection, PartialContentType } from '../../utils';
import { immutableEmptyObject } from '../../../../utils/object';

export const rteDescriptor: PartialContentType = {
	id: 'rte',
	name: 'Rich Text Editor',
	description: 'Rich text editing area',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: [
				'height',
				'autoGrow',
				'enableSpellCheck',
				'supportedChannels',
				'rteConfiguration',
				'imageManager',
				'videoManager',
				'audioManager',
				'fileManager'
			]
		}),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		height: {
			id: 'height',
			type: 'numeric-input',
			name: 'Height',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		autoGrow: {
			id: 'autoGrow',
			type: 'checkbox',
			name: 'Auto Grow',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		enableSpellCheck: {
			id: 'enableSpellCheck',
			type: 'checkbox',
			name: 'Enable Spell Check',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		// TODO: this is a custom type in legacy, need to check
		supportedChannels: {
			id: 'supportedChannels',
			type: 'input',
			name: 'Supported Channels',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		rteConfiguration: {
			id: 'rteConfiguration',
			type: 'input',
			name: 'RTE Configuration',
			defaultValue: 'generic',
			validations: immutableEmptyObject
		},
		imageManager: {
			id: 'imageManager',
			type: 'datasource-selector',
			name: 'Image Manager',
			defaultValue: undefined,
			validations: {
				// @ts-expect-error 'type' does not exist in type Partial<ContentTypeFieldValidations>
				type: 'image'
			}
		},
		videoManager: {
			id: 'videoManager',
			type: 'datasource-selector',
			name: 'Video Manager',
			defaultValue: undefined,
			validations: {
				// @ts-expect-error 'type' does not exist in type Partial<ContentTypeFieldValidations>
				type: 'video'
			}
		},
		audioManager: {
			id: 'audioManager',
			type: 'datasource-selector',
			name: 'Audio Manager',
			defaultValue: undefined,
			validations: {
				// @ts-expect-error 'type' does not exist in type Partial<ContentTypeFieldValidations>
				type: 'audio'
			}
		},
		fileManager: {
			id: 'fileManager',
			type: 'datasource-selector',
			name: 'File Manager',
			defaultValue: undefined,
			validations: {
				// @ts-expect-error 'type' does not exist in type Partial<ContentTypeFieldValidations>
				type: 'item'
			}
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'Required',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default rteDescriptor;
