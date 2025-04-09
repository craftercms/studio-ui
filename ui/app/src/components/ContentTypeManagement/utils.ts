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

import {
	ContentTypeField,
	ContentTypeFieldValidation,
	ContentTypeSection,
	DataSource,
	LegacyDataSource,
	LegacyFormDefinitionField,
	ValidationKeys
} from '../../models';
import LookupTable from '../../models/LookupTable';
import ContentType, { SerializeToXmlContentTypeStructure } from '../../models/ContentType';
import { createLookupTable, nnou, noOp, pluckProps } from '../../utils/object';
import { commonControlFieldsDescriptors, defaultDataSourcesSection } from './descriptors/controls';
import {
	FormsEngineFormApiContextProps,
	FormsEngineItemMetaContextProps,
	StableFormContextProps,
	StableGlobalContextProps
} from '../FormsEngine/lib/formsEngineContext';
import { buildSectionExpandedStateAtoms, setFieldAtoms } from '../FormsEngine/lib/formUtils';
import { RefObject } from 'react';
import { Subject } from 'rxjs';
import { createParsedValueForField } from '../FormsEngine/lib/valueRetrievers';
import { toBooleanString, toColor } from '../../utils/string';
import { getXmlBuilder } from '../FormsEngine/lib/valueSerializers';
import { nanoid } from 'nanoid';
import { commonDataSourceDescriptors } from './descriptors/dataSources';
import { ControlProps } from '../FormsEngine/types';
import { IntlShape } from 'react-intl';
import TranslationOrText from '../../models/TranslationOrText';

// TODO: assess which of the utils here should go to utils/contentType.ts, or other places (serializers, etc.)

export const DeserializerNullSymbol = Symbol(null);

export const NEW_FIELD_ID = '{NEW}';

// Some properties in ContentTypeField differ from the name in the XML.
// Descriptors for controls, sections, data sources, etc., declare their form fields with the XML name,
// so when mapping a field to its form values, those props with different names need to get mapped.
const contentTypeFieldToXmlNameMap = { name: 'title', helpText: 'help' };

type ContentTypeFieldProperties = keyof ContentTypeField;
const ignoredContentTypeFieldProps: Array<ContentTypeFieldProperties> = ['sortable', 'values', 'type'];

export type TypePropsToEdit = Pick<
	ContentType,
	| 'id'
	| 'name'
	| 'description'
	| 'type'
	| 'thumbnailFileName'
	| 'mergeStrategy'
	| 'quickCreate'
	| 'quickCreatePath'
	| 'hasJsController'
	| 'displayTemplate'
	| 'isHeadless'
	| 'paths'
>;

type ContentTypeValuesObject = TypePropsToEdit & { groovyController: string };

export const typePropsToEdit: Array<keyof TypePropsToEdit> = [
	'id',
	'name',
	'description',
	'type',
	'thumbnailFileName',
	'mergeStrategy',
	'quickCreate',
	'quickCreatePath',
	'hasJsController',
	'displayTemplate',
	'isHeadless',
	'paths'
];

export function createTypeFormValuesObject(type: ContentType): ContentTypeValuesObject {
	const values: Partial<ContentTypeValuesObject> = pluckProps(type, false, ...typePropsToEdit);
	values.groovyController = 'controller.groovy';
	return values as ContentTypeValuesObject;
}

/**
 * Creates the form values object for a content type field. It produces a FormsEngine values object
 * for the virtual content type produced for each field.
 **/
export function createTypeFieldValuesObject(field: ContentTypeField): LookupTable<unknown> {
	const values: LookupTable<unknown> = {};
	let property: ContentTypeFieldProperties;
	for (property in field) {
		if (ignoredContentTypeFieldProps.includes(property)) continue;
		if (property === 'fields') {
			values.fields = {};
			for (const fieldId in field.fields) {
				values.fields[fieldId] = createTypeFieldValuesObject(field.fields[fieldId]);
			}
		} else if (property === 'properties') {
			populateFieldPropertiesValues(values, field.properties);
		} else if (property === 'validations') {
			populateFieldValidationsValues(values, field.validations);
		} else {
			// See notes on `contentTypeFieldToXmlNameMap` declaration.
			values[contentTypeFieldToXmlNameMap[property] ?? property] = field[property];
		}
	}
	return values;
}

export function populateFieldPropertiesValues(
	values: LookupTable<unknown>,
	properties: ContentTypeField['properties']
): void {
	for (const property in properties ?? {}) {
		if (property === 'plugin') {
			// TODO: Not handled...
			console.error('Plugin case not handled.');
			continue;
		}
		const propObject = properties[property];
		// TODO: this was done to match dataSource properties, but the dataSource type is not matching so this may be wrong.
		values[property] = propObject.value ?? propObject;
	}
}

export function populateFieldValidationsValues(
	values: LookupTable<unknown>,
	validations: ContentTypeField['validations']
): void {
	let validationKey: ValidationKeys;
	for (validationKey in validations ?? {}) {
		// The maxlength property is mapped from properties to `field.validations.maxLength` when parsing the API
		// response to a content type, which makes it be present in both field.properties & field.validations.
		// We're skipping the validation since the properties is the rawest (has the raw XML name `maxlength`)
		// 	TODO: Should we use upgrade manager to remove from properties and into constraints?
		if (validationKey === 'maxLength') continue;
		const validationObject = validations[validationKey as ValidationKeys];
		values[validationKey] = validationObject.value;
	}
}

export function createDataSourceValuesObject(datasource: DataSource): LookupTable<unknown> {
	const values: LookupTable<unknown> = {};
	for (const property in datasource) {
		if (property === 'properties') {
			populateFieldPropertiesValues(values, datasource.properties);
		} else {
			// See notes on `contentTypeFieldToXmlNameMap` declaration.
			values[contentTypeFieldToXmlNameMap[property] ?? property] = datasource[property];
		}
	}
	return values;
}

// values is a lookup table of values which needs to be set
export function reverseTypeFieldValuesObject(field: ContentTypeField, values: LookupTable<unknown>): ContentTypeField {
	const fieldWithReversedValues: ContentTypeField = { ...field };
	let property: ContentTypeFieldProperties;
	for (property in field) {
		if (ignoredContentTypeFieldProps.includes(property)) continue;
		if (property === 'fields') {
			for (const fieldId in field.fields) {
				fieldWithReversedValues.fields[fieldId] = reverseTypeFieldValuesObject(
					field.fields[fieldId],
					values.fields[fieldId]
				);
			}
		} else if (property === 'properties') {
			fieldWithReversedValues.properties = {};
			const properties = fieldWithReversedValues.properties;
			for (const property in field.properties ?? {}) {
				// A stored property that's no longer in the descriptor would get cleaned/dropped up by this check.
				if (!(property in values)) {
					continue;
				}
				if (property === 'plugin') {
					// TODO: Not handled...
					console.error('Plugin case not handled.');
					continue;
				}
				properties[property] = { ...field.properties[property] };
				properties[property].value = values[property] as never;
			}
		} else if (property === 'validations') {
			fieldWithReversedValues.validations = { ...field.validations };
			const validations = fieldWithReversedValues.validations;
			let validationKey: ValidationKeys;
			for (validationKey in validations ?? {}) {
				validations[validationKey as ValidationKeys] = { ...validations[validationKey as ValidationKeys] };
				validations[validationKey as ValidationKeys].value =
					// TODO: Should we use upgrade manager to remove from properties and into constraints?
					// The maxlength property is mapped from properties to `field.validations` as `maxLength`.
					values[validationKey === 'maxLength' ? 'maxlength' : validationKey];
			}
		} else {
			// See notes on `contentTypeFieldToXmlNameMap` declaration.
			// @ts-expect-error: TS is unable to determine the match between types here
			fieldWithReversedValues[property] = values[contentTypeFieldToXmlNameMap[property] ?? property];
		}
	}
	return fieldWithReversedValues;
}

export type PartialContentType = Pick<ContentType, 'id' | 'name' | 'description' | 'sections' | 'fields'> & {
	dataSources?: DataSource[];
};

export type DescriptorContentType = Pick<ContentType, 'id'> & {
	dataSources?: DataSource[];
	name: TranslationOrText;
	description: TranslationOrText;
	sections: DescriptorSection[];
	fields: LookupTable<DescriptorField>;
	type?: 'image' | 'item' | 'audio' | 'flash' | 'video' | 'transcoded-video';
};

export type DescriptorSection = Omit<ContentTypeSection, 'title' | 'description'> & {
	title: TranslationOrText;
	description: TranslationOrText;
};

export type DescriptorField = Omit<ContentTypeField, 'name' | 'description' | 'fields'> & {
	name: TranslationOrText;
	description?: TranslationOrText;
	helpText?: TranslationOrText;
	fields?: LookupTable<DescriptorField>;
	validations: Partial<DescriptorFieldValidations>;
};

export type DescriptorFieldValidationKeys = ValidationKeys | 'root' | 'regex' | 'type';

export type DescriptorContentTypeFieldValidation = Omit<ContentTypeFieldValidation, 'id'> & {
	id: DescriptorFieldValidationKeys;
};

export type DescriptorFieldValidations = Record<DescriptorFieldValidationKeys, DescriptorContentTypeFieldValidation>;

export interface TypeBuilderControl extends Omit<ControlProps, 'field'> {
	field: ContentTypeField & {
		validations: Partial<DescriptorFieldValidations>;
	};
}

export function createEmptyTypeStructure(mixin?: Partial<ContentType>): ContentType {
	return {
		id: null,
		type: undefined,
		name: null,
		description: null,
		dataSources: null,
		displayTemplate: null,
		mergeStrategy: null,
		quickCreate: null,
		quickCreatePath: null,
		hasJsController: null,
		thumbnailFileName: null,
		isHeadless: null,
		paths: null,
		fields: {},
		sections: [],
		...mixin
	};
}

export function createVirtualTypeForField(
	controlDescriptor: DescriptorContentType,
	formatMessage: IntlShape['formatMessage']
): ContentType {
	const translatedControlDescriptor = applyTranslations(
		{
			...controlDescriptor,
			fields: {
				...commonControlFieldsDescriptors,
				...controlDescriptor.fields
			},
			sections: [
				{
					id: 'properties',
					color: null,
					title: 'Basic Properties',
					description: '',
					fields: Object.keys(commonControlFieldsDescriptors),
					expandByDefault: true
				},
				...(controlDescriptor.sections ?? [])
			]
		},
		formatMessage
	);
	return createEmptyTypeStructure(translatedControlDescriptor);
}

export function createVirtualTypeForSection(
	descriptor: DescriptorContentType,
	formatMessage: IntlShape['formatMessage']
): ContentType {
	const translatedDescriptor = applyTranslations(
		{
			...descriptor,
			fields: descriptor.fields,
			sections: descriptor.sections
		},
		formatMessage
	);
	return createEmptyTypeStructure(translatedDescriptor);
}

export function createVirtualTypeForDataSource(
	dataSourceDescriptor: DescriptorContentType,
	formatMessage: IntlShape['formatMessage']
): ContentType {
	const translatedDataSourceDescriptor = applyTranslations(
		{
			...dataSourceDescriptor,
			fields: {
				...commonDataSourceDescriptors,
				...dataSourceDescriptor.fields
			},
			sections: [
				{
					id: 'properties',
					color: null,
					title: 'Basic Properties',
					description: '',
					fields: Object.keys(commonDataSourceDescriptors),
					expandByDefault: true
				},
				...(dataSourceDescriptor.sections ?? [])
			]
		},
		formatMessage
	);
	return createEmptyTypeStructure(translatedDataSourceDescriptor);
}

export function createVirtualSection<K extends ContentTypeSection | DescriptorSection>(
	sectionData: Partial<K> & Pick<K, 'title' | 'fields'>
): K {
	const title = JSON.stringify(
		typeof sectionData.title === 'object' ? sectionData.title.defaultMessage : sectionData.title
	);
	return {
		id: sectionData?.id || nanoid(),
		description: '',
		expandByDefault: true,
		color: sectionData?.color ?? toColor(title),
		...sectionData
	} as K;
}

export function createVirtualDataSourceFields(type: ContentType): Partial<DescriptorContentType> {
	const dataSourceFields: Partial<DescriptorContentType> = {};
	for (const dataSource of type.dataSources ?? []) {
		dataSourceFields[dataSource.id] = {
			id: dataSource.id,
			type: dataSource.type,
			name: dataSource.title,
			defaultValue: undefined,
			validations: {
				type: dataSource.interface
			}
		};
	}
	return dataSourceFields;
}

export const fooStableGlobalContext: StableGlobalContextProps = Object.freeze<StableGlobalContextProps>({
	formsStackData: [],
	api: {
		pushForm: noOp,
		popForm: noOp,
		updateProps: noOp,
		setStateCache: noOp
	}
});

export function createVirtualTypeFormContext(
	type: ContentType,
	values: LookupTable<unknown>,
	contentTypesLookup: LookupTable<ContentType>,
	mixin?: Partial<StableFormContextProps>
): StableFormContextProps {
	const context = createStableFormContextProps({ type });
	const contextRef: RefObject<StableFormContextProps> = { current: context };
	const contentTypeFields = type.fields;
	const formValues: LookupTable<unknown> = {};
	context.atoms.valueByFieldId = {};
	context.atoms.validationByFieldId = {};
	context.changedFieldIds = new Set();
	context.originalValues = values;
	context.fieldUpdates$ = mixin.fieldUpdates$ ?? new Subject();
	Object.values(contentTypeFields).forEach((field) => {
		formValues[field.id] = createParsedValueForField(values[field.id], field, contentTypesLookup);
		setFieldAtoms(contextRef, type, type.fields, field.id, context.atoms, formValues[field.id]);
	});
	return context;
}

export function createFieldFormContextApi(): FormsEngineFormApiContextProps {
	const api: FormsEngineFormApiContextProps = {
		rollback() {},
		rollbackField() {},
		setValuesCheckpoint() {}
	};
	return api;
}

export function createFieldItemMetaContext(type: ContentType): FormsEngineItemMetaContextProps {
	const context: FormsEngineItemMetaContextProps = {
		id: '',
		path: '',
		sourceMap: null,
		pathInSite: '',
		contentType: type,
		contentObject: {},
		contentXml: null
	};
	return context;
}

export const createStableFormContextProps = (
	{
		type
	}: {
		type: ContentType;
	},
	createRootTypeSections: boolean = false
) => {
	const context: StableFormContextProps = {
		atoms: {
			expandedStateBySectionId: buildSectionExpandedStateAtoms(type.sections),
			isSubmitting: undefined,
			hasPendingChanges: undefined,
			readonly: undefined,
			lockResult: undefined,
			valueByFieldId: undefined,
			validationByFieldId: undefined,
			versionComment: undefined,
			collapseToC: undefined,
			useCollapsedToC: undefined,
			isLargeContainer: undefined,
			tableOfContentsDrawerOpen: undefined,
			closeAfterSave: undefined
		},
		changedFieldIds: null,
		fieldUpdates$: null,
		itemMeta: createFieldItemMetaContext(type), // TODO: Property may be removed from this context altogether
		originalValues: null,
		props: null,
		state: null
	};
	if (createRootTypeSections) {
		Object.assign(
			context.atoms.expandedStateBySectionId,
			buildSectionExpandedStateAtoms([defaultDataSourcesSection as ContentTypeSection])
		);
	}
	return context;
};

export function makeIntoTypeFieldStructPath(fieldPath: string): string {
	return fieldPath
		.split('.')
		.map((piece) => `${piece}.fields`)
		.join('.')
		.replace(/.fields$/, '');
}

export function prepareSerializeToXmlTypeObject(type: ContentType): SerializeToXmlContentTypeStructure {
	return {
		'content-type': type.id,
		title: type.name,
		controller: toBooleanString(type.hasJsController),
		description: type.description,
		objectType: type.type,
		quickCreate: toBooleanString(type.quickCreate),
		quickCreatePath: type.quickCreatePath,
		imageThumbnail: type.thumbnailFileName,
		paths: type.paths,
		properties: {
			property: [
				{
					label: 'Display Template',
					name: 'display-template',
					type: 'template',
					value: type.displayTemplate
				},
				{
					label: 'No Template Required',
					name: 'no-template-required',
					type: 'boolean',
					value: toBooleanString(type.isHeadless)
				},
				{
					label: 'Merge Strategy',
					name: 'merge-strategy',
					type: 'string',
					value: type.mergeStrategy
				}
			]
		},
		sections: {
			section: type.sections.map((section) => ({
				id: section.id,
				title: section.title,
				description: section.description,
				defaultOpen: toBooleanString(section.expandByDefault),
				fields: {
					field: section.fields.map((fieldId) => convertFieldStructToXmlStruct(type.fields[fieldId]))
				}
			}))
		},
		datasources:
			type.dataSources?.length > 0
				? { datasource: type.dataSources?.map((ds) => convertDataSourceStructToXmlStruct(ds)) }
				: null
	};
}

export function buildContentTypeXml(serializeTypeStructureObject: SerializeToXmlContentTypeStructure): string {
	const builder = getXmlBuilder({ suppressEmptyNode: true });
	return builder.build({ form: serializeTypeStructureObject });
}

function convertFieldStructToXmlStruct(field: ContentTypeField): Required<LegacyFormDefinitionField> {
	// TODO: sections other than properties & constraints?
	// field.properties
	// field.constraints
	// Note: `undefined` suppresses nodes in the XML, empty strings doesn't.
	return {
		id: field.id,
		title: field.name,
		description: field.description,
		defaultValue: field.defaultValue,
		type: field.type,
		help: field.helpText,
		iceId: undefined, // TODO: drop?
		// region TODO: ∨∨∨ Repeat Groups ∨∨∨
		maxOccurs: undefined,
		minOccurs: undefined,
		fields: undefined, // { field: undefined },
		// endregion TODO: ^^^ Repeat Groups ^^^
		// TODO: Populate `plugin` property
		plugin: undefined, // { filename: '', name: '', pluginId: '', type: '' },
		properties: undefined, // { property: undefined },
		constraints: undefined // { constraint: undefined }
	};
}

function convertDataSourceStructToXmlStruct(dataSource: DataSource): Required<LegacyDataSource> {
	return {
		id: dataSource.id,
		interface: dataSource.interface,
		title: dataSource.title,
		type: dataSource.type,
		// TODO: Double check the dataSource.properties struct matches the XML struct
		properties: {
			// TODO: Ideally, suppress these objects into simple key-value pairs.
			//   <properties>
			//     <property>
			//       <name>enableSearchExisting</name>
			//       <value>true</value>
			//       <type>boolean</type>
			//     </property>
			//  ===>
			//    <properties>
			//      <enableSearchExisting>true</enableSearchExisting>
			property: Object.entries(dataSource.properties).map(([name, value]) => ({
				name,
				value,
				type: typeof value
			}))
		}
	};
}

export function createValidation(
	key: DescriptorFieldValidationKeys,
	value,
	level?: ContentTypeFieldValidation['level']
): DescriptorContentTypeFieldValidation {
	return {
		id: key,
		value,
		level: level ?? 'suggestion'
	};
}

export function applyTranslations(
	descriptor: DescriptorContentType,
	formatMessage: IntlShape['formatMessage']
): PartialContentType {
	const translatedSections = descriptor.sections.map((section) => ({
		...section,
		title: translateIfMessageDescriptor(formatMessage, section, 'title'),
		description: translateIfMessageDescriptor(formatMessage, section, 'description')
	}));

	const translatedFieldsArray = Object.values(descriptor.fields).map((field) => {
		return {
			...field,
			name: translateIfMessageDescriptor(formatMessage, field, 'name'),
			description: translateIfMessageDescriptor(formatMessage, field, 'description')
		};
	});
	const translatedFieldsLookup = createLookupTable(translatedFieldsArray, 'id');

	return {
		...descriptor,
		name: translateIfMessageDescriptor(formatMessage, descriptor, 'name'),
		description: translateIfMessageDescriptor(formatMessage, descriptor, 'description'),
		sections: translatedSections,
		fields: translatedFieldsLookup as unknown as LookupTable<ContentTypeField>
	};
}

function translateIfMessageDescriptor(
	formatMessage: IntlShape['formatMessage'],
	target: DescriptorContentType,
	property: 'name' | 'description'
): string;
function translateIfMessageDescriptor(
	formatMessage: IntlShape['formatMessage'],
	target: DescriptorSection,
	property: 'title' | 'description'
): string;
function translateIfMessageDescriptor(
	formatMessage: IntlShape['formatMessage'],
	target: DescriptorField,
	property: 'name' | 'description' | 'helpText'
): string;
function translateIfMessageDescriptor<K>(
	formatMessage: IntlShape['formatMessage'],
	target: K,
	property: keyof K
): string {
	return nnou(target[property]) && typeof target[property] === 'object'
		? formatMessage(target[property])
		: ((target[property] as string) ?? '');
}
