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

export const timeDescriptor: DescriptorContentType = {
	id: 'time',
	name: defineMessage({ defaultMessage: 'Time' }),
	description: defineMessage({ defaultMessage: 'Time picker' }),
	sections: [
		createVirtualSection({
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
		createVirtualSection({ title: defineMessage({ defaultMessage: 'Constraints' }), fields: ['required'] })
	],
	fields: {
		showClear: {
			id: 'showClear',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Show Clear' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		showNowLink: {
			id: 'showNowLink',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Show Now Link' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		populate: {
			id: 'populate',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Populated' }),
			defaultValue: true,
			validations: immutableEmptyObject
		},
		populateDateExp: {
			id: 'populateDateExp',
			type: 'input',
			name: defineMessage({ defaultMessage: 'Populate Expression' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		useCustomTimezone: {
			id: 'useCustomTimezone',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Use Custom Timezone' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Read Only' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonlyEdit: {
			id: 'readonlyEdit',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Read Only on Edit' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Required' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	},
	supportedPostFixes: ['_to']
};

export default timeDescriptor;
