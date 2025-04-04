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

import { createValidation, createVirtualSection, TypeBuilderContentType } from '../../utils';
import { immutableEmptyObject } from '../../../../utils/object';

export const nodeSelectorDescriptor: TypeBuilderContentType = {
	id: 'node-selector',
	name: 'Node Selector',
	description: 'Content node selection',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['minSize', 'maxSize', 'itemManager', 'readonly', 'disableFlattening', 'useSingleValueFilename', 'useMVS']
		}),
		createVirtualSection({ title: 'Constraints', fields: ['allowDuplicates'] })
	],
	fields: {
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
		itemManager: {
			id: 'itemManager',
			type: 'datasource-selector',
			name: 'Item Manager',
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'item')
			}
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'Read Only',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		disableFlattening: {
			id: 'disableFlattening',
			type: 'checkbox',
			name: 'Disable Flattening for Search',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		// TODO: check if we're going to keep this option
		useSingleValueFilename: {
			id: 'useSingleValueFilename',
			type: 'checkbox',
			name: 'Use single value filename (backward compat)',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		// TODO: check if we're going to keep this option
		useMVS: {
			id: 'useMVS',
			type: 'checkbox',
			name: 'Use _mvs postfix (backward compat)',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		allowDuplicates: {
			id: 'allowDuplicates',
			type: 'checkbox',
			name: 'Allow Duplicates',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default nodeSelectorDescriptor;
