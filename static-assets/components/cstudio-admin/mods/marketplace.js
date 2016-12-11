//CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/marketplace/plugin.css");
CStudioAdminConsole.Tool.MarketPlace = CStudioAdminConsole.Tool.MarketPlace ||  function(config, el)  {
	this.containerEl = el;
	this.config = config;
	return this;
}

YAHOO.extend(CStudioAdminConsole.Tool.MarketPlace, CStudioAdminConsole.Tool, {
	renderWorkarea: function() {
		var workareaEl = document.getElementById("cstudio-admin-console-workarea");
		var hostOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');

		workareaEl.innerHTML = "<iframe id='marketplace' style='margin-left:150px; width:100%; height:1500px;' src='http://apps.craftersoftware.com?mode=store&host="+hostOrigin+"' />";

		var iframeWindow = document.getElementById("marketplace").contentWindow;
	    var Topics = crafter.studio.marketplace.Topics;
	    var origin = window.location.origin; // 'http://127.0.0.1:8080';
	    var communicator = new crafter.studio.Communicator(origin);
	        communicator.addOrigin("http://apps.craftersoftware.com");

	  	var sendCommunicator = new crafter.studio.Communicator({window: iframeWindow, origin: "http://apps.craftersoftware.com" }, hostOrigin);

	    communicator.subscribe(Topics.STORE_READY, function (message) {
            var serviceUri = "/studio/api/1/services/api/1/plugins/get-installed-plugins.json?&site="+CStudioAuthoringContext.site;
			
	    	var cb = {
				success:function(response) {
					var plugins = YAHOO.lang.JSON.parse(response.responseText);
					sendCommunicator.publish(Topics.INSTALLED_PLUGINS, plugins);
				},
				failure:function(response) {
					CStudioAuthoring.Operations.showSimpleDialog(
						"install-plugin-dialog",
						CStudioAuthoring.Operations.simpleDialogTypeINFO,
						"Crafter Market Place",
						"Unable to determine what plugins have been installed in your site.",
						null // use default button
					);
				},
			};	

			YConnect.asyncRequest("GET", serviceUri, cb);
		
	    });


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


            var serviceUri = "/studio/api/1/services/api/1/plugins/install.json?pluginUrl="+message.pluginUrl+"&site="+CStudioAuthoringContext.site;
			YConnect.asyncRequest("GET", serviceUri, cb);
	    });
	}

});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-marketplace",CStudioAdminConsole.Tool.MarketPlace);
