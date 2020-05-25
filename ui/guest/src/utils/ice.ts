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

import { LookupTable } from '@craftercms/studio-ui/models/LookupTable';
import { ContentTypeField } from '@craftercms/studio-ui/models/ContentType';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { isNullOrUndefined, notNullOrUndefined } from './object';
import Model from './model';
import { forEach } from './array';
import { popPiece } from './string';

export function findComponentContainerFields(fields: LookupTable<ContentTypeField> | ContentTypeField[]): ContentTypeField[] {
  if (!Array.isArray(fields)) {
    fields = Object.values(fields);
  }
  return fields.filter((field) => {
    if (field.type === 'node-selector') {
      return true;
    } else if (field.type === 'repeat') {
      // TODO Should repeats be considered containers?
      return false;
    } else {
      return false;
    }
  });
}

export function getParentModelId(modelId: string, models: LookupTable<ContentInstance>, children: LookupTable<ContentInstance>): string {
  return isNullOrUndefined(Model.prop(models[modelId], 'path'))
    ? findParentModelId(modelId, children, models)
    : null;
}

function findParentModelId(modelId: string, childrenMap: LookupTable<ContentInstance>, models: LookupTable<ContentInstance>): string {
  const parentId = forEach(
    Object.entries(childrenMap),
    ([id, children]) => {
      if (
        notNullOrUndefined(children) &&
        (id !== modelId) &&
        children.includes(modelId)
      ) {
        return id;
      }
    },
    null
  );
  return notNullOrUndefined(parentId)
    // If it has a path, it is not embedded and hence the parent
    // Otherwise, need to keep looking.
    ? notNullOrUndefined(Model.prop(models[parentId], 'path'))
      ? parentId
      : findParentModelId(parentId, childrenMap, models)
    // No parent found for this model
    : null;
}

export function getCollectionWithoutItemAtIndex(collection: string[], index: string | number): string[] {
  const parsedIndex = parseInt(popPiece(`${index}`), 10);
  return collection
    .slice(0, parsedIndex)
    .concat(collection.slice(parsedIndex + 1));
}

export function getCollection(model: ContentInstance, fieldId: string, index: string | number): string[] {
  const isStringIndex = typeof index === 'string';
  return isStringIndex
    ? Model.extractCollection(model, fieldId, index)
    : Model.value(model, fieldId);
}
