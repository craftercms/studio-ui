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
import { createVirtualSection, TypeBuilderContentType } from '../../utils';

export const s3RepoDataSourceDescriptor: TypeBuilderContentType = {
	id: 's3-repo',
	name: 'File From S3 Repository',
	description: '',
	type: 'item',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['path', 'profileId']
		})
	],
	fields: {
		path: {
			id: 'path',
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

export default s3RepoDataSourceDescriptor;
