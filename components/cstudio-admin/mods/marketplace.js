//CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/marketplace/plugin.css");
CStudioAdminConsole.Tool.MarketPlace = CStudioAdminConsole.Tool.MarketPlace ||  function(config, el)  {
	this.containerEl = el;
	this.config = config;
	return this;
}

YAHOO.extend(CStudioAdminConsole.Tool.MarketPlace, CStudioAdminConsole.Tool, {
	renderWorkarea: function() {
		var workareaEl = document.getElementById("cstudio-admin-console-workarea");
		workareaEl.innerHTML = "<iframe id='marketplace' style='margin-left:150px; width:100%; height:1500px;' src='http://apps.craftersoftware.com?mode=store' />";

	    var Topics = crafter.studio.marketplace.Topics;
	    var origin = window.location.origin; // 'http://127.0.0.1:8080';
	    var communicator = new crafter.studio.Communicator(origin);
	        communicator.addOrigin("http://apps.craftersoftware.com");


	    communicator.subscribe(Topics.INSTALL_SITE_PLUGIN, function (message) {

	    	var cb = {
				success:function(response) {

					CStudioAuthoring.Operations.showSimpleDialog(
						"install-plugin-dialog",
						CStudioAuthoring.Operations.simpleDialogTypeINFO,
						"Crafter Market Place",
						"Install Successful",
						null // use default button
					);
				},
				failure:function(response) {
					CStudioAuthoring.Operations.showSimpleDialog(
						"install-plugin-dialog",
						CStudioAuthoring.Operations.simpleDialogTypeINFO,
						"Crafter Market Place",
						"Install Failed",
						null // use default button
					);
				}
			}


            var serviceUri = "/api/1/plugins/install.json?pluginurl="+message.pluginUrl+"&site="+CStudioAuthoringContext.site;
			YConnect.asyncRequest("GET", serviceUri, cb);
	    });
	}

});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-marketplace",CStudioAdminConsole.Tool.MarketPlace);