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

import { createVirtualSection } from '../../utils';
import { foo } from '../../../../utils/object';

export const repeatDescriptor = {
	id: 'repeat',
	name: 'Repeating Group',
	description: 'Group of fields that can be repeated',
	sections: [
		createVirtualSection({ title: 'Options', fields: ['minOccurs', 'maxOccurs', 'readonly'] }),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		minOccurs: {
			id: 'minOccurs',
			type: 'numeric-input',
			name: 'Minimum Occurrences',
			defaultValue: undefined,
			validations: foo
		},
		maxOccurs: {
			id: 'maxOccurs',
			type: 'numeric-input',
			name: 'Maximum Occurrences',
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
		}
	}
};

export default repeatDescriptor;
