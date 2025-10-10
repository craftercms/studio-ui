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

import { ContentTypeField } from '../../../models';
import { NodeSelectorItem } from '../controls/NodeSelector';
import LookupTable from '../../../models/LookupTable';
import ContentType from '../../../models/ContentType';
import { XmlKeys } from './formConsts';
import { BuiltInControlType } from './controlMap';
import { RepeatItem } from '../controls/Repeat';
import { XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';
import type { DescriptorControlType } from '../../ContentTypeManagement/controlMap';

const attributeNamePrefix = '@:';
const cdataPropName = '__cdata__';
const textNodeName = '#text';

export type ValueSerializer<T = unknown> = (
	field: ContentTypeField,
	value: unknown,
	contentTypesLookup?: LookupTable<ContentType>
) => T;

export const valueSerializersLookup: Record<BuiltInControlType | DescriptorControlType, ValueSerializer> = {
	'auto-filename': undefined,
	'aws-file-upload': undefined,
	'checkbox-group': prepareArray,
	checkbox: undefined,
	'date-time': undefined,
	disabled: undefined,
	dropdown: undefined,
	'file-name': undefined,
	forcehttps: undefined,
	'image-picker': undefined,
	input: undefined,
	'internal-name': undefined,
	label: undefined,
	'link-input': undefined,
	'link-textarea': undefined,
	'linked-dropdown': undefined,
	'locale-selector': undefined,
	repeat: (field, value, contentTypesLookup) => prepareRepeat(field, value as RepeatItem[], contentTypesLookup),
	'node-selector': (field, value, contentTypesLookup) =>
		prepareNodeSelector(field, value as NodeSelectorItem[], contentTypesLookup),
	'numeric-input': undefined,
	'page-nav-order': undefined,
	rte: prepareRTE,
	textarea: undefined,
	time: undefined,
	'transcoded-video-picker': undefined,
	uuid: undefined,
	'video-picker': undefined,
	colorPicker: undefined,
	'content-path-input': undefined,
	contentTypes: undefined,
	'dropdown-static-values': undefined,
	'template-selector': undefined,
	'type-image-selector': undefined,
	'datasource-selector': undefined,
	'read-only-value': undefined,
	range: undefined,
	'type-js-controller-selector': undefined,
	'key-value-map': undefined,
	'type-destination-paths-selector': undefined,
	'path-with-macro-creator': undefined,
	'merge-strategy-selector': undefined,
	'datasource-single-selector': undefined,
	variable: undefined,
	'type-configuration': undefined
};

/**
 * Formats a FormsEngine values object with "hints" for attributes or other specifics for the XML serialiser to serialise
 * the content as a CrafterCMS content xml.
 **/
function prepareValuesForXmlSerialising(
	fields: LookupTable<ContentTypeField>,
	values: LookupTable<unknown>,
	contentTypesLookup: LookupTable<ContentType>
): LookupTable<unknown> {
	const jObj = { ...values };
	Object.entries(jObj).forEach(([id, value]) => {
		// System props are not in the model, hence field might be undefined at times.
		const field = fields[id];
		const fieldType = field?.type as BuiltInControlType;
		const fieldAttributes = {};
		// Field type specific hinting...

		const serializer = valueSerializersLookup[fieldType];
		if (serializer) {
			jObj[id] = serializer(field, value, contentTypesLookup);
		}
		if (field?.properties.tokenize?.value) {
			fieldAttributes[createAttrHint('tokenized')] = true;
		}
		// TODO: Carry/implement attributes (no-default, remote, others?)
		if (Object.keys(fieldAttributes).length) {
			jObj[id] =
				typeof jObj[id] === 'object'
					? { ...fieldAttributes, ...jObj[id] }
					: // The serializer may have made changes to 'value', so we need to use that instead of the original 'value'
						{ ...fieldAttributes, [textNodeName]: jObj[id] ?? value };
		}
	});
	return jObj;
}

type XmlNuancedArrayFormat<T = unknown> = {
	[P in `${typeof attributeNamePrefix}item-list`]: true;
} & {
	item: T[];
};

function prepareNodeSelector(
	field: ContentTypeField,
	value: NodeSelectorItem[],
	contentTypesLookup: LookupTable<ContentType>
): XmlNuancedArrayFormat<NodeSelectorItem> {
	return {
		'@:item-list': true,
		item: value.map((item) => {
			if (item.component == null) {
				return item;
			}
			const contentType = contentTypesLookup[(item.component[XmlKeys.contentTypeId] as string)?.trim()];
			if (!contentType) {
				console.error(`Content type not found for embedded component`, item.component);
				return item;
			}
			const component = prepareValuesForXmlSerialising(
				contentType.fields,
				item.component,
				contentTypesLookup
			) as unknown as NodeSelectorItem['component'];
			component[createAttrHint('id')] = component[XmlKeys.modelId];
			return { ...item, [createAttrHint('inline')]: true, component };
		})
	};
}

function prepareRepeat(
	field: ContentTypeField,
	value: RepeatItem[],
	contentTypesLookup: LookupTable<ContentType>
): XmlNuancedArrayFormat {
	return {
		'@:item-list': true,
		item: value.map((item) => prepareValuesForXmlSerialising(field.fields, item, contentTypesLookup))
	};
}

function prepareArray(field: ContentTypeField, value: unknown) {
	return {
		// TODO: Unsure if all array-likes could/should have the item list attribute. It makes sense, though.
		//  '@:item-list': true,
		item: value
	};
}

function prepareRTE(field: ContentTypeField, value: unknown) {
	// TODO: CDATA wrap based on config
	return { [cdataPropName]: value };
}

function createAttrHint(attributeName: string): string {
	return `${attributeNamePrefix}${attributeName}`;
}

// TODO: Move to utils/xml.ts?
export function getXmlBuilder(options?: Partial<XmlBuilderOptions>): XMLBuilder {
	return new XMLBuilder({
		format: true,
		indentBy: '\t',
		ignoreAttributes: false,
		suppressBooleanAttributes: false,
		attributeNamePrefix,
		cdataPropName,
		textNodeName,
		...options
	});
}

// TODO: Move to content.ts?
/** Takes in a FormsEngine values object and creates the XML representation */
export function buildContentXml(values: LookupTable<unknown>, contentTypesLookup: LookupTable<ContentType>): string {
	const rootContentType: ContentType = contentTypesLookup[values[XmlKeys.contentTypeId] as string];
	const rootObjectType = rootContentType.type;
	const jObj = prepareValuesForXmlSerialising(rootContentType.fields, values, contentTypesLookup);
	rootObjectType === 'component' && (jObj[createAttrHint('id')] = jObj.objectId);
	const builder = getXmlBuilder();
	const xml = builder.build({ [`${rootObjectType}`]: jObj });
	return xml as string;
}
