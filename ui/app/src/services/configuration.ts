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

import { get } from '../utils/ajax';
import { map, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { extractLocalizedElements, fromString, getInnerHtml, getInnerHtmlNumber } from '../utils/xml';
import ContentType from "../models/ContentType";
import { createLookupTable, reversePluckProps } from "../utils/object";
import ContentInstance from "../models/ContentInstance";

type CrafterCMSModules = 'studio' | 'engine';

export function getRawContent(site: string, configPath: string, module: CrafterCMSModules): Observable<string> {
  return get(`/studio/api/2/configuration/get_configuration?siteId=${site}&module=${module}&path=${configPath}`).pipe(
    map(({ response }) => response.content)
  );
}

export function getDOM(site: string, configPath: string, module: CrafterCMSModules): Observable<XMLDocument> {
  return getRawContent(site, configPath, module).pipe(map(fromString));
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

interface PreviewToolsConfig {
  modules: Array<PreviewToolsModuleDescriptor>;
}

interface craftercmsModel {
  id: string;

  [prop: string]: string;
}

// region AudiencesPanelConfig

const LegacyPanelIdMap: any = {
  'ice-tools-panel': 'craftercms.ice.ice',
  'component-panel': 'craftercms.ice.components',
  'medium-panel': 'craftercms.ice.simulator',
  'targeting': 'craftercms.ice.audiences'
};

const audienceTypesMap: any = {
  'input': 'input',
  'dropdown': 'dropdown',
  'checkboxes': 'checkbox-group',
  'datetime': 'date-time'
};

export function getPreviewToolsConfig(site: string): Observable<PreviewToolsConfig> {
  return getRawContent(site, `/preview-tools/panel.xml`, 'studio').pipe(
    map((content) => {
      try {
        return JSON.parse(content);
      } catch (e) {
        // Not JSON, assuming XML
        let previewToolsConfig: PreviewToolsConfig = { modules: null };
        const xml = fromString(content);
        previewToolsConfig.modules = Array.from(xml.querySelectorAll('module')).map((elem) => {

          let id = (
            // Try the new way first
            elem.getAttribute('id') ||
            // ...try the old way if no id attribute is found
            getInnerHtml(elem.querySelector('moduleName'))
          );
          if (LegacyPanelIdMap[id]) {
            id = LegacyPanelIdMap[id];
          }

          const configNode = elem.querySelector('config');
          let config = (id === 'craftercms.ice.simulator')
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

export function getAudiencesPanelConfig(site: string): Observable<ContentType> {
  return getRawContent(site, `/targeting/targeting-config.xml`, 'studio').pipe(
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
            defaultValue = getInnerHtml(elem.querySelector('default_value')),
            hint = getInnerHtml(elem.querySelector('hint'));
          let possibleValues: { label: string, value: string }[];

          if (elem.querySelectorAll('value').length > 0) {
            possibleValues = Array.from(elem.querySelectorAll('value')).map((element) => {
              const value = getInnerHtml(element);
              return {
                label: value,
                value: value
              }
            });
          }else{
            possibleValues = [];
          }

          return {
            id: name,
            name: label,
            type: audienceTypesMap[type],
            sortable: null,
            validations: null,
            defaultValue,
            required: null,
            fields: null,
            values: possibleValues,
            helpText: hint
          }

        });

        audiencesPanelContentType.fields = createLookupTable(properties, 'id');

        return audiencesPanelContentType;
      }
    })
  );
}

// TODO: asses the location of profile methods.
export function fetchActiveProfile(): Observable<ContentInstance> {
  let audiencesPanelModel: ContentInstance;
  return get(`/api/1/profile/get`).pipe(map(response => {
    const propsKeys = reversePluckProps(response.response, 'id');
    const props = {};
    const id = response.response.id ? response.response.id : null;

    for (let [key, value] of Object.entries(propsKeys)) {
      props[key] = {
        key: value,
        label: value
      }
    }

    audiencesPanelModel = {
      craftercms: id,
      ...props
    };

    return audiencesPanelModel;
  }));
}

export function setActiveProfile(params: string): Observable<craftercmsModel> {
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
      channels: Array.from(element.querySelectorAll('channel')).map((channel) => ({
        width: getInnerHtmlNumber(channel.querySelector('width')),
        height: getInnerHtmlNumber(channel.querySelector('height')),
        ...extractLocalizedElements(channel.querySelectorAll(':scope > title'))
      })).filter((channel) => {
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


// endregion

export function getGlobalMenuItems() {
  return get('/studio/api/2/ui/views/global_menu.json');
}

export default {
  getRawContent,
  getDOM,
  getGlobalMenuItems
}
