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
import { defineMessage } from 'react-intl';

export const fileDesktopUploadDataSourceDescriptor: DescriptorContentType = {
	id: 'file-desktop-upload',
	name: defineMessage({ defaultMessage: 'File Uploaded From Desktop' }),
	description: '',
	type: 'item',
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['repoPath']
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
		}
	}
};

export default fileDesktopUploadDataSourceDescriptor;
