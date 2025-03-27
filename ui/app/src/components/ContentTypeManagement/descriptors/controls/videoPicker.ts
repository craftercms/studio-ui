import { immutableEmptyObject } from '../../../../utils/object';
import { createVirtualSection, PartialContentType } from '../../utils';

export const videoPickerDescriptor: PartialContentType = {
	id: 'video-picker',
	name: 'Video Picker',
	description: 'Video selection control',
	sections: [
		createVirtualSection({ title: 'Options', fields: ['videoManager', 'readonly'] }),
		createVirtualSection({ title: 'Constraints', fields: ['required'] })
	],
	fields: {
		// TODO: check type
		videoManager: {
			id: 'videoManager',
			type: 'dropdown',
			name: 'Data Source',
			defaultValue: undefined,
			validations: immutableEmptyObject
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
