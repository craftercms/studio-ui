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
 * along with this program.  If not, see <http://www.gnu.org/licenses}.
 */

import { defineMessages } from 'react-intl';
import GlobalState from '../models/GlobalState';

const messages = defineMessages({
  pageBuilder: {
    id: 'pageBuilder.title',
    defaultMessage: 'Page Building'
  },
  siteTools: {
    id: 'siteTools.title',
    defaultMessage: 'Site Tools'
  },
  siteDashboard: {
    id: 'words.dashboard',
    defaultMessage: 'Dashboard'
  },
  configuration: {
    id: 'words.configuration',
    defaultMessage: 'Configuration'
  },
  workflowStates: {
    id: 'workflowStates.title',
    defaultMessage: 'Workflow States'
  },
  publishing: {
    id: 'words.publishing',
    defaultMessage: 'Publishing'
  },
  remoteRepositories: {
    id: 'remoteRepositories.title',
    defaultMessage: 'Remote Repositories'
  },
  preview: {
    id: 'words.preview',
    defaultMessage: 'Preview'
  },
  site: {
    id: 'launcher.siteSectionTitle',
    defaultMessage: 'Site <muted>• {siteName}</muted>'
  },
  noUiConfigMessageTitle: {
    id: 'noUiConfigMessageTitle.title',
    defaultMessage: 'Configuration file missing'
  },
  noUiConfigMessageSubtitle: {
    id: 'noUiConfigMessageTitle.subtitle',
    defaultMessage: 'Add & configure `ui.xml` on your site to show content here.'
  }
});

let count = 0;

const uiConfigDefaults: Pick<GlobalState['uiConfig'], 'preview' | 'launcher' | 'dashboard'> = {
  preview: {
    toolsPanel: {
      widgets: [
        {
          id: 'craftercms.component.EmptyState',
          uiKey: count++,
          configuration: {
            title: messages.noUiConfigMessageTitle,
            subtitle: messages.noUiConfigMessageSubtitle
          }
        }
      ]
    },
    pageBuilderPanel: {
      widgets: [
        {
          id: 'craftercms.component.EmptyState',
          uiKey: count++,
          configuration: {
            title: messages.noUiConfigMessageTitle,
            subtitle: messages.noUiConfigMessageSubtitle
          }
        }
      ]
    }
  },
  launcher: null,
  dashboard: null
};

export default uiConfigDefaults;
