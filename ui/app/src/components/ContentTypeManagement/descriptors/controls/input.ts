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

export const inputDescriptor: PartialContentType = {
	id: 'input',
	name: 'Input',
	description: 'Short amount of text',
	sections: [
		createVirtualSection({
			id: 'properties',
			title: 'Options',
			fields: ['maxlength', 'readonly', 'tokenize', 'escapeContent']
		}),
		createVirtualSection({ id: 'constraints', title: 'Constraints', fields: ['required', 'pattern'] })
	],
	fields: {
		maxlength: {
			id: 'maxlength',
			type: 'numeric-input',
			name: 'maxLength',
			defaultValue: undefined,
			validations: foo
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'readonly',
			defaultValue: undefined,
			validations: foo
		},
		tokenize: {
			id: 'tokenize',
			type: 'checkbox',
			name: 'Tokenize for Indexing',
			defaultValue: undefined,
			validations: foo
		},
		escapeContent: {
			id: 'escapeContent',
			type: 'checkbox',
			name: 'escapeContent',
			defaultValue: undefined,
			validations: foo
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'required',
			defaultValue: undefined,
			validations: foo
		},
		pattern: {
			id: 'pattern',
			type: 'input',
			name: 'pattern',
			defaultValue: undefined,
			validations: foo
		}
	}
};

export default inputDescriptor;
