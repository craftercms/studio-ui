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

export const timeDescriptor: DescriptorContentType = {
	id: 'time',
	name: defineMessage({ defaultMessage: 'Time' }),
	description: defineMessage({ defaultMessage: 'Time picker' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: [
				'showClear',
				'showNowLink',
				'populate',
				'populateDateExp',
				'useCustomTimezone',
				'readonly',
				'readonlyEdit'
			]
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required']
		})
	],
	fields: {
		showClear: {
			id: 'showClear',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Show Clear' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		showNowLink: {
			id: 'showNowLink',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Show Now Link' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		populate: {
			id: 'populate',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Populated' }),
			defaultValue: true,
			validations: immutableEmptyObject
		},
		populateDateExp: {
			id: 'populateDateExp',
			type: 'date-time-expression-input',
			name: defineMessage({ defaultMessage: 'Populate Expression' }),
			defaultValue: 'now',
			validations: {
				type: createValidation('type', 'time')
			}
		},
		useCustomTimezone: {
			id: 'useCustomTimezone',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Use Custom Timezone' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonly: commonFieldPropertiesDescriptors['readonly'],
		readonlyEdit: {
			id: 'readonlyEdit',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Read Only on Edit' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		required: commonFieldPropertiesDescriptors['required']
	},
	metadata: {
		suffixes: ['_to']
	}
};

export default timeDescriptor;
