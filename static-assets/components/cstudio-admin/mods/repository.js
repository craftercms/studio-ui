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

CStudioAdminConsole.Tool.Repository =
  CStudioAdminConsole.Tool.Repository ||
  function(config, el) {
    this.containerEl = el;
    this.config = config;
    this.types = [];
    this.currMillis = new Date().getTime();
    return this;
  };

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.Repository, CStudioAdminConsole.Tool, {
  renderWorkarea: function() {
    const workarea = document.getElementById('cstudio-admin-console-workarea');
    var el = document.createElement('div');
    el.className = 'cstudio-admin-console-workarea-container';
    $(workarea).html('');
    workarea.appendChild(el);
    CrafterCMSNext.render(el, 'RemotesManagement');
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-console-tools-repository', CStudioAdminConsole.Tool.Repository);
