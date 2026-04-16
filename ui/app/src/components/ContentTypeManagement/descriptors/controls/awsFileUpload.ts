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
import { immutableEmptyObject } from '../../../../utils/object';
import { defineMessage } from 'react-intl';
import { commonFieldPropertiesDescriptors } from './commonDescriptors';

export const awsFileUploadDescriptor: DescriptorContentType = {
	id: 'aws-file-upload',
	name: defineMessage({ defaultMessage: 'AWS File Upload' }),
	description: defineMessage({ defaultMessage: 'Upload files to AWS S3' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['profile_id']
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required']
		})
	],
	fields: {
		profile_id: {
			id: 'profile_id',
			type: 'string',
			name: defineMessage({ defaultMessage: 'Profile ID' }),
			defaultValue: 's3-default',
			validations: immutableEmptyObject
		},
		required: commonFieldPropertiesDescriptors['required']
	}
};

export default awsFileUploadDescriptor;
