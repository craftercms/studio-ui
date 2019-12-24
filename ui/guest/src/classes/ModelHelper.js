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

import { retrieveProperty, setProperty } from '../util';

export class ModelHelper {
  static prop(model, propName) {
    if (model == null) {
      return null;
    } else if (propName === 'id') {
      propName = 'craftercms.id';
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

  static getContentTypeId(model) {
    return model?.craftercms?.contentType;
  }
}
