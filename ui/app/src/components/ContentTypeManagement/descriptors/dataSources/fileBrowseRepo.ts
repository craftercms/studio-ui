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

import { createVirtualSection, DescriptorContentType } from '../../utils';

export const fileBrowseRepoDataSourceDescriptor: DescriptorContentType = {
	id: 'file-browse-repo',
	name: 'File Browse',
	description: '',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['repoPath']
		})
	],
	fields: {
		repoPath: {
			id: 'repoPath',
			type: 'content-path-input',
			name: 'Repository Path',
			defaultValue: '/',
			validations: {
				root: '/'
			}
		}
	}
};

export default fileBrowseRepoDataSourceDescriptor;
