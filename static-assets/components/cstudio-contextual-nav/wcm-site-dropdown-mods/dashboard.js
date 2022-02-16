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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * Site selector
 */
CStudioAuthoring.ContextualNav.Dashboard = CStudioAuthoring.ContextualNav.Dashboard || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    if (config.name == 'dashboard') {
      var moduleConfig = {
        label: 'dashboard',
        path: '/site-dashboard'
      };

      $.extend(moduleConfig, config.params);

      if (!this.initialized) {
        this.initialized = true;

        var dropdownInnerEl = config.containerEl;

        var dashboardLinkEl = document.createElement('a');

        var confLabel = moduleConfig.label.toLowerCase().replace(/\s/g, '');
        var label =
          CMgs.format(siteDropdownLangBundle, confLabel) == confLabel
            ? moduleConfig.label
            : CMgs.format(siteDropdownLangBundle, confLabel);

        var icon = CStudioAuthoring.Utils.createIcon(moduleConfig, 'fa-tasks');
        dashboardLinkEl.appendChild(icon);

        var linkText = document.createTextNode(label);
        dashboardLinkEl.appendChild(linkText);
        dashboardLinkEl.title = 'Dashboard';
        dashboardLinkEl.href = CStudioAuthoringContext.authoringAppBaseUri + moduleConfig.path;
        dashboardLinkEl.id = 'acn-sites-link';

        YDom.addClass(dropdownInnerEl, 'studio-view');

        dropdownInnerEl.appendChild(dashboardLinkEl);
      }
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('dashboard', CStudioAuthoring.ContextualNav.Dashboard);
