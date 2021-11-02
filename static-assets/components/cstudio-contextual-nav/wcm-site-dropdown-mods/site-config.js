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
 * PreviewSync
 */
CStudioAuthoring.ContextualNav.SiteConfig = CStudioAuthoring.ContextualNav.SiteConfig || {
  /**
   * initialize module
   */
  initialize: function (config) {
    if (config.name == 'site-config') {
      var moduleConfig = {
        label: 'siteConfig',
        path: '/site-config'
      };

      $.extend(moduleConfig, config.params);

      this.initialized = true;
      var dropdownInnerEl = config.containerEl;

      var parentFolderEl = document.createElement('div');
      var parentFolderLinkEl = document.createElement('a');
      parentFolderEl.appendChild(parentFolderLinkEl);
      YDom.addClass(parentFolderLinkEl, 'acn-admin-console');

      var confLabel = moduleConfig.label.toLowerCase().replace(/\s/g, '');
      var label =
        CMgs.format(siteDropdownLangBundle, confLabel) == confLabel
          ? moduleConfig.label
          : CMgs.format(siteDropdownLangBundle, confLabel);

      var icon = CStudioAuthoring.Utils.createIcon(moduleConfig, 'fa-sliders');
      parentFolderLinkEl.appendChild(icon);

      parentFolderLinkEl.innerHTML += label;

      parentFolderLinkEl.onclick = function () {
        document.location =
          CStudioAuthoringContext.authoringAppBaseUri + moduleConfig.path + '?site=' + CStudioAuthoringContext.site;
      };

      dropdownInnerEl.appendChild(parentFolderEl);
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('site-config', CStudioAuthoring.ContextualNav.SiteConfig);
