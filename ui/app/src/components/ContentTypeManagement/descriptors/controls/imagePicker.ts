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

import { createValidation, createVirtualSection, DescriptorContentType } from '../../utils';
import { immutableEmptyObject } from '../../../../utils/object';
import { defineMessage } from 'react-intl';
import { commonFieldPropertiesDescriptors } from './commonDescriptors';

export const imagePickerDescriptor: DescriptorContentType = {
	id: 'image-picker',
	name: defineMessage({ defaultMessage: 'Image' }),
	description: defineMessage({ defaultMessage: 'Image selection tool' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['width', 'height', 'thumbnailWidth', 'thumbnailHeight', 'imageManager', 'readonly']
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required']
		})
	],
	fields: {
		width: {
			id: 'width',
			type: 'range',
			name: defineMessage({ defaultMessage: 'Width' }),
			defaultValue: '{ "exact": "", "min": "", "max": "" }',
			validations: immutableEmptyObject
		},
		height: {
			id: 'height',
			type: 'range',
			name: defineMessage({ defaultMessage: 'Height' }),
			defaultValue: '{ "exact": "", "min": "", "max": "" }',
			validations: immutableEmptyObject
		},
		thumbnailWidth: {
			id: 'thumbnailWidth',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Thumbnail Width' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		thumbnailHeight: {
			id: 'thumbnailHeight',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Thumbnail Height' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		imageManager: {
			id: 'imageManager',
			type: 'datasource:image',
			name: defineMessage({ defaultMessage: 'Data Source' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'image')
			}
		},
		readonly: commonFieldPropertiesDescriptors['readonly'],
		required: commonFieldPropertiesDescriptors['required']
	},
	metadata: {
		suffixes: ['_s']
	}
};

export default imagePickerDescriptor;
