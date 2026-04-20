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

import { createVirtualSection, DescriptorContentType } from '../../utils';
import { immutableEmptyObject } from '../../../../utils/object';
import { defineMessage } from 'react-intl';
import { commonFieldPropertiesDescriptors } from './commonDescriptors';

export const linkTextareaDescriptor: DescriptorContentType = {
	id: 'link-textarea',
	name: defineMessage({ defaultMessage: 'Link Text Area' }),
	description: defineMessage({ defaultMessage: 'Multiple URL/Link input' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['rows', 'maxlength', 'allowResize', 'readonly']
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required']
		})
	],
	fields: {
		rows: {
			id: 'rows',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Rows' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		maxlength: {
			id: 'maxlength',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Maximum Length' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		allowResize: {
			id: 'allowResize',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Allow Resize' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonly: commonFieldPropertiesDescriptors['readonly'],
		required: commonFieldPropertiesDescriptors['required']
	}
};

export default linkTextareaDescriptor;
