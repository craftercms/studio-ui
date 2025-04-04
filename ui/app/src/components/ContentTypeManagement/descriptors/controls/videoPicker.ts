import { immutableEmptyObject } from '../../../../utils/object';
import { createValidation, createVirtualSection, TypeBuilderContentType } from '../../utils';

export const videoPickerDescriptor: TypeBuilderContentType = {
	id: 'video-picker',
	name: 'Video Picker',
	description: 'Video selection control',
	sections: [
		createVirtualSection({ title: 'Options', fields: ['videoManager', 'readonly'] }),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		videoManager: {
			id: 'videoManager',
			type: 'datasource-selector',
			name: 'Data Source',
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'video')
			}
		},
		readonly: {
			id: 'readonly',
			type: 'checkbox',
			name: 'Read Only',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		required: {
			id: 'required',
			type: 'checkbox',
			name: 'Required',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export default videoPickerDescriptor;
