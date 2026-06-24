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

export const labelDescriptor: DescriptorContentType = {
	id: 'label',
	name: defineMessage({ defaultMessage: 'Label' }),
	description: defineMessage({ defaultMessage: 'Static text label' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['text']
		})
	],
	fields: {
		text: {
			id: 'text',
			type: 'rte',
			name: defineMessage({ defaultMessage: 'Text' }),
			defaultValue: undefined,
			validations: immutableEmptyObject,
			properties: {
				rteConfiguration: {
					name: 'rteConfiguration',
					value: 'craftercms-label-control',
					type: 'string'
				}
			}
		}
	},
	metadata: {
		suffixes: ['_s']
	}
};

export default labelDescriptor;
