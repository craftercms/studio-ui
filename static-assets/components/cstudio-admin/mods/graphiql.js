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

CStudioAdminConsole.Tool.GraphiQL =
  CStudioAdminConsole.Tool.GraphiQL ||
  function (config, el) {
    this.containerEl = el;
    this.config = config;
    this.types = [];
    return this;
  };
var list = [];
var wfStates = [];
/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.GraphiQL, CStudioAdminConsole.Tool, {
  renderWorkarea: function () {
    $('#cstudio-admin-console-workarea').html('<div id="graphContainer"/>');

    this.initializeGraphi();
  },

  initializeGraphi: function () {
    var site = CStudioAuthoringContext.site,
      actions = [];

    CrafterCMSNext.render(document.getElementById('graphContainer'), 'GraphiQL', {
      url: CStudioAuthoringContext.graphQLBaseURI,
      storageKey: site
    });

    CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-console-tools-graphiql', CStudioAdminConsole.Tool.GraphiQL);
