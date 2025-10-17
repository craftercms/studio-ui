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

export const dateTimeDescriptor: DescriptorContentType = {
	id: 'date-time',
	name: defineMessage({ defaultMessage: 'Date / Time' }),
	description: defineMessage({ defaultMessage: 'Date and time picker' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: [
				'showDate',
				'showTime',
				'showClear',
				'showNowLink',
				'populate',
				'allowPastDate',
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
		showDate: {
			id: 'showDate',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Show Date' }),
			defaultValue: true,
			validations: immutableEmptyObject
		},
		showTime: {
			id: 'showTime',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Show Time' }),
			defaultValue: false,
			validations: immutableEmptyObject
		},
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
		allowPastDate: {
			id: 'allowPastDate',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Allow Past Date' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		populateDateExp: {
			id: 'populateDateExp',
			type: 'date-time-expression-input',
			name: defineMessage({ defaultMessage: 'Populate Expression' }),
			defaultValue: 'now',
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
	supportedPostFixes: ['_dt']
};

export default dateTimeDescriptor;
