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

export const audioBrowseRepoDataSourceDescriptor: PartialContentType = {
	id: 'audio-browse-repo',
	name: 'Audio From Repository',
	description: '',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['repoPath', 'useSearch']
		}),
		createVirtualSection({ id: 'constraints', title: 'Constraints', fields: ['required'] })
	],
	fields: {
		repoPath: {
			id: 'repoPath',
			type: 'input',
			name: 'Repository Path',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		useSearch: {
			id: 'useSearch',
			type: 'checkbox',
			name: 'Use Search',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'required',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default audioBrowseRepoDataSourceDescriptor;
