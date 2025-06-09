/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
	ComponentsDatasource,
	ContentType,
	ContentTypeField,
	ContentTypeFieldValidation,
	ContentTypeFieldValidations,
	ContentTypeSection,
	DataSource,
	LegacyContentType,
	LegacyDataSource,
	LegacyFormDefinition,
	LegacyFormDefinitionField,
	LegacyFormDefinitionProperty,
	LegacyFormDefinitionSection
} from '../models/ContentType';
import { LookupTable } from '../models/LookupTable';
import { camelize, capitalize, isBlank, toColor } from '../utils/string';
import { forkJoin, Observable, of } from 'rxjs';
import { errorSelectorApi1, get, getBinary, post, postJSON } from '../utils/ajax';
import { catchError, map, switchMap } from 'rxjs/operators';
import { createLookupTable, nou, toQueryString } from '../utils/object';
import { fetchContentItems } from './content';
import { ContentItem } from '../models/Item';
import { fetchConfigurationDOM, fetchConfigurationJSON, writeConfiguration } from './configuration';
import { beautify, deserialize, entityEncodingTagValueProcessor, serialize } from '../utils/xml';
import { Api2ResponseFormat } from '../models/ApiResponse';
import { asArray, immutableEmptyArray } from '../utils/array';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import AllowedContentTypesData from '../models/AllowedContentTypesData';
import {
	createFormDefinitionPathFromTypeId,
	systemValidationsKeysMap,
	systemValidationsNames
} from '../utils/contentType';
import { XmlKeys } from '../components/FormsEngine/lib/formConsts';
import { AjaxResponse } from 'rxjs/ajax';

// FE2 TODO: Verify removal
// const typeMap = {
//   input: 'text',
//   rte: 'html',
//   checkbox: 'boolean',
//   'image-picker': 'image'
// };

function bestGuessParse(value: unknown): unknown {
	if (nou(value)) {
		return null;
	} else if (value === 'true') {
		return true;
	} else if (value === 'false') {
		return false;
	} else if (!isNaN(parseFloat(value as string))) {
		return parseFloat(value as string);
	} else {
		return value;
	}
}

interface ParseComponentsDataSourceContentTypesPropertyOutput {
	allowedContentTypes: ContentTypeFieldValidation<LookupTable<AllowedContentTypesData>>;
	allowedEmbeddedContentTypes: ContentTypeFieldValidation<string[]>;
	allowedSharedContentTypes: ContentTypeFieldValidation<string[]>;
	allowedSharedExistingContentTypes: ContentTypeFieldValidation<string[]>;
}

export function parseComponentsDataSourceContentTypesProperty(
	dataSource: ComponentsDatasource,
	contentTypesPropertyValue: string,
	validations: Partial<ContentTypeFieldValidations> = {}
): Partial<ParseComponentsDataSourceContentTypesPropertyOutput> {
	const value = contentTypesPropertyValue?.split(',') ?? immutableEmptyArray;
	validations.allowedContentTypes = validations.allowedContentTypes ?? {
		id: 'allowedContentTypes',
		level: 'required',
		value: {} as LookupTable<AllowedContentTypesData<boolean>>
	};
	validations.allowedEmbeddedContentTypes = validations.allowedEmbeddedContentTypes ?? {
		id: 'allowedEmbeddedContentTypes',
		level: 'required',
		value: []
	};
	validations.allowedSharedContentTypes = validations.allowedSharedContentTypes ?? {
		id: 'allowedSharedContentTypes',
		level: 'required',
		value: []
	};
	validations.allowedSharedExistingContentTypes = validations.allowedSharedExistingContentTypes ?? {
		id: 'allowedSharedExistingContentTypes',
		level: 'required',
		value: []
	};
	const allowedContentTypesMeta: LookupTable<AllowedContentTypesData> = validations.allowedContentTypes.value;
	value.forEach((typeId) => {
		allowedContentTypesMeta[typeId] = allowedContentTypesMeta[typeId] ?? {};
		const propsLookup = createLookupTable(asArray(dataSource.properties.property), 'name');
		if (propsLookup.allowEmbedded) {
			allowedContentTypesMeta[typeId].embedded = true;
			validations.allowedEmbeddedContentTypes.value.push(typeId);
		}
		if (propsLookup.allowShared) {
			allowedContentTypesMeta[typeId].shared = true;
			validations.allowedSharedContentTypes.value.push(typeId);
		}
		if (propsLookup.enableBrowse || propsLookup.enableSearch) {
			allowedContentTypesMeta[typeId].sharedExisting = true;
			validations.allowedSharedExistingContentTypes.value.push(typeId);
		}
	});
	return validations;
}

function getFieldValidations(
	fieldProperty: LegacyFormDefinitionProperty | LegacyFormDefinitionProperty[],
	dropTargetsLookup?: LookupTable<LegacyDataSource>
): Partial<ContentTypeFieldValidations> {
	const map = asArray<LegacyFormDefinitionProperty>(fieldProperty).reduce<LookupTable<LegacyFormDefinitionProperty>>(
		(table, prop) => {
			if ((prop.name === 'width' || prop.name === 'height') && Boolean(prop.value)) {
				const parsedValidation = JSON.parse(prop.value);
				if (parsedValidation.exact) {
					table[prop.name] = {
						name: prop.name,
						type: prop.type,
						value: parsedValidation.exact
					};
				} else {
					table[`min${capitalize(prop.name)}`] = {
						name: prop.name,
						type: prop.type,
						value: parsedValidation.min
					};
					table[`max${capitalize(prop.name)}`] = {
						name: prop.name,
						type: prop.type,
						value: parsedValidation.max
					};
				}
			} else {
				table[prop.name] = prop;
			}
			return table;
		},
		{}
	);

	const validations: Partial<ContentTypeFieldValidations> = {};

	Object.keys(map).forEach((key) => {
		if (systemValidationsNames.includes(key)) {
			if (key === 'itemManager' && dropTargetsLookup) {
				map.itemManager?.value?.split(',').forEach((itemManagerId) => {
					asArray(dropTargetsLookup[itemManagerId]?.properties?.property).forEach((prop) => {
						const mappedPropName = systemValidationsKeysMap[prop.name];
						if (mappedPropName === 'allowedContentTypes') {
							parseComponentsDataSourceContentTypesProperty(
								dropTargetsLookup[itemManagerId] as ComponentsDatasource,
								prop.value,
								validations
							);
						} else if (mappedPropName) {
							validations[mappedPropName] = {
								id: mappedPropName,
								value: prop.value?.split(',') ?? immutableEmptyArray,
								level: 'required'
							};
						}
					});
				});
			} else if (systemValidationsNames.includes(key) && !isBlank(map[key]?.value)) {
				validations[systemValidationsKeysMap[key]] = {
					id: systemValidationsKeysMap[key],
					// TODO: Parse values robustly
					value: bestGuessParse(map[key].value),
					level: 'required'
				};
			}
		}
	});
	return validations;
}

function getFieldDataSourceValidations(
	fieldProperty: LegacyFormDefinitionProperty | LegacyFormDefinitionProperty[],
	dataSources: LegacyDataSource[]
): Partial<ContentTypeFieldValidations> {
	let validations = {};
	if (
		dataSources &&
		dataSources.length > 0 &&
		asArray(fieldProperty).find((prop) => ['imageManager', 'videoManager', 'audioManager'].includes(prop.name))
	) {
		validations = asArray<LegacyFormDefinitionProperty>(fieldProperty).reduce<LookupTable<ContentTypeFieldValidation>>(
			(table, prop) => {
				if (prop.name === 'imageManager' || prop.name === 'videoManager' || prop.name === 'audioManager') {
					const dataSourcesIds = prop.value.trim() !== '' ? prop.value.split(',') : null;
					dataSourcesIds?.forEach((id) => {
						const dataSource = dataSources.find((datasource) => datasource.id === id);
						if (dataSource && systemValidationsNames.includes(camelize(dataSource.type))) {
							table[systemValidationsKeysMap[camelize(dataSource.type)]] = {
								id: systemValidationsKeysMap[camelize(dataSource.type)],
								value: asArray(dataSource.properties.property).find((prop) => prop.name === 'repoPath').value,
								level: 'required'
							};
						}
					});
				}
				return table;
			},
			{}
		);
	}
	return validations;
}

function parseLegacyFormDefinitionFields(
	legacyFieldsToBeParsed: LegacyFormDefinitionField[] | LegacyFormDefinitionField,
	currentFieldLookup: LookupTable<ContentTypeField>,
	dropTargetsLookup: LookupTable<LegacyDataSource>,
	sectionFieldIds?: Array<string>,
	dataSources?: LegacyDataSource[]
): void {
	asArray<LegacyFormDefinitionField>(legacyFieldsToBeParsed).forEach((legacyField) => {
		// FE2 TODO: Changed the camelizing of file-name and internal-name
		// const fieldId = ['file-name', 'internal-name'].includes(legacyField.id) ? camelize(legacyField.id) : legacyField.id;
		const fieldId = legacyField.id;

		sectionFieldIds?.push(fieldId);

		const field: ContentTypeField = {
			id: fieldId,
			name: legacyField.title,
			description: legacyField.description,
			helpText: legacyField.help,
			type: legacyField.type, // FE2 TODO: Changed from `type: typeMap[legacyField.type] || legacyField.type,`
			sortable: legacyField.type === 'node-selector' || legacyField.type === 'repeat',
			validations: {},
			properties: {},
			defaultValue: legacyField.defaultValue
		};

		if (legacyField.plugin) {
			field.properties.plugin = legacyField.plugin;
		}

		asArray<LegacyFormDefinitionProperty>(legacyField.properties?.property).forEach((legacyProp) => {
			let value;
			switch (legacyProp.type) {
				case 'boolean':
					value = legacyProp.value === 'true';
					break;
				case 'int':
					value = legacyProp.value ? parseInt(legacyProp.value) : null;
					break;
				default:
					if (
						legacyField.type === 'repeat' &&
						(legacyProp.name === 'minOccurs' || legacyProp.name === 'maxOccurs') &&
						legacyProp.value === '*'
					) {
						value = null;
					} else {
						value = legacyProp.value;
					}
			}
			field.properties[legacyProp.name] = {
				...legacyProp,
				value
			};
		});

		asArray<LegacyFormDefinitionProperty>(legacyField.constraints?.constraint).forEach((legacyProp) => {
			const value = legacyProp.value?.trim();
			switch (legacyProp.name) {
				case 'required':
					if (value) {
						field.validations.required = {
							id: 'required',
							value: value === 'true',
							level: 'required'
						};
					}
					break;
				case 'allowDuplicates':
					if (value === 'true') {
						field.validations.allowDuplicates = {
							id: 'required',
							value: value === 'true',
							level: 'required'
						};
					}
					break;
				case 'pattern':
					field.validations.pattern = {
						id: 'pattern',
						value,
						level: 'required'
					};
					break;
				case 'minSize':
					break;
				default:
					console.log(`[parseLegacyFormDef] Unhandled constraint "${legacyProp.name}"`, legacyProp);
			}
		});

		const propertyProp = legacyField.properties?.property;
		switch (legacyField.type) {
			case 'repeat': {
				field.fields = {};
				let min = legacyField?.minOccurs !== '*' ? parseInt(legacyField?.minOccurs) : null;
				const max = legacyField?.maxOccurs !== '*' ? parseInt(legacyField?.maxOccurs) : null;
				isNaN(min) && (min = 0);
				field.validations.required = {
					id: 'required',
					value: min > 0,
					level: 'required'
				};
				min > 0 &&
					(field.validations.minCount = {
						id: 'minCount',
						value: min,
						level: 'required'
					});
				!isNaN(max) &&
					(field.validations.maxCount = {
						id: 'maxCount',
						value: max,
						level: 'required'
					});
				parseLegacyFormDefinitionFields(legacyField.fields.field, field.fields, dropTargetsLookup, null, dataSources);
				break;
			}
			case 'node-selector':
				field.validations = {
					...field.validations,
					...getFieldValidations(propertyProp, dropTargetsLookup)
				};
				field.validations.required = {
					id: 'required',
					value: Boolean(field.validations.minCount?.value),
					level: 'required'
				};
				break;
			case 'input':
			case 'textarea':
			case 'numeric-input':
			case 'image-picker':
				field.validations = {
					...field.validations,
					...getFieldValidations(propertyProp),
					...getFieldDataSourceValidations(propertyProp, dataSources)
				};
				break;
			case 'video-picker':
			case 'rte':
				field.validations = {
					...field.validations,
					...getFieldDataSourceValidations(propertyProp, dataSources)
				};
		}

		currentFieldLookup[fieldId] = field;
	});
}

function parseLegacyFormDefinition(definition: LegacyFormDefinition): ContentType {
	if (nou(definition)) {
		return {} as ContentType;
	}

	const fields: LookupTable<ContentTypeField> = {};
	const sections: Array<ContentTypeSection> = [];
	const dataSources: LookupTable<DataSource> = {};
	const dropTargetsLookup: LookupTable<LegacyDataSource> = {};

	const legacyDataSourceArray = asArray(definition.datasources?.datasource);

	// get receptacles dataSources
	legacyDataSourceArray.forEach((datasource: LegacyDataSource) => {
		// TODO: Delete datasource.properties after props have been added to the root object? Must update code usages of datasource.properties.
		dataSources[datasource.id] = { ...datasource, properties: {} };
		asArray(datasource.properties?.property).forEach((property) => {
			let value: unknown = property.value;
			switch (property.type) {
				case 'boolean':
					value = property.value.trim().toLowerCase() === 'true';
					break;
				case 'int':
					value = Number(property.value);
					if (isNaN(value as number)) value = 0;
				// TODO: There's more `types`. Review getSupportedProperties across different DSs. Preferably we drop these. These types should be on the descriptor for the DS form.
				// case 'minMax':
				//   value =
				//   break;
			}
			dataSources[datasource.id].properties[property.name] = value;
		});
		if (datasource.type === 'components') {
			dropTargetsLookup[datasource.id] = datasource;
		}
	});

	// Parse Sections & Fields
	asArray<LegacyFormDefinitionSection>(definition.sections?.section).forEach((legacySection, index) => {
		const fieldIds = [];
		parseLegacyFormDefinitionFields(
			legacySection.fields?.field,
			fields,
			dropTargetsLookup,
			fieldIds,
			legacyDataSourceArray
		);

		sections.push({
			id: `section-${index}`,
			title: legacySection.title,
			color: legacySection.color ?? toColor(legacySection.title, 0.7),
			description: legacySection.description,
			expandByDefault: legacySection.defaultOpen === 'true',
			fields: fieldIds
		});
	});

	const topLevelPropMap: LookupTable<LegacyFormDefinitionProperty> = createLookupTable(
		asArray(definition.properties?.property) as LegacyFormDefinitionProperty[],
		'name'
	);

	return {
		id: definition['content-type'],
		name: definition.title,
		description: definition.description,
		quickCreate: definition.quickCreate?.trim() === 'true',
		quickCreatePath: definition.quickCreatePath,
		type: definition.objectType as LegacyContentType['type'],
		displayTemplate: topLevelPropMap[XmlKeys.displayTemplate]?.value?.trim() || null,
		mergeStrategy: topLevelPropMap[XmlKeys.mergeStrategy]?.value?.trim() || null,
		// ∨∨∨ Added during TypeBuilder 2 ∨∨∨
		hasJsController: definition.controller?.trim() === 'true',
		thumbnailFileName: definition.imageThumbnail,
		isHeadless: topLevelPropMap[XmlKeys.templateNotRequired]?.value?.trim() === 'true',
		paths: parseLegacyFormDefinitionPathsProp(definition),
		// ^^^ Added during TypeBuilder 2 ^^^
		dataSources: Object.values(dataSources),
		sections,
		fields
	};
}

function parseLegacyFormDefinitionPathsProp(definition: LegacyFormDefinition): ContentType['paths'] {
	if (!definition.paths || !(definition.paths?.includes && definition.paths?.excludes)) return null;
	const paths: ContentType['paths'] = {};
	if (definition.paths?.includes) {
		paths.includes = asArray(definition.paths.includes);
	}
	if (definition.paths?.excludes) {
		paths.excludes = asArray(definition.paths.excludes);
	}
	return paths;
}

export function parseLegacyContentType(legacy: LegacyContentType): ContentType {
	return {
		hasJsController: null,
		isHeadless: null,
		paths: null,
		thumbnailFileName: null,
		id: legacy.form,
		name: legacy.label.replace('Component - ', ''),
		description: null,
		quickCreate: legacy.quickCreate,
		quickCreatePath: legacy.quickCreatePath,
		type: legacy.type,
		fields: null,
		sections: null,
		displayTemplate: null,
		dataSources: null,
		mergeStrategy: null
	};
}

function fetchFormDefinition(site: string, contentTypeId: string): Observable<ContentType> {
	const path = createFormDefinitionPathFromTypeId(contentTypeId);
	return fetchConfigurationJSON(site, path, 'studio').pipe(map((def) => parseLegacyFormDefinition(def.form)));
}

export function fetchContentType(site: string, contentTypeId: string): Observable<ContentType> {
	return forkJoin({
		type: fetchLegacyContentType(site, contentTypeId).pipe(map(parseLegacyContentType)),
		definition: fetchFormDefinition(site, contentTypeId)
	}).pipe(
		map(({ type, definition }) => ({
			...type,
			...definition
		}))
	);
}

export function fetchContentTypes(site: string): Observable<ContentType[]> {
	return post(`/studio/api/2/model/${site}/definitions`).pipe(
		map(({ response }) =>
			response.types.map((xmlStr) =>
				parseLegacyFormDefinition(
					deserialize(xmlStr, {
						parseTagValue: false,
						tagValueProcessor: entityEncodingTagValueProcessor
					}).form
				)
			)
		)
	);
}

export function fetchLegacyContentType(site: string, contentTypeId: string): Observable<LegacyContentType> {
	return get<LegacyContentType>(
		`/studio/api/1/services/api/1/content/get-content-type.json?site_id=${site}&type=${contentTypeId}`
	).pipe(map((response) => response?.response));
}

export function fetchLegacyContentTypes(site: string, path?: string): Observable<LegacyContentType[]> {
	const qs = toQueryString({ site, path });
	return get<LegacyContentType[]>(`/studio/api/1/services/api/1/content/get-content-types.json${qs}`).pipe(
		map((response) => response?.response),
		catchError(errorSelectorApi1)
	);
}

export interface FetchContentTypeUsageResponse<T = string> {
	templates: T[];
	scripts: T[];
	content: T[];
}

export function fetchContentTypeUsage(
	site: string,
	contentTypeId: string
): Observable<FetchContentTypeUsageResponse<ContentItem>> {
	const qs = toQueryString({ siteId: site, contentType: contentTypeId });
	return get<Api2ResponseFormat<{ usage: FetchContentTypeUsageResponse }>>(
		`/studio/api/2/configuration/content-type/usage${qs}`
	).pipe(
		map((response) => response?.response.usage),
		switchMap((usage) =>
			usage.templates.length + usage.scripts.length + usage.content.length === 0
				? of(
						// @ts-expect-error: at this point, `usage` is known to be empty arrays so we can safely cast it to `FetchContentTypeUsageResponse<ContentItem>`
						usage as FetchContentTypeUsageResponse<ContentItem>
					)
				: fetchContentItems(site, [...usage.templates, ...usage.scripts, ...usage.content]).pipe(
						map((items) => {
							const itemLookup = createLookupTable(items, 'path');
							const mapper = (path) => itemLookup[path];
							return {
								templates: usage.templates.map(mapper).filter(Boolean),
								scripts: usage.scripts.map(mapper).filter(Boolean),
								content: usage.content.map(mapper).filter(Boolean)
							};
						})
					)
		)
	);
}

export function deleteContentType(site: string, contentTypeId: string): Observable<boolean> {
	return postJSON(`/studio/api/2/configuration/content-type/delete`, {
		siteId: site,
		contentType: contentTypeId,
		deleteDependencies: true
	}).pipe(map(() => true));
}

export function associateTemplate(site: string, contentTypeId: string, displayTemplate: string): Observable<boolean> {
	const path = createFormDefinitionPathFromTypeId(contentTypeId);
	const module = 'studio';
	return fetchConfigurationDOM(site, path, 'studio').pipe(
		switchMap((doc) => {
			const properties = doc.querySelectorAll('properties > property');
			const property = Array.from(properties).find(
				(node) => node.querySelector('name').innerHTML.trim() === 'display-template'
			);
			if (property) {
				property.querySelector('value').innerHTML = displayTemplate;
			} else {
				const property = document.createElement('property');
				const name = document.createElement('name');
				const label = document.createElement('label');
				const value = document.createElement('value');
				const type = document.createElement('type');
				name.innerHTML = 'display-template';
				label.innerHTML = 'Display Template';
				value.innerHTML = displayTemplate;
				type.innerHTML = 'template';
				property.appendChild(name);
				property.appendChild(label);
				property.appendChild(value);
				property.appendChild(type);
				doc.querySelector('properties').appendChild(property);
			}
			return fromPromise(beautify(serialize(doc))).pipe(
				switchMap((xml) => writeConfiguration(site, path, module, xml))
			);
		})
	);
}

export function dissociateTemplate(site: string, contentTypeId: string): Observable<boolean> {
	const path = createFormDefinitionPathFromTypeId(contentTypeId);
	const module = 'studio';
	return fetchConfigurationDOM(site, path, 'studio').pipe(
		switchMap((doc) => {
			const properties = doc.querySelectorAll('properties > property');
			const property = Array.from(properties).find(
				(node) => node.querySelector('name').innerHTML.trim() === 'display-template'
			);
			if (property) {
				property.querySelector('value').innerHTML = '';
				return fromPromise(beautify(serialize(doc))).pipe(
					switchMap((xml) => writeConfiguration(site, path, module, xml))
				);
			} else {
				return of(false);
			}
		})
	);
}

export function fetchPreviewImage(site: string, contentTypeId: string): Observable<AjaxResponse<Blob>> {
	const qs = toQueryString({ siteId: site, contentTypeId });
	return getBinary(`/studio/api/2/configuration/content-type/preview_image${qs}`);
}

/**
 * @deprecated Only for Forms Engine v1 (FE1) usage. FE1 gets replaced by FE2 in CrafterCMS v5.
 **/
export function getFetchLegacyFormControllerUrl(site: string, contentTypeId: string): string {
	const qs = toQueryString({ siteId: site, contentTypeId });
	return `/studio/api/2/configuration/content-type/form_controller${qs}`;
}
