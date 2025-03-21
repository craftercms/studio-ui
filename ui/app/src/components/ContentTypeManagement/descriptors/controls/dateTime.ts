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
import { foo } from '../../../../utils/object';

export const dateTimeDescriptor: PartialContentType = {
	id: 'date-time',
	name: 'Date Time',
	description: 'Date and time picker',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['readonly', 'showNowLink', 'showClear', 'showDate', 'showTime']
		}),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'Read Only',
			defaultValue: undefined,
			validations: foo
		},
		showNowLink: {
			id: 'showNowLink',
			type: 'checkbox',
			name: 'Show Now Link',
			defaultValue: undefined,
			validations: foo
		},
		showClear: {
			id: 'showClear',
			type: 'checkbox',
			name: 'Show Clear',
			defaultValue: undefined,
			validations: foo
		},
		showDate: {
			id: 'showDate',
			type: 'checkbox',
			name: 'Show Date',
			defaultValue: true,
			validations: foo
		},
		showTime: {
			id: 'showTime',
			type: 'checkbox',
			name: 'Show Time',
			defaultValue: true,
			validations: foo
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'Required',
			defaultValue: undefined,
			validations: foo
		}
	}
};

export default dateTimeDescriptor;
