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

import { errorSelectorApi1, get, postJSON } from '../utils/ajax';
import { catchError, map, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { deserialize, fromString } from '../utils/xml';
import { ContentTypeField } from '../models/ContentType';
import { applyDeserializedXMLTransforms, reversePluckProps, toQueryString } from '../utils/object';
import ContentInstance from '../models/ContentInstance';
import { VersionsResponse } from '../models/Version';
import LookupTable from '../models/LookupTable';
import GlobalState from '../models/GlobalState';
import { defineMessages } from 'react-intl';
import { SiteConfigurationFile } from '../models/SiteConfigurationFile';

export type CrafterCMSModules = 'studio' | 'engine';

export function fetchConfigurationXML(
  site: string,
  configPath: string,
  module: CrafterCMSModules,
  environment?: string
): Observable<string> {
  const qs = toQueryString({
    siteId: site,
    module,
    path: configPath,
    environment
  });
  return get(`/studio/api/2/configuration/get_configuration${qs}`).pipe(pluck('response', 'content'));
}

export function fetchConfigurationDOM(
  site: string,
  configPath: string,
  module: CrafterCMSModules,
  environment?: string
): Observable<XMLDocument> {
  return fetchConfigurationXML(site, configPath, module, environment).pipe(map(fromString));
}

export function fetchConfigurationJSON(
  site: string,
  configPath: string,
  module: CrafterCMSModules,
  environment?: string
): Observable<any> {
  return fetchConfigurationXML(site, configPath, module, environment).pipe(
    map((conf) => {
      return deserialize(conf, {
        parseNodeValue: false,
        tagValueProcessor: (value) =>
          value
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
      });
    })
  );
}

export function writeConfiguration(
  site: string,
  path: string,
  module: CrafterCMSModules,
  content: string,
  environment?: string
): Observable<any> {
  return postJSON('/studio/api/2/configuration/write_configuration', {
    siteId: site,
    module,
    path,
    content,
    ...(environment && { environment })
  });
}

// region AudiencesPanelConfig

interface ActiveTargetingModel {
  id: string;

  [prop: string]: string;
}

// TODO: asses the location of profile methods.
export function fetchActiveTargetingModel(site?: string): Observable<ContentInstance> {
  return get(`/api/1/profile/get`).pipe(
    map((response) => {
      const data = reversePluckProps(response.response, 'id');
      const id = response.response.id ?? null;

      return {
        craftercms: {
          id,
          path: null,
          label: null,
          locale: null,
          dateCreated: null,
          dateModified: null,
          contentTypeId: null
        },
        ...data
      };
    })
  );
}

export function deserializeActiveTargetingModelData<T extends Object>(
  data: T,
  contentTypeFields: LookupTable<ContentTypeField>
): ContentInstance {
  Object.keys(data).forEach((modelKey) => {
    if (contentTypeFields[modelKey]) {
      // if checkbox-group (Array)
      if (contentTypeFields[modelKey].type === 'checkbox-group') {
        data[modelKey] = data[modelKey] ? data[modelKey].split(',') : [];
      }
    }
  });

  return {
    craftercms: {
      id: '',
      path: null,
      label: null,
      locale: null,
      dateCreated: null,
      dateModified: null,
      contentTypeId: null
    },
    ...data
  };
}

export function setActiveTargetingModel(data): Observable<ActiveTargetingModel> {
  const model = reversePluckProps(data, 'craftercms');
  const qs = toQueryString({ ...model, id: data.craftercms.id });
  return get(`/api/1/profile/set${qs}`).pipe(pluck('response'));
}

// endregion

const messages = defineMessages({
  emptyUiConfigMessageTitle: {
    id: 'emptyUiConfigMessageTitle.title',
    defaultMessage: 'Configuration is empty'
  },
  emptyUiConfigMessageSubtitle: {
    id: 'emptyUiConfigMessageTitle.subtitle',
    defaultMessage: 'Nothing is set to be shown here.'
  }
});

export function fetchSiteUiConfig(site: string): Observable<Pick<GlobalState['uiConfig'], 'preview' | 'launcher'>> {
  return fetchConfigurationDOM(site, '/ui.xml', 'studio').pipe(
    map((xml) => {
      if (xml) {
        const config = {
          preview: {
            toolbar: {
              leftSection: null,
              middleSection: null,
              rightSection: null
            },
            toolsPanel: {
              widgets: [
                {
                  id: 'craftercms.component.EmptyState',
                  uiKey: -1,
                  configuration: {
                    title: messages.emptyUiConfigMessageTitle,
                    subtitle: messages.emptyUiConfigMessageSubtitle
                  }
                }
              ]
            },
            pageBuilderPanel: {
              widgets: [
                {
                  id: 'craftercms.component.EmptyState',
                  uiKey: -1,
                  configuration: {
                    title: messages.emptyUiConfigMessageTitle,
                    subtitle: messages.emptyUiConfigMessageSubtitle
                  }
                }
              ]
            }
          },
          launcher: null,
          dashboard: null,
          references: {}
        };
        const arrays = ['widgets', 'roles', 'excludes', 'devices', 'values', 'siteCardMenuLinks'];
        const renameTable = { permittedRoles: 'roles' };
        // Reading references
        xml.querySelectorAll('references > reference').forEach((tag) => {
          config.references[tag.id] = applyDeserializedXMLTransforms(deserialize(tag.innerHTML), {
            arrays,
            renameTable
          });
        });
        // Replacing references
        xml.querySelectorAll('configuration > reference').forEach((tag) => {
          tag.outerHTML = xml.querySelector(`references > reference[id='${tag.id}']`).innerHTML;
        });
        // Make sure any plugin reference has a valid site id to import the plugin from
        xml.querySelectorAll('plugin').forEach((tag) => {
          const siteAttr = tag.getAttribute('site');
          if (siteAttr === '{site}' || siteAttr === null) {
            tag.setAttribute('site', site);
          }
        });
        const toolbar = xml.querySelector('[id="craftercms.components.PreviewToolbar"] > configuration');
        if (toolbar) {
          const leftSection = toolbar.querySelector('leftSection > widgets');
          if (leftSection) {
            leftSection.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
            config.preview.toolbar.leftSection = applyDeserializedXMLTransforms(deserialize(leftSection), {
              arrays,
              renameTable
            });
          }
          const middleSection = toolbar.querySelector('middleSection > widgets');
          if (middleSection) {
            middleSection.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
            config.preview.toolbar.middleSection = applyDeserializedXMLTransforms(deserialize(middleSection), {
              arrays,
              renameTable
            });
          }
          const rightSection = toolbar.querySelector('rightSection > widgets');
          if (rightSection) {
            rightSection.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
            config.preview.toolbar.rightSection = applyDeserializedXMLTransforms(deserialize(rightSection), {
              arrays,
              renameTable
            });
          }
        }
        const toolsPanelPages = xml.querySelector('[id="craftercms.components.ToolsPanel"] > configuration > widgets');
        if (toolsPanelPages) {
          // When rendering widgets dynamically and changing pages on the tools panel, if there are duplicate react key
          // props across pages, react may no swap the components correctly, incurring in unexpected behaviours.
          // We need a unique key for each widget.
          toolsPanelPages.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
          const lookupTables = ['fields'];
          config.preview.toolsPanel = applyDeserializedXMLTransforms(deserialize(toolsPanelPages), {
            arrays,
            lookupTables,
            renameTable
          });
        }
        const launcher = xml.querySelector('[id="craftercms.components.Launcher"] > configuration');
        if (launcher) {
          launcher.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
          config.launcher = applyDeserializedXMLTransforms(deserialize(launcher), {
            arrays,
            renameTable
          }).configuration;
        }
        const pageBuilderPanel = xml.querySelector(
          '[id="craftercms.components.PageBuilderPanel"] > configuration > widgets'
        );
        if (pageBuilderPanel) {
          const lookupTables = ['fields'];
          pageBuilderPanel.querySelectorAll('widget').forEach((e, index) => {
            e.setAttribute('uiKey', String(index));
            if (e.getAttribute('id') === 'craftercms.components.ToolsPanelPageButton') {
              e.querySelector(':scope > configuration')?.setAttribute('target', 'pageBuilderPanel');
            }
          });
          config.preview.pageBuilderPanel = applyDeserializedXMLTransforms(deserialize(pageBuilderPanel), {
            arrays,
            renameTable,
            lookupTables
          });
        }
        const dashboard = xml.querySelector('[id="craftercms.components.Dashboard"] > configuration');
        if (dashboard) {
          dashboard.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
          config.dashboard = applyDeserializedXMLTransforms(deserialize(dashboard), {
            arrays,
            renameTable
          }).configuration;
        }
        return config;
      } else {
        return null;
      }
    })
  );
}

const legacyToNextMenuIconMap = {
  'fa-sitemap': 'craftercms.icons.Sites',
  'fa-user': '@material-ui/icons/PeopleRounded',
  'fa-users': '@material-ui/icons/SupervisedUserCircleRounded',
  'fa-database': '@material-ui/icons/StorageRounded',
  'fa-bars': '@material-ui/icons/SubjectRounded',
  'fa-level-down': '@material-ui/icons/SettingsApplicationsRounded',
  'fa-align-left': '@material-ui/icons/FormatAlignCenterRounded',
  'fa-globe': '@material-ui/icons/PublicRounded',
  'fa-lock': '@material-ui/icons/LockRounded',
  'fa-key': '@material-ui/icons/VpnKeyRounded'
};

export function fetchGlobalMenuItems(): Observable<GlobalState['uiConfig']['globalNavigation']['items']> {
  return get('/studio/api/2/ui/views/global_menu.json').pipe(
    pluck('response', 'menuItems'),
    map((items) => [
      ...items.map((item) => ({
        ...item,
        icon: legacyToNextMenuIconMap[item.icon]
          ? { id: legacyToNextMenuIconMap[item.icon] }
          : { baseClass: item.icon.includes('fa') ? `fa ${item.icon}` : item.icon }
      })),
      { id: 'home.globalMenu.about-us', icon: { id: 'craftercms.icons.CrafterIcon' }, label: 'About' },
      { id: 'home.globalMenu.settings', icon: { id: '@material-ui/icons/AccountCircleRounded' }, label: 'Account' }
    ])
  );
}

export function fetchProductLanguages(): Observable<{ id: string; label: string }[]> {
  return get('/studio/api/1/services/api/1/server/get-available-languages.json').pipe(pluck('response'));
}

export function fetchHistory(
  site: string,
  path: string,
  environment: string,
  module: string
): Observable<VersionsResponse> {
  const parsedPath = encodeURIComponent(path.replace(/(\/config\/)(studio|engine)/g, ''));

  return get(
    `/studio/api/2/configuration/get_configuration_history.json?siteId=${site}&path=${parsedPath}&environment=${environment}&module=${module}`
  ).pipe(pluck('response', 'history'));
}

export function fetchCannedMessage(site: string, locale: string, type: string): Observable<string> {
  return get(
    `/studio/api/1/services/api/1/site/get-canned-message.json?site=${site}&locale=${locale}&type=${type}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export function fetchSiteLocale(site: string): Observable<any> {
  return fetchConfigurationDOM(site, '/site-config.xml', 'studio').pipe(
    map((xml) => {
      let settings = {};
      if (xml) {
        const localeXML = xml.querySelector('locale');
        if (localeXML) {
          settings = deserialize(localeXML).locale;
        }
      }
      return settings;
    })
  );
}

export function fetchSiteConfigurationFiles(site: string, environment?: string): Observable<SiteConfigurationFile[]> {
  return fetchConfigurationDOM(site, '/administration/config-list.xml', 'studio', environment).pipe(
    map((xml) => {
      let files = [];
      if (xml) {
        const filesXML = xml.querySelector('files');
        if (filesXML) {
          files = deserialize(filesXML).files.file;
        }
      }
      return files;
    })
  );
}

const legacySiteToolsIdMapping = {
  'content-types': 'content-types',
  'encrypt-tool': 'encrypt-tool',
  'admin-configurations': 'configuration',
  audit: 'audit',
  'workflow-states': 'item-states',
  'log-view': 'log',
  'status-view': 'publishing',
  repository: 'remote-repositories',
  graphiql: 'graphiql',
  'plugin-management': 'plugins'
};

const legacySiteToolsIconMapping = {
  'content-types': '@material-ui/icons/WidgetsOutlined',
  'encrypt-tool': '@material-ui/icons/LockOutlined',
  'admin-configurations': '@material-ui/icons/SettingsApplicationsOutlined',
  audit: '@material-ui/icons/SubjectRounded',
  'workflow-states': '@material-ui/icons/SettingsOutlined',
  'log-view': '@material-ui/icons/FormatAlignCenterRounded',
  'status-view': '@material-ui/icons/CloudUploadOutlined',
  repository: '@material-ui/icons/StorageRounded',
  graphiql: 'craftercms.icons.GraphQL',
  'plugin-management': '@material-ui/icons/ExtensionOutlined'
};

export function fetchSiteTools(site: string): Observable<GlobalState['uiConfig']['siteTools']['tools']> {
  return fetchConfigurationDOM(site, '/administration/site-config-tools.xml', 'studio').pipe(
    map((xml) => {
      let tools = null;
      if (xml) {
        const toolsXML = xml.querySelector('tools');
        if (toolsXML) {
          tools = deserialize(toolsXML).tools.tool.map((tool) => ({
            id: legacySiteToolsIdMapping[tool.name],
            icon: { id: legacySiteToolsIconMapping[tool.name] }
          }));
        }
      }
      return tools;
    })
  );
}
