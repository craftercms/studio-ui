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

  // There's an issue in tinymce when pasting lists where it wraps each of the 'li' elements in its own 'ol' or 'ul'.
  // This function joins all of the ol elements with the issue (groups of 'ol')
  const fixOrderedLists = (element) => {
    const orderedLists = Array.from(element.getElementsByTagName('OL')).filter((ol) => {
      return ol.childElementCount === 1;
    });
    orderedLists.forEach((ol) => {
      let haveOlSiblings = ol.nextElementSibling?.tagName === 'OL' && ol.nextElementSibling.children.length === 1;
      while (haveOlSiblings) {
        ol.appendChild(ol.nextElementSibling.children.item(0));
        ol.nextElementSibling.remove();
        // getting next ol sibling (may not exists) so it can continue checking/joining the lists.
        haveOlSiblings = ol.nextElementSibling?.tagName === 'OL';
      }
    });
  };

  return {
    cleanup: function (parentNode) {
      removeElAttributes(parentNode);
      fixOrderedLists(parentNode, 'OL');

      $(parentNode)
        .find('*')
        .each((index, node) => {
          removeElAttributes(node);
        });
    },
  };
});
