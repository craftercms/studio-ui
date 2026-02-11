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

export const imgWebDavRepoDataSourceDescriptor: DescriptorContentType = {
	id: 'img-WebDAV-repo',
	name: defineMessage({ defaultMessage: 'Image From WebDav Repository' }),
	description: '',
	type: 'image',
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['repoPath', 'profileId']
		})
	],
	fields: {
		repoPath: {
			id: 'repoPath',
			type: 'string',
			name: defineMessage({ defaultMessage: 'Repository Path' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		profileId: {
			id: 'profileId',
			type: 'string',
			name: defineMessage({ defaultMessage: 'Profile ID' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default imgWebDavRepoDataSourceDescriptor;
