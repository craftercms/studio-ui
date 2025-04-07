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

export const linkTextareaDescriptor: DescriptorContentType = {
	id: 'link-textarea',
	name: defineMessage({ defaultMessage: 'Link Textarea' }),
	description: defineMessage({ defaultMessage: 'Multiple URL/Link input' }),
	sections: [
		createVirtualSection({
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['rows', 'maxlength', 'allowResize', 'readonly']
		}),
		createVirtualSection({ title: defineMessage({ defaultMessage: 'Constraints' }), fields: ['required'] })
	],
	fields: {
		rows: {
			id: 'rows',
			type: 'numeric-input',
			name: defineMessage({ defaultMessage: 'Rows' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		maxlength: {
			id: 'maxlength',
			type: 'numeric-input',
			name: defineMessage({ defaultMessage: 'Maximum Length' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		allowResize: {
			id: 'allowResize',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Allow Resize' }),
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
		required: {
			id: 'required',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Required' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default linkTextareaDescriptor;
