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

import prettierXmlPlugin from '@prettier/plugin-xml';
import prettier from 'prettier/standalone';
import { nnou } from './object';
import { XMLParser, X2jOptionsOptional } from 'fast-xml-parser';
import { legacyUnescapeXml } from './string';

export function fromString(xml: string): XMLDocument {
  return xml != null ? new DOMParser().parseFromString(xml, 'text/xml') : null;
}

export function serialize(doc: Node, options?: { format: boolean }): string {
  options = Object.assign({ format: true }, options || {});
  const content = new XMLSerializer().serializeToString(doc);
  return options.format ? beautify(content, { printWidth: +Infinity }) : content;
}

interface BeautifyOptions {
  tabWidth: number;
  printWidth: number;
  xmlWhitespaceSensitivity: 'ignore' | 'strict';
  xmlSelfClosingSpace: boolean;
}

export function beautify(xml: string): string;
export function beautify(xml: string, options: Partial<BeautifyOptions>): string;
export function beautify(xml: string, options?: Partial<BeautifyOptions>): string {
  return prettier.format(xml, {
    tabWidth: 2,
    printWidth: 100,
    xmlWhitespaceSensitivity: 'ignore',
    xmlSelfClosingSpace: true,
    ...options,
    // @ts-ignore
    parser: 'xml',
    plugins: [prettierXmlPlugin]
  });
}

interface GetInnerHtmlOptions {
  trim: boolean;
  applyLegacyUnescaping: boolean;
}

export function getInnerHtml(element: Element): string;
export function getInnerHtml(element: Element, options: Partial<GetInnerHtmlOptions>): string;
export function getInnerHtml(element: Element, options?: Partial<GetInnerHtmlOptions>): string {
  let opts = Object.assign({ trim: true, applyLegacyUnescaping: false } as GetInnerHtmlOptions, options);
  let content = element?.innerHTML;
  if (content) {
    // @ts-ignore downlevelIteration
    const matches = [...content.matchAll(/<!\[CDATA\[([\s\S\n]*?)\]\]>/g)];
    if (matches.length > 0) {
      content = matches[0][1].trim();
    }
    if (opts.trim) {
      content = content.trim();
    }
    if (opts.applyLegacyUnescaping) {
      content = legacyUnescapeXml(content);
    }
  }
  return nnou(content) ? content : null;
}

export function getInnerHtmlNumber(element: Element, parser = parseInt): number {
  const content = getInnerHtml(element);
  const num = parser(content);
  if (content === null || content === '') {
    return null;
  } else if (isNaN(num)) {
    console.error(`[utils/xml/getInnerHtmlNumber] Expected number but got NaN. Received value was "${content}".`);
    return null;
  } else {
    return num;
  }
}

export function extractLocalizedElements(nodes: Array<Element> | NodeListOf<Element>) {
  const items: any = {};
  if (!Array.isArray(nodes)) {
    nodes = Array.from(nodes);
  }
  nodes.forEach((tag) => {
    const tagName = tag.tagName;
    const lang = tag.getAttribute('lang');
    if (lang === null) {
      items[tagName] = getInnerHtml(tag);
    } else {
      items[`tagName_${lang}`] = getInnerHtml(tag);
    }
  });
  return items;
}

export function commentless(xml: string) {
  return xml.replace(/<!--[\s\S\n]*?-->/g, '');
}

export function findDocumentElement(element: Element) {
  do {
    if (element instanceof XMLDocument) {
      return element;
    }
    element = element?.parentNode as Element;
  } while (element);
  return null;
}

export function createElements(element: Element, data: object): void {
  Object.entries(data).forEach(([tag, content]) => {
    if (tag === '@attributes') {
      Object.entries(content).forEach(([attr, value]) => {
        element.setAttribute(attr, `${value}`);
      });
    } else {
      const elem = createElement(tag);
      if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
        elem.innerHTML = `${content}`;
      } else if (Array.isArray(content)) {
        elem.setAttribute('item-list', 'true');
        if (content.length) {
          if (typeof content[0] === 'object') {
            content.forEach((itemData) => {
              const item = createElement('item');
              createElements(item, itemData);
              elem.appendChild(item);
            });
          } else {
            console.error(
              `[utils/xml/createElements] Incorrect data supplied. Received an array with items of type ${typeof content[0]}.`,
              content
            );
          }
        }
      } else if (content instanceof Element) {
        elem.appendChild(content);
      } else if (content !== null && content !== void 0) {
        createElements(elem, content);
      }
      element.appendChild(elem);
    }
  });
}

export function wrapElementInAuxDocument(element: Element): XMLDocument {
  return fromString(`<?xml version="1.0" encoding="UTF-8"?>${element.outerHTML}`);
}

export function newXMLDocument(rootTagName = 'root'): XMLDocument {
  // With the document.implementation.createDocument, new elements then inserted into the xml document
  // end up with an undesirable namespace and serialization looses the case, so sticking with creating from string.
  return fromString(`<?xml version="1.0" encoding="UTF-8"?><${rootTagName} />`);
}

export function createElement(tagName: string): Element;
export function createElement(tagName: string, options: ElementCreationOptions): Element;
export function createElement(tagName: string, options?: ElementCreationOptions): Element {
  return newXMLDocument().createElement(tagName, options);
}

export function deserialize(xml: string): any;
export function deserialize(xml: Node): any;
export function deserialize(xml: string, options: X2jOptionsOptional): any;
export function deserialize(xml: Node, options: X2jOptionsOptional): any;
export function deserialize(xml: string | Node, options?: X2jOptionsOptional): any {
  const parser = new XMLParser({
    attributeNamePrefix: '',
    ignoreAttributes: false,
    htmlEntities: true,
    ignoreDeclaration: true,
    ...options
  });
  if (typeof xml !== 'string') {
    xml = serialize(xml);
  }
  return parser.parse(xml);
}

export function cdataWrap(value: string): string {
  return `<![CDATA[${value}]]>`;
}

export function parseValidateDocument(content: string): XMLDocument | string {
  const xml = fromString(content);
  const parseError = xml.querySelector('parsererror');

  if (parseError) {
    return parseError.querySelector('div').innerText;
  }

  return xml;
}

export const entityEncodingTagValueProcessor = (tag, value) =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
