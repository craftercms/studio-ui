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

export const flashDesktopUploadDataSourceDescriptor: PartialContentType = {
	id: 'flash-desktop-upload',
	name: 'Flash Uploaded from Desktop',
	description: '',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['repoPath']
		}),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		repoPath: {
			id: 'repoPath',
			type: 'input',
			name: 'Repository Path',
			defaultValue: '/',
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'Required',
			defaultValue: true,
			validations: { required: { id: 'required', value: true, level: 'required' } }
		}
	}
};

export default flashDesktopUploadDataSourceDescriptor;
