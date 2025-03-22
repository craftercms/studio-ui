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

export const nodeSelectorDescriptor: PartialContentType = {
	id: 'node-selector',
	name: 'Node Selector',
	description: 'Content node selection',
	sections: [
		createVirtualSection({ title: 'Options', fields: ['readonly', 'minSize', 'maxSize'] }),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'Read Only',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		minSize: {
			id: 'minSize',
			type: 'numeric-input',
			name: 'Minimum Size',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		maxSize: {
			id: 'maxSize',
			type: 'numeric-input',
			name: 'Maximum Size',
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

export default nodeSelectorDescriptor;
