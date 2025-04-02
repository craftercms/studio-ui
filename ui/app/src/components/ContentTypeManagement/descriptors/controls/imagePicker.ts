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

export const imagePickerDescriptor: PartialContentType = {
	id: 'image-picker',
	name: 'Image Picker',
	description: 'Image selection tool',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['width', 'height', 'thumbnailWidth', 'thumbnailHeight', 'datasource', 'readonly']
		}),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		width: {
			id: 'width',
			type: 'range',
			name: 'Width',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		height: {
			id: 'height',
			type: 'range',
			name: 'Height',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		thumbnailWidth: {
			id: 'thumbnailWidth',
			type: 'numeric-input',
			name: 'Thumbnail Width',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		thumbnailHeight: {
			id: 'thumbnailHeight',
			type: 'numeric-input',
			name: 'Thumbnail Height',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		datasource: {
			id: 'datasource',
			type: 'datasource-selector',
			name: 'Data Source',
			defaultValue: undefined,
			validations: {
				// @ts-expect-error 'type' does not exist in type Partial<ContentTypeFieldValidations>
				type: 'image'
			}
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'Read Only',
			defaultValue: undefined,
			validations: immutableEmptyObject
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

export default imagePickerDescriptor;
