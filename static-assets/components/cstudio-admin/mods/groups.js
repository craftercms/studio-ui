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

CStudioAdminConsole.Tool.Groups =
  CStudioAdminConsole.Tool.Groups ||
  function (config, el) {
    this.containerEl = el;
    this.config = config;
    this.types = [];
    this.currMillis = new Date().getTime();
    return this;
  };

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.Groups, CStudioAdminConsole.Tool, {
  renderWorkarea: function () {
    var workareaEl = document.getElementById('cstudio-admin-console-workarea'),
      auditUrl = '/studio/#/groups?iframe=true&site=' + CStudioAuthoringContext.siteId,
      actions = [];

    workareaEl.innerHTML =
      '<div class="iframe-container" style="position: relative; top: 50px; height: calc(100vh - 50px);">' +
      '<iframe src="' +
      auditUrl +
      '" style="width: 100%; height: 100%;"></iframe>' +
      '</div>';

    CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-console-tools-groups', CStudioAdminConsole.Tool.Groups);
