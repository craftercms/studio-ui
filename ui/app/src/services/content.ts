/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { get, post } from '../utils/ajax';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { createElements, fromString, getInnerHtml, serialize } from '../utils/xml';
import {
  ContentType,
  ContentTypeField,
  LegacyContentTypeDescriptorCamelized,
  LegacyFormDefinition,
  LegacyFormDefinitionField,
  LegacyFormDefinitionProperty,
  LegacyFormDefinitionSection
} from '../models/ContentType';
import { camelizeProps, nou, pluckProps, reversePluckProps } from '../utils/object';
import { LookupTable } from '../models/LookupTable';
import $ from 'jquery/dist/jquery.slim';
import { camelize } from '../utils/string';
import ContentInstance from '../models/ContentInstance';
import { AjaxResponse } from 'rxjs/ajax';
import { PaginationOptions } from '../models/Search';

export function getContent(site: string, path: string): Observable<string> {
  return get(`/studio/api/1/services/api/1/content/get-content.json?site_id=${site}&path=${path}`).pipe(
    map(({ response }) => response.content)
  );
}

export function getDOM(site: string, path: string): Observable<XMLDocument> {
  return getContent(site, path).pipe(map(fromString));
}

export function fetchContentTypes(site: string, query?: any): Observable<ContentType[]> {
  return get(`/studio/api/1/services/api/1/content/get-content-types.json?site=${site}`).pipe(
    map<AjaxResponse, ContentType[]>(({ response }) => (
        (query?.type)
          ? response.filter((contentType) => (
            (contentType.type === query.type) &&
            (contentType.name !== '/component/level-descriptor')
          ))
          : response.filter((contentType) => (
            contentType.name !== '/component/level-descriptor'
          ))
      ).map((data) => {
        const legacy = camelizeProps(data) as LegacyContentTypeDescriptorCamelized;
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
      })
    ),
    switchMap((contentTypes) => zip(
      of(contentTypes),
      forkJoin(
        contentTypes.reduce((hash, contentType) => (
          hash[contentType.id] = get(url(contentType.id, 'form-definition.xml')).pipe(map(({ response }) => response))
        ) && hash, {}) as { [contentTypeId: string]: Observable<LegacyFormDefinition> }
      ))
    ),
    map(([contentTypes, legacyFormDefinitions]) => contentTypes.map((contentType) => ({
      ...contentType,
      ...parseLegacyFormDef(legacyFormDefinitions[contentType.id])
    })))
  );
}

const systemPropList = ['id', 'path', 'contentType', 'dateCreated', 'dateModified', 'label'];

export function fetchById(site: string, id: string): Observable<any> {
  return post(
    `/api/1/site/graphql?crafterSite=${site}`,
    {
      query: `
        query Page {
          contentItems {
            total
            items {
              id: objectId
              path: localId
              contentType: content__type
              dateCreated: createdDate_dt
              dateModified: lastModifiedDate_dt
              label: internal__name
              ...on component_articles__widget {
                title_t
                max_articles_i

              }
              ...on component_contact__widget {
                title_t
                text_html
                email_s
                phone_s
                address_html
              }
              ...on component_feature {
                icon_s
                title_t
                body_html
              }
              ...on component_header {
                logo_s
                logo_text_t
                business_name_s
                social_media_links_o {
                  item {
                    social_media_s
                    url_s
                  }
                }
              }
              ...on component_left__rail {
                widgets_o {
                  item {
                    key
                    component {
                      id: objectId
                    }
                  }
                }
              }
              ...on page_home {
                title_t
                header_o {
                  ...ContentIncludeWrapperFragment
                }
                left__rail_o {
                  ...ContentIncludeWrapperFragment
                }
                hero_title_html
                hero_text_html
                hero_image_s
                features_title_t
                features_o {
                  ...ContentIncludeWrapperFragment
                }
              }
              ...on taxonomy {
                items {
                  item {
                    key
                    value
                  }
                }
              }
            }
          }
        }
        fragment ContentIncludeWrapperFragment on ContentIncludeWrapper {
          item {
            key
            component {
              id: objectId
            }
          }
        }
      `
    },
    { 'Content-Type': 'application/json' }
  ).pipe(
    map(({ response }) => response.data.contentItems.items.flatMap((model) => {

      if ([
        '/page/search-results',
        '/component/level-descriptor'
      ].includes(model.contentType)) {
        return [];
      }

      const system = pluckProps(model, ...systemPropList);
      const data = reversePluckProps(model, ...systemPropList);

      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key.endsWith('_o')) {
          data[key] = value.item.map((item) => item.component?.id || item)
        } else if (model.contentType === '/taxonomy' && key === 'items') {
          data[key] = value.item;
        }
      });

      return [{
        craftercms: system,
        ...data
      }];

    }))
  );
}

const typeMap = {
  'input': 'text',
  'rte-tinymce5': 'html',
  'rte-tinymce4': 'html',
  'checkbox': 'boolean',
  'image-picker': 'image'
};

function url(type, document) {
  return (`/studio/api/1/services/api/1/site/get-configuration.json?site=editorial&path=/content-types${type}/${document}`)
}

function asArray<T = any>(object: Array<T> | T): Array<T> {
  return nou(object) ? [] : Array.isArray(object) ? object : [object];
}

// TODO: Temporarily disabled data sources until needed and read properly (images, and others?)
function parseLegacyFormDef(definition: LegacyFormDefinition): Partial<ContentType> {
  if (nou(definition)) {
    return {};
  }

  const fields = {};
  const sections = [];
  // const dataSources = {};

  // In some cases, the back end parser seems to return this as "   " 🤷
  // if (typeof definition.datasources !== 'string') {
  //   const propsToPluck = ['browsePath', 'repoPath', 'enableSearchExisting', 'enableBrowseExisting', 'enableCreateNew'];
  //   definition.datasources?.datasource && asArray<LegacyDataSource>(definition.datasources.datasource).forEach((legacyDS) => {
  //
  //     dataSources[legacyDS.id] = {
  //       id: legacyDS.id,
  //       name: legacyDS.title,
  //       type: typeMap[legacyDS.type] || legacyDS.type, // e.g. shared-content, embedded-content, img-desktop-upload, img-repository-upload
  //       contentTypes: null,
  //       repoPath: null,
  //       browsePath: null,
  //       enableSearchExisting: null,
  //       enableBrowseExisting: null,
  //       enableCreateNew: null
  //     };
  //
  //     asArray<LegacyFormDefinitionProperty>(legacyDS.properties.property).forEach(prop => {
  //       if (prop.name === 'contentType') {
  //         if (dataSources[legacyDS.id].contentTypes === null) {
  //           dataSources[legacyDS.id].contentTypes = [];
  //         }
  //         dataSources[legacyDS.id].contentTypes.push(...prop.value.split(','));
  //       } else if (propsToPluck.includes(prop.name)) {
  //         // TODO: Figure out how to reliable extract this for the purpose of validating welcomed content types.
  //         dataSources[legacyDS.id][prop.name] = prop.value;
  //       }
  //     });
  //
  //   });
  // }

  // Parse Sections & Fields
  definition.sections?.section && asArray<LegacyFormDefinitionSection>(definition.sections.section).forEach((legacySection) => {
    const fieldIds = [];

    legacySection.fields?.field && asArray<LegacyFormDefinitionField>(legacySection.fields.field).forEach((legacyField) => {

      const fieldId = camelize(legacyField.id);

      fieldIds.push(fieldId);

      const field: ContentTypeField = {
        id: fieldId,
        name: legacyField.title,
        type: typeMap[legacyField.type] || legacyField.type,
        sortable: (legacyField.type === 'node-selector' || legacyField.type === 'repeat'),
        validations: null,
        defaultValue: legacyField.defaultValue,
        required: false
      };

      legacyField.constraints && asArray<LegacyFormDefinitionProperty>(legacyField.constraints.constraint)
        .forEach((legacyProp) => {
          const value = legacyProp.value.trim();
          switch (legacyProp.name) {
            case 'required':
              field.required = (value === 'true');
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

      if (legacyField.type === 'repeat') {
        field.fields = {};
        asArray(legacyField.fields.field).forEach((_legacyField) => {
          const _fieldId = camelize(_legacyField.id);
          field.fields[_fieldId] = {
            id: _fieldId,
            name: _legacyField.title,
            type: typeMap[_legacyField.type] || _legacyField.type,
            sortable: (legacyField.type === 'node-selector' || legacyField.type === 'repeat'),
            validations: null,
            defaultValue: '',
            required: false
          };
          if (field.fields[_fieldId].type === 'node-selector') {

            const map = asArray<LegacyFormDefinitionProperty>(_legacyField.properties.property)
              .reduce<LookupTable<LegacyFormDefinitionProperty>>((table, prop) => {
                table[prop.name] = prop;
                return table;
              }, {});

            field.fields[_fieldId].validations = {
              // tags: (map.tags?.value || '').split(','),
              contentTypes: (map.contentTypes?.value || '').split(',')
            };
          }
        });
      } else if (legacyField.type === 'node-selector') {

        const map = asArray<LegacyFormDefinitionProperty>(legacyField.properties.property)
          .reduce<LookupTable<LegacyFormDefinitionProperty>>((table, prop) => {
            table[prop.name] = prop;
            return table;
          }, {});

        field.validations = {
          // tags: (map.tags?.value || '').split(','),
          contentTypes: (map.contentTypes?.value || '').split(',')
        };

        // Different data sources come as CSV
        // map.itemManager?.value && map.itemManager.value.split(',').forEach((value) => {
        //   if (dataSources[value] && dataSources[value].contentTypes) {
        //     field.validations.contentTypes.push.apply(
        //       field.validations.contentTypes,
        //       dataSources[value].contentTypes);
        //   }
        // });

        // field.validations = {
        //   limit: { min: null, max: null, message: null },
        //   contentTypes: map.itemManager?.value,
        // };
        // asArray(legacyField.properties.property)
        // minSize>value, maxSize>value, itemManager>value
      }

      fields[fieldId] = field;

    });

    sections.push({
      description: legacySection.description,
      expandByDefault: legacySection.defaultOpen,
      title: legacySection.title,
      fields: fieldIds
    });

  });

  const topLevelProps: LegacyFormDefinitionProperty[] = definition.properties?.property ? asArray(definition.properties.property) : [];

  return {
    // Find display template
    displayTemplate: topLevelProps.find((prop) => prop.name === 'display-template')?.value,
    mergeStrategy: topLevelProps.find((prop) => prop.name === 'merge-strategy')?.value,
    // dataSources: Object.values(dataSources),
    sections,
    fields
  };

}

function writeContentUrl(qs: object) {
  qs = new URLSearchParams(qs as URLSearchParams);
  return `/studio/api/1/services/api/1/content/write-content.json?${qs.toString()}`;
}

export function updateField(site: string, modelId: string, fieldId: string, value: any, index: number = null): Observable<any> {
  return getDOM(site, modelId).pipe(
    switchMap((doc) => {
      const qs = {
        site,
        path: modelId,
        unlock: 'true',
        fileName: getInnerHtml(doc.querySelector('file-name'))
      };
      let fieldNode;
      if (index !== null) {
        //the field is a repeat item
        let repeatFieldId = fieldId.split('.');
        fieldNode = doc.querySelector(`:scope > ${repeatFieldId[0]} > item > ${repeatFieldId[1]}`);
        if (!fieldNode) {
          let parentNode = document.createElement(repeatFieldId[0]);
          let itemNode = document.createElement('item');
          fieldNode = document.createElement(repeatFieldId[1]);
          itemNode.append(fieldNode);
          parentNode.append(itemNode);
          doc.documentElement.append(parentNode);
        }
      } else {
        fieldNode = doc.querySelector(`:scope > ${fieldId}`);
        if (!fieldNode) {
          fieldNode = document.createElement(fieldId);
          doc.documentElement.append(fieldNode);
        }
      }
      fieldNode.innerHTML = `<![CDATA[${value}]]>`;
      return post(
        writeContentUrl(qs),
        serialize(doc)
      );

    })
  )
}

export function insertComponent(
  site: string,
  modelId: string,
  fieldId: string,
  targetIndex: number,
  contentType: ContentType,
  instance: ContentInstance,
  shared = false
): Observable<any> {
  return getDOM(site, modelId).pipe(
    switchMap((doc) => {
      const qs = {
        site,
        path: modelId,
        unlock: 'true',
        fileName: getInnerHtml(doc.querySelector('file-name'))
      };

      const id = instance.craftercms.id;
      // TODO: Hardcoded value. Retrieve properly.
      const pathBase = shared ? `/site/components/${contentType.id.replace('/component/', '')}s/`.replace(/\/{1,}$/m, '') : null;
      const path = `${pathBase}/${id}.xml`;

      // Create the new `item` that holds or references (embedded vs shared) the component.
      const newItem = doc.createElement('item');

      delete instance.fileName;
      delete instance.internalName;

      // Create the new component that will be either embedded into the parent's XML or
      // shared stored on it's own.
      const component = mergeContentDocumentProps('component', {
        '@attributes': { id },
        'content-type': contentType.id,
        'display-template': contentType.displayTemplate,
        'internal-name': instance.craftercms.label,
        'file-name': `${id}.xml`,
        'objectId': id,
        'locale': instance.craftercms.locale,
        ...reversePluckProps(instance, 'craftercms')
      });

      // Add the child elements into the `item` node
      createElements(doc, newItem, {
        '@attributes': {
          // TODO: Hardcoded value. Fix.
          datasource: shared ? 'sharedFeatures' : 'features',
          ...(shared ? {} : { inline: true })
        },
        key: shared ? path : id,
        value: instance.craftercms.label,
        ...(shared ? {
          include: path,
          disableFlattening: 'false'
        } : {
          component
        })
      });

      let fieldNode = doc.querySelector(`:scope > ${fieldId}`);

      // Fields not initialized will not be present in the document
      // and we'd rather need to create it.
      if (nou(fieldNode)) {
        fieldNode = doc.createElement(fieldId);
        fieldNode.setAttribute('item-list', 'true');
        doc.documentElement.appendChild(fieldNode);
      }

      // Since this operation only deals with components (i.e. no repeat groups)
      // using `item` as a selector instead of a generic `> *` selection.
      const itemList = fieldNode.querySelectorAll(`:scope > item`);

      if (itemList.length === targetIndex) {
        fieldNode.appendChild(newItem);
      } else {
        $(newItem).insertBefore(itemList[targetIndex]);
      }

      return post(
        writeContentUrl(qs),
        serialize(doc)
      );

    })
  );
}

export function insertItem() {

}

export function sortItem(
  site: string,
  modelId: string,
  fieldId: string,
  currentIndex: number,
  targetIndex: number
): Observable<any> {
  return getDOM(site, modelId).pipe(
    switchMap((doc) => {

      const qs = {
        site,
        path: modelId,
        unlock: 'true',
        fileName: getInnerHtml(doc.querySelector('file-name'))
      };

      // It's important to add the `:scope >` in to the selector since
      // there may be nested fields with the same field ID.
      const items = doc.querySelectorAll(`:scope > ${fieldId} > *`);
      const $el = $(items).eq(currentIndex);
      const $targetSibling = $(items).eq(targetIndex);

      if (currentIndex < targetIndex) {
        $el.insertAfter($targetSibling);
      } else {
        $el.insertBefore($targetSibling);
      }

      return post(
        writeContentUrl(qs),
        serialize(doc)
      );

    })
  );
}

export function moveItem(): Observable<any> {
  throw new Error('Not implemented.');
}

export function deleteItem(
  site: string,
  modelId: string,
  fieldId: string,
  targetIndex: number
): Observable<any> {
  return getDOM(site, modelId).pipe(
    switchMap((doc) => {

      const qs = {
        site,
        path: modelId,
        unlock: 'true',
        fileName: getInnerHtml(doc.querySelector('file-name'))
      };

      const fieldNode = doc.querySelector(`${fieldId}`);

      $(fieldNode).children().eq(targetIndex).remove();

      return post(
        writeContentUrl(qs),
        serialize(doc)
      );

    })
  );
}

export function getContentByContentType(site: string, contentType: string, options?: PaginationOptions): Observable<ContentInstance>;
export function getContentByContentType(site: string, contentTypes: string[], options?: PaginationOptions): Observable<ContentInstance>;
export function getContentByContentType(site: string, contentTypes: string[] | string, options?: PaginationOptions): Observable<ContentInstance> {
  if (typeof contentTypes === 'string') {
    contentTypes = [contentTypes];
  }
  return post(
    `/studio/api/2/search/search.json?siteId=${site}`,
    {
      filters: { 'content-type': contentTypes }
    }
  ).pipe(
    map<any, ContentInstance>(({ response: { result: { items } } }) => items.map((item) => ({
      craftercms: {
        id: null,
        path: item.path,
        label: item.name,
        locale: null,
        dateCreated: null,
        dateModified: item.lastModified,
        contentType: null
      }
      // ...Search doesn't return all content props. Need to fetch separately 😞.
    })))
  );
}

export function reformatDocument(site: string, id: string) {
  return getDOM(site, id).pipe(
    switchMap((doc) => post(
      writeContentUrl({
        site,
        path: id,
        unlock: 'true',
        fileName: getInnerHtml(doc.querySelector('file-name'))
      }),
      serialize(doc)
    ))
  );
}

interface LegacyContentDocumentProps {
  'content-type': string;
  'display-template': string;
  'internal-name': string;
  'file-name': string;
  'merge-strategy': string;
  'createdDate_dt': string;
  'lastModifiedDate_dt': string;
  'objectId': string;
  'locale': string;
  'placeInNav'?: 'true' | 'false';
}

interface AnyObject {
  [key: string]: any;
}

// TypeScript: Typing object with arbitrary properties - The "Property does not exist on type object" issue
// function mergeContentDocumentProps<T = typeof object>(type: string, data: T): LegacyContentDocumentProps {
// function mergeContentDocumentProps2<T = any>(type: string, data: T): LegacyContentDocumentProps {
//   data.dateCreated;
//   return null;
// }

function mergeContentDocumentProps(type: string, data: AnyObject): LegacyContentDocumentProps {
// Dasherized props...
// content-type, display-template, no-template-required, internal-name, file-name
// merge-strategy, folder-name, parent-descriptor
  const now = (data.lastModifiedDate_dt && data.createdDate_dt) ? null : new Date().toISOString();
  const dateCreated = data.createdDate_dt ? data.createdDate_dt : now;
  const dateModified = data.lastModifiedDate_dt ? data.lastModifiedDate_dt : now;
  return Object.assign({
    'content-type': '',
    'display-template': '',
    'internal-name': '',
    'file-name': '',
    'merge-strategy': 'inherit-levels',
    'createdDate_dt': dateCreated,
    'lastModifiedDate_dt': dateModified,
    'objectId': '',
    'locale': 'en'
  }, (type === 'page' ? {
    'placeInNav': 'false'
  } : {}), (data || {}));
}

// function createContentDocument(type: string, data: object): XMLDocument {
//
//   const tags = mergeContentDocumentProps(type, data);
//
//   const doc = fromString(
//     `<?xml version='1.0' encoding='UTF-8' ?>` +
//     `<${type} version="1.1"/>`
//   );
//
//   createElements(doc, doc.documentElement, tags);
//
//   return doc;
//
// }

export function fetchPublishingChannels(site: string) {
  return get(`/studio/api/1/services/api/1/deployment/get-available-publishing-channels.json?site=${site}`)
}

export default {
  getContent,
  getDOM,
  fetchPublishingChannels
}
