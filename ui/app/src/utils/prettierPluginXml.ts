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

import parse from '@prettier/plugin-xml/src/parse';
import prettier from 'prettier/standalone';
import { Plugin } from 'prettier';

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
    return group(
      concat(['<!--', indent(concat([line, value])), concat([line, '-->'])])
    );
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
  options: [
    {
      since: '1.19.1',
      category: 'XML',
      type: 'boolean',
      default: true,
      description: 'Whether or not to allow self closing XML tags.'
    }
  ],
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

export default plugin;
