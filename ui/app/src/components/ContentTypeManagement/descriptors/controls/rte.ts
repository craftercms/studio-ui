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

import { createValidation, createVirtualSection, DescriptorContentType } from '../../utils';
import { immutableEmptyObject } from '../../../../utils/object';
import { defineMessage } from 'react-intl';

export const rteDescriptor: DescriptorContentType = {
	id: 'rte',
	name: defineMessage({ defaultMessage: 'Rich Text Editor' }),
	description: defineMessage({ defaultMessage: 'Rich text editing area' }),
	sections: [
		createVirtualSection({
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: [
				'height',
				'autoGrow',
				'enableSpellCheck',
				'supportedChannels',
				'rteConfiguration',
				'imageManager',
				'videoManager',
				'audioManager',
				'fileManager'
			]
		}),
		createVirtualSection({ title: defineMessage({ defaultMessage: 'Constraints' }), fields: ['required'] })
	],
	fields: {
		height: {
			id: 'height',
			type: 'numeric-input',
			name: defineMessage({ defaultMessage: 'Height' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		autoGrow: {
			id: 'autoGrow',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Auto Grow' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		enableSpellCheck: {
			id: 'enableSpellCheck',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Enable Spell Check' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		// TODO: this is a custom type in legacy, need to check
		supportedChannels: {
			id: 'supportedChannels',
			type: 'input',
			name: defineMessage({ defaultMessage: 'Supported Channels' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		rteConfiguration: {
			id: 'rteConfiguration',
			type: 'input',
			name: defineMessage({ defaultMessage: 'RTE Configuration' }),
			defaultValue: 'generic',
			validations: immutableEmptyObject
		},
		imageManager: {
			id: 'imageManager',
			type: 'datasource-selector',
			name: defineMessage({ defaultMessage: 'Image Manager' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'image')
			}
		},
		videoManager: {
			id: 'videoManager',
			type: 'datasource-selector',
			name: defineMessage({ defaultMessage: 'Video Manager' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'video')
			}
		},
		audioManager: {
			id: 'audioManager',
			type: 'datasource-selector',
			name: defineMessage({ defaultMessage: 'Audio Manager' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'audio')
			}
		},
		fileManager: {
			id: 'fileManager',
			type: 'datasource-selector',
			name: defineMessage({ defaultMessage: 'File Manager' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'item')
			}
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Required' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	},
	supportedPostFixes: ['_html']
};

export default rteDescriptor;
