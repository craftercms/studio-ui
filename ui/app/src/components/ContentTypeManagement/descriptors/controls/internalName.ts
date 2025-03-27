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

import { createVirtualSection, PartialContentType } from '../../utils';
import { immutableEmptyObject } from '../../../../utils/object';
import { XmlKeys } from '../../../FormsEngine/lib/formConsts';

// TODO: Why is internal name a control type? Doesn't seem to be in use.

export const internalNameDescriptor: PartialContentType = {
	id: XmlKeys.internalName,
	name: 'Internal Name',
	description: 'Internal name displayed for the item throughout the CMS (e.g. sidebar)',
	sections: [createVirtualSection({ title: 'Options', fields: ['maxlength'] })],
	fields: {
		maxLength: {
			id: 'maxLength',
			type: 'checkbox',
			name: 'maxLength',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default internalNameDescriptor;
