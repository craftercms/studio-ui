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
import { createVirtualSection, DescriptorContentType } from '../../utils';
import { defineMessage } from 'react-intl';

export const configuredListDataSourceDescriptor: DescriptorContentType = {
	id: 'configured-list',
	name: defineMessage({ defaultMessage: 'Configured List of Pairs' }),
	description: '',
	type: 'item',
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['dataType', 'listName', 'sort']
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required']
		})
	],
	fields: {
		dataType: {
			id: 'dataType',
			type: 'dropdown-static-values',
			name: defineMessage({ defaultMessage: 'Data Type' }),
			defaultValue: `[
				{
					"value": "value",
					"label": "No Data Type",
					"selected": true
				},
				{
					"value": "value_s",
					"label": "String",
					"selected": false
				},
				{
					"value": "value_i",
					"label": "Integer",
					"selected": false
				},
				{
					"value": "value_f",
					"label": "Float",
					"selected": false
				},
				{
					"value": "value_dt",
					"label": "Date",
					"selected": false
				},
				{
					"value": "value_html",
					"label": "HTML",
					"selected": false
				}
			]`,
			validations: immutableEmptyObject
		},
		listName: {
			id: 'listName',
			type: 'string',
			name: defineMessage({ defaultMessage: 'List Name' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		sort: {
			id: 'sort',
			type: 'dropdown-static-values',
			name: defineMessage({ defaultMessage: 'Sort' }),
			defaultValue: `[
				{
					"value": "None",
					"label": "None",
					"selected": true
				},
				{
					"value": "ascending",
					"label": "Ascending",
					"selected": false
				},
				{
					"value": "descending",
					"label": "Descending",
					"selected": false
				}
			]`,
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'required' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default configuredListDataSourceDescriptor;
