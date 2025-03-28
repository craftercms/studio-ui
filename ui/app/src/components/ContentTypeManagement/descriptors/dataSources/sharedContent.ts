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

import { immutableEmptyObject } from '../../../../utils/object';
import { createVirtualSection, PartialContentType } from '../../utils';

export const sharedContentDataSourceDescriptor: PartialContentType = {
	id: 'shared-content',
	name: 'Shared Content',
	description: '',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['enableCreateNew', 'enableBrowseExisting', 'enableSearchExisting', 'repoPath', 'browsePath', 'type']
		})
	],
	fields: {
		enableCreateNew: {
			id: 'enableCreateNew',
			type: 'checkbox',
			name: 'Enable Create New',
			defaultValue: true,
			validations: immutableEmptyObject
		},
		enableBrowseExisting: {
			id: 'enableBrowseExisting',
			type: 'checkbox',
			name: 'Enable Browse Existing',
			defaultValue: true,
			validations: immutableEmptyObject
		},
		enableSearchExisting: {
			id: 'enableSearchExisting',
			type: 'checkbox',
			name: 'Enable Search Existing',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		repoPath: {
			id: 'repoPath',
			// TODO: custom control - content-path-input
			type: 'input',
			name: 'Repository Path',
			defaultValue: undefined,
			validations: {
				// @ts-expect-error 'regex' does not exist in type Partial<ContentTypeFieldValidations>
				regex: /^\/site(\/.*)?$/
			}
		},
		browsePath: {
			id: 'browsePath',
			// TODO: custom control - content-path-input
			type: 'input',
			name: 'Browse Path',
			defaultValue: undefined,
			validations: {
				// @ts-expect-error 'regex' does not exist in type Partial<ContentTypeFieldValidations>
				regex: /^\/site(\/.*)?$/
			}
		},
		type: {
			id: 'type',
			type: 'input',
			name: 'Default Types',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default sharedContentDataSourceDescriptor;
