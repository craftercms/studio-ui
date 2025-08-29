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

export const audioDesktopUploadDataSourceDescriptor: DescriptorContentType = {
	id: 'audio-desktop-upload',
	name: defineMessage({ defaultMessage: 'Audio Uploaded from Desktop' }),
	description: '',
	type: 'audio',
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
			defaultValue: undefined,
			validations: {
				root: createValidation('root', '/static-assets')
			}
		}
	}
};

export default audioDesktopUploadDataSourceDescriptor;
