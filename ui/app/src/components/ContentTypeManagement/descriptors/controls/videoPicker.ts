import { createValidation, createVirtualSection, DescriptorContentType } from '../../utils';
import { defineMessage } from 'react-intl';
import { commonFieldPropertiesDescriptors } from './commonDescriptors';

export const videoPickerDescriptor: DescriptorContentType = {
	id: 'video-picker',
	name: defineMessage({ defaultMessage: 'Video' }),
	description: defineMessage({ defaultMessage: 'Video selection control' }),
	sections: [
		createVirtualSection({
			id: 'properties',
			title: defineMessage({ defaultMessage: 'Options' }),
			fields: ['videoManager', 'readonly']
		}),
		createVirtualSection({
			id: 'constraints',
			title: defineMessage({ defaultMessage: 'Constraints' }),
			fields: ['required']
		})
	],
	fields: {
		videoManager: {
			id: 'videoManager',
			type: 'datasource:video',
			name: defineMessage({ defaultMessage: 'Data Source' }),
			defaultValue: undefined,
			validations: {
				type: createValidation('type', 'video')
			}
		},
		readonly: commonFieldPropertiesDescriptors['readonly'],
		required: commonFieldPropertiesDescriptors['required']
	},
	metadata: {
		suffixes: ['_o']
	}
};

export default videoPickerDescriptor;
