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

export const imgRepositoryUploadDataSourceDescriptor: PartialContentType = {
	id: 'img-repository-upload',
	name: 'Image From Repository',
	description: '',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['repoPath', 'useSearch']
		}),
		createVirtualSection({ id: 'constraints', title: 'Constraints', fields: ['required'] })
	],
	fields: {
		repoPath: {
			id: 'repoPath',
			type: 'content-path-input',
			name: 'Repository Path',
			defaultValue: '/',
			validations: {
				// @ts-expect-error 'regex' does not exist in type Partial<ContentTypeFieldValidations>
				regex: /^\/static-assets(\/.*)?$/,
				root: '/static-assets'
			}
		},
		useSearch: {
			id: 'useSearch',
			type: 'checkbox',
			name: 'Use Search',
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

export default imgRepositoryUploadDataSourceDescriptor;
