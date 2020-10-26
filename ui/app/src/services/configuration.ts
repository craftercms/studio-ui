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

import { errorSelectorApi1, get } from '../utils/ajax';
import { catchError, map, pluck } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import {
  extractLocalizedElements,
  fromString,
  getInnerHtml,
  getInnerHtmlNumber,
  toJS
} from '../utils/xml';
import ContentType, { ContentTypeField } from '../models/ContentType';
import { createLookupTable, reversePluckProps } from '../utils/object';
import ContentInstance from '../models/ContentInstance';
import { VersionsResponse } from '../models/Version';
import { asArray } from '../utils/array';

type CrafterCMSModules = 'studio' | 'engine';

export function getRawConfiguration(
  site: string,
  configPath: string,
  module: CrafterCMSModules
): Observable<string> {
  return get(
    `/studio/api/2/configuration/get_configuration?siteId=${site}&module=${module}&path=${configPath}`
  ).pipe(map(({ response }) => response.content));
}

export function getConfigurationDOM(
  site: string,
  configPath: string,
  module: CrafterCMSModules
): Observable<XMLDocument> {
  return getRawConfiguration(site, configPath, module).pipe(map(fromString));
}

// region PreviewToolsConfig

interface PreviewToolsModuleDescriptor {
  id: string; // The module id
  title: string;
  // title_en: string;
  // title_es: string;
  // title_ko: string;
  // title_de: string;
  config: string;
}

export interface PreviewToolsConfig {
  modules: Array<PreviewToolsModuleDescriptor>;
}

const LegacyPanelIdMap: any = {
  'ice-tools-panel': 'craftercms.ice.ice',
  'component-panel': 'craftercms.ice.components',
  'medium-panel': 'craftercms.ice.simulator',
  targeting: 'craftercms.ice.audiences'
};

const audienceTypesMap: any = {
  input: 'input',
  dropdown: 'dropdown',
  checkboxes: 'checkbox-group',
  datetime: 'date-time'
};

export function getPreviewToolsConfig(site: string): Observable<PreviewToolsConfig> {
  return getRawConfiguration(site, `/preview-tools/panel.xml`, 'studio').pipe(
    map((content) => {
      try {
        return JSON.parse(content);
      } catch (e) {
        // Not JSON, assuming XML
        let previewToolsConfig: PreviewToolsConfig = { modules: null };
        const xml = fromString(content);
        previewToolsConfig.modules = Array.from(xml.querySelectorAll('module')).map((elem) => {
          let id =
            // Try the new way first
            elem.getAttribute('id') ||
            // ...try the old way if no id attribute is found
            getInnerHtml(elem.querySelector('moduleName'));
          if (LegacyPanelIdMap[id]) {
            id = LegacyPanelIdMap[id];
          }

          const configNode = elem.querySelector('config');
          let config =
            id === 'craftercms.ice.simulator'
              ? parseSimulatorPanelConfig(configNode)
              : parsePreviewToolsPanelConfig(configNode);

          const localizedTitles = extractLocalizedElements(elem.querySelectorAll(':scope > title'));

          return {
            id: LegacyPanelIdMap[id] || id,
            ...localizedTitles,
            config
          };
        });
        return previewToolsConfig;
      }
    })
  );
}

// endregion

// region AudiencesPanelConfig

interface ActiveTargetingModel {
  id: string;

  [prop: string]: string;
}

export function getAudiencesPanelConfig(site: string): Observable<ContentType> {
  return getRawConfiguration(site, `/targeting/targeting-config.xml`, 'studio').pipe(
    map((content) => {
      try {
        return JSON.parse(content);
      } catch (e) {
        // Not JSON, assuming XML
        let audiencesPanelContentType: ContentType = {
          id: 'audiencesPanelConfig',
          name: 'Audiences Panel Config',
          type: 'unknown',
          quickCreate: null,
          quickCreatePath: null,
          displayTemplate: null,
          sections: null,
          fields: null,
          dataSources: null,
          mergeStrategy: null
        };

        const xml = fromString(content);
        const properties = Array.from(xml.querySelectorAll('property')).map((elem) => {
          const name = getInnerHtml(elem.querySelector('name')),
            label = getInnerHtml(elem.querySelector('label')),
            type = getInnerHtml(elem.querySelector('type')),
            hint = getInnerHtml(elem.querySelector('hint'));
          let defaultValue: any = getInnerHtml(elem.querySelector('default_value'));

          let possibleValues: ContentTypeField['values'];

          if (elem.querySelectorAll('value').length > 0) {
            possibleValues = Array.from(elem.querySelectorAll('value')).map((element) => {
              const value = getInnerHtml(element);
              return {
                label: element.getAttribute('label') ?? value,
                value: value
              };
            });
          } else {
            possibleValues = [];
          }

          if (type === 'checkboxes') {
            defaultValue = defaultValue ? defaultValue.split(',') : [];
          }

          return {
            id: name,
            name: label,
            type: audienceTypesMap[type] || type,
            sortable: null,
            validations: null,
            defaultValue,
            required: null,
            fields: null,
            values: possibleValues,
            helpText: hint
          };
        });

        audiencesPanelContentType.fields = createLookupTable(properties, 'id');

        return audiencesPanelContentType;
      }
    })
  );
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

export function getAudiencesPanelPayload(
  site: string
): Observable<{ contentType: ContentType; model: ContentInstance }> {
  return forkJoin({
    data: fetchActiveTargetingModel(site),
    contentType: getAudiencesPanelConfig(site)
  }).pipe(
    map(({ contentType, data }) => ({
      contentType,
      model: deserializeActiveTargetingModelData(data, contentType)
    }))
  );
}

function deserializeActiveTargetingModelData<T extends Object>(
  data: T,
  contentType: ContentType
): ContentInstance {
  const contentTypeFields = contentType.fields;

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

  Object.keys(model).forEach((key) => {
    if (Array.isArray(model[key])) {
      model[key] = model[key].join(',');
    }
  });

  const params = encodeURI(
    Object.entries(model)
      .map(([key, val]) => `${key}=${val}`)
      .join('&')
  );

  return get(`/api/1/profile/set?${params}`).pipe(pluck('response'));
}

function parseSimulatorPanelConfig(element: Element) {
  let config = parsePreviewToolsPanelConfig(element);
  if (config === null) {
    return null;
  } else if (typeof config === 'object') {
    return config;
  } else {
    return {
      channels: Array.from(element.querySelectorAll('channel'))
        .map((channel) => ({
          width: getInnerHtmlNumber(channel.querySelector('width')),
          height: getInnerHtmlNumber(channel.querySelector('height')),
          ...extractLocalizedElements(channel.querySelectorAll(':scope > title'))
        }))
        .filter((channel) => {
          if (channel.width === null && channel.height === null) {
            console.warn(
              '[services/configuration/parseSimulatorPanelConfig]' +
                `Filtered out config item with blank/null width/height values. ` +
                `Both values in blank is equivalent to the tool's default preset.`
            );
            return false;
          } else {
            return true;
          }
        })
    };
  }
}

// endregion

// region SidebarConfig

export interface SidebarConfigItem {
  id?: string;
  parameters?: object;
  permittedRoles?: {
    role?: string[];
  };
}

export function getSidebarItems(site: string): Observable<SidebarConfigItem[]> {
  return getRawConfiguration(site, '/context-nav/sidebar.xml', 'studio').pipe(
    map((rawXML) => {
      if (rawXML) {
        const items = Array.from(fromString(rawXML).querySelectorAll('widget'));
        const cleanDoc = fromString(`<?xml version="1.0" encoding="UTF-8"?><root></root>`);
        cleanDoc.documentElement.append(...items);
        return asArray<SidebarConfigItem>(
          toJS(cleanDoc, {
            attributeNamePrefix: '',
            ignoreAttributes: false
          }).root.widget
        ).filter(Boolean);
      } else {
        return [];
      }
    })
  );
}

// endregion

function parsePreviewToolsPanelConfig(element: Element) {
  if (element === null) {
    return null;
  }
  // Inspect config to determine JSON (new way) or XML (old way).
  try {
    let config = getInnerHtml(element);
    return JSON.parse(config);
  } catch (_e) {
    return element.outerHTML;
  }
}

export function getGlobalMenuLinks(site: string) {
  return getRawConfiguration(site, '/context-nav/sidebar.xml', 'studio').pipe(
    map((rawXML) => {
      // The XML has a structure like:
      // {root}.contextNav.contexts.context.groups.group.menuItems.menuItem.modulehooks.modulehook;
      // To avoid excessive traversal, create a transition XML document with just the items.
      if (rawXML) {
        const parsedXML = fromString(rawXML);
        let name = parsedXML.querySelector('modulehooks') ? 'modulehook' : 'widget';
        const items = Array.from(fromString(rawXML).querySelectorAll(name));
        const cleanDoc = fromString(`<?xml version="1.0" encoding="UTF-8"?><root></root>`);
        cleanDoc.documentElement.append(...items);
        return asArray(toJS(cleanDoc).root[name])
          .filter((item) => {
            const link = name === 'widget' ? item.parameters?.link : item.params?.path;
            return link?.includes('/site-dashboard') || link?.includes('/site-config');
          })
          .map((item) => {
            if (name === 'widget') {
              return {
                label: item.parameters.label,
                path: `/studio${item.parameters.link.replace('/studio')}`,
                roles: item.permittedRoles ? item.permittedRoles.role : [],
                icon: item.parameters.icon.baseClass
              };
            } else {
              return {
                label: item.params.label,
                path: `/studio${item.params.path.replace('/studio')}`,
                roles: item.roles ? item.roles.role : [],
                icon: item.name === 'site-config' ? 'fa fa-sliders' : 'fa fa-tasks'
              };
            }
          });
      } else {
        return [];
      }
    })
  );
}

export function getGlobalMenuItems() {
  return get('/studio/api/2/ui/views/global_menu.json');
}

export function getProductLanguages(): Observable<{ id: string; label: string }[]> {
  return get('/studio/api/1/services/api/1/server/get-available-languages.json').pipe(
    pluck('response')
  );
}

export function getHistory(
  site: string,
  path: string,
  environment: string,
  module: string
): Observable<VersionsResponse> {
  return get(
    `/studio/api/2/configuration/get_configuration_history.json?siteId=${site}&path=${path}&environment=${environment}&module=${module}`
  ).pipe(pluck('response', 'history'));
}

export function fetchCannedMessage(site: string, locale: string, type: string): Observable<string> {
  return get(
    `/studio/api/1/services/api/1/site/get-canned-message.json?site=${site}&locale=${locale}&type=${type}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}

export default {
  getProductLanguages,
  getRawConfiguration,
  getConfigurationDOM,
  getGlobalMenuItems,
  getConfigurationHistory: getHistory,
  getSidebarItems
};
