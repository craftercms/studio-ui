/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { catchApi1Error, get, getText, post, postJSON } from '../utils/ajax';
import { map, pluck, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { createElements, fromString, getInnerHtml, serialize, wrapElementInAuxDocument } from '../utils/xml';
import {
  ContentType,
  ContentTypeField,
  LegacyContentTypeDescriptorCamelized,
  LegacyFormDefinition,
  LegacyFormDefinitionField,
  LegacyFormDefinitionProperty,
  LegacyFormDefinitionSection
} from '../models/ContentType';
import { camelizeProps, nnou, nou, pluckProps, reversePluckProps } from '../utils/object';
import { LookupTable } from '../models/LookupTable';
import $ from 'jquery/dist/jquery.slim';
import {
  camelize,
  dataUriToBlob,
  decodeHTML,
  isBlank,
  objectIdFromPath,
  popPiece,
  removeLastPiece
} from '../utils/string';
import ContentInstance from '../models/ContentInstance';
import { AjaxResponse } from 'rxjs/ajax';
import { ComponentsContentTypeParams, ContentInstancePage } from '../models/Search';
import Core from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import { getRequestForgeryToken } from '../utils/auth';

export function getComponentInstanceHTML(path: string): Observable<string> {
  return getText(`/crafter-controller/component.html?path=${path}`).pipe(
    pluck('response')
  );
}

export function getContent(site: string, path: string): Observable<string> {
  return get(`/studio/api/1/services/api/1/content/get-content.json?site_id=${site}&path=${path}`).pipe(
    pluck('response', 'content')
  );
}

export function getItem(site: string, path: string): Observable<any> {
  return get(`/studio/api/1/services/api/1/content/get-item.json?site_id=${site}&path=${path}`).pipe(
    pluck('response', 'item'),
    catchApi1Error
  );
}

export function getDOM(site: string, path: string): Observable<XMLDocument> {
  return getContent(site, path).pipe(map(fromString));
}

export function getContentInstanceLookup(site: string, path: string, contentTypesLookup: LookupTable<ContentType>): Observable<LookupTable<ContentInstance>> {
  return getDOM(site, path).pipe(
    map(doc => parseContentXML(doc, path, contentTypesLookup, {}))
  );
}

function parseElementByContentType(element: Element, field: ContentTypeField, contentTypesLookup: LookupTable<ContentType>, instanceLookup: LookupTable<ContentInstance>) {
  const type = field ? field.type : null;
  switch (type) {
    case 'repeat': {
      const array = [];
      element.querySelectorAll(':scope > item').forEach((item) => {
        const repeatItem = {};
        item.querySelectorAll(':scope > *').forEach((fieldTag) => {
          let fieldTagName = fieldTag.tagName;
          repeatItem[fieldTagName] = parseElementByContentType(fieldTag, field.fields[fieldTagName], contentTypesLookup, instanceLookup);
        });
        array.push(repeatItem);
      });
      return array;
    }
    case 'node-selector': {
      const array = [];
      element.querySelectorAll(':scope > item').forEach((item) => {
        const key = getInnerHtml(item.querySelector('key'));
        const component = item.querySelector('component');
        parseContentXML(component ? wrapElementInAuxDocument(component) : null, key, contentTypesLookup, instanceLookup);
        array.push(objectIdFromPath(key));
      });
      return array;
    }

    case 'html':
      return decodeHTML(getInnerHtml(element));
    default:
      return getInnerHtml(element);
  }
}

function parseContentXML(doc: XMLDocument, path: string = null, contentTypesLookup: LookupTable<ContentType>, instanceLookup: LookupTable<ContentInstance>): LookupTable<ContentInstance> {

  const id = nnou(doc) ? getInnerHtml(doc.querySelector('objectId')) : objectIdFromPath(path);
  const contentType = nnou(doc) ? getInnerHtml(doc.querySelector('content-type')) : null;
  instanceLookup[id] = {
    craftercms: {
      id,
      path,
      label: nnou(doc) ? getInnerHtml(doc.querySelector('internal-name')) : null,
      locale: null,
      dateCreated: nnou(doc) ? getInnerHtml(doc.querySelector('createdDate_dt')) : null,
      dateModified: nnou(doc) ? getInnerHtml(doc.querySelector('lastModifiedDate_dt')) : null,
      contentType
    }
  };
  if (nnou(doc)) {
    Array.from(doc.documentElement.children).forEach((element: Element) => {
      if (!systemPropsList.includes(element.tagName)) {
        instanceLookup[id][element.tagName] = parseElementByContentType(element, contentTypesLookup[contentType].fields[element.tagName], contentTypesLookup, instanceLookup);
      }
    });
  }

  return instanceLookup;
}

const systemPropsList = [
  'content-type',
  'display-template',
  'no-template-required',
  'merge-strategy',
  'objectGroupId',
  'objectId',
  'file-name',
  'folder-name',
  'internal-name',
  'disabled',
  'createdDate',
  'createdDate_dt',
  'lastModifiedDate',
  'lastModifiedDate_dt'
];

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
          data[key] = value.item.map((item) => item.component?.id || item);
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
  return (`/studio/api/1/services/api/1/site/get-configuration.json?site=editorial&path=/content-types${type}/${document}`);
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

      const fieldId = [
        'file-name',
        'internal-name'
      ].includes(legacyField.id) ? camelize(legacyField.id) : legacyField.id;

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
              contentTypes: nou(map.contentTypes) ? [] : map.contentTypes.value.split(',')
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
          contentTypes: nou(map.contentTypes) ? [] : map.contentTypes.value.split(',')
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

export function updateField(
  site: string,
  modelId: string,
  fieldId: string,
  indexToUpdate: number,
  parentModelId: string = null,
  value: any
): Observable<any> {
  return performMutation(
    site,
    modelId,
    parentModelId,
    doc => {
      let node = extractNode(doc, removeLastPiece(fieldId) || fieldId, indexToUpdate);

      if (fieldId.includes('.')) {
        // node is <item/> inside collection
        const fieldToUpdate = popPiece(fieldId);
        let fieldNode = node.querySelector(`:scope > ${fieldToUpdate}`);
        if (nou(fieldNode)) {
          fieldNode = doc.createElement(fieldToUpdate);
          node.appendChild(fieldNode);
        }
        node = fieldNode;
      } else if (!node) {
        // node is <fieldId/> inside the doc
        node = doc.createElement(fieldId);
        doc.documentElement.appendChild(node);
      }
      node.innerHTML = `<![CDATA[${value}]]>`;
    }
  );
}

function performMutation(
  site: string,
  modelId: string,
  parentModelId: string = null,
  mutation: (doc: XMLDocument) => void
): Observable<any> {
  const isEmbeddedTarget = nnou(parentModelId);
  return getDOM(site, isEmbeddedTarget ? parentModelId : modelId).pipe(
    switchMap((doc) => {

      const qs = {
        site,
        path: isEmbeddedTarget ? parentModelId : modelId,
        unlock: 'true',
        fileName: getInnerHtml(doc.querySelector('file-name'))
      };

      if (isEmbeddedTarget) {
        const component = doc.querySelector(`[id="${modelId}"]`);
        const auxiliaryDocument = wrapElementInAuxDocument(component);
        mutation(auxiliaryDocument);
        updateModifiedDateElement(auxiliaryDocument);
        component.replaceWith(auxiliaryDocument.documentElement);
      } else {
        mutation(doc);
      }

      updateModifiedDateElement(doc);

      return post(
        writeContentUrl(qs),
        serialize(doc)
      );

    })
  );
}

export function insertComponent(
  site: string,
  modelId: string,
  fieldId: string,
  targetIndex: string | number,
  contentType: ContentType,
  instance: ContentInstance,
  parentModelId: string = null,
  shared = false
): Observable<any> {
  return performMutation(
    site,
    modelId,
    parentModelId,
    doc => {

      const id = instance.craftercms.id;
      const path = shared ? getComponentPath(id, instance.craftercms.contentType) : null;

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

      insertCollectionItem(doc, fieldId, targetIndex, newItem);

    }
  );
}

export function insertInstance(
  site: string,
  modelId: string,
  fieldId: string,
  targetIndex: string | number,
  instance: ContentInstance,
  parentModelId: string = null
): Observable<any> {
  return performMutation(
    site,
    modelId,
    parentModelId,
    doc => {

      const path = getComponentPath(instance.craftercms.id, instance.craftercms.contentType);

      const newItem = doc.createElement('item');

      createElements(doc, newItem, {
        '@attributes': {
          // TODO: Hardcoded value. Fix.
          datasource: 'sharedFeatures'
        },
        key: path,
        value: instance.craftercms.label,
        include: path,
        disableFlattening: 'false'
      });

      insertCollectionItem(doc, fieldId, targetIndex, newItem);

    }
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

      updateModifiedDateElement(doc);

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

export function moveItem(
  site: string,
  originalModelId: string,
  originalFieldId: string,
  originalIndex: number,
  targetModelId: string,
  targetFieldId: string,
  targetIndex: number,
  originalParentModelId: string = null,
  targetParentModelId: string = null
): Observable<any> {
  // TODO Warning: cannot perform as transaction whilst the UI is the one to do all this.
  // const isOriginalEmbedded = nnou(originalParentModelId);
  // const isTargetEmbedded = nnou(targetParentModelId);
  if (
    (originalModelId === targetModelId) ||
    (originalParentModelId === targetParentModelId)
  ) {
    if ((originalParentModelId === targetParentModelId) && nnou(originalParentModelId)) {
      debugger;
    }
    // Moving items between two fields of the same model...
    return performMutation(
      site,
      originalModelId,
      originalParentModelId,
      (doc) => {

        const item = extractNode(doc, originalFieldId, originalIndex);
        const targetField = extractNode(doc, targetFieldId, removeLastPiece(`${targetIndex}`));
        const targetFieldItems = targetField.querySelectorAll(':scope > item');

        const parsedTargetIndex = parseInt(popPiece(`${targetIndex}`));
        if (targetFieldItems.length === parsedTargetIndex) {
          targetField.appendChild(item);
        } else {
          targetField.insertBefore(item, targetFieldItems[parsedTargetIndex]);
        }

      }
    );
  } else {
    let removedItemHTML: string;
    return performMutation(
      site,
      originalModelId,
      originalParentModelId,
      (doc) => {

        const item: Element = extractNode(doc, originalFieldId, originalIndex);
        const field: Element = extractNode(
          doc,
          originalFieldId,
          removeLastPiece(`${originalIndex}`)
        );

        removedItemHTML = item.outerHTML;
        field.removeChild(item);

      }
    ).pipe(
      switchMap(() =>
        performMutation(
          site,
          targetModelId,
          targetParentModelId,
          (doc) => {

            const item: Element = extractNode(doc, targetFieldId, targetIndex);
            const field: Element = extractNode(
              doc,
              targetFieldId,
              removeLastPiece(`${targetIndex}`)
            );

            const auxElement = doc.createElement('hold');
            auxElement.innerHTML = removedItemHTML;

            field.insertBefore(auxElement.querySelector(':scope > item'), item);

          }
        )
      )
    );
  }
}

export function deleteItem(
  site: string,
  modelId: string,
  fieldId: string,
  indexToDelete: number | string,
  parentModelId: string = null
): Observable<any> {
  return performMutation(
    site,
    modelId,
    parentModelId,
    doc => {

      let index = indexToDelete;
      let fieldNode = doc.querySelector(`:scope > ${fieldId}`);

      if (typeof indexToDelete === 'string') {
        index = parseInt(popPiece(indexToDelete));
        // A fieldId can be in the form of `a.b`, which translates to `a > item > b` on the XML.
        // In terms of index, since all it should ever arrive here is collection items,
        // this assumes the index path points to the item itself, not the collection.
        // By calling removeLastPiece(indexToDelete), we should get the collection node here.
        fieldNode = extractNode(doc, fieldId, removeLastPiece(`${indexToDelete}`));
      }

      $(fieldNode).children().eq(index as number).remove();

    }
  );
}

export function getContentByContentType(site: string, contentType: string, contentTypesLookup: LookupTable<ContentType>, options?: ComponentsContentTypeParams): Observable<ContentInstancePage>;
export function getContentByContentType(site: string, contentTypes: string[], contentTypesLookup: LookupTable<ContentType>, options?: ComponentsContentTypeParams): Observable<ContentInstancePage>;
export function getContentByContentType(site: string, contentTypes: string[] | string, contentTypesLookup: LookupTable<ContentType>, options?: ComponentsContentTypeParams): Observable<ContentInstancePage> {
  if (typeof contentTypes === 'string') {
    contentTypes = [contentTypes];
  }
  return postJSON(
    `/studio/api/2/search/search.json?siteId=${site}`,
    {
      ...reversePluckProps(options, 'type'),
      filters: { 'content-type': contentTypes }
    }
  ).pipe(
    map<AjaxResponse, { count: number, paths: string[] }>(({ response }) => ({
      count: response.result.total,
      paths: response.result.items.filter((item) => item.type === options.type).map((item) => item.path)
    })),
    switchMap(({ paths, count }) => zip(
      of(count),
      paths.length ? forkJoin(
        paths.reduce((array, path) => {
          array.push(getContentInstanceLookup(site, path, contentTypesLookup));
          return array;
        }, []) as Array<Observable<LookupTable<ContentInstance>>>
      ) : of([])
    )),
    map(([count, array]) => ({
      count,
      lookup: array.reduce((hash, lookupTable) => Object.assign(hash, lookupTable), {})
    }))
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

function extractNode(doc: XMLDocument, fieldId: string, index: string | number) {
  const indexes = (
    (index === '' || nou(index))
      ? []
      : `${index}`.split('.').map(i => parseInt(i, 10))
  );
  let aux: any = doc.documentElement;
  if (nou(index) || isBlank(`${index}`)) {
    return aux.querySelector(`:scope > ${fieldId}`);
  }
  const fields = fieldId.split('.');
  if (indexes.length > fields.length) {
    // There's more indexes than fields
    throw new Error(
      '[content/extractNode] Path not handled: indexes.length > fields.length. Indexes ' +
      `is ${indexes} and fields is ${fields}`
    );
  }
  indexes.forEach((_index, i) => {
    const field = fields[i];
    aux = aux.querySelectorAll(`:scope > ${field} > item`)[_index];
  });
  if (indexes.length === fields.length) {
    return aux;
  } else if (indexes.length < fields.length) {
    // There's one more field to use as there were less indexes
    // than there were fields. For example: fieldId: `items_o.content_o`, index: 0
    // At this point, aux would be `items_o[0]` and we need to extract `content_o`
    const field = fields[fields.length - 1];
    return aux.querySelector(`:scope > ${field}`);
  }
}

function mergeContentDocumentProps(type: string, data: AnyObject): LegacyContentDocumentProps {
// Dasherized props...
// content-type, display-template, no-template-required, internal-name, file-name
// merge-strategy, folder-name, parent-descriptor
  const now = (data.lastModifiedDate_dt && data.createdDate_dt) ? null : createModifiedDate();
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

function createModifiedDate() {
  return new Date().toISOString();
}

function updateModifiedDateElement(doc: XMLDocument) {
  doc.querySelector(':scope > lastModifiedDate_dt').innerHTML = createModifiedDate();
}

function getComponentPath(id: string, contentType: string) {
  const pathBase = `/site/components/${contentType.replace('/component/', '')}s/`.replace(/\/{1,}$/m, '');
  return `${pathBase}/${id}.xml`;
}

function insertCollectionItem(doc: XMLDocument, fieldId: string, targetIndex: string | number, newItem: Node): void {
  let fieldNode = extractNode(doc, fieldId, removeLastPiece(`${targetIndex}`));
  let index = (typeof targetIndex === 'string') ? parseInt(popPiece(targetIndex)) : targetIndex;

  if (nou(fieldNode)) {
    fieldNode = doc.createElement(fieldId);
    fieldNode.setAttribute('item-list', 'true');
    doc.documentElement.appendChild(fieldNode);
  }

  const itemList = fieldNode.querySelectorAll(`:scope > item`);

  if (itemList.length === index) {
    fieldNode.appendChild(newItem);
  } else {
    $(newItem).insertBefore(itemList[index]);
  }
}

export function fetchPublishingChannels(site: string) {
  return get(`/studio/api/1/services/api/1/deployment/get-available-publishing-channels.json?site=${site}`);
}

export function uploadDataUrl(
  site: string,
  file: any,
  path: string,
  XSRF_CONFIG_ARGUMENT: string
): Observable<any> {
  return new Observable((subscriber) => {
    const uppy = Core({ autoProceed: true });
    const uploadAssetUrl = `/studio/asset-upload?${XSRF_CONFIG_ARGUMENT}=${getRequestForgeryToken()}`;
    uppy.use(XHRUpload, { endpoint: uploadAssetUrl });
    uppy.setMeta({ site, path });

    const blob = dataUriToBlob(file.dataUrl);

    uppy.on('upload-success', () => {
      subscriber.complete();
    });

    uppy.on('upload-progress', (file, progress) => {
      let type = 'progress';
      if (progress.bytesUploaded === progress.bytesTotal) {
        type = 'complete';
      }
      subscriber.next({
        type,
        payload: {
          file,
          progress
        }
      });
    });

    uppy.on('upload-error', (file, error) => {
      subscriber.error(error);
    });

    uppy.addFile({
      name: file.name,
      type: file.type,
      data: blob
    });
  });
}

export function getBulkUploadUrl(site: string, path: string): string {
  return `/studio/api/1/services/api/1/content/write-content.json?site=${site}&path=${path}&contentType=folder&createFolders=true&draft=false&duplicate=false&unlock=true&_csrf=${getRequestForgeryToken()}`
}

export function getQuickCreateContentList(siteId: string) {
  return get(`/studio/api/2/content/list_quick_create_content.json?siteId=${siteId}`).pipe(
    pluck('response')
  )
}

export function deleteItems(siteId: string, user: string, submissionComment: string, data: AnyObject): Observable<any> {
  return postJSON(
    `/studio/api/1/services/api/1/workflow/go-delete.json?site=${siteId}&user=${user}&submissionComment=${submissionComment}`,
    data
  ).pipe(
    pluck('response'),
    catchApi1Error
  );
}

export default {
  getComponentInstanceHTML,
  getContent,
  getItem,
  getDOM,
  getContentInstanceLookup,
  fetchContentTypes,
  fetchById,
  updateField,
  insertComponent,
  insertInstance,
  insertItem,
  sortItem,
  moveItem,
  deleteItem,
  getContentByContentType,
  fetchPublishingChannels,
  uploadDataUrl,
  getBulkUploadUrl,
  getQuickCreateContentList
};
