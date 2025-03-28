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

export const videoWebDavRepoDataSourceDescriptor: PartialContentType = {
	id: 'video-webdav-repo',
	name: 'Video From WebDav Repository',
	description: '',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['repoPath', 'profileId']
		})
	],
	fields: {
		repoPath: {
			id: 'repoPath',
			type: 'input',
			name: 'Repository Path',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		profileId: {
			id: 'profileId',
			type: 'input',
			name: 'Profile ID',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default videoWebDavRepoDataSourceDescriptor;
