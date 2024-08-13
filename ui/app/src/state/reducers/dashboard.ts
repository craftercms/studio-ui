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
import { initDashboardConfig } from '../actions/dashboard';
import { deserialize, fromString } from '../../utils/xml';
import { applyDeserializedXMLTransforms } from '../../utils/object';
import { defineMessages } from 'react-intl';
import { changeSiteComplete } from '../actions/sites';

const messages = defineMessages({
  noUiConfigMessageTitle: {
    id: 'noUiConfigMessageTitle.title',
    defaultMessage: 'Configuration file missing'
  },
  noUiConfigMessageSubtitle: {
    id: 'noUiConfigMessageTitle.subtitle',
    defaultMessage: 'Add & configure `ui.xml` on your project to show content here.'
  }
});

const reducer = createReducer<GlobalState['dashboard']>(null, (builder) => {
  builder
    .addCase(changeSiteComplete, () => null)
    .addCase(initDashboardConfig, (state, { payload }) => {
      let dashboardConfig = {
        widgets: [
          {
            id: 'craftercms.components.EmptyState',
            uiKey: -1,
            configuration: {
              title: messages.noUiConfigMessageTitle,
              subtitle: messages.noUiConfigMessageSubtitle
            }
          }
        ]
      };
      const arrays = ['widgets', 'permittedRoles'];
      const configDOM = fromString(payload.configXml);
      // TODO: 4.0.1 update selector to craftercms.components.SiteDashboard
      const dashboard = configDOM.querySelector('[id="craftercms.components.Dashboard"] > configuration');

      if (dashboard) {
        dashboardConfig = applyDeserializedXMLTransforms(deserialize(dashboard), {
          arrays
        }).configuration;
      }

      return {
        ...state,
        ...dashboardConfig
      };
    });
});

export default reducer;
