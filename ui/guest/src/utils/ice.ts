
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

// TODO: Move all DOMController & Markers function as utils here.

// To be removed. Just a placeholder so the file
// isn't empty and the linter doesn't complain.
import { LookupTable } from '../models/LookupTable';
import { ContentTypeField } from '../models/ContentType';

export const naught = null;

// export function findContainerField(model, fields, modelId) {
//   return forEach(fields, (field) => {
//     const value = ModelHelper.value(model, field.id);
//     if (
//       (field.type === 'node-selector' && value === modelId) ||
//       (field.type === 'array' && value.includes(modelId))
//     ) {
//       return field;
//     } else if (field.type === 'repeat') {
//       // TODO ...
//     }
//   });
// }
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
