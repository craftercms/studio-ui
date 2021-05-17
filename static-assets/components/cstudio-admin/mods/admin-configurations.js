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

(function() {
  const i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    adminConfigurationMessages = i18n.messages.adminConfigurationMessages;

  const XML_HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<!--
~ Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
~
~ This program is free software: you can redistribute it and/or modify
~ it under the terms of the GNU General Public License version 3 as published by
~ the Free Software Foundation.
~
~ This program is distributed in the hope that it will be useful,
~ but WITHOUT ANY WARRANTY; without even the implied warranty of
~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
~ GNU General Public License for more details.
~
~ You should have received a copy of the GNU General Public License
~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
`;

  CStudioAuthoring.Module.requireModule('ace', '/static-assets/libs/ace/ace.js', {}, { moduleLoaded });

  function moduleLoaded() {
    CStudioAuthoring.Utils.addCss('/static-assets/components/cstudio-admin/mods/admin-configurations.css');
    CStudioAdminConsole.Tool.AdminConfig =
      CStudioAdminConsole.Tool.AdminConfig ||
      function(config, el) {
        this.containerEl = el;
        this.config = config;
        this.types = [];
        return this;
      };

    /**
     * Overarching class that drives the content type tools
     */
    YAHOO.extend(CStudioAdminConsole.Tool.AdminConfig, CStudioAdminConsole.Tool, {
      renderWorkarea: function() {
        var workarea = document.querySelector('#cstudio-admin-console-workarea');
        var el = document.createElement('div');
        el.className = 'cstudio-admin-console-workarea-container';
        // adding 100vh - header
        el.style.height = 'calc(100vh - 55px)';
        $(workarea).html('');
        workarea.appendChild(el);
        CrafterCMSNext.render(el, 'SiteConfigurationManagement');
      }
    });

    CStudioAuthoring.Module.moduleLoaded(
      'cstudio-console-tools-admin-configurations',
      CStudioAdminConsole.Tool.AdminConfig
    );
  }
})();
