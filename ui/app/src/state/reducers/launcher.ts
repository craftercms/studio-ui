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
import { INIT_LAUNCHER_CONFIG } from '../actions/launcher';
import { deserialize, fromString } from '../../utils/xml';
import { applyDeserializedXMLTransforms } from '../../utils/object';

const reducer = createReducer<GlobalState['launcher']>(null, {
  [INIT_LAUNCHER_CONFIG]: (state, { payload }) => {
    let launcherConfig = null;
    const arrays = ['widgets', 'roles', 'excludes', 'devices', 'values', 'siteCardMenuLinks', 'tools'];
    const renameTable = { permittedRoles: 'roles' };
    const configDOM = fromString(payload.configXml);

    const launcher = configDOM.querySelector('[id="craftercms.components.Launcher"] > configuration');
    if (launcher) {
      launcher.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
      launcherConfig = applyDeserializedXMLTransforms(deserialize(launcher), {
        arrays,
        renameTable
      }).configuration;
    }

    return {
      ...state,
      ...launcherConfig
    };
  }
});

export default reducer;
