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

  var pluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');
  var hookPluginName = 'craftercms_tinymce_hooks';

  function removeElAttributes(element) {
    const textDecoration = element.style?.textDecoration;
    element.getAttributeNames().forEach((attrName) => {
      if (attrName !== 'href') {
        element.removeAttribute(attrName);
      }
    });
    // We need to keep the textDecoration style under the 'style' attribute if it exists. That's to be able to support
    // strikethrough and underline formatting when pasting content.
    if (textDecoration) {
      element.style.textDecoration = textDecoration;
    }
  }

  // There's an issue in tinymce when pasting lists where it doesn't wrap the 'li' elements property in their own 'ol' or 'ul'.
  // This function joins all the ol|ul elements with the issue (groups of 'ol' or 'ul')
  // @listType: 'UL' | 'OL'
  function fixLists(element, listType) {
    const lists = Array.from(element.getElementsByTagName(listType)).filter((list) => {
      // First item of lists will always be in a separate ul|ol.
      return list.childElementCount === 1;
    });
    lists.forEach((list) => {
      let haveListSiblings = list.nextElementSibling?.tagName === listType;
      while (haveListSiblings) {
        if (list.nextElementSibling.children) {
          Array.from(list.nextElementSibling.children).forEach((item) => {
            list.appendChild(item);
          });
          list.nextElementSibling.remove();
        }
        // getting next ol sibling (may not exist) so it can continue checking/joining the lists.
        haveListSiblings = list.nextElementSibling?.tagName === listType;
      }
    });
  }

  function cleanup(parentNode) {
    removeElAttributes(parentNode);
    fixLists(parentNode, 'OL');
    fixLists(parentNode, 'UL');
    parentNode.querySelectorAll('*').forEach((node) => {
      removeElAttributes(node);
    });
  }

  var shouldCleanup = function (editor) {
    return editor.getParam('craftercms_paste_cleanup', true);
  };

  pluginManager.add('craftercms_paste_extension', function (editor) {
    return {
      paste_preprocess(plugin, args) {
        editor.plugins[hookPluginName]?.paste_preprocess?.(plugin, args);
      },
      paste_postprocess(plugin, args) {
        shouldCleanup(editor) && cleanup(args.node);
        editor.plugins[hookPluginName]?.paste_postprocess?.(plugin, args);
      }
    };
  });
})();
