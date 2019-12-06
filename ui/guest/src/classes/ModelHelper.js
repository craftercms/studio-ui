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

export class ModelHelper {
  static prop(model, propName) {
    if (model == null) {
      return null;
    } else if (propName === 'id') {
      return model.craftercms.id;
    }
    return model[propName];
  }

  static value(model, fieldId, newValue) {
    if (newValue != null) {
      model[fieldId] = newValue;
    }
    // TODO: GraphQL transforms names as left-rail_o to left__rail_o.
    return model[fieldId] || model[fieldId.replace(/-/g, '__')];
  }

  static getContentTypeId(model) {
    return model?.craftercms?.contentType;
  }
}
