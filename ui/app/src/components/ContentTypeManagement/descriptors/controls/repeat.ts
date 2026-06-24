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

export const repeatDescriptor: DescriptorContentType = {
	id: 'repeat',
	name: defineMessage({ defaultMessage: 'Repeating Group' }),
	description: defineMessage({ defaultMessage: 'Group of fields that can be repeated' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['minOccurs', 'maxOccurs']
		})
	],
	fields: {
		minOccurs: {
			id: 'minOccurs',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Minimum Occurrences' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		maxOccurs: {
			id: 'maxOccurs',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Maximum Occurrences' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	},
	metadata: {
		suffixes: ['_o']
	}
};

export default repeatDescriptor;
