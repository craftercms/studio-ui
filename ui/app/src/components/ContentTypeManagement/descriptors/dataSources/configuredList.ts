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

import { immutableEmptyObject } from '../../../../utils/object';
import { createVirtualSection, PartialContentType } from '../../utils';

export const configuredListDataSourceDescriptor: PartialContentType = {
	id: 'configured-list',
	name: 'Configured List',
	description: '',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['dataType', 'listName', 'sort']
		}),
		createVirtualSection({ id: 'constraints', title: 'Constraints', fields: ['required'] })
	],
	fields: {
		dataType: {
			id: 'dataType',
			type: 'dropdown-static-values',
			name: 'Data Type',
			defaultValue: [
				{
					value: 'value',
					label: 'No Data Type',
					selected: true
				},
				{
					value: 'value_s',
					label: 'String',
					selected: false
				},
				{
					value: 'value_i',
					label: 'Integer',
					selected: false
				},
				{
					value: 'value_f',
					label: 'Float',
					selected: false
				},
				{
					value: 'value_dt',
					label: 'Date',
					selected: false
				},
				{
					value: 'value_html',
					label: 'HTML',
					selected: false
				}
			],
			validations: immutableEmptyObject
		},
		listName: {
			id: 'listName',
			type: 'input',
			name: 'List Name',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		sort: {
			id: 'sort',
			type: 'dropdown-static-values',
			name: 'Sort',
			defaultValue: [
				{
					value: 'None',
					label: 'None',
					selected: true
				},
				{
					value: 'ascending',
					label: 'Ascending',
					selected: false
				},
				{
					value: 'descending',
					label: 'Descending',
					selected: false
				}
			],
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'required',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default configuredListDataSourceDescriptor;
