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

tinymce.PluginManager.add('paste_cleanup', function (editor, url) {
  const removeElAttributes = (element) => {
    element.getAttributeNames().forEach((attrName) => {
      element.removeAttribute(attrName);
    });
  };

  // There's an issue in tinymce when pasting lists where it doesn't wrap the 'li' elements property in their own 'ol' or 'ul'.
  // This function joins all of the ol|ul elements with the issue (groups of 'ol' or 'ul')
  // @listType: 'UL' | 'OL'
  const fixLists = (element, listType) => {
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
        // getting next ol sibling (may not exists) so it can continue checking/joining the lists.
        haveListSiblings = list.nextElementSibling?.tagName === listType;
      }
    });
  };

  return {
    cleanup: function (parentNode) {
      removeElAttributes(parentNode);
      fixLists(parentNode, 'OL');
      fixLists(parentNode, 'UL');

      parentNode.querySelectorAll('*').forEach((node) => {
        removeElAttributes(node);
      });
    },
  };
});
