/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { del, errorSelectorApi1, get, getGlobalHeaders, getText, post, postJSON } from '../utils/ajax';
import { catchError, map, mapTo, pluck, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { createElements, fromString, getInnerHtml, serialize, wrapElementInAuxDocument } from '../utils/xml';
import { ContentType } from '../models/ContentType';
import { createLookupTable, nnou, nou, reversePluckProps, toQueryString } from '../utils/object';
import { LookupTable } from '../models/LookupTable';
import $ from 'jquery/dist/jquery.slim';
import { dataUriToBlob, isBlank, popPiece, removeLastPiece } from '../utils/string';
import ContentInstance from '../models/ContentInstance';
import { AjaxResponse } from 'rxjs/ajax';
import { ComponentsContentTypeParams, ContentInstancePage } from '../models/Search';
import Core from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import { getRequestForgeryToken } from '../utils/auth';
import { DetailedItem, LegacyItem, SandboxItem } from '../models/Item';
import { VersionsResponse } from '../models/Version';
import { GetChildrenResponse } from '../models/GetChildrenResponse';
import { GetChildrenOptions } from '../models/GetChildrenOptions';
import { parseContentXML, parseLegacyItemToDetailedItem, parseLegacyItemToSandBoxItem } from '../utils/content';
import QuickCreateItem from '../models/content/QuickCreateItem';
import ApiResponse from '../models/ApiResponse';
import { fetchContentTypes } from './contentTypes';
import { Clipboard } from '../models/GlobalState';
import { getPasteItemFromPath } from '../utils/path';
import { StandardAction } from '../models/StandardAction';

export function getComponentInstanceHTML(path: string): Observable<string> {
  return getText(`/crafter-controller/component.html?path=${path}`).pipe(pluck('response'));
}

interface GetContentOptions {
  lock: boolean;
}

export function getContentXML(site: string, path: string, options?: Partial<GetContentOptions>): Observable<string> {
  options = Object.assign({ lock: false }, options);
  const qs = toQueryString({ site_id: site, path, edit: options.lock });
  return get(`/studio/api/1/services/api/1/content/get-content.json${qs}`).pipe(pluck('response', 'content'));
}

export function getContentDOM(site: string, path: string): Observable<XMLDocument> {
  return getContentXML(site, path).pipe(map(fromString));
}

interface GetDescriptorOptions {
  flatten: boolean;
}

export function getDescriptorXML(
  site: string,
  path: string,
  options?: Partial<GetDescriptorOptions>
): Observable<string> {
  const qs = toQueryString({ siteId: site, path, flatten: true, ...options });
  return get(`/studio/api/2/content/descriptor${qs}`).pipe(pluck('response', 'xml'));
}

export function getDescriptorDOM(
  site: string,
  path: string,
  options?: Partial<GetDescriptorOptions>
): Observable<XMLDocument> {
  return getDescriptorXML(site, path, options).pipe(map(fromString));
}

export function getSandboxItem(site: string, path: string): Observable<SandboxItem> {
  return getLegacyItem(site, path).pipe(map<LegacyItem, SandboxItem>(parseLegacyItemToSandBoxItem));
}

export function getDetailedItem(site: string, path: string): Observable<DetailedItem> {
  return getLegacyItem(site, path).pipe(map<LegacyItem, DetailedItem>(parseLegacyItemToDetailedItem));
}

export function getContentInstanceLookup(
  site: string,
  path: string,
  contentTypesLookup: LookupTable<ContentType>
): Observable<LookupTable<ContentInstance>> {
  return getContentDOM(site, path).pipe(
    map((doc) => {
      const lookup = {};
      parseContentXML(doc, path, contentTypesLookup, lookup);
      return lookup;
    })
  );
}

export function getContentInstance(
  site: string,
  path: string,
  contentTypesLookup: LookupTable<ContentType>
): Observable<ContentInstance> {
  return getContentDOM(site, path).pipe(map((doc) => parseContentXML(doc, path, contentTypesLookup, {})));
}

export function getContentInstanceDescriptor(
  site: string,
  path: string,
  options?: Partial<GetDescriptorOptions>,
  contentTypeLookup?: LookupTable<ContentType>
): Observable<{ model: ContentInstance; modelLookup: LookupTable<ContentInstance> }> {
  return (contentTypeLookup
    ? of(contentTypeLookup)
    : fetchContentTypes(site).pipe(map((contentTypes) => createLookupTable(contentTypes)))
  ).pipe(
    switchMap((contentTypeLookup) =>
      getDescriptorDOM(site, path, options).pipe(
        map((doc) => {
          const modelLookup = {};
          const model = parseContentXML(doc, path, contentTypeLookup, modelLookup);
          return { model, modelLookup };
        })
      )
    )
  );
}

function writeContentUrl(qs: object): string {
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
  return performMutation(site, modelId, parentModelId, (doc) => {
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
  });
}

function performMutation(
  site: string,
  modelId: string,
  parentModelId: string = null,
  mutation: (doc: XMLDocument) => void
): Observable<any> {
  const isEmbeddedTarget = nnou(parentModelId);
  return getContentDOM(site, isEmbeddedTarget ? parentModelId : modelId).pipe(
    switchMap((doc) => {
      const qs = {
        site,
        path: isEmbeddedTarget ? parentModelId : modelId,
        unlock: 'true',
        fileName: getInnerHtml(doc.querySelector(':scope > file-name'))
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

      return post(writeContentUrl(qs), serialize(doc)).pipe(mapTo({ updatedDocument: doc }));
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
  return performMutation(site, modelId, parentModelId, (doc) => {
    const id = instance.craftercms.id;
    const path = shared ? instance.craftercms.path ?? getComponentPath(id, instance.craftercms.contentTypeId) : null;

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
      objectId: id,
      locale: instance.craftercms.locale,
      ...reversePluckProps(instance, 'craftercms')
    });

    // Add the child elements into the `item` node
    createElements(doc, newItem, {
      '@attributes': {
        // TODO: Hardcoded value. Fix.
        datasource: 'TODO',
        ...(shared ? {} : { inline: true })
      },
      key: shared ? path : id,
      value: instance.craftercms.label,
      ...(shared
        ? {
            include: path,
            disableFlattening: 'false'
          }
        : {
            component
          })
    });

    insertCollectionItem(doc, fieldId, targetIndex, newItem);
  });
}

export function insertInstance(
  site: string,
  modelId: string,
  fieldId: string,
  targetIndex: string | number,
  instance: ContentInstance,
  parentModelId: string = null
): Observable<any> {
  return performMutation(site, modelId, parentModelId, (doc) => {
    const path = instance.craftercms.path;

    const newItem = doc.createElement('item');

    createElements(doc, newItem, {
      '@attributes': {
        // TODO: Hardcoded value. Fix.
        datasource: 'TODO'
      },
      key: path,
      value: instance.craftercms.label,
      include: path,
      disableFlattening: 'false'
    });

    insertCollectionItem(doc, fieldId, targetIndex, newItem);
  });
}

export function insertItem() {}

export function sortItem(
  site: string,
  modelId: string,
  fieldId: string,
  currentIndex: number,
  targetIndex: number,
  parentModelId: string = null
): Observable<any> {
  return performMutation(site, modelId, parentModelId, (doc) => {
    const item = extractNode(doc, fieldId, currentIndex);
    insertCollectionItem(doc, fieldId, targetIndex, item, currentIndex);
  });
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
  // When Moving between inherited dropzone to other dropzone, the modelsIds will be different but in some cases the parentId will be null for both targets
  // in that case we need to add a nnou validation to parentsModelId;
  if (
    originalModelId === targetModelId ||
    (nnou(originalParentModelId) && nnou(targetParentModelId) && originalParentModelId === targetParentModelId)
  ) {
    // Moving items between two fields of the same model...
    return performMutation(site, originalModelId, originalParentModelId, (doc) => {
      const item = extractNode(doc, originalFieldId, originalIndex);
      const targetField = extractNode(doc, targetFieldId, removeLastPiece(`${targetIndex}`));
      const targetFieldItems = targetField.querySelectorAll(':scope > item');

      const parsedTargetIndex = parseInt(popPiece(`${targetIndex}`));
      if (targetFieldItems.length === parsedTargetIndex) {
        targetField.appendChild(item);
      } else {
        targetField.insertBefore(item, targetFieldItems[parsedTargetIndex]);
      }
    });
  } else {
    let removedItemHTML: string;
    return performMutation(site, originalModelId, originalParentModelId, (doc) => {
      const item: Element = extractNode(doc, originalFieldId, originalIndex);
      const field: Element = extractNode(doc, originalFieldId, removeLastPiece(`${originalIndex}`));

      removedItemHTML = item.outerHTML;
      field.removeChild(item);
    }).pipe(
      switchMap(() =>
        performMutation(site, targetModelId, targetParentModelId, (doc) => {
          const item: Element = extractNode(doc, targetFieldId, targetIndex);
          const field: Element = extractNode(doc, targetFieldId, removeLastPiece(`${targetIndex}`));

          const auxElement = doc.createElement('hold');
          auxElement.innerHTML = removedItemHTML;

          field.insertBefore(auxElement.querySelector(':scope > item'), item);
        })
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
  return performMutation(site, modelId, parentModelId, (doc) => {
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

    $(fieldNode)
      .children()
      .eq(index as number)
      .remove();
  });
}

export function getContentByContentType(
  site: string,
  contentType: string,
  contentTypesLookup: LookupTable<ContentType>,
  options?: ComponentsContentTypeParams
): Observable<ContentInstancePage>;
export function getContentByContentType(
  site: string,
  contentTypes: string[],
  contentTypesLookup: LookupTable<ContentType>,
  options?: ComponentsContentTypeParams
): Observable<ContentInstancePage>;
export function getContentByContentType(
  site: string,
  contentTypes: string[] | string,
  contentTypesLookup: LookupTable<ContentType>,
  options?: ComponentsContentTypeParams
): Observable<ContentInstancePage> {
  if (typeof contentTypes === 'string') {
    contentTypes = [contentTypes];
  }
  return postJSON(`/studio/api/2/search/search.json?siteId=${site}`, {
    ...reversePluckProps(options, 'type'),
    filters: { 'content-type': contentTypes }
  }).pipe(
    map<AjaxResponse, { count: number; paths: string[] }>(({ response }) => ({
      count: response.result.total,
      paths: response.result.items.filter((item) => item.type === options.type).map((item) => item.path)
    })),
    switchMap(({ paths, count }) =>
      zip(
        of(count),
        paths.length
          ? forkJoin(
              paths.reduce((array, path) => {
                array.push(getContentInstanceLookup(site, path, contentTypesLookup));
                return array;
              }, []) as Array<Observable<LookupTable<ContentInstance>>>
            )
          : of([])
      )
    ),
    map(([count, array]) => ({
      count,
      lookup: array.reduce((hash, lookupTable) => Object.assign(hash, lookupTable), {})
    }))
  );
}

export function formatXML(site: string, path: string) {
  return getContentDOM(site, path).pipe(
    switchMap((doc) =>
      post(
        writeContentUrl({
          site,
          path: path,
          unlock: 'true',
          fileName: getInnerHtml(doc.querySelector(':scope > file-name'))
        }),
        serialize(doc)
      )
    )
  );
}

interface LegacyContentDocumentProps {
  'content-type': string;
  'display-template': string;
  'internal-name': string;
  'file-name': string;
  'merge-strategy': string;
  createdDate_dt: string;
  lastModifiedDate_dt: string;
  objectId: string;
  locale: string;
  placeInNav?: 'true' | 'false';
}

interface AnyObject {
  [key: string]: any;
}

function extractNode(doc: XMLDocument, fieldId: string, index: string | number) {
  const indexes = index === '' || nou(index) ? [] : `${index}`.split('.').map((i) => parseInt(i, 10));
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
  const now = data.lastModifiedDate_dt && data.createdDate_dt ? null : createModifiedDate();
  const dateCreated = data.createdDate_dt ? data.createdDate_dt : now;
  const dateModified = data.lastModifiedDate_dt ? data.lastModifiedDate_dt : now;
  return Object.assign(
    {
      'content-type': '',
      'display-template': '',
      'internal-name': '',
      'file-name': '',
      'merge-strategy': 'inherit-levels',
      createdDate_dt: dateCreated,
      lastModifiedDate_dt: dateModified,
      objectId: '',
      locale: 'en'
    },
    type === 'page' ? { placeInNav: 'false' as 'false' } : {},
    data || {}
  );
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

function insertCollectionItem(
  doc: XMLDocument,
  fieldId: string,
  targetIndex: string | number,
  newItem: Node,
  currentIndex?: number
): void {
  let fieldNode = extractNode(doc, fieldId, removeLastPiece(`${targetIndex}`));
  let index = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) : targetIndex;

  // If currentIndex it means the op is a 'sort', and the index(targetIndex) needs to plus 1 or no
  if (nnou(currentIndex)) {
    let currentIndexParsed = typeof currentIndex === 'string' ? parseInt(popPiece(currentIndex)) : currentIndex;
    let targetIndexParsed = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) : targetIndex;
    if (currentIndexParsed > targetIndexParsed) {
      index = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) : targetIndex;
    } else {
      index = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) + 1 : targetIndex + 1;
    }
  }

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

export function createFileUpload(
  uploadUrl: string,
  file: any,
  path: string,
  metaData: object,
  xsrfArgumentName: string
): Observable<StandardAction> {
  const qs = toQueryString({ [xsrfArgumentName]: getRequestForgeryToken() });
  return new Observable((subscriber) => {
    const uppy = Core({ autoProceed: true });
    uppy.use(XHRUpload, { endpoint: `${uploadUrl}${qs}`, headers: getGlobalHeaders() });
    uppy.setMeta(metaData);

    const blob = dataUriToBlob(file.dataUrl);

    uppy.on('upload-success', (file, response) => {
      subscriber.next({
        type: 'complete',
        payload: response
      });
      subscriber.complete();
    });

    uppy.on('upload-progress', (file, progress) => {
      let type = 'progress';
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

    return () => {
      uppy.cancelAll();
    };
  });
}

export function uploadDataUrl(
  site: string,
  file: any,
  path: string,
  xsrfArgumentName: string
): Observable<StandardAction> {
  return createFileUpload(
    '/studio/api/1/services/api/1/content/write-content.json',
    file,
    path,
    {
      site,
      name: file.name,
      type: file.type,
      path
    },
    xsrfArgumentName
  );
}

export function uploadToS3(
  site: string,
  file: any,
  path: string,
  profileId: string,
  xsrfArgumentName: string
): Observable<StandardAction> {
  return createFileUpload(
    '/studio/api/2/aws/s3/upload.json',
    file,
    path,
    {
      name: file.name,
      type: file.type,
      siteId: site,
      path,
      profileId: profileId
    },
    xsrfArgumentName
  );
}

export function uploadToWebDAV(
  site: string,
  file: any,
  path: string,
  profileId: string,
  xsrfArgumentName: string
): Observable<StandardAction> {
  return createFileUpload(
    '/studio/api/2/webdav/upload',
    file,
    path,
    {
      name: file.name,
      type: file.type,
      siteId: site,
      path,
      profileId: profileId
    },
    xsrfArgumentName
  );
}

export function uploadToCMIS(
  site: string,
  file: any,
  path: string,
  repositoryId: string,
  xsrfArgumentName: string
): Observable<StandardAction> {
  return createFileUpload(
    '/studio/api/2/cmis/upload',
    file,
    path,
    {
      name: file.name,
      type: file.type,
      siteId: site,
      cmisPath: path,
      cmisRepoId: repositoryId
    },
    xsrfArgumentName
  );
}

export function getBulkUploadUrl(site: string, path: string): string {
  const qs = toQueryString({
    site,
    path,
    contentType: 'folder',
    createFolders: true,
    draft: false,
    duplicate: false,
    unlock: true,
    _csrf: getRequestForgeryToken()
  });
  return `/studio/api/1/services/api/1/content/write-content.json${qs}`;
}

export function fetchQuickCreateList(site: string): Observable<QuickCreateItem[]> {
  return get(`/studio/api/2/content/list_quick_create_content.json?siteId=${site}`).pipe(pluck('response', 'items'));
}

export function getHistory(site: string, path: string): Observable<VersionsResponse> {
  return get(
    `/studio/api/1/services/api/1/content/get-item-versions.json?site=${site}&path=${encodeURIComponent(path)}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function revertTo(site: string, path: string, versionNumber: string): Observable<Boolean> {
  return get(
    `/studio/api/1/services/api/1/content/revert-content.json?site=${site}&path=${encodeURIComponent(
      path
    )}&version=${versionNumber}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

interface VersionDescriptor {
  site: string;
  path: string;
  versionNumber: string;
  content: ContentInstance;
}

export function getVersion(site: string, path: string, versionNumber: string): Observable<VersionDescriptor> {
  return of({
    site,
    path,
    versionNumber,
    content: null
  });
}

export function getVersions(
  site: string,
  path: string,
  versionNumbers: [string, string],
  contentTypes: LookupTable<ContentType>
): Observable<[VersionDescriptor, VersionDescriptor]> {
  return of([
    {
      site,
      path,
      versionNumber: versionNumbers[0],
      content: null
    },
    {
      site,
      path,
      versionNumber: versionNumbers[1],
      content: null
    }
  ]);
}

export function getChildrenByPath(
  site: string,
  path: string,
  options?: Partial<GetChildrenOptions>
): Observable<GetChildrenResponse> {
  const qs = toQueryString({ site, path, depth: 1, order: 'default', ...options });
  // TODO: Waiting for API. Temporarily calling API1's get-items-tree
  // return get(`/studio/api/2/content/children_by_path?siteId=${site}&path=${path}`)
  //   .pipe(
  //     pluck('response'),
  //     map(({ children, parent, levelDescriptor }) => Object.assign(children, { parent, levelDescriptor })),
  //     catchError(errorSelectorApi1)
  //   );
  return get(`/studio/api/1/services/api/1/content/get-items-tree.json${qs}`).pipe(
    pluck('response'),
    map(({ item }) => {
      const levelDescriptor = item.children.find((item) => item.contentType === '/component/level-descriptor');
      return Object.assign(parseLegacyItemToSandBoxItem(item.children), {
        parent: parseLegacyItemToSandBoxItem(item),
        levelDescriptor: levelDescriptor
          ? {
              ...parseLegacyItemToSandBoxItem(levelDescriptor),
              label: 'Section Defaults'
            }
          : null
      });
    }),
    catchError(errorSelectorApi1)
  );
}

export function paste(siteId: string, targetPath: string, clipboard: Clipboard): Observable<any> {
  return postJSON('/studio/api/2/content/paste', {
    siteId,
    operation: clipboard.type,
    targetPath,
    item: getPasteItemFromPath(clipboard.sourcePath, clipboard.paths)
  }).pipe(pluck('response'));
}

export function duplicate(siteId: string, path: string): Observable<any> {
  return postJSON('/studio/api/2/content/duplicate', {
    siteId,
    path
  }).pipe(pluck('response'));
}

export function deleteItems(site: string, submissionComment: string, data: AnyObject): Observable<ApiResponse> {
  const paths = encodeURIComponent(data.items.join(','));
  return del(`/studio/api/2/content/delete?siteId=${site}&submissionComment=${submissionComment}&paths=${paths}`).pipe(
    pluck('response', 'response')
  );
}

export function lock(site: string, path: string): Observable<boolean> {
  return getContentXML(site, path, { lock: true }).pipe(mapTo(true));
}

export function unlock(site: string, path: string): Observable<boolean> {
  return get(`/studio/api/1/services/api/1/content/unlock-content.json?site=${site}&path=${path}`).pipe(mapTo(true));
}

export function fetchWorkflowAffectedItems(site: string, path: string): Observable<SandboxItem[]> {
  return get(`/studio/api/1/services/api/1/workflow/get-workflow-affected-paths.json?site=${site}&path=${path}`).pipe(
    pluck('response', 'items'),
    map((items) => items.map(parseLegacyItemToSandBoxItem)),
    catchError(errorSelectorApi1)
  );
}

export function createFolder(site: string, path: string, name: string): Observable<unknown> {
  return post(
    `/studio/api/1/services/api/1/content/create-folder.json?site=${site}&path=${encodeURIComponent(path)}&name=${name}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function createFile(site: string, path: string, fileName: string): Observable<unknown> {
  return post(
    `/studio/api/1/services/api/1/content/write-content.json?site=${site}&phase=onSave&path=${encodeURIComponent(
      path
    )}&fileName=${fileName}&user=admin&unlock=true`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function renameFolder(site: string, path: string, name: string) {
  return post(
    `/studio/api/1/services/api/1/content/rename-folder.json?site=${site}&path=${encodeURIComponent(path)}&name=${name}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function changeContentType(site: string, path: string, contentType: string): Observable<boolean> {
  return post(
    `/studio/api/1/services/api/1/content/change-content-type.json?site=${site}&path=${path}&contentType=${contentType}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function checkPathExistence(site: string, path: string): Observable<boolean> {
  return get(`/studio/api/1/services/api/1/content/content-exists.json?site_id=${site}&path=${path}`).pipe(
    pluck('response', 'content'),
    catchError(errorSelectorApi1)
  );
}

export function getLegacyItem(site: string, path: string): Observable<LegacyItem> {
  return get(
    `/studio/api/1/services/api/1/content/get-item.json?site_id=${site}&path=${encodeURIComponent(path)}`
  ).pipe(pluck('response', 'item'), catchError(errorSelectorApi1));
}

export function getLegacyItemsTree(
  site: string,
  path: string,
  options?: Partial<{ depth: number; order: string }>
): Observable<LegacyItem> {
  return get(
    `/studio/api/1/services/api/1/content/get-items-tree.json${toQueryString({
      site_id: site,
      path,
      ...options
    })}`
  ).pipe(pluck('response', 'item'), catchError(errorSelectorApi1));
}
