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

import LookupTable from '../../../models/LookupTable';
import ContentType, { ContentTypeField } from '../../../models/ContentType';
import type { BuiltInControlType } from './controlMap';
import type { RepeatItem } from '../controls/Repeat';
import type { NodeSelectorItem } from '../controls/NodeSelector';
import { systemFieldsNotInType, XmlKeys } from './formConsts';
import { deserialize } from '../../../utils/xml';

export type ValueRetriever<T = unknown> = (value: unknown, field: ContentTypeField) => T;

export const arrayFieldExtractor: ValueRetriever<unknown[]> = (value) =>
	// Controls needn't worry about packaging as `items: { item: [] }`, but when it first gets deserialised, it will have that format.
	Array.isArray(value) ? value : ((value as Record<'item', unknown[]>)?.item ?? []);

export const textFieldExtractor: ValueRetriever<string> = (value) => (value && String(value)) ?? '';

export const booleanFieldExtractor: ValueRetriever<boolean> = (value) => (value === true || value === 'true') ?? false;

export const valueRetrieverLookup: Record<BuiltInControlType, ValueRetriever> = {
	'auto-filename': textFieldExtractor,
	'aws-file-upload': null,
	'box-file-upload': null,
	'checkbox-group': arrayFieldExtractor,
	checkbox: booleanFieldExtractor,
	'date-time': null,
	disabled: booleanFieldExtractor,
	dropdown: textFieldExtractor,
	'file-name': textFieldExtractor,
	forcehttps: null,
	'image-picker': textFieldExtractor,
	input: textFieldExtractor,
	'internal-name': textFieldExtractor,
	label: textFieldExtractor,
	'link-input': textFieldExtractor,
	'link-textarea': textFieldExtractor,
	'linked-dropdown': textFieldExtractor,
	'locale-selector': textFieldExtractor,
	repeat: arrayFieldExtractor,
	'node-selector': arrayFieldExtractor,
	'numeric-input': textFieldExtractor, // Should this parse to number?
	'page-nav-order': null,
	rte: textFieldExtractor,
	textarea: textFieldExtractor,
	time: null,
	'transcoded-video-picker': textFieldExtractor,
	uuid: textFieldExtractor,
	'video-picker': textFieldExtractor
};

/**
 * Takes in the raw deserialized values from a content XML and returns a "clean" JSON-style object
 * with the values returned by the field value retrievers.
 * @param contentTypeFields The fields of the content type
 * @param xmlDeserializedValues The raw deserialized values from the content XML
 * @param contentTypesLookup A lookup table of content types
 * @param fieldCallback A callback to run for each field
 **/
export function createParsedValuesObject(
	contentTypeFields: LookupTable<ContentTypeField> | ContentTypeField[],
	xmlDeserializedValues: LookupTable<unknown>,
	contentTypesLookup: LookupTable<ContentType>,
	fieldCallback?: (fieldId: string, value: unknown) => void
): LookupTable<unknown> {
	const values = {};
	systemFieldsNotInType.forEach((systemFieldId) => {
		if (systemFieldId in xmlDeserializedValues) {
			values[systemFieldId] = xmlDeserializedValues[systemFieldId] ?? '';
			fieldCallback?.(systemFieldId, values[systemFieldId]);
		}
	});
	(Array.isArray(contentTypeFields) ? contentTypeFields : Object.values(contentTypeFields)).forEach((field) => {
		values[field.id] = createParsedValueForField(xmlDeserializedValues[field.id], field, contentTypesLookup);
		fieldCallback?.(field.id, values[field.id]);
	});
	return values;
}

export function createParsedValueForField<T = unknown>(
	xmlDeserializedValue: unknown,
	field: ContentTypeField,
	contentTypesLookup: LookupTable<ContentType>
): T {
	const value = retrieveFieldValue<T>(field, xmlDeserializedValue);
	const controlType = field.type as BuiltInControlType;
	switch (controlType) {
		case 'repeat': {
			return (value as Array<RepeatItem>).map((item) =>
				createParsedValuesObject(field.fields, item, contentTypesLookup)
			) as T;
		}
		case 'node-selector': {
			return (value as Array<NodeSelectorItem>).map((item) => {
				try {
					return item.component
						? {
								...item,
								component: createParsedValuesObject(
									contentTypesLookup[(item.component[XmlKeys.contentTypeId] as string).trim()].fields,
									item.component,
									contentTypesLookup
								)
							}
						: item;
				} catch (e) {
					console.error(e);
					return item;
				}
			}) as T;
		}
	}
	return value;
}

export function retrieveFieldValue<T = unknown>(field: ContentTypeField, value: unknown): T {
	const retriever: ValueRetriever<T> | undefined = valueRetrieverLookup[field.type];
	if (!retriever) {
		console.warn(`No value retriever for field ${field.id} of type ${field.type}`);
		return value as T;
	}
	return retriever(value, field);
}

/** Takes in the CrafterCMS content XML and returns a JS object with the values */
export function deserializeContentDoc(contentDom: XMLDocument | Element): LookupTable<unknown> {
	if (!contentDom) return null;
	return deserialize(contentDom, {
		ignoreAttributes: true,
		// Ideally, we would extract all collection types (item selector, repeat) that have
		// this sort of syntax to avoid false positives.
		// e.g.collectionFieldIds.map((fieldId) => `${rootTagName}.${fieldId}.item`).includes(jPath);
		isArray: (tagName: string, jPath: string) => jPath.endsWith('.item')
	})[(contentDom as XMLDocument).documentElement?.tagName ?? (contentDom as Element).tagName];
}
