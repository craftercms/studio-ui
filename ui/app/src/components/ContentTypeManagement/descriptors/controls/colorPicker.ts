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
import { defineMessage } from 'react-intl';

export const colorPickerDescriptor: DescriptorContentType = {
	id: 'colorPicker',
	name: defineMessage({ defaultMessage: 'Color Picker' }),
	description: defineMessage({ defaultMessage: 'Pick a web color' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: []
		}),
		createVirtualSection({ id: 'constraints', title: defineMessage({ defaultMessage: 'Constraints' }), fields: [] })
	],
	fields: {}
};

export default colorPickerDescriptor;
