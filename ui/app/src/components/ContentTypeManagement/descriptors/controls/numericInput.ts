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

export const numericInputDescriptor: DescriptorContentType = {
	id: 'numeric-input',
	name: defineMessage({ defaultMessage: 'Numeric Input' }),
	description: defineMessage({ defaultMessage: 'Input field that accepts numbers' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['maxValue', 'minValue', 'readonly', 'tokenize']
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required', 'pattern']
		})
	],
	fields: {
		maxValue: {
			id: 'maxValue',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Maximum Value' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		minValue: {
			id: 'minValue',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Minimum Value' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonly: commonFieldPropertiesDescriptors['readonly'],
		tokenize: commonFieldPropertiesDescriptors['tokenize'],
		required: commonFieldPropertiesDescriptors['required'],
		pattern: {
			id: 'pattern',
			type: 'string',
			name: defineMessage({ defaultMessage: 'Match Pattern' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	},
	metadata: {
		suffixes: ['_i', '_l', '_f', '_d']
	}
};

export default numericInputDescriptor;
