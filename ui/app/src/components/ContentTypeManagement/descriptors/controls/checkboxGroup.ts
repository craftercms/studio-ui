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

export const checkboxGroupDescriptor: DescriptorContentType = {
	id: 'checkbox-group',
	name: defineMessage({ defaultMessage: 'Checkbox Group' }),
	description: defineMessage({ defaultMessage: 'Multiple checkbox inputs' }),
	sections: [
		createVirtualSection({
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['datasource', 'selectAll', 'listDirection', 'readonly']
		}),
		createVirtualSection({ title: defineMessage({ defaultMessage: 'Constraints' }), fields: ['minSize'] })
	],
	fields: {
		datasource: {
			id: 'datasource',
			type: 'datasource-single-selector',
			name: defineMessage({ defaultMessage: 'Data Source' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'item')
			}
		},
		selectAll: {
			id: 'selectAll',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Show select all' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		listDirection: {
			id: 'listDirection',
			type: 'dropdown-static-values',
			name: defineMessage({ defaultMessage: 'List Direction' }),
			defaultValue: [
				{
					value: 'horizontal',
					label: 'Horizontal',
					selected: true
				},
				{
					value: 'vertical',
					label: 'Vertical',
					selected: false
				}
			],
			validations: immutableEmptyObject
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Read Only' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		minSize: {
			id: 'minSize',
			type: 'numeric-input',
			name: defineMessage({ defaultMessage: 'Minimum Selected' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default checkboxGroupDescriptor;
