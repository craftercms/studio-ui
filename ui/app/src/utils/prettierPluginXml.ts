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

// TODO: This file is a temporary fix while prettier plugin XML releases suggested fixes.
// @see https://github.com/prettier/plugin-xml/pull/29

import prettier from 'prettier/standalone';
import { Plugin } from 'prettier';

const attrsPattern = '([^\\s=]+)\\s*(=\\s*([\'"])(.*?)\\3)?';

const cDataPattern = '(!\\[CDATA\\[([\\s\\S]*?)(]]>))';

const tagNamePattern = '(([\\w:\\-._]*:)?([\\w:\\-._]+))';
const startTagPattern = `${tagNamePattern}([^>]*)>`;
const endTagPattern = `((\\/)${tagNamePattern}\\s*>)`;

const commentPattern = '(!--)([\\s\\S\\n]*?)-->';
const declPattern = '((\\?xml)(-model)?)(.+)\\?>';

const tagPattern = `<(${cDataPattern}|${startTagPattern}|${endTagPattern}|${commentPattern}|${declPattern})([^<]*)`;

class XMLNode {
  tagname: string;
  children = [];
  parent: XMLNode;
  value: string;
  locStart: number;
  locEnd: number;
  attrs = {};

  constructor(tagname, opts) {
    this.tagname = tagname;
    this.children = [];

    this.parent = opts.parent;
    this.value = opts.value || '';

    this.locStart = opts.locStart || 0;
    this.locEnd = opts.locEnd || 0;

    this.attrs = {};
    this.parseAttrs(opts.attrs);
  }

  parseAttrs(attrs) {
    if (typeof attrs !== 'string' || !attrs) {
      return;
    }

    const normal = attrs.replace(/\r?\n/g, ' ');
    const attrsRegex = new RegExp(attrsPattern, 'g');
    let match;

    while ((match = attrsRegex.exec(normal))) {
      const name = match[1];
      if (name.length) {
        this.attrs[name] = match[4] === undefined ? true : match[4].trim();
      }
    }
  }
}

const parse = (text, _parsers, _opts) => {
  const rootNode = new XMLNode('!root', { locStart: 0, locEnd: text.length });
  let node = rootNode;

  const tagRegex = new RegExp(tagPattern, 'g');
  let tag;

  while ((tag = tagRegex.exec(text))) {
    const value = (tag[20] || '').trim();

    if (tag[17] === '?xml') {
      node.children.push(
        new XMLNode(`!${tag[16]}`, {
          parent: node,
          attrs: tag[19],
          locStart: tag.index,
          locEnd: tag.index + tag[0].trim().length
        })
      );
    } else if (tag[14] === '!--') {
      node.children.push(
        new XMLNode('!comment', {
          parent: node,
          value: tag[0].trim(),
          locStart: tag.index,
          locEnd: tag.index + tag[0].trim().length
        })
      );
    } else if (tag[4] === ']]>') {
      node.children.push(
        new XMLNode('!cdata', {
          parent: node,
          value: tag[3],
          attrs: tag[8],
          locStart: tag.index,
          locEnd: tag.index + tag[0].trim().length
        })
      );

      node.value += `\\c${value}`;
    } else if (tag[10] === '/') {
      node.locEnd = tag.index + tag[0].trim().length;
      node.parent.value += value;
      node = node.parent;
    } else if (
      typeof tag[8] !== 'undefined' &&
      tag[8].charAt(tag[8].length - 1) === '/'
    ) {
      node.value += value;
      node.children.push(
        new XMLNode(tag[5], {
          parent: node,
          attrs: tag[8].slice(0, -1),
          locStart: tag.index,
          locEnd: tag.index + tag[0].trim().length
        })
      );
    } else {
      node = new XMLNode(tag[5], {
        parent: node,
        value,
        attrs: tag[8],
        locStart: tag.index
      });

      node.parent.children.push(node);
    }
  }

  return rootNode;
};

const {
  concat,
  group,
  hardline,
  indent,
  join,
  line,
  softline
// @ts-ignore
} = prettier.doc.builders;

const printAttrs = attrs => {
  if (Object.keys(attrs).length === 0) {
    return '';
  }

  const parts = [line];

  Object.keys(attrs).forEach((key, index) => {
    if (index !== 0) {
      parts.push(line);
    }
    parts.push(key, '=', '"', attrs[key], '"');
  });

  return group(indent(concat(parts)));
};

const printOpeningTag = (name, attrs) => {
  if (name === '!cdata') {
    return '<![CDATA[';
  }
  return group(concat(['<', name, printAttrs(attrs), softline, '>']));
};

const printSelfClosingTag = (name, attrs) => {
  if (name === '!?xml' || name === '!?xml-model') {
    return group(concat(['<', name.slice(1), printAttrs(attrs), line, '?>']));
  }

  return group(concat(['<', name, printAttrs(attrs), line, '/>']));
};

const genericPrint = (path, opts, print) => {
  const { tagname, children, attrs, value } = path.getValue();

  if (tagname === '!root') {
    return concat([join(hardline, path.map(print, 'children')), hardline]);
  }

  if (tagname === '!comment') {
    return group(concat([value]));
  }

  if (Object.keys(children).length === 0 && !value && opts.xmlSelfClosingTags) {
    return printSelfClosingTag(tagname, attrs);
  }

  const openingTag = printOpeningTag(tagname, attrs);
  const closingTag = tagname === '!cdata' ? ']]>' : `</${tagname}>`;

  if (Object.keys(children).length === 0) {
    return group(
      concat([
        openingTag,
        indent(concat([softline, value])),
        softline,
        closingTag
      ])
    );
  }

  let inner;

  if (children.length === 0) {
    inner = softline;
  } else {
    inner = concat([
      indent(concat([hardline, join(hardline, path.map(print, 'children'))])),
      hardline
    ]);
  }

  return group(concat([openingTag, inner, closingTag]));
};

const locStart = node => node.locStart;
const locEnd = node => node.locEnd;

const plugin: Plugin = {
  languages: [
    {
      name: 'XML',
      parsers: ['xml'],
      extensions: ['.dita', '.ditamap', '.ditaval', '.xml'],
      vscodeLanguageIds: ['xml']
    }
  ],
  parsers: {
    xml: {
      parse,
      astFormat: 'xml',
      locStart,
      locEnd
    }
  },
  printers: {
    xml: {
      print: genericPrint
    }
  },
  options: {
    // @ts-ignore
    xmlSelfClosingTags: {
      since: '1.19.1',
      category: 'XML',
      type: 'boolean',
      default: true,
      description: 'Whether or not to allow self closing XML tags.'
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

export default plugin;
