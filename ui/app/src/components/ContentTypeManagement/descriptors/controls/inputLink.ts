/*
 * Copyright (C) 2007-2026 Crafter Software Corporation. All Rights Reserved.
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

export const inputLinkDescriptor: DescriptorContentType = {
	id: 'input-link',
	name: defineMessage({ defaultMessage: 'Input - Link' }),
	description: defineMessage({ defaultMessage: 'Input field for web links with validation.' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['maxlength', 'readonly', 'tokenized', 'escapeContent']
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required', 'pattern']
		})
	],
	fields: {
		maxlength: {
			id: 'maxlength',
			type: 'int',
			name: defineMessage({ defaultMessage: 'Max Length' }),
			defaultValue: 50,
			validations: immutableEmptyObject
		},
		readonly: {
			id: 'readonly',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Read Only' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		tokenized: {
			id: 'tokenized',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Tokenize for Indexing' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		escapeContent: {
			id: 'escapeContent',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Escape Content' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Required' }),
			defaultValue: false,
			validations: immutableEmptyObject
		},
		pattern: {
			id: 'pattern',
			type: 'string',
			name: defineMessage({ defaultMessage: 'Match Pattern' }),
			defaultValue: '^(https?://)?([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}(/\\S*)?$',
			validations: immutableEmptyObject
		}
	},
	metadata: {
		suffixes: ['_s']
	}
};

export default inputLinkDescriptor;
