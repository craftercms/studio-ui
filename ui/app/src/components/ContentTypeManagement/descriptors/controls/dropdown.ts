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

export const dropdownDescriptor: DescriptorContentType = {
	id: 'dropdown',
	name: defineMessage({ defaultMessage: 'Dropdown' }),
	description: defineMessage({ defaultMessage: 'Dropdown select input' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['datasource', 'emptyvalue', 'readonly']
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required']
		})
	],
	fields: {
		datasource: {
			id: 'datasource',
			type: 'datasource:item',
			name: defineMessage({ defaultMessage: 'Data Source' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'item')
			}
		},
		emptyvalue: {
			id: 'emptyvalue',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Allow Empty Value' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonly: commonFieldPropertiesDescriptors['readonly'],
		required: commonFieldPropertiesDescriptors['required']
	},
	metadata: {
		suffixes: ['_s', '_i', '_f']
	}
};

export default dropdownDescriptor;
