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

export const checkboxGroupDescriptor: PartialContentType = {
	id: 'checkbox-group',
	name: 'Checkbox Group',
	description: 'Multiple checkbox inputs',
	sections: [
		createVirtualSection({ title: 'Options', fields: ['options', 'readonly'] }),
		createVirtualSection({ title: 'Constraints', fields: ['required', 'minSize', 'maxSize'] })
	],
	fields: {
		options: {
			id: 'options',
			type: 'repeat',
			name: 'Options',
			defaultValue: undefined,
			validations: foo
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'Read Only',
			defaultValue: undefined,
			validations: foo
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'Required',
			defaultValue: undefined,
			validations: foo
		},
		minSize: {
			id: 'minSize',
			type: 'numeric-input',
			name: 'Minimum Selected',
			defaultValue: undefined,
			validations: foo
		},
		maxSize: {
			id: 'maxSize',
			type: 'numeric-input',
			name: 'Maximum Selected',
			defaultValue: undefined,
			validations: foo
		}
	}
};

export default checkboxGroupDescriptor;
