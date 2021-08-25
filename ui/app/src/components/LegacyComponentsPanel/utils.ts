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

import { nanoid as uuid } from 'nanoid';

export const LegacyXmlModelToMap = (dom) => {
  var map = {};
  var children = dom.children ? dom.children : dom.childNodes;

  LegacyXmlModelToMapChildren(map, children);

  /* make sure object has IDs */
  if (!map['objectId']) {
    var UUID = uuid();
    map['objectGroupId'] = UUID.substring(0, 4);
    map['objectId'] = UUID;
  }

  return map;
};

export const LegacyXmlModelToMapChildren = (node, children) => {
  for (var i = 0; i < children.length; i++) {
    try {
      var child = children[i];
      if (child.nodeName !== '#text') {
        // Chrome and FF support childElementCount; for IE we will get the length of the childNodes collection
        var hasChildren =
          typeof child.childElementCount == 'number'
            ? !!child.childElementCount
            : !!child.childNodes.length && child.firstChild.nodeName !== '#text';

        if (hasChildren) {
          LegacyXmlModelToMapArray(node, child);
        } else {
          node[child.nodeName] = LegacyGetModelItemValue(child);
        }
      }
    } catch (err) {}
  }
};

export const LegacyXmlModelToMapArray = (node, child) => {
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
              LegacyXmlModelToMapArray(node[child.nodeName][repeatCount], repeatField);
            } else {
              var value = '';

              try {
                value = LegacyGetModelItemValue(repeatField);
              } catch (noValue) {}

              node[child.nodeName][repeatCount][repeatField.nodeName] = UnEscapeXml(value);
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

export const LegacyGetModelItemValue = (item) => {
  return !item.wholeText ? item.firstChild.wholeText : item.wholeText;
};

export const UnEscapeXml = (value) => {
  if (value && typeof value === 'string') {
    value = value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
  return value;
};
