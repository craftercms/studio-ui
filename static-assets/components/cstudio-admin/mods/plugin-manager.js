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

CStudioAuthoring.Utils.addCss('/static-assets/components/cstudio-admin/mods/plugin-manager/plugin.css');
CStudioAdminConsole.Tool.PluginManager =
  CStudioAdminConsole.Tool.PluginManager ||
  function (config, el) {
    this.containerEl = el;
    this.config = config;
    return this;
  };

YAHOO.extend(CStudioAdminConsole.Tool.PluginManager, CStudioAdminConsole.Tool, {
  renderWorkarea: function () {
    var workareaEl = document.getElementById('cstudio-admin-console-workarea'),
      actions = [];
    workareaEl.innerHTML = '<h1>Plugins</h1>';

    CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-console-tools-plugin-manager', CStudioAdminConsole.Tool.PluginManager);
