/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import { initLauncherConfig } from '../actions/launcher';
import { deserialize, fromString } from '../../utils/xml';
import { applyDeserializedXMLTransforms } from '../../utils/object';
import { changeSite } from '../actions/sites';
import { fetchSiteUiConfig } from '../actions/configuration';

const reducer = createReducer<GlobalState['launcher']>(null, {
  [changeSite.type]: () => null,
  [fetchSiteUiConfig.type]: () => null,
  [initLauncherConfig.type]: (state, { payload }) => {
    let launcherConfig = null;
    const arrays = ['widgets', 'permittedRoles', 'siteCardMenuLinks'];
    const configDOM = fromString(payload.configXml);
    const launcher = configDOM.querySelector('[id="craftercms.components.Launcher"] > configuration');
    if (launcher) {
      launcherConfig = applyDeserializedXMLTransforms(deserialize(launcher), {
        arrays
      }).configuration;
    }
    return {
      ...state,
      ...launcherConfig
    };
  }
});

export default reducer;
