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

export const checkboxGroupDescriptor: PartialContentType = {
	id: 'checkbox-group',
	name: 'Checkbox Group',
	description: 'Multiple checkbox inputs',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['datasource', 'selectAll', 'listDirection', 'readonly']
		}),
		createVirtualSection({ title: 'Constraints', fields: ['minSize'] })
	],
	fields: {
		// TODO: check this type
		datasource: {
			id: 'datasource',
			type: 'input',
			name: 'Data Source',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		selectAll: {
			id: 'selectAll',
			type: 'checkbox',
			name: 'Show select all',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		listDirection: {
			id: 'listDirection',
			type: 'dropdown-static-values',
			name: 'List Direction',
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
			name: 'Read Only',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		minSize: {
			id: 'minSize',
			type: 'numeric-input',
			name: 'Minimum Selected',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default checkboxGroupDescriptor;
