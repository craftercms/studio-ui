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
  LegacyContentType,
  LegacyDataSource,
  LegacyFormDefinition,
  LegacyFormDefinitionField,
  LegacyFormDefinitionProperty,
  LegacyFormDefinitionSection
} from '../models/ContentType';
import { LookupTable } from '../models/LookupTable';
import { camelize, capitalize, isBlank } from '../utils/string';
import { forkJoin, Observable, of } from 'rxjs';
import { errorSelectorApi1, get, getBinary, post, postJSON } from '../utils/ajax';
import { catchError, map, switchMap } from 'rxjs/operators';
import { createLookupTable, nou, toQueryString } from '../utils/object';
import { fetchItemsByPath } from './content';
import { SandboxItem } from '../models/Item';
import { fetchConfigurationDOM, fetchConfigurationJSON, writeConfiguration } from './configuration';
import { beautify, deserialize, entityEncodingTagValueProcessor, serialize } from '../utils/xml';
import { stripDuplicateSlashes } from '../utils/path';
import { Api2ResponseFormat } from '../models/ApiResponse';
import { asArray } from '../utils/array';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import AllowedContentTypesData from '../models/AllowedContentTypesData';

const typeMap = {
  input: 'text',
  rte: 'html',
  checkbox: 'boolean',
  'image-picker': 'image'
};

const systemValidationsNames = [
  'itemManager',
  'minSize',
  'maxSize',
  'maxlength',
  'readonly',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'minValue',
  'maxValue',
  'imgRepositoryUpload',
  'imgDesktopUpload',
  'videoDesktopUpload',
  'videoBrowseRepo',
  'audioDesktopUpload',
  'audioBrowseRepo'
];

const systemValidationsKeysMap = {
  minSize: 'minCount',
  maxSize: 'maxCount',
  maxlength: 'maxLength',
  contentTypes: 'allowedContentTypes',
  tags: 'allowedContentTypeTags',
  readonly: 'readOnly',
  width: 'width',
  height: 'height',
  minWidth: 'minWidth',
  minHeight: 'minHeight',
  maxWidth: 'maxWidth',
  maxHeight: 'maxHeight',
  minValue: 'minValue',
  maxValue: 'maxValue',
  imgRepositoryUpload: 'allowImagesFromRepo',
  imgDesktopUpload: 'allowImageUpload',
  videoDesktopUpload: 'allowVideoUpload',
  videoBrowseRepo: 'allowVideosFromRepo',
  audioDesktopUpload: 'allowAudioUpload',
  audioBrowseRepo: 'allowAudioFromRepo'
};

function bestGuessParse(value: any) {
  if (nou(value)) {
    return null;
  } else if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else if (!isNaN(parseFloat(value))) {
    return parseFloat(value);
  } else {
    return value;
  }
}

function getFieldValidations(
  fieldProperty: LegacyFormDefinitionProperty | LegacyFormDefinitionProperty[],
  dropTargetsLookup?: LookupTable<LegacyDataSource>
): Partial<ContentTypeFieldValidations> {
  const map = asArray<LegacyFormDefinitionProperty>(fieldProperty).reduce<LookupTable<LegacyFormDefinitionProperty>>(
    (table, prop) => {
      if (prop.name === 'width' || prop.name === 'height') {
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

  let validations: Partial<ContentTypeFieldValidations> = {};

  Object.keys(map).forEach((key) => {
    if (systemValidationsNames.includes(key)) {
      if (key === 'itemManager' && dropTargetsLookup) {
        map.itemManager?.value &&
          map.itemManager.value.split(',').forEach((itemManagerId) => {
            asArray(dropTargetsLookup[itemManagerId]?.properties?.property).forEach((prop) => {
              let mappedPropName = systemValidationsKeysMap[prop.name];
              if (mappedPropName) {
                let value = prop.value ? prop.value.split(',') : [];
                if (mappedPropName === 'allowedContentTypes') {
                  const datasource = dropTargetsLookup[itemManagerId] as ComponentsDatasource;
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
                  const allowedContentTypesMeta = validations.allowedContentTypes.value;
                  value.forEach((typeId) => {
                    allowedContentTypesMeta[typeId] = allowedContentTypesMeta[typeId] ?? {};
                    if (datasource.allowEmbedded) {
                      allowedContentTypesMeta[typeId].embedded = true;
                      validations.allowedEmbeddedContentTypes.value.push(typeId);
                    }
                    if (datasource.allowShared) {
                      allowedContentTypesMeta[typeId].shared = true;
                      validations.allowedSharedContentTypes.value.push(typeId);
                    }
                    if (datasource.enableBrowse || datasource.enableSearch) {
                      allowedContentTypesMeta[typeId].sharedExisting = true;
                      validations.allowedSharedExistingContentTypes.value.push(typeId);
                    }
                  });
                } else {
                  validations[mappedPropName] = {
                    id: mappedPropName,
                    value,
                    level: 'required'
                  };
                }
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
) {
  asArray<LegacyFormDefinitionField>(legacyFieldsToBeParsed).forEach((legacyField) => {
    const fieldId = ['file-name', 'internal-name'].includes(legacyField.id) ? camelize(legacyField.id) : legacyField.id;

    sectionFieldIds?.push(fieldId);

    const field: ContentTypeField = {
      id: fieldId,
      name: legacyField.title,
      type: typeMap[legacyField.type] || legacyField.type,
      sortable: legacyField.type === 'node-selector' || legacyField.type === 'repeat',
      validations: {},
      properties: {},
      defaultValue: legacyField.defaultValue
    };

    asArray<LegacyFormDefinitionProperty>(legacyField.properties?.property).forEach((legacyProp) => {
      let value;
      switch (legacyProp.type) {
        case 'boolean':
          value = legacyProp.value === 'true';
          break;
        case 'int':
          value = parseInt(legacyProp.value);
          break;
        default:
          value = legacyProp.value;
      }
      field.properties[legacyProp.name] = {
        ...legacyProp,
        value
      };
    });

    asArray<LegacyFormDefinitionProperty>(legacyField.constraints?.constraint).forEach((legacyProp) => {
      const value = legacyProp.value.trim();
      switch (legacyProp.name) {
        case 'required':
          if (value === 'true') {
            field.validations.required = {
              id: 'required',
              value: value === 'true',
              level: 'required'
            };
          }
          break;
        case 'allowDuplicates':
          break;
        case 'pattern':
          break;
        case 'minSize':
          break;
        default:
          console.log(`[parseLegacyFormDef] Unhandled constraint "${legacyProp.name}"`, legacyProp);
      }
    });

    switch (legacyField.type) {
      case 'repeat':
        field.fields = {};
        let min = parseInt(legacyField?.minOccurs);
        let max = parseInt(legacyField?.maxOccurs);
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
      case 'node-selector':
        field.validations = {
          ...field.validations,
          ...getFieldValidations(legacyField.properties.property, dropTargetsLookup)
        };
        field.validations.required = {
          id: 'required',
          value: Boolean(field.validations.minCount),
          level: 'required'
        };
        break;
      case 'input':
      case 'textarea':
      case 'numeric-input':
      case 'image-picker':
        field.validations = {
          ...field.validations,
          ...getFieldValidations(legacyField.properties.property),
          ...getFieldDataSourceValidations(legacyField.properties.property, dataSources)
        };
        break;
      case 'video-picker':
      case 'rte':
        field.validations = {
          ...field.validations,
          ...getFieldDataSourceValidations(legacyField.properties.property, dataSources)
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
  const sections = [];
  const dataSources = {};
  const dropTargetsLookup: LookupTable<LegacyDataSource> = {};

  // get receptacles dataSources
  asArray(definition.datasources?.datasource).forEach((datasource: LegacyDataSource) => {
    // TODO: Delete datasource.properties after props have been added to the root object? Must update code usages of datasource.properties.
    const properties = asArray(datasource.properties?.property);
    properties.forEach((property) => {
      let value: any = property.value;
      switch (property.type) {
        case 'boolean':
          value = property.value.trim().toLowerCase() === 'true';
          break;
        case 'int':
          value = parseInt(property.value);
          if (isNaN(value)) value = 0;
        // TODO: There's more `types`. Review getSupportedProperties across different datasources.
        // case 'minMax':
        //   value =
        //   break;
      }
      datasource[property.name] = value;
    });
    if (datasource.type === 'components') dropTargetsLookup[datasource.id] = datasource;
    dataSources[datasource.id] = datasource;
  });

  // Parse Sections & Fields
  asArray<LegacyFormDefinitionSection>(definition.sections?.section).forEach((legacySection) => {
    const fieldIds = [];
    parseLegacyFormDefinitionFields(
      legacySection.fields?.field,
      fields,
      dropTargetsLookup,
      fieldIds,
      asArray(definition.datasources?.datasource)
    );
    sections.push({
      description: legacySection.description,
      expandByDefault: legacySection.defaultOpen === 'true',
      title: legacySection.title,
      fields: fieldIds
    });
  });

  const topLevelProps: LegacyFormDefinitionProperty[] = asArray(definition.properties?.property);

  return {
    id: definition['content-type'],
    name: definition.title,
    quickCreate: (definition.quickCreate ?? '').trim() === 'true',
    quickCreatePath: definition.quickCreatePath,
    type: definition.objectType as LegacyContentType['type'],
    displayTemplate: topLevelProps.find((prop) => prop.name === 'display-template')?.value,
    mergeStrategy: topLevelProps.find((prop) => prop.name === 'merge-strategy')?.value,
    dataSources: Object.values(dataSources),
    sections,
    fields
  };
}

function parseLegacyContentType(legacy: LegacyContentType): ContentType {
  return {
    id: legacy.form,
    name: legacy.label.replace('Component - ', ''),
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
  const path = `/content-types${contentTypeId}/form-definition.xml`;
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

export interface FetchContentTypeUsageResponse<T = SandboxItem> {
  templates: T[];
  scripts: T[];
  content: T[];
}

export function fetchContentTypeUsage(site: string, contentTypeId: string): Observable<FetchContentTypeUsageResponse> {
  const qs = toQueryString({ siteId: site, contentType: contentTypeId });
  return get<Api2ResponseFormat<{ usage: FetchContentTypeUsageResponse<string> }>>(
    `/studio/api/2/configuration/content-type/usage${qs}`
  ).pipe(
    map((response) => response?.response.usage),
    switchMap((usage: FetchContentTypeUsageResponse<string>) =>
      usage.templates.length + usage.scripts.length + usage.content.length === 0
        ? // @ts-ignore - avoiding creating new object with the exact same structure just for typescript's sake
          of(usage as FetchContentTypeUsageResponse)
        : fetchItemsByPath(site, [...usage.templates, ...usage.scripts, ...usage.content]).pipe(
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
  const path = stripDuplicateSlashes(`/content-types/${contentTypeId}/form-definition.xml`);
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
  const path = stripDuplicateSlashes(`/content-types/${contentTypeId}/form-definition.xml`);
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

export function fetchPreviewImage(site: string, contentTypeId: string): Observable<any> {
  const qs = toQueryString({ siteId: site, contentTypeId });
  return getBinary(`/studio/api/2/configuration/content-type/preview_image${qs}`);
}
