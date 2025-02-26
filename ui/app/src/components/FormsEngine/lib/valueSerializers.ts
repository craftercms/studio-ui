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
import { XMLBuilder } from 'fast-xml-parser';

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
		const field = fields[id];
		const fieldType = field?.type as BuiltInControlType;
		switch (fieldType) {
			case 'repeat':
			case 'node-selector': {
				jObj[id] =
					fieldType === 'repeat'
						? prepareRepeat(field, value as RepeatItem[], contentTypesLookup)
						: prepareNodeSelector(field, value as NodeSelectorItem[], contentTypesLookup);
				break;
			}
			case 'rte': {
				jObj[id] = { __cdata__: value };
				break;
			}
			case 'checkbox-group': {
				jObj[id] = prepareArray(field, value);
				break;
			}
			default:
				// Leave value as is...
				break;
		}
	});
	return jObj;
}

interface XmlNuancedArrayFormat<T = unknown> {
	'@:item-list': true;
	item: T[];
}

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
			component['@:id'] = component[XmlKeys.modelId];
			return { ...item, '@:inline': true, component };
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

/** Takes in a FormsEngine values object and creates the XML representation */
export function buildContentXml(values: LookupTable<unknown>, contentTypesLookup: LookupTable<ContentType>): string {
	const rootContentType: ContentType = contentTypesLookup[values[XmlKeys.contentTypeId] as string];
	const rootObjectType = rootContentType.type;
	const jObj = prepareValuesForXmlSerialising(rootContentType.fields, values, contentTypesLookup);
	rootObjectType === 'component' && (jObj['@:id'] = jObj.objectId);
	const builder = new XMLBuilder({
		format: true,
		indentBy: '\t',
		ignoreAttributes: false,
		attributeNamePrefix: '@:',
		cdataPropName: '__cdata__',
		suppressBooleanAttributes: false
	});
	const xml = builder.build({ [`${rootObjectType}`]: jObj });
	return xml as string;
}
