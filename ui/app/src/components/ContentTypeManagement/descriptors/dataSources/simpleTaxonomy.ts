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

export const simpleTaxonomyDataSourceDescriptor: DescriptorContentType = {
	id: 'simpleTaxonomy',
	name: defineMessage({ defaultMessage: 'Simple Taxonomy' }),
	description: '',
	type: 'item',
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['dataType', 'componentPath']
		})
	],
	fields: {
		dataType: {
			id: 'dataType',
			type: 'dropdown-static-values',
			name: defineMessage({ defaultMessage: 'Data Type' }),
			defaultValue: `[
				{
					"value": "value_s",
					"label": "String",
					"selected": true
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
		componentPath: {
			id: 'componentPath',
			type: 'content-path-input',
			name: defineMessage({ defaultMessage: 'Component Path' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default simpleTaxonomyDataSourceDescriptor;
