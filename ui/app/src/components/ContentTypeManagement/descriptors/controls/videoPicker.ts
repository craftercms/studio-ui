import { immutableEmptyObject } from '../../../../utils/object';
import { createValidation, createVirtualSection, DescriptorContentType } from '../../utils';
import { defineMessage } from 'react-intl';

export const videoPickerDescriptor: DescriptorContentType = {
	id: 'video-picker',
	name: defineMessage({ defaultMessage: 'Video Picker' }),
	description: defineMessage({ defaultMessage: 'Video selection control' }),
	sections: [
		createVirtualSection({ title: defineMessage({ defaultMessage: 'Options' }), fields: ['videoManager', 'readonly'] }),
		createVirtualSection({ title: defineMessage({ defaultMessage: 'Constraints' }), fields: ['required'] })
	],
	fields: {
		videoManager: {
			id: 'videoManager',
			type: 'datasource-selector',
			name: defineMessage({ defaultMessage: 'Data Source' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'video')
			}
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Read Only' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: defineMessage({ defaultMessage: 'Required' }),
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default videoPickerDescriptor;
