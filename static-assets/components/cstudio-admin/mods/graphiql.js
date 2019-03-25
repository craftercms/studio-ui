/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

CStudioAuthoring.Utils.addJavascript("/static-assets/libs/graphiql/graphiql.js");
CStudioAuthoring.Utils.addCss("/static-assets/libs/graphiql/graphiql.css");		// library css
CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/graphiql.css");		// mod css
CStudioAdminConsole.Tool.GraphiQL = CStudioAdminConsole.Tool.GraphiQL ||  function(config, el)  {
	this.containerEl = el;
	this.config = config;
	this.types = [];
	return this;
}
var list = [];
var wfStates = [];
/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.GraphiQL, CStudioAdminConsole.Tool, {
	renderWorkarea: function() {
		var workareaEl = document.getElementById("cstudio-admin-console-workarea");
		
		workareaEl.innerHTML = 
			"<div id='graph-container'>" +
			"</div>";
			
			var actions = [];

			this.initializeGraphi();
	},

	initializeGraphi: function() {
		var site = CStudioAuthoringContext.site;
		GraphiQL(document.getElementById("graph-container"), CStudioAuthoringContext.previewAppBaseUri + '/api/1/site/graphql', site);
	}
});
		
CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-graphiql",CStudioAdminConsole.Tool.GraphiQL);