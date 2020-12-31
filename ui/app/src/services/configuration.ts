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
import { deserialize, fromString, getInnerHtml } from '../utils/xml';
import ContentType, { ContentTypeField } from '../models/ContentType';
import { applyDeserializedXMLTransforms, createLookupTable, reversePluckProps, toQueryString } from '../utils/object';
import ContentInstance from '../models/ContentInstance';
import { VersionsResponse } from '../models/Version';
import uiConfigDefaults from '../assets/uiConfigDefaults';
import LookupTable from '../models/LookupTable';
import GlobalState from '../models/GlobalState';

type CrafterCMSModules = 'studio' | 'engine';

export function getRawConfiguration(site: string, configPath: string, module: CrafterCMSModules): Observable<string> {
  return get(`/studio/api/2/configuration/get_configuration?siteId=${site}&module=${module}&path=${configPath}`).pipe(
    pluck('response', 'content')
  );
}

export function getConfigurationDOM(
  site: string,
  configPath: string,
  module: CrafterCMSModules
): Observable<XMLDocument> {
  return getRawConfiguration(site, configPath, module).pipe(map(fromString));
}

export function writeConfiguration(
  site: string,
  path: string,
  module: CrafterCMSModules,
  content: string
): Observable<any> {
  return postJSON('/studio/api/2/configuration/write_configuration', {
    siteId: site,
    module,
    path,
    content
  });
}

// region AudiencesPanelConfig

const audienceTypesMap: any = {
  input: 'input',
  dropdown: 'dropdown',
  checkboxes: 'checkbox-group',
  datetime: 'date-time'
};

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

// region SidebarConfig

export function getSiteUiConfig(
  site: string
): Observable<Omit<GlobalState['uiConfig'], 'error' | 'isFetching' | 'currentSite'>> {
  return getConfigurationDOM(site, '/ui.xml', 'studio').pipe(
    map((xml) => {
      if (xml) {
        const widgets = xml.querySelector('[id="craftercms.components.ToolsPanel"] > configuration > widgets');
        if (widgets) {
          // When rendering widgets dynamically and changing pages on the tools panel, if there are duplicate react key
          // props across pages, react may no swap the components correctly, incurring in unexpected behaviours.
          // We need a unique key for each widget.
          widgets.querySelectorAll('widget').forEach((e, index) => e.setAttribute('uiKey', String(index)));
          const arrays = ['widgets', 'roles', 'excludes', 'devices', 'values'];
          const lookupTables = ['fields'];
          const renameTable = { permittedRoles: 'roles' };
          return {
            preview: {
              toolsPanel: applyDeserializedXMLTransforms(deserialize(widgets), { arrays, lookupTables, renameTable })
            },
            // TODO: parse XML.
            globalNav: {
              sections: []
            }
          };
        } else {
          return uiConfigDefaults;
        }
      } else {
        return uiConfigDefaults;
      }
    })
  );
}

// endregion

export function getGlobalMenuItems(): Observable<{ id: string; icon: string; label: string }[]> {
  return get('/studio/api/2/ui/views/global_menu.json').pipe(pluck('response', 'menuItems'));
}

export function getProductLanguages(): Observable<{ id: string; label: string }[]> {
  return get('/studio/api/1/services/api/1/server/get-available-languages.json').pipe(pluck('response'));
}

export function getHistory(
  site: string,
  path: string,
  environment: string,
  module: string
): Observable<VersionsResponse> {
  const parsedPath = encodeURIComponent(path.replace('/config/studio', ''));

  return get(
    `/studio/api/2/configuration/get_configuration_history.json?siteId=${site}&path=${parsedPath}&environment=${environment}&module=${module}`
  ).pipe(pluck('response', 'history'));
}

export function fetchCannedMessage(site: string, locale: string, type: string): Observable<string> {
  return get(
    `/studio/api/1/services/api/1/site/get-canned-message.json?site=${site}&locale=${locale}&type=${type}`
  ).pipe(pluck('response'), catchError(errorSelectorApi1));
}
