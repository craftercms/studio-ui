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

import { createValidation, createVirtualSection, DescriptorContentType } from '../../utils';
import { immutableEmptyObject } from '../../../../utils/object';
import { defineMessage } from 'react-intl';

export const imgRepositoryUploadDataSourceDescriptor: DescriptorContentType = {
	id: 'img-repository-upload',
	name: defineMessage({ defaultMessage: 'Image From Repository' }),
	description: '',
	type: 'image',
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['repoPath', 'useSearch', 'sortBy', 'sortOrder']
		})
	],
	fields: {
		repoPath: {
			id: 'repoPath',
			type: 'content-path-input',
			name: defineMessage({ defaultMessage: 'Repository Path' }),
			defaultValue: '/static-assets/',
			validations: {
				regex: createValidation('regex', /^\/static-assets(\/.*)?$/),
				root: createValidation('root', '/static-assets')
			}
		},
		useSearch: {
			id: 'useSearch',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Use Search' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		sortBy: {
			id: 'sortBy',
			type: 'sort-dropdown',
			name: defineMessage({ defaultMessage: 'Sort By' }),
			defaultValue: '-AUTO-',
			validations: immutableEmptyObject,
			properties: {
				type: { name: 'type', type: 'string', value: 'sortBy' }
			}
		},
		sortOrder: {
			id: 'sortOrder',
			type: 'sort-dropdown',
			name: defineMessage({ defaultMessage: 'Sort Order' }),
			defaultValue: undefined,
			validations: immutableEmptyObject,
			properties: {
				type: { name: 'type', type: 'string', value: 'sortOrder' }
			}
		}
	}
};

export default imgRepositoryUploadDataSourceDescriptor;
