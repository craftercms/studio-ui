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
import { immutableEmptyObject } from '../../../../utils/object';

export const textareaDescriptor = {
	id: 'textarea',
	name: 'Text Area',
	description: 'Multi-line text input',
	sections: [
		createVirtualSection({ title: 'Options', fields: ['height', 'width', 'maxlength', 'readonly', 'tokenize'] }),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		height: {
			id: 'height',
			type: 'numeric-input',
			name: 'Height',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		width: {
			id: 'width',
			type: 'numeric-input',
			name: 'Width',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		maxlength: {
			id: 'maxlength',
			type: 'numeric-input',
			name: 'Maximum Length',
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
		tokenize: {
			id: 'tokenize',
			type: 'checkbox',
			name: 'Tokenize for Indexing',
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

export default textareaDescriptor;
