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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import { LauncherStateProps } from '../../../components/Launcher';
import { closeLauncher, showLauncher } from '../../actions/dialogs';
import { initLauncherConfig } from '../../actions/launcher';
import { deserialize, fromString } from '../../../utils/xml';
import { applyDeserializedXMLTransforms } from '../../../utils/object';

const initialState: LauncherStateProps = {
  open: false,
  anchor: null,
  sitesRailPosition: 'left',
  closeButtonPosition: 'right',
  widgets: null,
  siteCardMenuLinks: null
};

const launcher = createReducer<GlobalState['dialogs']['launcher']>(initialState, (builder) => {
  builder
    .addCase(showLauncher, (state, { payload }) => ({
      ...state,
      ...(payload as object),
      open: true
    }))
    .addCase(initLauncherConfig, (state, { payload }) => {
      const configDOM = fromString(payload.configXml);
      const launcher = configDOM.querySelector('[id="craftercms.components.Launcher"] > configuration');
      if (launcher) {
        let launcherConfig = applyDeserializedXMLTransforms(deserialize(launcher), {
          arrays: ['widgets', 'permittedRoles', 'siteCardMenuLinks']
        }).configuration;
        return {
          ...state,
          ...launcherConfig
        };
      } else {
        return state;
      }
    })
    .addCase(closeLauncher, (state) => ({
      ...state,
      open: false,
      anchor: null
    }));
});

export default launcher;
