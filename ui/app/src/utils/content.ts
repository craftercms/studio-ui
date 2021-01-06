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

import { BaseItem, DetailedItem, LegacyItem, SandboxItem } from '../models/Item';
import { getStateMapFromLegacyItem } from './state';
import { nnou, reversePluckProps } from './object';
import { ContentType, ContentTypeField } from '../models/ContentType';
import { LookupTable } from '../models/LookupTable';
import ContentInstance from '../models/ContentInstance';
import { deserialize, getInnerHtml, getInnerHtmlNumber, wrapElementInAuxDocument } from './xml';
import { fileNameFromPath, unescapeHTML } from './string';
import { getRootPath, isRootPath } from './path';
import { isFolder, isNavigable, isPreviewable } from '../components/Navigation/PathNavigator/utils';

export function isEditableAsset(path: string) {
  return (
    path.endsWith('.ftl') ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.groovy') ||
    path.endsWith('.txt') ||
    path.endsWith('.html') ||
    path.endsWith('.hbs') ||
    path.endsWith('.xml') ||
    path.endsWith('.tmpl') ||
    path.endsWith('.htm')
  );
}

export function isAsset(path: string): boolean {
  return (
    path.endsWith('.jpg') ||
    path.endsWith('.png') ||
    path.endsWith('.svg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.gif') ||
    path.endsWith('.pdf') ||
    path.endsWith('.doc') ||
    path.endsWith('.docx') ||
    path.endsWith('.xls') ||
    path.endsWith('.xlsx') ||
    path.endsWith('.ppt') ||
    path.endsWith('.pptx') ||
    path.endsWith('.mp4') ||
    path.endsWith('.avi') ||
    path.endsWith('.webm') ||
    path.endsWith('.mpg')
  );
}

export function isCode(path: string): boolean {
  return (
    path.endsWith('.ftl') ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.groovy') ||
    path.endsWith('.html') ||
    path.endsWith('.hbs') ||
    path.endsWith('.tmpl') ||
    path.endsWith('.htm')
  );
}

export function isImage(path: string): boolean {
  return (
    path.endsWith('.jpg') ||
    path.endsWith('.png') ||
    path.endsWith('.svg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.gif')
  );
}

export function getSystemTypeFromPath(path: string): string {
  const rootPath = getRootPath(path);
  if (rootPath.includes('/site/website')) {
    return 'page';
  } else if (rootPath.includes('/components')) {
    return 'taxonomy';
  } else if (rootPath.includes('/taxonomy')) {
    return 'component';
  } else if (rootPath.includes('/templates')) {
    return 'template';
  } else if (rootPath.includes('/static-assets')) {
    return 'asset';
  } else if (rootPath.includes('script')) {
    return 'script';
  } else if (rootPath.includes('config')) {
    return 'config';
  } else {
    return 'unknown';
  }
}

function getLegacyItemSystemType(item: LegacyItem) {
  switch (true) {
    case item.contentType === 'renderingTemplate': {
      return 'template';
    }
    case item.contentType === 'script': {
      return 'script';
    }
    case item.contentType === 'folder': {
      return 'folder';
    }
    case item.asset || item.isAsset: {
      return 'asset';
    }
    case item.component || item.isComponent: {
      return 'component';
    }
    case item.page || item.isPage: {
      return 'page';
    }
    case item.folder:
    case item.container || item.isContainer: {
      return 'folder';
    }
    case item.contentType === 'taxonomy': {
      return 'taxonomy';
    }
    default: {
      return null;
    }
  }
}

export function parseLegacyItemToBaseItem(item: LegacyItem): BaseItem {
  return {
    id: item.uri ?? item.path,
    label: item.internalName ?? item.name,
    contentTypeId: item.contentType,
    path: item.uri ?? item.path,
    // Assuming folders aren't navigable
    previewUrl: item.uri?.includes('index.xml') ? item.browserUri || '/' : null,
    systemType: getLegacyItemSystemType(item),
    mimeType: item.mimeType,
    state: null,
    stateMap: getStateMapFromLegacyItem(item),
    lockOwner: null,
    disabled: null,
    localeCode: 'en',
    translationSourceId: null
  };
}

export function parseLegacyItemToSandBoxItem(item: LegacyItem): SandboxItem;
export function parseLegacyItemToSandBoxItem(item: LegacyItem[]): SandboxItem[];
export function parseLegacyItemToSandBoxItem(item: LegacyItem | LegacyItem[]): SandboxItem | SandboxItem[] {
  if (Array.isArray(item)) {
    // If no internalName then skipping (e.g. level descriptors)
    return item.flatMap((i) => (i.internalName || i.name ? [parseLegacyItemToSandBoxItem(i)] : []));
  }

  return {
    ...parseLegacyItemToBaseItem(item),
    creator: null,
    createdDate: null,
    modifier: null,
    lastModifiedDate: null,
    commitId: null,
    sizeInBytes: null
  };
}

export function parseLegacyItemToDetailedItem(item: LegacyItem): DetailedItem;
export function parseLegacyItemToDetailedItem(item: LegacyItem[]): DetailedItem[];
export function parseLegacyItemToDetailedItem(item: LegacyItem | LegacyItem[]): DetailedItem | DetailedItem[] {
  if (Array.isArray(item)) {
    // If no internalName then skipping (e.g. level descriptors)
    return item.flatMap((i) => (i.internalName || i.name ? [parseLegacyItemToDetailedItem(i)] : []));
  }

  return {
    ...parseLegacyItemToBaseItem(item),
    sandbox: {
      creator: null,
      createdDate: null,
      modifier: null,
      lastModifiedDate: null,
      commitId: null,
      sizeInBytes: null
    },
    staging: null,
    live: {
      lastScheduledDate: item.scheduledDate,
      lastPublishedDate: item.publishedDate,
      publisher: item.user,
      commitId: null
    }
  };
}

export function parseSandBoxItemToDetailedItem(item: SandboxItem): DetailedItem;
export function parseSandBoxItemToDetailedItem(item: SandboxItem[]): DetailedItem[];
export function parseSandBoxItemToDetailedItem(item: SandboxItem | SandboxItem[]): DetailedItem | DetailedItem[] {
  if (Array.isArray(item)) {
    // including level descriptors to avoid issues on pathNavigator;
    return item.map((i) => parseSandBoxItemToDetailedItem(i));
  }
  return {
    sandbox: {
      creator: item.creator,
      createdDate: item.createdDate,
      modifier: item.modifier,
      lastModifiedDate: item.lastModifiedDate,
      commitId: item.commitId,
      sizeInBytes: item.sizeInBytes
    },
    staging: null,
    live: null,
    ...(reversePluckProps(
      item,
      'creator',
      'createdDate',
      'modifier',
      'lastModifiedDate',
      'commitId',
      'sizeInBytes'
    ) as BaseItem)
  };
}

const systemPropsList = [
  'orderDefault_f',
  'savedAsDraft',
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

export function parseContentXML(
  doc: Document,
  path: string = null,
  contentTypesLookup: LookupTable<ContentType>,
  instanceLookup: LookupTable<ContentInstance>
): ContentInstance {
  const id = nnou(doc) ? getInnerHtml(doc.querySelector(':scope > objectId')) : fileNameFromPath(path);
  const contentTypeId = nnou(doc) ? getInnerHtml(doc.querySelector(':scope > content-type')) : null;
  const current = {
    craftercms: {
      id,
      path,
      label: null,
      locale: null,
      dateCreated: null,
      dateModified: null,
      contentTypeId: contentTypeId,
      sourceMap: {}
    }
  };
  if (nnou(doc)) {
    current.craftercms.label = getInnerHtml(doc.querySelector(':scope > internal-name'));
    current.craftercms.dateCreated = getInnerHtml(doc.querySelector(':scope > createdDate_dt'));
    current.craftercms.dateModified = getInnerHtml(doc.querySelector(':scope > lastModifiedDate_dt'));
  }
  instanceLookup[id] = current;
  if (nnou(doc)) {
    Array.from(doc.documentElement.children).forEach((element: Element) => {
      const tagName = element.tagName;
      if (!systemPropsList.includes(tagName)) {
        let sourceContentTypeId;
        const source = element.getAttribute('crafter-source');
        if (source) {
          current.craftercms.sourceMap[tagName] = source;
          sourceContentTypeId = element.getAttribute('crafter-source-content-type-id');
          if (!sourceContentTypeId) {
            console.error(
              `[parseContentXML] No "crafter-source-content-type-id" attribute found together with "crafter-source".`
            );
          }
        }
        const field = contentTypesLookup[sourceContentTypeId ?? contentTypeId].fields[tagName];
        if (!field) {
          console.error(
            `[parseContentXML] Field "${tagName}" was not found on "${sourceContentTypeId ??
              contentTypeId}" content type. "${source ?? path}" may have stale/outdated content properties.`
          );
        }
        current[tagName] = parseElementByContentType(element, field, contentTypesLookup, instanceLookup);
      }
    });
  }
  return current;
}

function parseElementByContentType(
  element: Element,
  field: ContentTypeField,
  contentTypesLookup: LookupTable<ContentType>,
  instanceLookup: LookupTable<ContentInstance>
) {
  if (!field) {
    return getInnerHtml(element) ?? '';
  }
  const type = field.type;
  // Some of this parsing (e.g. converting to booleans & numbers) is great but
  // the delivery side APIs don't have this intelligence. Could this cause any issues?
  // In any case, in the future we should go rather by a data-type instead of id of
  // the control as, various controls may produce same data type and the list
  // needn't be updated when new controls are added with a sound list of data types.
  switch (type) {
    case 'repeat': {
      const array = [];
      element.querySelectorAll(':scope > item').forEach((item) => {
        const repeatItem = {};
        item.querySelectorAll(':scope > *').forEach((fieldTag) => {
          let fieldTagName = fieldTag.tagName;
          repeatItem[fieldTagName] = parseElementByContentType(
            fieldTag,
            field.fields[fieldTagName],
            contentTypesLookup,
            instanceLookup
          );
        });
        array.push(repeatItem);
      });
      return array;
    }
    case 'node-selector': {
      const array = [];
      element.querySelectorAll(':scope > item').forEach((item) => {
        let path = getInnerHtml(item.querySelector(':scope > include'));
        const component = item.querySelector(':scope > component');
        if (!path && !component) {
          // TODO: Groovy Controller Issue;
          path = getInnerHtml(item.querySelector(':scope > key'));
        }
        const instance = parseContentXML(
          component ? wrapElementInAuxDocument(component) : null,
          path,
          contentTypesLookup,
          instanceLookup
        );
        array.push(instance);
      });
      return array;
    }
    case 'html':
      return unescapeHTML(getInnerHtml(element));
    case 'checkbox-group': {
      const deserialized = deserialize(element);
      const extract = deserialized[element.tagName].item;
      return Array.isArray(extract) ? extract : [extract];
    }
    case 'text':
    case 'image':
    case 'textarea':
    case 'dropdown':
    case 'date-time':
      return getInnerHtml(element);
    case 'boolean':
    case 'page-nav-order':
      return getInnerHtml(element) === 'true';
    case 'numeric-input':
      return getInnerHtmlNumber(element, parseFloat);
    default:
      console.log(
        `[parseElementByContentType] Missing type "${type}" on switch statement for field "${field.id}".`,
        element
      );
      return getInnerHtml(element);
  }
}

// Code disabled temporarily
// noinspection DuplicatedCode
/* function parseContentXMLWithoutContentTypes(
  doc: XMLDocument,
  path: string = null,
  instanceLookup: LookupTable<ContentInstance> = {}
): LookupTable<ContentInstance> {
  const id = nnou(doc)
    ? getInnerHtml(doc.querySelector(':scope > objectId'))
    : fileNameFromPath(path);
  const contentType = nnou(doc) ? getInnerHtml(doc.querySelector(':scope > content-type')) : null;
  instanceLookup[id] = {
    craftercms: {
      id,
      path,
      label: nnou(doc) ? getInnerHtml(doc.querySelector(':scope > internal-name')) : null,
      locale: null,
      dateCreated: nnou(doc) ? getInnerHtml(doc.querySelector(':scope > createdDate_dt')) : null,
      dateModified: nnou(doc)
        ? getInnerHtml(doc.querySelector(':scope > lastModifiedDate_dt'))
        : null,
      contentTypeId: contentType
    }
  };
  if (nnou(doc)) {
    parseContentXMLWithoutContentTypes_processFields(
      doc.documentElement,
      instanceLookup[id],
      instanceLookup
    );
  }
  return instanceLookup;
}

function parseContentXMLWithoutContentTypes_processFields(
  element: Element,
  instance: LookupTable<any>,
  instanceLookup: LookupTable<ContentInstance>
): void {
  Array.from(element.children).forEach((elem: Element) => {
    const fieldId = elem.tagName;
    if (!systemPropsList.includes(fieldId)) {
      if (fieldId.endsWith('_o')) {
        const parentId = getInnerHtml(element.querySelector('objectId'));
        const isNodeSelector =
          Boolean(elem.querySelector(':scope > item > component')) ||
          Boolean(
            elem.querySelector(':scope > item > key') &&
              elem.querySelector(':scope > item > value') &&
              elem.querySelector(':scope > item > include')
          );
        if (isNodeSelector) {
          // component
          instanceLookup[parentId][fieldId] = Array.from(
            elem.querySelectorAll(':scope > item')
          ).map((item) => {
            const component = item.querySelector(':scope > component');
            const isEmbedded = Boolean(component);
            return {
              craftercms: {
                id: isEmbedded ? getInnerHtml(component.querySelector(':scope > objectId')) : null,
                path: isEmbedded ? null : getInnerHtml(item.querySelector(':scope > include')),
                dateCreated: isEmbedded
                  ? getInnerHtml(component.querySelector(':scope > createdDate_dt'))
                  : null,
                dateModified: isEmbedded
                  ? getInnerHtml(component.querySelector(':scope > lastModifiedDate_dt'))
                  : null,
                contentTypeId: isEmbedded
                  ? getInnerHtml(component.querySelector(':scope > content-type'))
                  : null,
                label: isEmbedded
                  ? getInnerHtml(component.querySelector(':scope > internal-name'))
                  : getInnerHtml(item.querySelector(':scope > value')),
                locale: null
              }
            };
          });
        } else {
          // repeat group
          instanceLookup[parentId][fieldId] = Array.from(
            elem.querySelectorAll(':scope > item')
          ).map((item) => {
            const groupItem = {};
            parseContentXMLWithoutContentTypes_processFields(item, groupItem, instanceLookup);
            return groupItem;
          });
        }
      } else {
        instance[fieldId] = getInnerHtml(elem);
      }
    }
  });
} */

export function createChildModelIdList(model: ContentInstance, contentTypes: LookupTable<ContentType>): string[] {
  const children = [];
  const processFields = (model: ContentInstance, fields: ContentTypeField[], children: string[]) =>
    fields.forEach((field) => {
      // Check the field in the model isn't null in case the field isn't required and isn't present on current model.
      if (model[field.id]) {
        if (field.type === 'node-selector') {
          model[field.id].forEach((mdl: ContentInstance) => children.push(mdl.craftercms.id));
        } else if (field.type === 'repeat') {
          model[field.id].forEach((mdl: ContentInstance) => {
            processFields(mdl, Object.values(field.fields), children);
          });
        }
      }
    });
  if (contentTypes[model.craftercms.contentTypeId]) {
    processFields(model, Object.values(contentTypes[model.craftercms.contentTypeId].fields), children);
  }
  return children;
}

export function createChildModelLookup(
  models: LookupTable<ContentInstance>,
  contentTypes: LookupTable<ContentType>
): LookupTable<string[]> {
  const lookup = {};
  Object.values(models).forEach((model) => {
    lookup[model.craftercms.id] = createChildModelIdList(model, contentTypes);
  });
  return lookup;
}

export function normalizeModelsLookup(models: LookupTable<ContentInstance>) {
  const lookup = {};
  Object.entries(models).forEach(([id, model]) => {
    lookup[id] = normalizeModel(model);
  });
  return lookup;
}

export function normalizeModel(model: ContentInstance): ContentInstance {
  const normalized = { ...model };
  Object.entries(model).forEach(([prop, value]) => {
    if (prop.endsWith('_o')) {
      const collection: ContentInstance[] = value;
      if (collection.length) {
        const isNodeSelector = Boolean(collection[0]?.craftercms?.id);
        if (isNodeSelector) {
          normalized[prop] = collection.map((item) => item.craftercms.id);
        } else {
          normalized[prop] = collection.map((item) => normalizeModel(item));
        }
      }
    }
  });
  return normalized;
}

export function denormalizeModel(
  normalized: ContentInstance,
  modelLookup: LookupTable<ContentInstance>
): ContentInstance {
  const model = { ...normalized };
  Object.entries(model).forEach(([prop, value]) => {
    if (prop.endsWith('_o')) {
      const collection: any[] = value;
      if (collection.length) {
        const isNodeSelector = typeof collection[0] === 'string';
        if (isNodeSelector) {
          model[prop] = collection.map((item) => denormalizeModel(modelLookup[item], modelLookup));
        } else {
          model[prop] = collection.map((item) => denormalizeModel(item, modelLookup));
        }
      }
    }
  });
  return model;
}

export function getNumOfMenuOptionsForItem(item: DetailedItem): number {
  if (isNavigable(item)) {
    return isRootPath(item.path) ? 11 : 16;
  } else if (isFolder(item)) {
    return isRootPath(item.path) ? 3 : 6;
  } else if (isPreviewable(item)) {
    return 10;
  }
}
