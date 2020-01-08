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

import { isNullOrUndefined, retrieveProperty, setProperty } from '../util';

const systemPropList = ['id', 'path', 'contentType', 'dateCreated', 'dateModified', 'label'];

export class ModelHelper {
  static prop(model, propName) {
    if (model == null) {
      return null;
    } else if (systemPropList.includes(propName)) {
      propName = `craftercms.${propName}`;
    }
    return retrieveProperty(model, propName);
  }

  static value(model, fieldId, newValue) {
    // TODO: GraphQL transforms names as left-rail_o to left__rail_o.
    // This transform is potentially unreliable. We should discuss approach.
    const cleanFieldId = fieldId.replace(/-/g, '__');
    if (cleanFieldId !== fieldId && retrieveProperty(model, cleanFieldId)) {
      fieldId = cleanFieldId;
    }
    if (newValue != null) {
      setProperty(model, fieldId, newValue);
    }
    return retrieveProperty(model, fieldId);
  }

  static extractCollectionItem(model, fieldId, index) {
    const indexPath = `${index}`.split('.').map(i => parseInt(i, 10));
    const pieces = fieldId.split('.');
    let aux = model;
    if (indexPath.length > pieces.length) {
      throw new Error(
        '[ModelHelper.extractCollectionItem] The number of indexes surpasses the number ' +
        `of nested properties on model id "${ModelHelper.prop(model, 'id')}", field id "${fieldId}". ` +
        `Supplied index path was ${index}. `
      );
    }
    if (Math.abs(indexPath.length - pieces.length) > 1) {
      throw new Error(
        '[ModelHelper.extractCollectionItem] The number of indexes and number of nested props mismatch ' +
        `by more than 1 on "${ModelHelper.prop(model, 'id')}", field id "${fieldId}". ` +
        `Supplied index path was ${index}. Number of nested props may be greater by no more than one ` +
        'than the number of nested indexes.'
      );
    }
    indexPath.forEach((index, i) => {
      const field = pieces[i];
      aux = aux[field][index];
    });
    if (indexPath.length !== pieces.length) {
      // TODO: For nested repeat groups, aux would be a object.
      // Could possibly extract last piece and read it from the indexPath readout
      // Only a 1 point length difference mismatch should be allowed?
      return aux[pieces[pieces.length - 1]];
    }
    return aux;
  }

  static getContentTypeId(model) {
    return model?.craftercms?.contentType;
  }

  static isEmbedded(model) {
    return isNullOrUndefined(ModelHelper.prop(model, 'path'));
  }
}
