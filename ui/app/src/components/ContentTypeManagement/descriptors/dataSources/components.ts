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
import { createVirtualSection, DescriptorContentType } from '../../utils';
import { defineMessage } from 'react-intl';

export const componentsDataSourceDescriptor: DescriptorContentType = {
	id: 'components',
	name: 'Components',
	description: '',
	type: 'item',
	sections: [
		createVirtualSection({
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['allowEmbedded', 'allowShared', 'enableBrowse', 'baseRepoPath', 'baseBrowsePath', 'contentTypes', 'tags']
		})
	],
	fields: {
		allowEmbedded: {
			id: 'allowEmbedded',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Allow Embedded' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		allowShared: {
			id: 'allowShared',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Allow New Shared' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		enableBrowse: {
			id: 'enableBrowse',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Enable Browsing Shared' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		enableSearch: {
			id: 'enableSearch',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Enable Search' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		baseRepoPath: {
			id: 'baseRepoPath',
			type: 'input',
			name: defineMessage({ defaultMessage: 'Path for New Items' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		baseBrowsePath: {
			id: 'baseBrowsePath',
			type: 'input',
			name: defineMessage({ defaultMessage: 'Base Browse Path' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		contentTypes: {
			id: 'contentTypes',
			type: 'contentTypes',
			name: defineMessage({ defaultMessage: 'Content Types' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		tags: {
			id: 'tags',
			type: 'input',
			name: defineMessage({ defaultMessage: 'Tags' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default componentsDataSourceDescriptor;
