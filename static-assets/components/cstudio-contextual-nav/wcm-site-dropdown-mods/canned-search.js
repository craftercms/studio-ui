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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * Site selector
 */
CStudioAuthoring.ContextualNav.CannedSearch = CStudioAuthoring.ContextualNav.CannedSearch || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    if (!this.initialized) {
      this.initialized = true;

      var folderListEl = YDom.get('acn-dropdown-menu-inner');

      var parentFolderEl = document.createElement('div');

      var parentFolderLinkEl = document.createElement('a');
      parentFolderLinkEl.innerHTML = '<br/>&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;Downloads Canned Search Example';
      parentFolderLinkEl.onclick = function () {
        var url =
          CStudioAuthoringContext.authoringAppBaseUri +
          '/search?site=' +
          CStudioAuthoringContext.site +
          '&context=download&selection=-1&mode=act';

        window.location = url;
      };

      folderListEl.appendChild(parentFolderEl);
      parentFolderEl.appendChild(parentFolderLinkEl);
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('cannedSearch', CStudioAuthoring.ContextualNav.CannedSearch);
