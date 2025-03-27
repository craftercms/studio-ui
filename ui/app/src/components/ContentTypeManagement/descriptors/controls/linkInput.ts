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

export const linkInputDescriptor: PartialContentType = {
	id: 'link-input',
	name: 'Link Input',
	description: 'URL/Link input field',
	sections: [
		createVirtualSection({ id: 'properties', title: 'Options', fields: ['maxlength', 'readonly', 'tokenize'] }),
		createVirtualSection({ id: 'constraints', title: 'Constraints', fields: ['required', 'pattern'] })
	],
	fields: {
		maxlength: {
			id: 'maxlength',
			type: 'numeric-input',
			name: 'maxLength',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'readonly',
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
		},
		pattern: {
			id: 'pattern',
			type: 'input',
			name: 'Match Pattern',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default linkInputDescriptor;
