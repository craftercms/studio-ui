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
import { createValidation, createVirtualSection, DescriptorContentType } from '../../utils';
import { defineMessage } from 'react-intl';

export const sharedContentDataSourceDescriptor: DescriptorContentType = {
	id: 'shared-content',
	name: defineMessage({ defaultMessage: 'Shared Content' }),
	description: '',
	type: 'item',
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['enableCreateNew', 'enableBrowseExisting', 'enableSearchExisting', 'repoPath', 'browsePath', 'type']
		})
	],
	fields: {
		enableCreateNew: {
			id: 'enableCreateNew',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Enable Create New' }),
			defaultValue: true,
			validations: immutableEmptyObject
		},
		enableBrowseExisting: {
			id: 'enableBrowseExisting',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Enable Browse Existing' }),
			defaultValue: true,
			validations: immutableEmptyObject
		},
		enableSearchExisting: {
			id: 'enableSearchExisting',
			type: 'boolean',
			name: defineMessage({ defaultMessage: 'Enable Search Existing' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		repoPath: {
			id: 'repoPath',
			type: 'content-path-input',
			name: defineMessage({ defaultMessage: 'Repository Path' }),
			defaultValue: '/site/',
			validations: {
				regex: createValidation('regex', /^\/site(\/.*)?$/),
				root: createValidation('root', '/site')
			}
		},
		browsePath: {
			id: 'browsePath',
			type: 'content-path-input',
			name: defineMessage({ defaultMessage: 'Browse Path' }),
			defaultValue: '/site',
			validations: {
				regex: createValidation('regex', /^\/site(\/.*)?$/),
				root: createValidation('root', '/site')
			}
		},
		type: {
			id: 'type',
			type: 'string',
			name: defineMessage({ defaultMessage: 'Default Type' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default sharedContentDataSourceDescriptor;
