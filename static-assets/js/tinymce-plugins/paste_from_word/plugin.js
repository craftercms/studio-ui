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

(function () {

  'use strict';

  const PLUGIN_LABEL = 'paste_from_word';
  const PASTE_TEXT_ICON = 'paste-text';
  const PASTE_TEXT_TOOLTIP = 'Paste as text';
  const DEFAULT_VALID_ELEMENTS = '-strong/b,-em/i,-u,-span,-p,-ol,-ul,-li,-h1,-h2,-h3,-h4,-h5,-h6,-h7,-h8,-pre,-p/div,-a[href|name],sub,sup,pre,blockquote,strike,br,del,table[width],tr,td[colspan|rowspan|width],th[colspan|rowspan|width],thead,tfoot,tbody';

  const nbsp = '\u00A0';

  const Utils = {
    isRegExp: (value) => {
      return Object.prototype.toString.call(value) === '[object RegExp]';
    },
    filter: (content, items) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (Utils.isRegExp(item)) {
          content = content.replace(item, '');
        } else {
          content = content.replace(item[0], item[1]);
        }
      }

      return content;
    },
    isNewLineChar: (c) => {
      return c === '\r' || c === '\n';
    },
    getForcedRootBlock: (editor) => {
      const block = editor.getParam('forced_root_block');
      return block;
    },
    getForcedRootBlockAttrs: (editor) => {
      const rootBlockAttrs = editor.getParam('forced_root_block_attrs');
      return rootBlockAttrs;
    },
    isCollapsibleWhitespace: (c) => {
      return ' \f\t\v'.indexOf(c) !== -1
    }
  };

  const isWordContent = (content) => {
    return /<font face="Times New Roman"|class="?Mso|style="[^"]*\bmso-|style='[^']*\bmso-|w:WordDocument/i.test(content) || /class="OutlineElement/.test(content) || /id="?docs\-internal\-guid\-/.test(content);
  };

  const normalizeWhitespace = (editor, text) => {
    // Replace tabs with a variable amount of spaces
    // Note: We don't use an actual tab character here, as it only works when in a "whitespace: pre" element,
    // which will cause other issues, such as trying to type the content will also be treated as being in a pre.
    const normalizedText = text.replace(/\t/g, '  ');

    const result = normalizedText.split().reduce((acc, c) => {
      // Are we dealing with a char other than some collapsible whitespace or nbsp? if so then just use it as is
      if (Utils.isCollapsibleWhitespace(c) || c === nbsp) {
        // If the previous char is a space, we are at the start or end, or if the next char is a new line char, then we need
        // to convert the space to a nbsp
        if (acc.pcIsSpace || acc.str === '' || acc.str.length === normalizedText.length - 1 || isNewline(normalizedText, acc.str.length + 1)) {
          return { pcIsSpace: false, str: acc.str + nbsp };
        } else {
          return { pcIsSpace: true, str: acc.str + ' ' };
        }
      } else {
        // Treat newlines as being a space, since we'll need to convert any leading spaces to nsbps
        return { pcIsSpace: Utils.isNewLineChar(c), str: acc.str + c };
      }
    }, { pcIsSpace: false, str: '' });

    return result.str;
  };

  const toBRs = (text) => {
    return text.replace(/\r?\n/g, '<br>');
  };

  const openContainer = (rootTag, rootAttrs) => {
    const attrs = [];
    let tag = '<' + rootTag;

    if (typeof rootAttrs === 'object') {
      for (const key in rootAttrs) {
        if (Obj.has(rootAttrs, key)) {
          attrs.push(key + '="' + tinymce.html.Entities.encodeAllRaw(rootAttrs[key]) + '"');
        }
      }

      if (attrs.length) {
        tag += ' ' + attrs.join(' ');
      }
    }
    return tag + '>';
  };

  const toBlockElements = (text, rootTag, rootAttrs) => {
    const blocks = text.split(/\n\n/);
    const tagOpen = openContainer(rootTag, rootAttrs);
    const tagClose = '</' + rootTag + '>';

    const paragraphs = Tools.map(blocks, (p) => {
      return p.split(/\n/).join('<br />');
    });

    const stitch = (p) => {
      return tagOpen + p + tagClose;
    };

    return paragraphs.length === 1 ? paragraphs[0] : paragraphs.map(stitch).join('');
  }

  const convert = (text, rootTag, rootAttrs) => {
    return rootTag ? toBlockElements(text, rootTag === true ? 'p' : rootTag, rootAttrs) : toBRs(text);
  };

  const filterStyles = (editor, node, styleValue) => {
    const outputStyles = {};
    const styles = editor.dom.parseStyle(styleValue);

    const keys = Object.keys(styles);

    for (let i = 0; i < keys.length; i++) {
      let name = keys[i];
      const value = styles[name];
      switch (name) {
        case 'mso-list':
          // Parse out list indent level for lists
          const matches = /\w+ \w+([0-9]+)/i.exec(styleValue);
          if (matches) {
            node._listLevel = parseInt(matches[1], 10);
          }

          // Remove these nodes <span style="mso-list:Ignore">o</span>
          // Since the span gets removed we mark the text node and the span
          if (/Ignore/i.test(value) && node.firstChild) {
            node._listIgnore = true;
            (node.firstChild)._listIgnore = true;
          }

          break;

        case 'horiz-align':
          name = 'text-align';
          break;

        case 'vert-align':
          name = 'vertical-align';
          break;

        case 'font-color':
        case 'mso-foreground':
          name = 'color';
          break;

        case 'mso-background':
        case 'mso-highlight':
          name = 'background';
          break;

        case 'font-weight':
        case 'font-style':
          if (value !== 'normal') {
            outputStyles[name] = value;
          }
          continue;

        case 'mso-element':
          // Remove track changes code
          if (/^(comment|comment-list)$/i.test(value)) {
            node.remove();
            continue;
          }

          break;
      }

      if (name.indexOf('mso-comment') === 0) {
        node.remove();
        continue;
      }

      // Never allow mso- prefixed names
      if (name.indexOf('mso-') === 0) {
        continue;
      }

      outputStyles[name] = value;
    }

    // Convert bold style to "b" element
    if (/(bold)/i.test(outputStyles['font-weight'])) {
      delete outputStyles['font-weight'];
      node.wrap(new tinymce.html.Node('strong', 1));
    }

    // Convert italic style to "i" element
    if (/(italic)/i.test(outputStyles['font-style'])) {
      delete outputStyles['font-style'];
      node.wrap(new tinymce.html.Node('i', 1));
    }

    // Serialize the styles and see if there is something left to keep
    const outputStyle = editor.dom.serializeStyle(outputStyles, node.name);
    if (outputStyle) {
      return outputStyle;
    }

    return null;
  };

  const filterWordContent = (editor, content) => {
    const wordItems = [
      // Remove apple new line markers
      /<br class="?Apple-interchange-newline"?>/gi,

      // Remove google docs internal guid markers
      /<b[^>]+id="?docs-internal-[^>]*>/gi,

      // Word comments like conditional comments etc
      /<!--[\s\S]+?-->/gi,

      // Remove comments, scripts (e.g., msoShowComment), XML tag, VML content,
      // MS Office namespaced tags, and a few other tags
      /<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,

      // Convert <s> into <strike> for line-though
      [ /<(\/?)s>/gi, '<$1strike>' ],

      // Replace nsbp entities to char since it's easier to handle
      [ /&nbsp;/gi, nbsp ],

      // Convert <span style="mso-spacerun:yes">___</span> to string of alternating
      // breaking/non-breaking spaces of same length
      [ /<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,
        (str, spaces) => {
          return (spaces.length > 0) ?
            spaces.replace(/./, ' ').slice(Math.floor(spaces.length / 2)).split('').join(nbsp) : '';
        }
      ]
    ];
    content = Utils.filter(content, wordItems);

    // Parse HTML into DOM structure
    const domParser = new tinymce.html.DomParser({}, editor.schema);

    // Filter styles to remove "mso" specific styles and convert some of them
    domParser.addAttributeFilter('style', (nodes) => {
      let i = nodes.length, node;

      while (i--) {
        node = nodes[i];
        node.attr('style', filterStyles(editor, node, node.attr('style')));

        // Remove pointless spans
        if (node.name === 'span' && node.parent && !node.attributes.length) {
          node.unwrap();
        }
      }
    });

    // Check the class attribute for comments or del items and remove those
    domParser.addAttributeFilter('class', (nodes) => {
      let i = nodes.length, node, className;

      while (i--) {
        node = nodes[i];

        className = node.attr('class');
        if (/^(MsoCommentReference|MsoCommentText|msoDel)$/i.test(className)) {
          node.remove();
        }

        node.attr('class', null);
      }
    });

    // Remove all del elements since we don't want the track changes code in the editor
    domParser.addNodeFilter('del', (nodes) => {
      let i = nodes.length;

      while (i--) {
        nodes[i].remove();
      }
    });

    // Keep some of the links and anchors
    domParser.addNodeFilter('a', (nodes) => {
      let i = nodes.length, node, href, name;

      while (i--) {
        node = nodes[i];
        href = node.attr('href');
        name = node.attr('name');

        if (href && href.indexOf('#_msocom_') !== -1) {
          node.remove();
          continue;
        }

        if (href && href.indexOf('file://') === 0) {
          href = href.split('#')[1];
          if (href) {
            href = '#' + href;
          }
        }

        if (!href && !name) {
          node.unwrap();
        } else {
          // Remove all named anchors that aren't specific to TOC, Footnotes or Endnotes
          if (name && !/^_?(?:toc|edn|ftn)/i.test(name)) {
            node.unwrap();
            continue;
          }

          node.attr({
            href,
            name
          });
        }
      }
    });

    // Parse into DOM structure
    const rootNode = domParser.parse(content);

    // Serialize DOM back to HTML
    content = new tinymce.html.Serializer().serialize(rootNode);

    return content;
  };
  const filterHtmlContent = (editor, content) => {
    const validElements = editor.settings.paste_word_valid_elements || DEFAULT_VALID_ELEMENTS;

    const schema = new tinymce.html.Schema({
      valid_elements: validElements,
      valid_children: '-li[p]'
    });

    // Parse HTML into DOM structure
    const domParser = new tinymce.html.DomParser({}, schema);

    // remove all styles
    domParser.addAttributeFilter('style', (nodes) => {
      let i = nodes.length, node;

      while (i--) {
        node = nodes[i];
        node.attr('style', null);
      }
    });

    // remove all classes
    domParser.addAttributeFilter('class', (nodes) => {
      let i = nodes.length, node, className;

      while (i--) {
        node = nodes[i];
        node.attr('class', null);
      }
    });

    // strip p tag with only <br> children
    domParser.addNodeFilter('p', (nodes) => {
      let i = nodes.length, node;

      while (i--) {
        node = nodes[i];
        let child = node.firstChild;
        let shouldUnwrap = true;
        while (child) {
          if (child.name.toLowerCase() !== 'br') {
            shouldUnwrap = false;
            break;
          }
          child = child.next;
        }
        if (shouldUnwrap) {
          node.unwrap();
        }
      }
    });

    // Parse into DOM structure
    const rootNode = domParser.parse(content);

    // Serialize DOM back to HTML
    content = new tinymce.html.Serializer().serialize(rootNode);

    return content;
  };

  const getDataTransferItems = (dataTransfer) => {
    const items = {};
    const mceInternalUrlPrefix = 'data:text/mce-internal,';
    if (dataTransfer) {
      if (dataTransfer.getData) {
        const legacyText = dataTransfer.getData('Text');
        if (legacyText && legacyText.length > 0) {
          if (legacyText.indexOf(mceInternalUrlPrefix) === -1) {
            items['text/plain'] = legacyText;
          }
        }
      }
      if (dataTransfer.types) {
        for (let i = 0; i < dataTransfer.types.length; i++) {
          const contentType = dataTransfer.types[i];
          try {
            items[contentType] = dataTransfer.getData(contentType);
          } catch (ex) {
            items[contentType] = '';
          }
        }
      }
    }
    return items;
  };

  const getClipboardContent = (editor, clipboardEvent) => {
    return getDataTransferItems(clipboardEvent.clipboardData || editor.getDoc().dataTransfer);
  };

  const pasteAsText = (data, editor) => {
    const encodedText = editor.dom.encode(data['text/plain']).replace(/\r\n/g, '\n');
    const normalizedText = normalizeWhitespace(editor, encodedText);
    const content = convert(normalizedText);
    editor.execCommand('mceInsertContent', false, content);
  };

  const pasteHtml = (data, editor) => {
    let content = data['text/html'];
    if (isWordContent(content)) {
      content = filterWordContent(editor, content);
    }

    content = filterHtmlContent(editor, content);

    editor.execCommand('mceInsertContent', false, content);
  };

  tinymce.PluginManager.add(PLUGIN_LABEL, function (editor, url) {
    let pasteAsTextOption = false;

    editor.ui.registry.addToggleButton(PLUGIN_LABEL, {
      active: false,
      icon: PASTE_TEXT_ICON,
      tooltip: PASTE_TEXT_TOOLTIP,
      onAction: function (api) {
        pasteAsTextOption = !pasteAsTextOption;
        api.setActive(pasteAsTextOption);
        editor.focus();
      },
      onSetup: function (api) {
        editor.on('PastePlainTextToggle', function (e) {
          api.setActive(e.state);
          editor.focus();
        });
      }
    });

    editor.ui.registry.addToggleMenuItem(PLUGIN_LABEL, {
      text: PASTE_TEXT_TOOLTIP,
      icon: PASTE_TEXT_ICON,
      tooltip: PASTE_TEXT_TOOLTIP,
      onAction: function (api) {
        pasteAsTextOption = !pasteAsTextOption;
        editor.fire('PastePlainTextToggle', { state: pasteAsTextOption });
      },
      onSetup: function (api) {
        api.setActive(pasteAsTextOption);
        return function () {};
      }
    });

    editor.on('paste', function (e) {
      e.preventDefault();

      const data = getClipboardContent(editor, e);
      const isHtml = data['text/html'] !== undefined;
      if (!pasteAsTextOption && isHtml) {
        pasteHtml(data, editor);
      } else {
        pasteAsText(data, editor);
      }
    });
  });

  return {
    getMetadata: function () {
      return {
        name: 'A Plugin to paste from Word',
        url: '#'
      };
    }
  };
})();