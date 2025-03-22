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

import type { BuiltInControlType } from '../../../FormsEngine/lib/controlMap';
import { XmlKeys } from '../../../FormsEngine/lib/formConsts';
import { createVirtualSection, PartialContentType } from '../../utils';
import fileNameDescriptor from './fileName';
import inputDescriptor from './input';
import autoFileNameDescriptor from './autoFileName';
import awsFileUploadDescriptor from './awsFileUpload';
import boxFileUploadDescriptor from './boxFileUpload';
import checkboxDescriptor from './checkbox';
import checkboxGroupDescriptor from './checkboxGroup';
import dateTimeDescriptor from './dateTime';
import disabledDescriptor from './disabled';
import dropdownDescriptor from './dropdown';
import forceHttpsDescriptor from './forceHttps';
import imagePickerDescriptor from './imagePicker';
import internalNameDescriptor from './internalName';
import labelDescriptor from './label';
import linkInputDescriptor from './linkInput';
import linkTextareaDescriptor from './linkTextarea';
import linkedDropdownDescriptor from './linkedDropdown';
import localeSelectorDescriptor from './localeSelector';
import nodeSelectorDescriptor from './nodeSelector';
import numericInputDescriptor from './numericInput';
import pageNavOrderDescriptor from './pageNavOrder';
import repeatDescriptor from './repeat';
import rteDescriptor from './rte';
import textareaDescriptor from './textarea';
import timeDescriptor from './time';
import transcodedVideoPickerDescriptor from './transcodedVideoPicker';
import uuidDescriptor from './uuid';
import videoPickerDescriptor from './videoPicker';
import { immutableEmptyObject } from '../../../../utils/object';
import { ContentTypeField } from '../../../../models/ContentType';
import LookupTable from '../../../../models/LookupTable';
import colorPickerDescriptor from './colorPicker';

const dataSourceRootProperties = ['id', 'type', 'title', 'interface'];

export const systemFieldsSection = createVirtualSection({
	title: 'System Fields',
	fields: [XmlKeys.modelId, XmlKeys.fileName, XmlKeys.internalName, XmlKeys.disabled, XmlKeys.placeInNav]
});

export const systemFieldsDescriptors: LookupTable<ContentTypeField> = {
	[XmlKeys.modelId]: {
		id: XmlKeys.modelId,
		type: 'label',
		name: 'Unique Identifier',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	[XmlKeys.fileName]: {
		id: XmlKeys.fileName,
		type: 'file-name',
		name: 'Page URL',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	[XmlKeys.internalName]: {
		id: XmlKeys.internalName,
		type: 'input',
		name: 'Internal Name',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	[XmlKeys.disabled]: {
		id: XmlKeys.disabled,
		type: 'checkbox',
		name: 'Disabled',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	[XmlKeys.placeInNav]: {
		id: XmlKeys.placeInNav,
		type: 'page-nav-order',
		name: 'Place in Navigation',
		defaultValue: undefined,
		validations: immutableEmptyObject
	}
};

export const defaultDataSourcesSection = createVirtualSection({
	id: `typeDataSourceSection`,
	title: 'Data Sources',
	fields: []
});

export const commonControlFieldsDescriptors: LookupTable<ContentTypeField> = {
	id: {
		id: 'id',
		type: 'input',
		name: 'Variable Name',
		defaultValue: undefined,
		validations: {
			required: { id: 'required', level: 'required', value: true }
		}
	},
	title: {
		id: 'title',
		type: 'input',
		name: 'Title',
		defaultValue: undefined,
		validations: {
			required: { id: 'required', level: 'required', value: true }
		}
	},
	description: {
		id: 'description',
		type: 'textarea',
		name: 'Description',
		description: 'A description shown to the user on the form',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	help: {
		id: 'help',
		type: 'rte',
		name: 'Help',
		description: 'An expanded description or help text with rich text capabilities',
		defaultValue: undefined,
		validations: immutableEmptyObject
	},
	defaultValue: {
		id: 'defaultValue',
		type: 'textarea',
		name: 'Default Value',
		defaultValue: undefined,
		validations: immutableEmptyObject
	}
};

export const controlDescriptors: Record<BuiltInControlType, PartialContentType> = {
	'auto-filename': autoFileNameDescriptor,
	'aws-file-upload': awsFileUploadDescriptor,
	'box-file-upload': boxFileUploadDescriptor,
	checkbox: checkboxDescriptor,
	'checkbox-group': checkboxGroupDescriptor,
	'date-time': dateTimeDescriptor,
	disabled: disabledDescriptor,
	dropdown: dropdownDescriptor,
	'file-name': fileNameDescriptor,
	forcehttps: forceHttpsDescriptor,
	'image-picker': imagePickerDescriptor,
	input: inputDescriptor,
	'internal-name': internalNameDescriptor,
	label: labelDescriptor,
	'link-input': linkInputDescriptor,
	'link-textarea': linkTextareaDescriptor,
	'linked-dropdown': linkedDropdownDescriptor,
	'locale-selector': localeSelectorDescriptor,
	'node-selector': nodeSelectorDescriptor,
	'numeric-input': numericInputDescriptor,
	'page-nav-order': pageNavOrderDescriptor,
	repeat: repeatDescriptor,
	rte: rteDescriptor,
	textarea: textareaDescriptor,
	time: timeDescriptor,
	'transcoded-video-picker': transcodedVideoPickerDescriptor,
	uuid: uuidDescriptor,
	'video-picker': videoPickerDescriptor,
	colorPicker: colorPickerDescriptor
};

export const typeBasicDetailsDescriptor: PartialContentType = {
	id: 'typeBasicDetailsDescriptor',
	name: 'Content Type Properties',
	description: '',
	sections: [
		createVirtualSection({
			id: 'properties',
			title: 'Basic Properties',
			fields: ['id', 'name', 'description', 'type', 'thumbnailFileName', 'mergeStrategy']
		}),
		createVirtualSection({
			id: 'quickCreate',
			title: 'Quick Create',
			fields: ['quickCreate', 'quickCreatePath']
		}),
		createVirtualSection({
			id: 'rendering',
			title: 'Rendering',
			fields: ['groovyController', 'hasJsController', 'displayTemplate', 'isHeadless']
		}),
		createVirtualSection({
			id: 'allowedDestinations',
			title: 'Allowed Destinations',
			fields: ['paths']
		})
	],
	fields: {
		id: {
			id: 'id',
			type: 'readonlyValue', // TODO: create control readonlyValue
			name: 'ID',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		name: {
			id: 'name',
			type: 'input',
			name: 'Name',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		description: {
			id: 'description',
			type: 'textarea',
			name: 'Description',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		type: {
			id: 'type',
			type: 'readonlyValue', // TODO: create control
			name: 'Archetype',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		quickCreate: {
			id: 'quickCreate',
			type: 'checkbox',
			name: 'Enable Quick Create',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		quickCreatePath: {
			id: 'quickCreatePath',
			type: 'input', // TODO: create control pathWithMacroCreator
			name: 'Destination Path Pattern',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		displayTemplate: {
			id: 'displayTemplate',
			type: 'input', // TODO: create control templateSelector
			name: 'Display Template',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		mergeStrategy: {
			id: 'mergeStrategy',
			type: 'input', // TODO: create control mergeStrategySelector
			name: 'Merge Strategy',
			description: 'Inheritance description...',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		hasJsController: {
			id: 'hasJsController',
			type: 'checkbox', // TODO: create control typeJsControllerSelector
			name: 'Client-side Controller',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		thumbnailFileName: {
			id: 'thumbnailFileName',
			type: 'input', // TODO: create control typeImageSelector
			name: 'Thumbnail Image File Name',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		isHeadless: {
			id: 'isHeadless',
			type: 'checkbox',
			name: 'Is Headless Type',
			description:
				'Check this to authorize this content type to leave the display template field empty as it is a headless type',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		paths: {
			id: 'paths',
			type: 'typeDestinationPathsSelector', // TODO: create control
			name: '',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
	}
};

export const sectionDescriptor: PartialContentType = {
	id: 'sectionDescriptor',
	name: 'Section Properties',
	description: null,
	sections: [
		createVirtualSection({
			id: 'properties',
			title: 'Basic Properties',
			fields: ['title', 'color', 'description', 'expandByDefault']
		})
		// createVirtualSection({
		// 	id: 'fields',
		// 	title: 'Fields',
		// 	fields: ['fields']
		// })
	],
	fields: {
		title: {
			id: 'title',
			type: 'input',
			name: 'Title',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		description: {
			id: 'description',
			type: 'textarea',
			name: 'Description',
			description: '',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		},
		color: {
			id: 'color',
			type: 'colorPicker',
			name: 'Color',
			description:
				'Pick the color that this section should feature in the form. A small amount of transparency can help with dark mode.',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject,
			properties: {
				alpha: {
					name: 'Alpha',
					value: true,
					type: 'boolean'
				},
				format: {
					name: 'Format',
					value: 'rgb',
					type: 'string'
				}
			}
		},
		expandByDefault: {
			id: 'expandByDefault',
			type: 'checkbox',
			name: 'Expand by default',
			description: 'Check this to show the section expanded when the content type is displayed in the content form',
			helpText: '',
			defaultValue: undefined,
			validations: immutableEmptyObject
		}
		// TODO: create control for managing fields(?)
		// fields: {
		// 	id: 'fields',
		// 	type: 'sectionFieldManager',
		// 	name: 'Expand by default',
		// 	description: 'Check this to show the section expanded when the content type is displayed in the content form',
		// 	helpText: '',
		// 	defaultValue: undefined,
		// 	validations: foo
		// }
	}
};

export default controlDescriptors;
