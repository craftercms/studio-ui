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

import { createVirtualSection, PartialContentType } from '../../utils';
import { immutableEmptyObject } from '../../../../utils/object';

export const dateTimeDescriptor: PartialContentType = {
	id: 'date-time',
	name: 'Date Time',
	description: 'Date and time picker',
	sections: [
		createVirtualSection({
			title: 'Options',
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
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		showDate: {
			id: 'showDate',
			type: 'checkbox',
			name: 'Show Date',
			defaultValue: true,
			validations: immutableEmptyObject
		},
		showTime: {
			id: 'showTime',
			type: 'checkbox',
			name: 'Show Time',
			defaultValue: true,
			validations: immutableEmptyObject
		},
		showClear: {
			id: 'showClear',
			type: 'checkbox',
			name: 'Show Clear',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		showNowLink: {
			id: 'showNowLink',
			type: 'checkbox',
			name: 'Show Now Link',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		populate: {
			id: 'populate',
			type: 'checkbox',
			name: 'Populated',
			defaultValue: true,
			validations: immutableEmptyObject
		},
		allowPastDate: {
			id: 'allowPastDate',
			type: 'checkbox',
			name: 'Allow Past Date',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		populateDateExp: {
			id: 'populateDateExp',
			type: 'input',
			name: 'Populate Expression',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		useCustomTimezone: {
			id: 'useCustomTimezone',
			type: 'checkbox',
			name: 'Use Custom Timezone',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'Read Only',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonlyEdit: {
			id: 'readonlyEdit',
			type: 'checkbox',
			name: 'Read Only on Edit',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'Required',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default dateTimeDescriptor;
