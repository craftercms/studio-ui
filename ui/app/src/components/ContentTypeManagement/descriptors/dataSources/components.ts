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

export const componentsDataSourceDescriptor = {
	allowEmbedded: {
		id: 'allowEmbedded',
		type: 'checkbox',
		name: '',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	allowShared: {
		id: 'allowShared',
		type: 'checkbox',
		name: '',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	enableBrowse: {
		id: 'enableBrowse',
		type: 'checkbox',
		name: '',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	enableSearch: {
		id: 'enableSearch',
		type: 'checkbox',
		name: '',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	baseRepoPath: {
		id: 'baseRepoPath',
		type: '',
		name: '',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	baseBrowsePath: {
		id: 'baseBrowsePath',
		type: '',
		name: '',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	contentTypes: {
		id: 'contentTypes',
		type: '',
		name: '',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	tags: {
		id: 'tags',
		type: '',
		name: '',
		defaultValue: undefined,
		validations: immutableEmptyObject
	}
};

export default componentsDataSourceDescriptor;
