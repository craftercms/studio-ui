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

import GlobalState from '../../models/GlobalState';
import { createReducer } from '@reduxjs/toolkit';
import { INIT_DASHBOARD_CONFIG } from '../actions/dashboard';
import { deserialize, fromString } from '../../utils/xml';
import { applyDeserializedXMLTransforms } from '../../utils/object';

const reducer = createReducer<GlobalState['dashboard']>(null, {
  [INIT_DASHBOARD_CONFIG]: (state, { payload }) => {
    let dashboardConfig = null;
    const arrays = ['widgets', 'roles', 'excludes', 'devices', 'values', 'siteCardMenuLinks', 'tools'];
    const renameTable = { permittedRoles: 'roles' };
    const configDOM = fromString(payload.configXml);
    const dashboard = configDOM.querySelector('[id="craftercms.components.Dashboard"] > configuration');

    if (dashboard) {
      // TODO: keys should go in xmlPreprocessor
      dashboard.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
      dashboardConfig = applyDeserializedXMLTransforms(deserialize(dashboard), {
        arrays,
        renameTable
      }).configuration;
    }

    return {
      ...state,
      ...dashboardConfig
    };
  }
});

export default reducer;
