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

CStudioAuthoring.ContextualNav.UserDashboard = CStudioAuthoring.ContextualNav.UserDashboard || {
  /**
   * initialize module
   */
  initialize: function (config) {
    if (config.name == 'user-dashboard') {
      this.initialized = true;
      var dropdownInnerEl = config.containerEl;

      var parentFolderEl = document.createElement('div');
      parentFolderEl.style.paddingTop = '8px';
      var parentFolderLinkEl = document.createElement('a');
      parentFolderEl.appendChild(parentFolderLinkEl);
      YDom.addClass(parentFolderLinkEl, 'acn-userdash');
      parentFolderLinkEl.style =
        "background: url('/studio/static-assets/themes/cstudioTheme/images/icons/icon_strip_vertical.gif') no-repeat scroll 0 -941px rgba(0, 0, 0, 0); padding-left:19px";

      parentFolderLinkEl.id = 'user-dashboard';
      parentFolderLinkEl.innerHTML = 'User Dashboard';
      parentFolderLinkEl.onclick = function () {
        document.location = CStudioAuthoringContext.authoringAppBaseUri + '/user-dashboard';
      };

      dropdownInnerEl.appendChild(parentFolderEl);
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('user-dashboard', CStudioAuthoring.ContextualNav.UserDashboard);
