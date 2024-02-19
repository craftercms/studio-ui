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

import { nanoid as uuid } from 'nanoid';
import { Observable } from 'rxjs';
import { fetchConfigurationJSON } from '../../services/configuration';
import { map, switchMap } from 'rxjs/operators';
import { LookupTable } from '../../models/LookupTable';
import { ContentType } from '../../models/ContentType';
import { fetchContentInstance, insertInstance } from '../../services/content';

export const legacyXmlModelToMap = (dom) => {
  let map = {};
  let children = dom.children ? dom.children : dom.childNodes;

  legacyXmlModelToMapChildren(map, children);

  /* make sure object has IDs */
  if (!map['objectId']) {
    let UUID = uuid();
    map['objectGroupId'] = UUID.substring(0, 4);
    map['objectId'] = UUID;
  }

  return map;
};

export const legacyXmlModelToMapChildren = (node, children) => {
  for (let i = 0; i < children.length; i++) {
    try {
      let child = children[i];
      if (child.nodeName !== '#text') {
        // Chrome and FF support childElementCount; for IE we will get the length of the childNodes collection
        let hasChildren =
          typeof child.childElementCount == 'number'
            ? !!child.childElementCount
            : !!child.childNodes.length && child.firstChild.nodeName !== '#text';

        if (hasChildren) {
          legacyXmlModelToMapArray(node, child);
        } else {
          node[child.nodeName] = legacyGetModelItemValue(child);
        }
      }
    } catch (err) {}
  }
};

export const legacyXmlModelToMapArray = (node, child) => {
  // array/repeat item
  node[child.nodeName] = [];

  let repeatCount = 0;
  let repeatChildren = child.children ? child.children : child.childNodes;

  for (let j = 0; j < repeatChildren.length; j++) {
    try {
      let repeatChild = repeatChildren[j];

      if (repeatChild.nodeName !== '#text') {
        node[child.nodeName][repeatCount] = {};
        node[child.nodeName][repeatCount] = repeatChild.getAttribute('datasource')
          ? {
              datasource: repeatChild.getAttribute('datasource')
            }
          : {};
        let repeatChildChildren = repeatChild.children ? repeatChild.children : repeatChild.childNodes;

        for (let k = 0; k < repeatChildChildren.length; k++) {
          let repeatField = repeatChildChildren[k];

          if (repeatField.nodeName !== '#text' && repeatField.nodeName !== 'component') {
            if (repeatField.childElementCount > 0) {
              legacyXmlModelToMapArray(node[child.nodeName][repeatCount], repeatField);
            } else {
              let value = '';

              try {
                value = legacyGetModelItemValue(repeatField);
              } catch (noValue) {}

              node[child.nodeName][repeatCount][repeatField.nodeName] = unEscapeXml(value);
            }
          }
        }

        // eslint-disable-next-line no-loop-func
        Array.from(repeatChild.attributes).forEach((attr) => {
          // @ts-ignore
          const { nodeName, nodeValue } = attr;
          node[child.nodeName][repeatCount] = { ...node[child.nodeName][repeatCount], [nodeName]: nodeValue };
        });

        repeatCount++;
      }
    } catch (repeatErr) {
      console.log(repeatErr);
    }
  }
};

export const legacyGetModelItemValue = (item) => {
  return !item.wholeText ? item.firstChild.wholeText : item.wholeText;
};

export const unEscapeXml = (value) => {
  if (value && typeof value === 'string') {
    value = value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
  return value;
};

export const legacyLoadFormDefinition = (siteId: string, contentType: string): Observable<unknown> => {
  return fetchConfigurationJSON(siteId, `/content-types/${contentType}/form-definition.xml`, 'studio').pipe(
    map((config) => {
      let def = config.form;
      def.contentType = contentType;

      // handle datasources

      if (!def.datasources || typeof def.datasources === 'string') {
        def.datasources = [];
      } else {
        def.datasources = def.datasources.datasource;
      }

      if (!def.datasources.length) {
        def.datasources = [].concat(def.datasources);
      }

      for (let k = 0; k < def.datasources.length; k++) {
        let datasource = def.datasources[k];
        datasource.form = def;

        if (!datasource.properties || !datasource.properties.property) {
          datasource.properties = [];
        } else {
          datasource.properties = datasource.properties.property;
          if (!datasource.properties.length) {
            datasource.properties = [].concat(datasource.properties);
          }
        }
      }

      // handle form properties
      if (!def.properties || !def.properties.property) {
        def.properties = [];
      } else {
        def.properties = def.properties.property;
        if (!def.properties.length) {
          def.properties = [def.properties];
        }
      }

      // handle form dections
      if (!def.sections || !def.sections.section) {
        def.sections = [];
      } else {
        def.sections = def.sections.section;
        if (!def.sections.length) {
          def.sections = [].concat(def.sections);
        }
      }

      for (let i = 0; i < def.sections.length; i++) {
        let section = def.sections[i];
        section.form = def;
        section.id = section.title.replace(/ /g, '');

        let processFieldsFn = (container) => {
          if (!container.fields || !container.fields.field) {
            container.fields = [];
          } else {
            container.fields = container.fields.field;
            if (!container.fields.length) {
              container.fields = [].concat(container.fields);
            }
          }

          for (let j = 0; j < container.fields.length; j++) {
            let field = container.fields[j];
            if (field) {
              if (!field.properties || !field.properties.property) {
                field.properties = [];
              } else {
                field.properties = field.properties.property;
                if (!field.properties.length) {
                  field.properties = [].concat(field.properties);
                }
              }

              if (!field.constraints || !field.constraints.constraint) {
                field.constraints = [];
              } else {
                field.constraints = field.constraints.constraint;

                if (!field.constraints.length) {
                  field.constraints = [].concat(field.constraints);
                }
              }

              if (field.type === 'repeat') {
                processFieldsFn(field);
              }
            }
          }
        };

        processFieldsFn(section);
      }

      return def;
    })
  );
};

export const fetchAndInsertContentInstance = (
  siteId: string,
  parentPath: string,
  childPath: string,
  fieldId: string,
  index: number,
  datasource: string,
  contentTypesLookup: LookupTable<ContentType>,
  parentModelId: string,
  parentContentTypeId: string
): Observable<any> => {
  return fetchContentInstance(siteId, childPath, contentTypesLookup).pipe(
    switchMap((contentInstance) => {
      const parentContentType: ContentType = contentTypesLookup[parentContentTypeId];
      return insertInstance(
        siteId,
        parentPath,
        parentModelId,
        fieldId,
        index,
        parentContentType,
        contentInstance,
        datasource
      );
    })
  );
};
