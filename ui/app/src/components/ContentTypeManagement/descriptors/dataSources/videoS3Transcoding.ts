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

export const videoS3TranscodingDataSourceDescriptor: TypeBuilderContentType = {
	id: 'video-s3-transcoding',
	name: 'Video Transcoding From S3 Repository',
	description: '',
	type: 'transcoded-video',
	sections: [
		createVirtualSection({
			title: 'Options',
			fields: ['inputProfileId', 'outputProfileId']
		})
	],
	fields: {
		inputProfileId: {
			id: 'inputProfileId',
			type: 'input',
			name: 'Input Profile ID',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		outputProfileId: {
			id: 'outputProfileId',
			type: 'input',
			name: 'Output Profile ID',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default videoS3TranscodingDataSourceDescriptor;
